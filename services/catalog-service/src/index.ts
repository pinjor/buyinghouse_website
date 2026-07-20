import express from 'express';
import cors from 'cors';
import { z } from 'zod';
import { pool, migrate, seedIfEmpty } from './db.js';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

app.get('/products', async (req, res) => {
  const category = typeof req.query.category === 'string' ? req.query.category : undefined;
  const result = category
    ? await pool.query('SELECT id, category, name, base_price FROM products WHERE category = $1 ORDER BY created_at', [category])
    : await pool.query('SELECT id, category, name, base_price FROM products ORDER BY created_at');
  res.json(result.rows.map(toProductSummary));
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

  const productRes = await pool.query('SELECT base_price FROM products WHERE id = $1', [productId]);
  if (!productRes.rowCount) return res.status(404).json({ error: 'product not found' });
  const basePrice = Number(productRes.rows[0].base_price);

  const fabricRes = await pool.query(
    'SELECT id, name, price_premium FROM fabric_options WHERE id = $1 AND product_id = $2',
    [fabricId, productId],
  );
  if (!fabricRes.rowCount) return res.status(400).json({ error: 'invalid fabric for this product' });
  const fabric = fabricRes.rows[0];

  let styleTotal = 0;
  const styleBreakdown: { id: string; label: string; pricePremium: number }[] = [];
  if (styleOptionIds.length) {
    const styleRes = await pool.query(
      `SELECT so.id, so.label, so.price_premium
       FROM style_options so
       JOIN style_groups sg ON sg.id = so.style_group_id
       WHERE so.id = ANY($1) AND sg.product_id = $2`,
      [styleOptionIds, productId],
    );
    if (styleRes.rowCount !== styleOptionIds.length) {
      return res.status(400).json({ error: 'one or more style options invalid for this product' });
    }
    for (const row of styleRes.rows) {
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

app.post('/admin/products', async (req, res) => {
  const parsed = createProductSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const { category, name, basePrice } = parsed.data;

  const result = await pool.query(
    'INSERT INTO products (category, name, base_price) VALUES ($1, $2, $3) RETURNING id, category, name, base_price',
    [category, name, basePrice],
  );
  res.status(201).json(toProductSummary(result.rows[0]));
});

const updateProductSchema = z.object({
  name: z.string().min(1).optional(),
  basePrice: z.number().nonnegative().optional(),
});

app.patch('/admin/products/:id', async (req, res) => {
  const parsed = updateProductSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const { name, basePrice } = parsed.data;
  if (name === undefined && basePrice === undefined) {
    return res.status(400).json({ error: 'nothing to update' });
  }

  const result = await pool.query(
    `UPDATE products SET name = COALESCE($1, name), base_price = COALESCE($2, base_price)
     WHERE id = $3 RETURNING id, category, name, base_price`,
    [name ?? null, basePrice ?? null, req.params.id],
  );
  if (!result.rowCount) return res.status(404).json({ error: 'product not found' });
  res.json(toProductSummary(result.rows[0]));
});

const fabricSchema = z.object({
  name: z.string().min(1),
  swatchImageUrl: z.string().min(1),
  pricePremium: z.number().nonnegative().default(0),
  supplierRef: z.string().min(1),
});

app.post('/admin/products/:id/fabrics', async (req, res) => {
  const parsed = fabricSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const productRes = await pool.query('SELECT id FROM products WHERE id = $1', [req.params.id]);
  if (!productRes.rowCount) return res.status(404).json({ error: 'product not found' });

  const { name, swatchImageUrl, pricePremium, supplierRef } = parsed.data;
  const result = await pool.query(
    `INSERT INTO fabric_options (product_id, name, swatch_image_url, price_premium, supplier_ref)
     VALUES ($1, $2, $3, $4, $5) RETURNING id, name, swatch_image_url, price_premium, supplier_ref`,
    [req.params.id, name, swatchImageUrl, pricePremium, supplierRef],
  );
  const f = result.rows[0];
  res.status(201).json({
    id: f.id,
    name: f.name,
    swatchImageUrl: f.swatch_image_url,
    pricePremium: Number(f.price_premium),
    supplierRef: f.supplier_ref,
  });
});

const styleGroupSchema = z.object({ name: z.string().min(1) });

app.post('/admin/products/:id/style-groups', async (req, res) => {
  const parsed = styleGroupSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const productRes = await pool.query('SELECT id FROM products WHERE id = $1', [req.params.id]);
  if (!productRes.rowCount) return res.status(404).json({ error: 'product not found' });

  const result = await pool.query(
    'INSERT INTO style_groups (product_id, name) VALUES ($1, $2) RETURNING id, name',
    [req.params.id, parsed.data.name],
  );
  res.status(201).json(result.rows[0]);
});

const styleOptionSchema = z.object({
  label: z.string().min(1),
  pricePremium: z.number().nonnegative().default(0),
});

app.post('/admin/style-groups/:id/options', async (req, res) => {
  const parsed = styleOptionSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const groupRes = await pool.query('SELECT id FROM style_groups WHERE id = $1', [req.params.id]);
  if (!groupRes.rowCount) return res.status(404).json({ error: 'style group not found' });

  const { label, pricePremium } = parsed.data;
  const result = await pool.query(
    'INSERT INTO style_options (style_group_id, label, price_premium) VALUES ($1, $2, $3) RETURNING id, label, price_premium',
    [req.params.id, label, pricePremium],
  );
  const o = result.rows[0];
  res.status(201).json({ id: o.id, label: o.label, pricePremium: Number(o.price_premium) });
});

function toProductSummary(row: any) {
  return { id: row.id, category: row.category, name: row.name, basePrice: Number(row.base_price) };
}

async function loadFullProduct(id: string) {
  const productRes = await pool.query('SELECT id, category, name, base_price FROM products WHERE id = $1', [id]);
  if (!productRes.rowCount) return null;
  const product = productRes.rows[0];

  const fabricsRes = await pool.query(
    'SELECT id, name, swatch_image_url, price_premium, supplier_ref FROM fabric_options WHERE product_id = $1 ORDER BY sort_order',
    [id],
  );
  const groupsRes = await pool.query(
    'SELECT id, name FROM style_groups WHERE product_id = $1 ORDER BY sort_order',
    [id],
  );
  const groups = [];
  for (const group of groupsRes.rows) {
    const optionsRes = await pool.query(
      'SELECT id, label, price_premium FROM style_options WHERE style_group_id = $1 ORDER BY sort_order',
      [group.id],
    );
    groups.push({
      id: group.id,
      name: group.name,
      options: optionsRes.rows.map((o) => ({ id: o.id, label: o.label, pricePremium: Number(o.price_premium) })),
    });
  }

  return {
    id: product.id,
    category: product.category,
    name: product.name,
    basePrice: Number(product.base_price),
    fabricOptions: fabricsRes.rows.map((f) => ({
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
