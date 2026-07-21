import express, { type Request, type Response, type NextFunction } from 'express';
import cors from 'cors';
import { z } from 'zod';
import { pool, migrate } from './db.js';
import { connectMessaging, publishOrderEvent } from './messaging.js';
import { priceProduct, getProduct } from './catalogClient.js';
import { isStripeConfigured, createPaymentIntent, retrievePaymentIntent, constructWebhookEvent } from './paymentService.js';

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    console.error(`missing required env var ${name}`);
    process.exit(1);
  }
  return value;
}

const app = express();
app.use(cors());

// Stripe webhook needs the raw body for signature verification, so it must be
// registered before the express.json() body parser.
app.post('/webhooks/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
  const signature = req.headers['stripe-signature'];
  if (typeof signature !== 'string') return res.status(400).json({ error: 'missing signature' });

  let event;
  try {
    event = constructWebhookEvent(req.body, signature);
  } catch (err) {
    console.error('stripe webhook signature verification failed', err);
    return res.status(400).json({ error: 'invalid signature' });
  }

  if (event.type === 'payment_intent.succeeded') {
    const intent = event.data.object as { id: string; metadata?: { orderId?: string } };
    const orderId = intent.metadata?.orderId;
    if (orderId) await markOrderPlacedIfPending(orderId, intent.id);
  }

  res.json({ received: true });
});

app.use(express.json());

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

// Everything below trusts x-user-id / x-user-role headers as already-verified
// identity — that's only safe if this service is unreachable except through
// the gateway (which independently verifies the JWT and sets those headers
// itself). This gate enforces that even when network isolation isn't
// guaranteed by the hosting setup (e.g. each service getting its own public
// URL, as with cPanel's Node.js app selector).
const INTERNAL_SERVICE_SECRET = requireEnv('INTERNAL_SERVICE_SECRET');
app.use((req, res, next) => {
  if (req.headers['x-internal-secret'] !== INTERNAL_SERVICE_SECRET) {
    return res.status(403).json({ error: 'forbidden' });
  }
  next();
});

function requireUser(req: Request, res: Response, next: NextFunction) {
  const userId = req.headers['x-user-id'];
  const userEmail = req.headers['x-user-email'];
  if (typeof userId !== 'string') return res.status(401).json({ error: 'missing user context' });
  (req as Request & { userId: string; userEmail?: string }).userId = userId;
  (req as Request & { userId: string; userEmail?: string }).userEmail =
    typeof userEmail === 'string' ? userEmail : undefined;
  next();
}

async function getOrCreateCart(userId: string): Promise<string> {
  const existing = await pool.query('SELECT id FROM carts WHERE user_id = $1', [userId]);
  if (existing.rowCount) return existing.rows[0].id;
  const created = await pool.query('INSERT INTO carts (user_id) VALUES ($1) RETURNING id', [userId]);
  return created.rows[0].id;
}

async function loadCart(userId: string) {
  const cartId = await getOrCreateCart(userId);
  const items = await pool.query(
    `SELECT id, product_id, product_name, fabric_id, style_option_ids, measurements, unit_price, quantity
     FROM cart_items WHERE cart_id = $1 ORDER BY created_at`,
    [cartId],
  );
  const rows = items.rows.map((r) => ({
    id: r.id,
    productId: r.product_id,
    productName: r.product_name,
    fabricId: r.fabric_id,
    styleOptionIds: r.style_option_ids,
    measurements: r.measurements,
    unitPrice: Number(r.unit_price),
    quantity: r.quantity,
  }));
  const total = rows.reduce((sum, r) => sum + r.unitPrice * r.quantity, 0);
  return { id: cartId, items: rows, total: Math.round(total * 100) / 100 };
}

app.get('/cart', requireUser, async (req, res) => {
  const { userId } = req as Request & { userId: string };
  res.json(await loadCart(userId));
});

