import express, { type Request, type Response, type NextFunction } from 'express';
import cors from 'cors';
import { z } from 'zod';
import { pool, migrate, seedIfEmpty } from './db.js';

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
app.use(express.json());

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

// This service trusts x-user-role as already-verified identity from the
// gateway — only safe if unreachable except through it. Gate everything else
// with a shared secret so that holds even when network isolation isn't
// guaranteed (e.g. each service getting its own public URL, as with cPanel's
// Node.js app selector).
const INTERNAL_SERVICE_SECRET = requireEnv('INTERNAL_SERVICE_SECRET');
app.use((req, res, next) => {
  if (req.headers['x-internal-secret'] !== INTERNAL_SERVICE_SECRET) {
    return res.status(403).json({ error: 'forbidden' });
  }
  next();
});

// Defense in depth: the gateway is expected to gate /admin/* behind auth +
// role checks before proxying here, but this service must not rely on that
// alone — verify the role header itself in case it's ever reached directly.
function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (req.headers['x-user-role'] !== 'admin') return res.status(403).json({ error: 'admin access required' });
  next();
}

interface ProductRow {
  id: string;
  category: string;
  name: string;
  base_price: string | number;
}

app.get('/products', async (req, res) => {
  const category = typeof req.query.category === 'string' ? req.query.category : undefined;
  const [rows] = category
    ? await pool.query('SELECT id, category, name, base_price FROM products WHERE category = ? ORDER BY created_at', [category])
    : await pool.query('SELECT id, category, name, base_price FROM products ORDER BY created_at');
  res.json((rows as ProductRow[]).map(toProductSummary));
});

app.get('/products/:id', async (req, res) => {
  const product = await loadFullProduct(req.params.id);
  if (!product) return res.status(404).json({ error: 'product not found' });
  res.json(product);
});

const priceRequestSchema = z.object({
  productId: z.string().uuid(),
  fabricId: z.string().uuid(),
  styleOptionIds: z.array(z.string().uuid()).default([]),
});

app.post('/price', async (req, res) => {
  const parsed = priceRequestSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const { productId, fabricId, styleOptionIds } = parsed.data;

  const [productRows] = await pool.query('SELECT base_price FROM products WHERE id = ?', [productId]);
  const productRow = (productRows as { base_price: string | number }[])[0];
  if (!productRow) return res.status(404).json({ error: 'product not found' });
  const basePrice = Number(productRow.base_price);

  const [fabricRows] = await pool.query(
    'SELECT id, name, price_premium FROM fabric_options WHERE id = ? AND product_id = ?',
    [fabricId, productId],
  );
  const fabric = (fabricRows as { id: string; name: string; price_premium: string | number }[])[0];
  if (!fabric) return res.status(400).json({ error: 'invalid fabric for this product' });

  let styleTotal = 0;
  const styleBreakdown: { id: string; label: string; pricePremium: number }[] = [];
  if (styleOptionIds.length) {
    const [styleRows] = await pool.query(
      `SELECT so.id, so.label, so.price_premium
       FROM style_options so
       JOIN style_groups sg ON sg.id = so.style_group_id
       WHERE so.id IN (?) AND sg.product_id = ?`,
      [styleOptionIds, productId],
    );
    const styles = styleRows as { id: string; label: string; price_premium: string | number }[];
    if (styles.length !== styleOptionIds.length) {
      return res.status(400).json({ error: 'one or more style options invalid for this product' });
    }
    for (const row of styles) {
      styleTotal += Number(row.price_premium);
      styleBreakdown.push({ id: row.id, label: row.label, pricePremium: Number(row.price_premium) });
    }
  }

  const fabricPremium = Number(fabric.price_premium);
  const total = basePrice + fabricPremium + styleTotal;

  res.json({
    basePrice,
    fabric: { id: fabric.id, name: fabric.name, pricePremium: fabricPremium },
    styles: styleBreakdown,
    total: Math.round(total * 100) / 100,
  });
});

const createProductSchema = z.object({
  category: z.string().min(1),
  name: z.string().min(1),
  basePrice: z.number().nonnegative(),
});

app.post('/admin/products', requireAdmin, async (req, res) => {
  const parsed = createProductSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const { category, name, basePrice } = parsed.data;

  const [result] = await pool.query(
    'INSERT INTO products (category, name, base_price) VALUES (?, ?, ?) RETURNING id, category, name, base_price',
    [category, name, basePrice],
  );
  res.status(201).json(toProductSummary((result as ProductRow[])[0]));
});

const updateProductSchema = z.object({
  name: z.string().min(1).optional(),
  basePrice: z.number().nonnegative().optional(),
});

app.patch('/admin/products/:id', requireAdmin, async (req, res) => {
  const parsed = updateProductSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const { name, basePrice } = parsed.data;
  if (name === undefined && basePrice === undefined) {
    return res.status(400).json({ error: 'nothing to update' });
  }

  await pool.query(
    `UPDATE products SET name = COALESCE(?, name), base_price = COALESCE(?, base_price) WHERE id = ?`,
    [name ?? null, basePrice ?? null, req.params.id],
  );
  const [rows] = await pool.query('SELECT id, category, name, base_price FROM products WHERE id = ?', [req.params.id]);
  const product = (rows as ProductRow[])[0];
  if (!product) return res.status(404).json({ error: 'product not found' });
  res.json(toProductSummary(product));
});

