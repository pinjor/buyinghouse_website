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