const measurementsSchema = z.object({
  neck: z.string().optional().default(''),
  chest: z.string().optional().default(''),
  waist: z.string().optional().default(''),
  sleeveLength: z.string().optional().default(''),
});

const addCartItemSchema = z.object({
  productId: z.string().uuid(),
  fabricId: z.string().uuid(),
  styleOptionIds: z.array(z.string().uuid()).default([]),
  measurements: measurementsSchema.default({}),
  quantity: z.number().int().positive().default(1),
});

app.post('/cart/items', requireUser, async (req, res) => {
  const parsed = addCartItemSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const { userId } = req as Request & { userId: string };
  const { productId, fabricId, styleOptionIds, measurements, quantity } = parsed.data;

  let price;
  let product;
  try {
    [price, product] = await Promise.all([
      priceProduct(productId, fabricId, styleOptionIds),
      getProduct(productId),
    ]);
  } catch {
    return res.status(400).json({ error: 'invalid product, fabric, or style selection' });
  }

  const cartId = await getOrCreateCart(userId);
  await pool.query(
    `INSERT INTO cart_items (cart_id, product_id, product_name, fabric_id, style_option_ids, measurements, unit_price, quantity)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
    [cartId, productId, product.name, fabricId, styleOptionIds, JSON.stringify(measurements), price.total, quantity],
  );
  res.status(201).json(await loadCart(userId));
});

app.delete('/cart/items/:itemId', requireUser, async (req, res) => {
  const { userId } = req as Request & { userId: string };
  const cartId = await getOrCreateCart(userId);
  await pool.query('DELETE FROM cart_items WHERE id = $1 AND cart_id = $2', [req.params.itemId, cartId]);
  res.json(await loadCart(userId));
});

const PAYMENT_METHODS = ['stripe', 'wire'] as const;
const checkoutSchema = z.object({
  paymentMethod: z.enum(PAYMENT_METHODS),
});

// Order is created as pending_payment and only ever flips to placed once
// payment is independently verified server-side (Stripe: webhook/confirm
// endpoint re-checking PaymentIntent status; wire: admin manual approval).
// Never trust the client's mere invocation of this endpoint as proof of payment.
app.post('/checkout', requireUser, async (req, res) => {
  const parsed = checkoutSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const { paymentMethod } = parsed.data;

  if (paymentMethod === 'stripe' && !isStripeConfigured()) {
    return res.status(503).json({ error: 'card payments are not configured yet' });
  }

  const { userId, userEmail } = req as Request & { userId: string; userEmail?: string };
  const cart = await loadCart(userId);
  if (cart.items.length === 0) return res.status(400).json({ error: 'cart is empty' });

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const orderRes = await client.query(
      `INSERT INTO orders (user_id, user_email, status, total, payment_method)
       VALUES ($1, $2, 'pending_payment', $3, $4) RETURNING id, status, total, created_at, payment_method`,
      [userId, userEmail ?? null, cart.total, paymentMethod],
    );
    const order = orderRes.rows[0];

    for (const item of cart.items) {
      await client.query(
        `INSERT INTO order_items (order_id, product_id, product_name, fabric_id, style_option_ids, measurements, unit_price, quantity)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          order.id,
          item.productId,
          item.productName,
          item.fabricId,
          item.styleOptionIds,
          JSON.stringify(item.measurements),
          item.unitPrice,
          item.quantity,
        ],
      );
    }

    await client.query('DELETE FROM cart_items WHERE cart_id = $1', [cart.id]);
    await client.query('COMMIT');

    let clientSecret: string | null = null;
    if (paymentMethod === 'stripe') {
      const intent = await createPaymentIntent(Number(order.total), 'usd', order.id);
      await pool.query('UPDATE orders SET payment_intent_id = $1 WHERE id = $2', [intent.id, order.id]);
      clientSecret = intent.client_secret;
    }

    res.status(201).json({
      id: order.id,
      status: order.status,
      total: Number(order.total),
      paymentMethod: order.payment_method,
      items: cart.items,
      createdAt: order.created_at,
      clientSecret,
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('checkout failed', err);
    res.status(500).json({ error: 'checkout failed' });
  } finally {
    client.release();
  }
});