const fabricSchema = z.object({
  name: z.string().min(1),
  swatchImageUrl: z.string().min(1),
  pricePremium: z.number().nonnegative().default(0),
  supplierRef: z.string().min(1),
});

app.post('/admin/products/:id/fabrics', requireAdmin, async (req, res) => {
  const parsed = fabricSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const [productRows] = await pool.query('SELECT id FROM products WHERE id = ?', [req.params.id]);
  if (!(productRows as { id: string }[]).length) return res.status(404).json({ error: 'product not found' });

  const { name, swatchImageUrl, pricePremium, supplierRef } = parsed.data;
  const [result] = await pool.query(
    `INSERT INTO fabric_options (product_id, name, swatch_image_url, price_premium, supplier_ref)
     VALUES (?, ?, ?, ?, ?) RETURNING id, name, swatch_image_url, price_premium, supplier_ref`,
    [req.params.id, name, swatchImageUrl, pricePremium, supplierRef],
  );
  const f = (result as { id: string; name: string; swatch_image_url: string; price_premium: string | number; supplier_ref: string }[])[0];
  res.status(201).json({
    id: f.id,
    name: f.name,
    swatchImageUrl: f.swatch_image_url,
    pricePremium: Number(f.price_premium),
    supplierRef: f.supplier_ref,
  });
});

const styleGroupSchema = z.object({ name: z.string().min(1) });

app.post('/admin/products/:id/style-groups', requireAdmin, async (req, res) => {
  const parsed = styleGroupSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const [productRows] = await pool.query('SELECT id FROM products WHERE id = ?', [req.params.id]);
  if (!(productRows as { id: string }[]).length) return res.status(404).json({ error: 'product not found' });

  const [result] = await pool.query(
    'INSERT INTO style_groups (product_id, name) VALUES (?, ?) RETURNING id, name',
    [req.params.id, parsed.data.name],
  );
  res.status(201).json((result as { id: string; name: string }[])[0]);
});

const styleOptionSchema = z.object({
  label: z.string().min(1),
  pricePremium: z.number().nonnegative().default(0),
});

app.post('/admin/style-groups/:id/options', requireAdmin, async (req, res) => {
  const parsed = styleOptionSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const [groupRows] = await pool.query('SELECT id FROM style_groups WHERE id = ?', [req.params.id]);
  if (!(groupRows as { id: string }[]).length) return res.status(404).json({ error: 'style group not found' });

  const { label, pricePremium } = parsed.data;
  const [result] = await pool.query(
    'INSERT INTO style_options (style_group_id, label, price_premium) VALUES (?, ?, ?) RETURNING id, label, price_premium',
    [req.params.id, label, pricePremium],
  );
  const o = (result as { id: string; label: string; price_premium: string | number }[])[0];
  res.status(201).json({ id: o.id, label: o.label, pricePremium: Number(o.price_premium) });
});

function toProductSummary(row: ProductRow) {
  return { id: row.id, category: row.category, name: row.name, basePrice: Number(row.base_price) };
}

async function loadFullProduct(id: string) {
  const [productRows] = await pool.query('SELECT id, category, name, base_price FROM products WHERE id = ?', [id]);
  const product = (productRows as ProductRow[])[0];
  if (!product) return null;

  const [fabricRows] = await pool.query(
    'SELECT id, name, swatch_image_url, price_premium, supplier_ref FROM fabric_options WHERE product_id = ? ORDER BY sort_order',
    [id],
  );
  const [groupRows] = await pool.query(
    'SELECT id, name FROM style_groups WHERE product_id = ? ORDER BY sort_order',
    [id],
  );
  const groups = [];
  for (const group of groupRows as { id: string; name: string }[]) {
    const [optionRows] = await pool.query(
      'SELECT id, label, price_premium FROM style_options WHERE style_group_id = ? ORDER BY sort_order',
      [group.id],
    );
    groups.push({
      id: group.id,
      name: group.name,
      options: (optionRows as { id: string; label: string; price_premium: string | number }[]).map((o) => ({
        id: o.id,
        label: o.label,
        pricePremium: Number(o.price_premium),
      })),
    });
  }

  return {
    id: product.id,
    category: product.category,
    name: product.name,
    basePrice: Number(product.base_price),
    fabricOptions: (fabricRows as { id: string; name: string; swatch_image_url: string; price_premium: string | number; supplier_ref: string }[]).map((f) => ({
      id: f.id,
      name: f.name,
      swatchImageUrl: f.swatch_image_url,
      pricePremium: Number(f.price_premium),
      supplierRef: f.supplier_ref,
    })),
    styleOptions: groups,
  };
}

const PORT = process.env.PORT ?? 4002;
migrate()
  .then(seedIfEmpty)
  .then(() => app.listen(PORT, () => console.log(`catalog-service listening on ${PORT}`)))
  .catch((err) => {
    console.error('failed to init catalog-service db', err);
    process.exit(1);
  });
