import express, { type Request, type Response, type NextFunction } from 'express';
import cors from 'cors';
import { z } from 'zod';
import { pool, migrate } from './db.js';
import { connectMessaging, publishOrderEvent } from './messaging.js';
import { priceProduct, getProduct } from './catalogClient.js';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

function requireUser(req: Request, res: Response, next: NextFunction) {
  const userId = req.headers['x-user-id'];
  if (typeof userId !== 'string') return res.status(401).json({ error: 'missing user context' });
  (req as Request & { userId: string }).userId = userId;
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

app.post('/checkout', requireUser, async (req, res) => {
  const { userId } = req as Request & { userId: string };
  const cart = await loadCart(userId);
  if (cart.items.length === 0) return res.status(400).json({ error: 'cart is empty' });

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const orderRes = await client.query(
      `INSERT INTO orders (user_id, status, total) VALUES ($1, 'placed', $2) RETURNING id, status, total, created_at`,
      [userId, cart.total],
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

    publishOrderEvent('order.placed', {
      orderId: order.id,
      userId,
      total: Number(order.total),
      itemCount: cart.items.length,
    });

    res.status(201).json({
      id: order.id,
      status: order.status,
      total: Number(order.total),
      items: cart.items,
      createdAt: order.created_at,
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('checkout failed', err);
    res.status(500).json({ error: 'checkout failed' });
  } finally {
    client.release();
  }
});

app.get('/orders', requireUser, async (req, res) => {
  const { userId } = req as Request & { userId: string };
  const result = await pool.query(
    'SELECT id, status, total, created_at FROM orders WHERE user_id = $1 ORDER BY created_at DESC',
    [userId],
  );
  res.json(result.rows.map((r) => ({ id: r.id, status: r.status, total: Number(r.total), createdAt: r.created_at })));
});

app.get('/orders/:id', requireUser, async (req, res) => {
  const { userId } = req as Request & { userId: string };
  const orderRes = await pool.query('SELECT id, status, total, created_at FROM orders WHERE id = $1 AND user_id = $2', [
    req.params.id,
    userId,
  ]);
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
