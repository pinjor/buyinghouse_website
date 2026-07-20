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

interface SeedFabric {
  name: string;
  swatch: string;
  premium: number;
  supplier: string;
}

interface SeedStyleGroup {
  name: string;
  options: { label: string; premium: number }[];
}

interface SeedProduct {
  category: string;
  name: string;
  basePrice: number;
  fabrics: SeedFabric[];
  styleGroups: SeedStyleGroup[];
}

const SEED_PRODUCTS: SeedProduct[] = [
  {
    category: 'shirt',
    name: 'Classic Custom Shirt',
    basePrice: 60,
    fabrics: [
      { name: 'Cotton Poplin — White', swatch: '/swatches/poplin-white.jpg', premium: 0, supplier: 'LS-POP-WHT-001' },
      { name: 'Oxford — Light Blue', swatch: '/swatches/oxford-blue.jpg', premium: 8, supplier: 'LS-OXF-BLU-014' },
      { name: 'Linen — Natural', swatch: '/swatches/linen-natural.jpg', premium: 15, supplier: 'LS-LIN-NAT-022' },
    ],
    styleGroups: [
      { name: 'Collar', options: [{ label: 'Spread', premium: 0 }, { label: 'Button-Down', premium: 0 }, { label: 'Cutaway', premium: 5 }] },
      { name: 'Cuff', options: [{ label: 'Barrel', premium: 0 }, { label: 'French', premium: 6 }] },
      { name: 'Fit', options: [{ label: 'Slim', premium: 0 }, { label: 'Regular', premium: 0 }, { label: 'Relaxed', premium: 0 }] },
    ],
  },
  {
    category: 'suit',
    name: 'Two-Piece Suit',
    basePrice: 450,
    fabrics: [
      { name: 'Wool — Charcoal', swatch: '/swatches/wool-charcoal.jpg', premium: 0, supplier: 'LS-WOOL-CHR-001' },
      { name: 'Wool — Navy Pinstripe', swatch: '/swatches/wool-navy-pinstripe.jpg', premium: 40, supplier: 'LS-WOOL-NVP-007' },
      { name: 'Wool-Silk Blend', swatch: '/swatches/wool-silk.jpg', premium: 90, supplier: 'LS-WSB-BLK-003' },
    ],
    styleGroups: [
      { name: 'Lapel', options: [{ label: 'Notch', premium: 0 }, { label: 'Peak', premium: 15 }, { label: 'Shawl', premium: 20 }] },
      { name: 'Vents', options: [{ label: 'Single', premium: 0 }, { label: 'Double', premium: 10 }, { label: 'None', premium: 0 }] },
      { name: 'Fit', options: [{ label: 'Slim', premium: 0 }, { label: 'Regular', premium: 0 }, { label: 'Relaxed', premium: 0 }] },
    ],
  },
  {
    category: 'jacket',
    name: 'Sport Coat',
    basePrice: 280,
    fabrics: [
      { name: 'Tweed — Herringbone', swatch: '/swatches/tweed-herringbone.jpg', premium: 0, supplier: 'LS-TWD-HRB-002' },
      { name: 'Cashmere Blend — Camel', swatch: '/swatches/cashmere-camel.jpg', premium: 70, supplier: 'LS-CSH-CML-011' },
      { name: 'Linen — Sand', swatch: '/swatches/linen-sand.jpg', premium: 20, supplier: 'LS-LIN-SND-009' },
    ],
    styleGroups: [
      { name: 'Lapel', options: [{ label: 'Notch', premium: 0 }, { label: 'Peak', premium: 15 }] },
      { name: 'Buttons', options: [{ label: '2-Button', premium: 0 }, { label: '3-Button', premium: 5 }] },
      { name: 'Fit', options: [{ label: 'Slim', premium: 0 }, { label: 'Regular', premium: 0 }] },
    ],
  },
  {
    category: 'vest',
    name: 'Formal Vest',
    basePrice: 90,
    fabrics: [
      { name: 'Wool — Charcoal', swatch: '/swatches/wool-charcoal.jpg', premium: 0, supplier: 'LS-WOOL-CHR-001' },
      { name: 'Silk — Black', swatch: '/swatches/silk-black.jpg', premium: 25, supplier: 'LS-SLK-BLK-004' },
      { name: 'Cotton Twill — Tan', swatch: '/swatches/twill-tan.jpg', premium: 5, supplier: 'LS-TWL-TAN-015' },
    ],
    styleGroups: [
      { name: 'Back', options: [{ label: 'Adjustable Strap', premium: 0 }, { label: 'Full Back', premium: 8 }] },
      { name: 'Buttons', options: [{ label: '5-Button', premium: 0 }, { label: '6-Button', premium: 3 }] },
    ],
  },
  {
    category: 'pants',
    name: 'Tailored Trousers',
    basePrice: 120,
    fabrics: [
      { name: 'Wool — Grey', swatch: '/swatches/wool-grey.jpg', premium: 0, supplier: 'LS-WOOL-GRY-005' },
      { name: 'Wool — Navy', swatch: '/swatches/wool-navy.jpg', premium: 0, supplier: 'LS-WOOL-NVY-006' },
      { name: 'Cotton — Khaki', swatch: '/swatches/cotton-khaki.jpg', premium: -10, supplier: 'LS-COT-KHK-018' },
    ],
    styleGroups: [
      { name: 'Rise', options: [{ label: 'Low', premium: 0 }, { label: 'Mid', premium: 0 }, { label: 'High', premium: 0 }] },
      { name: 'Pleats', options: [{ label: 'Flat Front', premium: 0 }, { label: 'Single Pleat', premium: 4 }, { label: 'Double Pleat', premium: 6 }] },
    ],
  },
  {
    category: 'jeans',
    name: 'Custom Denim',
    basePrice: 95,
    fabrics: [
      { name: 'Raw Selvedge', swatch: '/swatches/denim-raw.jpg', premium: 0, supplier: 'LS-DNM-RAW-021' },
      { name: 'Stretch Indigo', swatch: '/swatches/denim-indigo.jpg', premium: 10, supplier: 'LS-DNM-IND-023' },
      { name: 'Black Denim', swatch: '/swatches/denim-black.jpg', premium: 5, supplier: 'LS-DNM-BLK-024' },
    ],
    styleGroups: [
      { name: 'Fit', options: [{ label: 'Slim', premium: 0 }, { label: 'Straight', premium: 0 }, { label: 'Relaxed', premium: 0 }] },
      { name: 'Wash', options: [{ label: 'Raw', premium: 0 }, { label: 'Light', premium: 0 }, { label: 'Dark', premium: 0 }] },
    ],
  },
  {
    category: 'tuxedo',
    name: 'Formal Tuxedo',
    basePrice: 550,
    fabrics: [
      { name: 'Wool — Black', swatch: '/swatches/wool-black.jpg', premium: 0, supplier: 'LS-WOOL-BLK-008' },
      { name: 'Wool — Midnight Blue', swatch: '/swatches/wool-midnight.jpg', premium: 30, supplier: 'LS-WOOL-MID-012' },
      { name: 'Wool-Mohair Blend', swatch: '/swatches/wool-mohair.jpg', premium: 110, supplier: 'LS-WMH-BLK-002' },
    ],
    styleGroups: [
      { name: 'Lapel', options: [{ label: 'Peak', premium: 0 }, { label: 'Shawl', premium: 10 }] },
      { name: 'Stripe', options: [{ label: 'Satin Stripe', premium: 0 }, { label: 'Plain', premium: 0 }] },
    ],
  },
  {
    category: 'overcoat',
    name: 'Wool Overcoat',
    basePrice: 380,
    fabrics: [
      { name: 'Wool — Camel', swatch: '/swatches/wool-camel.jpg', premium: 0, supplier: 'LS-WOOL-CML-013' },
      { name: 'Wool — Charcoal', swatch: '/swatches/wool-charcoal.jpg', premium: 0, supplier: 'LS-WOOL-CHR-001' },
      { name: 'Cashmere Blend', swatch: '/swatches/cashmere-camel.jpg', premium: 120, supplier: 'LS-CSH-CML-011' },
    ],
    styleGroups: [
      { name: 'Length', options: [{ label: 'Knee-Length', premium: 0 }, { label: 'Full-Length', premium: 25 }] },
      { name: 'Collar', options: [{ label: 'Notch', premium: 0 }, { label: 'Ulster', premium: 15 }] },
    ],
  },
  {
    category: 'tie',
    name: 'Silk Tie',
    basePrice: 35,
    fabrics: [
      { name: 'Silk — Navy', swatch: '/swatches/silk-navy.jpg', premium: 0, supplier: 'LS-SLK-NVY-016' },
      { name: 'Silk — Burgundy', swatch: '/swatches/silk-burgundy.jpg', premium: 0, supplier: 'LS-SLK-BUR-017' },
      { name: 'Silk — Patterned', swatch: '/swatches/silk-patterned.jpg', premium: 8, supplier: 'LS-SLK-PAT-019' },
    ],
    styleGroups: [{ name: 'Width', options: [{ label: 'Skinny', premium: 0 }, { label: 'Classic', premium: 0 }, { label: 'Wide', premium: 0 }] }],
  },
  {
    category: 'womens',
    name: 'Tailored Blazer',
    basePrice: 260,
    fabrics: [
      { name: 'Wool — Black', swatch: '/swatches/wool-black.jpg', premium: 0, supplier: 'LS-WOOL-BLK-008' },
      { name: 'Crepe — Navy', swatch: '/swatches/crepe-navy.jpg', premium: 15, supplier: 'LS-CRP-NVY-020' },
      { name: 'Linen — Cream', swatch: '/swatches/linen-cream.jpg', premium: 10, supplier: 'LS-LIN-CRM-010' },
    ],
    styleGroups: [
      { name: 'Lapel', options: [{ label: 'Notch', premium: 0 }, { label: 'Peak', premium: 15 }] },
      { name: 'Fit', options: [{ label: 'Fitted', premium: 0 }, { label: 'Relaxed', premium: 0 }] },
    ],
  },
];