async function markOrderPlacedIfPending(orderId: string, paymentIntentId: string) {
  const result = await pool.query(
    `UPDATE orders SET status = 'placed'
     WHERE id = $1 AND status = 'pending_payment' AND payment_intent_id = $2
     RETURNING id, user_id, user_email, total`,
    [orderId, paymentIntentId],
  );
  if (!result.rowCount) return;
  const order = result.rows[0];
  const itemsRes = await pool.query('SELECT id FROM order_items WHERE order_id = $1', [order.id]);
  publishOrderEvent('order.placed', {
    orderId: order.id,
    userId: order.user_id,
    userEmail: order.user_email,
    total: Number(order.total),
    itemCount: itemsRes.rowCount,
  });
}

app.post('/checkout/:orderId/confirm', requireUser, async (req, res) => {
  const { userId } = req as Request & { userId: string };
  const orderRes = await pool.query(
    `SELECT id, status, payment_method, payment_intent_id, total FROM orders WHERE id = $1 AND user_id = $2`,
    [req.params.orderId, userId],
  );
  if (!orderRes.rowCount) return res.status(404).json({ error: 'order not found' });
  const order = orderRes.rows[0];

  if (order.payment_method !== 'stripe' || !order.payment_intent_id) {
    return res.status(400).json({ error: 'order does not use card payment confirmation' });
  }
  if (order.status !== 'pending_payment') {
    return res.json({ id: order.id, status: order.status });
  }

  const intent = await retrievePaymentIntent(order.payment_intent_id);
  if (intent.status !== 'succeeded' || intent.amount !== Math.round(Number(order.total) * 100)) {
    return res.status(402).json({ error: 'payment not completed', status: intent.status });
  }

  await markOrderPlacedIfPending(order.id, intent.id);
  res.json({ id: order.id, status: 'placed' });
});

function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (req.headers['x-user-role'] !== 'admin') return res.status(403).json({ error: 'admin access required' });
  next();
}

const ORDER_STATUS_SEQUENCE = ['pending_payment', 'placed', 'in_production', 'shipped', 'delivered'] as const;

app.get('/admin/orders', requireAdmin, async (_req, res) => {
  const result = await pool.query(
    'SELECT id, user_id, user_email, status, total, payment_method, created_at FROM orders ORDER BY created_at DESC',
  );
  res.json(
    result.rows.map((r) => ({
      id: r.id,
      userId: r.user_id,
      userEmail: r.user_email,
      status: r.status,
      total: Number(r.total),
      paymentMethod: r.payment_method,
      createdAt: r.created_at,
    })),
  );
});

const statusUpdateSchema = z.object({
  status: z.enum(ORDER_STATUS_SEQUENCE),
});

app.patch('/admin/orders/:id/status', requireAdmin, async (req, res) => {
  const parsed = statusUpdateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const orderRes = await pool.query('SELECT id, user_id, user_email, status, total FROM orders WHERE id = $1', [
    req.params.id,
  ]);
  if (!orderRes.rowCount) return res.status(404).json({ error: 'order not found' });
  const order = orderRes.rows[0];

  const currentIndex = ORDER_STATUS_SEQUENCE.indexOf(order.status);
  const nextIndex = ORDER_STATUS_SEQUENCE.indexOf(parsed.data.status);
  if (nextIndex !== currentIndex + 1) {
    return res.status(400).json({
      error: `invalid transition from "${order.status}" to "${parsed.data.status}" (must advance one step at a time)`,
    });
  }

  await pool.query('UPDATE orders SET status = $1 WHERE id = $2', [parsed.data.status, order.id]);

  publishOrderEvent(`order.${parsed.data.status}`, {
    orderId: order.id,
    userId: order.user_id,
    userEmail: order.user_email,
    total: Number(order.total),
  });

  res.json({ id: order.id, status: parsed.data.status });
});

