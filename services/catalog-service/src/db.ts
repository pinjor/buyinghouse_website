import pg from 'pg';

const { Pool } = pg;

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL ?? 'postgres://postgres:postgres@localhost:5432/catalog',
});

export async function migrate() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS products (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      category TEXT NOT NULL,
      name TEXT NOT NULL,
      base_price NUMERIC(10,2) NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS fabric_options (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      swatch_image_url TEXT NOT NULL,
      price_premium NUMERIC(10,2) NOT NULL DEFAULT 0,
      supplier_ref TEXT NOT NULL,
      sort_order INT NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS style_groups (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      sort_order INT NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS style_options (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      style_group_id UUID NOT NULL REFERENCES style_groups(id) ON DELETE CASCADE,
      label TEXT NOT NULL,
      price_premium NUMERIC(10,2) NOT NULL DEFAULT 0,
      sort_order INT NOT NULL DEFAULT 0
    );
  `);
}

export async function seedIfEmpty() {
  const { rows } = await pool.query('SELECT COUNT(*)::int AS count FROM products');
  if (rows[0].count > 0) return;

  const productRes = await pool.query(
    `INSERT INTO products (category, name, base_price) VALUES ('shirt', 'Classic Custom Shirt', 60.00) RETURNING id`,
  );
  const productId = productRes.rows[0].id;

  const fabrics = [
    { name: 'Cotton Poplin — White', swatch: '/swatches/poplin-white.jpg', premium: 0, supplier: 'LS-POP-WHT-001' },
    { name: 'Oxford — Light Blue', swatch: '/swatches/oxford-blue.jpg', premium: 8, supplier: 'LS-OXF-BLU-014' },
    { name: 'Linen — Natural', swatch: '/swatches/linen-natural.jpg', premium: 15, supplier: 'LS-LIN-NAT-022' },
  ];
  for (let i = 0; i < fabrics.length; i++) {
    const f = fabrics[i];
    await pool.query(
      `INSERT INTO fabric_options (product_id, name, swatch_image_url, price_premium, supplier_ref, sort_order)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [productId, f.name, f.swatch, f.premium, f.supplier, i],
    );
  }

  const styleGroups: { name: string; options: { label: string; premium: number }[] }[] = [
    {
      name: 'Collar',
      options: [
        { label: 'Spread', premium: 0 },
        { label: 'Button-Down', premium: 0 },
        { label: 'Cutaway', premium: 5 },
      ],
    },
    {
      name: 'Cuff',
      options: [
        { label: 'Barrel', premium: 0 },
        { label: 'French', premium: 6 },
      ],
    },
    {
      name: 'Fit',
      options: [
        { label: 'Slim', premium: 0 },
        { label: 'Regular', premium: 0 },
        { label: 'Relaxed', premium: 0 },
      ],
    },
  ];
  for (let g = 0; g < styleGroups.length; g++) {
    const group = styleGroups[g];
    const groupRes = await pool.query(
      `INSERT INTO style_groups (product_id, name, sort_order) VALUES ($1, $2, $3) RETURNING id`,
      [productId, group.name, g],
    );
    const groupId = groupRes.rows[0].id;
    for (let o = 0; o < group.options.length; o++) {
      const opt = group.options[o];
      await pool.query(
        `INSERT INTO style_options (style_group_id, label, price_premium, sort_order) VALUES ($1, $2, $3, $4)`,
        [groupId, opt.label, opt.premium, o],
      );
    }
  }
}