export async function seedIfEmpty() {
  const { rows } = await pool.query('SELECT COUNT(*)::int AS count FROM products');
  if (rows[0].count > 0) return;

  for (const product of SEED_PRODUCTS) {
    const productRes = await pool.query(
      'INSERT INTO products (category, name, base_price) VALUES ($1, $2, $3) RETURNING id',
      [product.category, product.name, product.basePrice],
    );
    const productId = productRes.rows[0].id;

    for (let i = 0; i < product.fabrics.length; i++) {
      const f = product.fabrics[i];
      await pool.query(
        `INSERT INTO fabric_options (product_id, name, swatch_image_url, price_premium, supplier_ref, sort_order)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [productId, f.name, f.swatch, f.premium, f.supplier, i],
      );
    }

    for (let g = 0; g < product.styleGroups.length; g++) {
      const group = product.styleGroups[g];
      const groupRes = await pool.query(
        'INSERT INTO style_groups (product_id, name, sort_order) VALUES ($1, $2, $3) RETURNING id',
        [productId, group.name, g],
      );
      const groupId = groupRes.rows[0].id;
      for (let o = 0; o < group.options.length; o++) {
        const opt = group.options[o];
        await pool.query(
          'INSERT INTO style_options (style_group_id, label, price_premium, sort_order) VALUES ($1, $2, $3, $4)',
          [groupId, opt.label, opt.premium, o],
        );
      }
    }
  }
}