app.get('/orders', requireUser, async (req, res) => {
  const { userId } = req as Request & { userId: string };
  const result = await pool.query(
    'SELECT id, status, total, payment_method, created_at FROM orders WHERE user_id = $1 ORDER BY created_at DESC',
    [userId],
  );
  res.json(
    result.rows.map((r) => ({
      id: r.id,
      status: r.status,
      total: Number(r.total),
      paymentMethod: r.payment_method,
      createdAt: r.created_at,
    })),
  );
});

app.get('/orders/:id', requireUser, async (req, res) => {
  const { userId } = req as Request & { userId: string };
  const orderRes = await pool.query(
    'SELECT id, status, total, payment_method, created_at FROM orders WHERE id = $1 AND user_id = $2',
    [req.params.id, userId],
  );
  if (!orderRes.rowCount) return res.status(404).json({ error: 'order not found' });
  const order = orderRes.rows[0];

  const itemsRes = await pool.query(
    `SELECT id, product_id, product_name, fabric_id, style_option_ids, measurements, unit_price, quantity
     FROM order_items WHERE order_id = $1`,
    [order.id],
  );

  res.json({
    id: order.id,
    status: order.status,
    total: Number(order.total),
    paymentMethod: order.payment_method,
    createdAt: order.created_at,
    items: itemsRes.rows.map((r) => ({
      id: r.id,
      productId: r.product_id,
      productName: r.product_name,
      fabricId: r.fabric_id,
      styleOptionIds: r.style_option_ids,
      measurements: r.measurements,
      unitPrice: Number(r.unit_price),
      quantity: r.quantity,
    })),
  });
});

const measurementProfileSchema = z.object({
  label: z.string().min(1),
  neck: z.number().positive().optional(),
  chest: z.number().positive().optional(),
  waist: z.number().positive().optional(),
  sleeveLength: z.number().positive().optional(),
});

app.get('/measurement-profiles', requireUser, async (req, res) => {
  const { userId } = req as Request & { userId: string };
  const result = await pool.query(
    'SELECT id, label, neck, chest, waist, sleeve_length, created_at FROM measurement_profiles WHERE user_id = $1 ORDER BY created_at DESC',
    [userId],
  );
  res.json(
    result.rows.map((r) => ({
      id: r.id,
      label: r.label,
      neck: r.neck ? Number(r.neck) : null,
      chest: r.chest ? Number(r.chest) : null,
      waist: r.waist ? Number(r.waist) : null,
      sleeveLength: r.sleeve_length ? Number(r.sleeve_length) : null,
      createdAt: r.created_at,
    })),
  );
});

app.post('/measurement-profiles', requireUser, async (req, res) => {
  const parsed = measurementProfileSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const { userId } = req as Request & { userId: string };
  const { label, neck, chest, waist, sleeveLength } = parsed.data;

  const result = await pool.query(
    `INSERT INTO measurement_profiles (user_id, label, neck, chest, waist, sleeve_length)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, label, neck, chest, waist, sleeve_length, created_at`,
    [userId, label, neck ?? null, chest ?? null, waist ?? null, sleeveLength ?? null],
  );
  const r = result.rows[0];
  res.status(201).json({
    id: r.id,
    label: r.label,
    neck: r.neck ? Number(r.neck) : null,
    chest: r.chest ? Number(r.chest) : null,
    waist: r.waist ? Number(r.waist) : null,
    sleeveLength: r.sleeve_length ? Number(r.sleeve_length) : null,
    createdAt: r.created_at,
  });
});

const PORT = process.env.PORT ?? 4003;
migrate()
  .then(connectMessaging)
  .then(() => app.listen(PORT, () => console.log(`order-service listening on ${PORT}`)))
  .catch((err) => {
    console.error('failed to init order-service', err);
    process.exit(1);
  });
