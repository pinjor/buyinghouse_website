import mysql from 'mysql2/promise';

export const pool = mysql.createPool(
  process.env.DATABASE_URL ?? 'mysql://root:root@localhost:3306/catalog',
);

export async function migrate() {
  const statements = [
    `CREATE TABLE IF NOT EXISTS products (
      id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
      category TEXT NOT NULL,
      name TEXT NOT NULL,
      base_price DECIMAL(10,2) NOT NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB`,

    `CREATE TABLE IF NOT EXISTS fabric_options (
      id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
      product_id CHAR(36) NOT NULL,
      name TEXT NOT NULL,
      swatch_image_url TEXT NOT NULL,
      price_premium DECIMAL(10,2) NOT NULL DEFAULT 0,
      supplier_ref TEXT NOT NULL,
      sort_order INT NOT NULL DEFAULT 0,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    ) ENGINE=InnoDB`,

    `CREATE TABLE IF NOT EXISTS style_groups (
      id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
      product_id CHAR(36) NOT NULL,
      name TEXT NOT NULL,
      sort_order INT NOT NULL DEFAULT 0,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    ) ENGINE=InnoDB`,

    `CREATE TABLE IF NOT EXISTS style_options (
      id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
      style_group_id CHAR(36) NOT NULL,
      label TEXT NOT NULL,
      price_premium DECIMAL(10,2) NOT NULL DEFAULT 0,
      sort_order INT NOT NULL DEFAULT 0,
      FOREIGN KEY (style_group_id) REFERENCES style_groups(id) ON DELETE CASCADE
    ) ENGINE=InnoDB`,
  ];

  for (const statement of statements) {
    await pool.query(statement);
  }
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
    name: 'Custom Tailored Suit',
    basePrice: 239,
    fabrics: [
      { name: 'Dark Navy Wool Blend', swatch: '/swatches/dark-navy.jpg', premium: 0, supplier: 'LS-3799-20' },
      { name: 'Textured Light Grey', swatch: '/swatches/light-grey.jpg', premium: 0, supplier: 'LS-3799-21' },
      { name: 'Classic Black Suit', swatch: '/swatches/black.jpg', premium: 0, supplier: 'LS-3799-22' },
      { name: 'Light Navy Wool', swatch: '/swatches/light-navy.jpg', premium: 10, supplier: 'LS-3800-01' },
      { name: 'Brown Wool Blend', swatch: '/swatches/brown.jpg', premium: 10, supplier: 'LS-3800-05' },
      { name: 'Textured Charcoal', swatch: '/swatches/charcoal.jpg', premium: 15, supplier: 'LS-3800-08' },
      { name: 'Khaki Linen Blend', swatch: '/swatches/khaki.jpg', premium: 10, supplier: 'LS-3801-02' },
      { name: 'Beige Summer Wool', swatch: '/swatches/beige.jpg', premium: 10, supplier: 'LS-3801-04' },
      { name: 'Green Taupe Twill', swatch: '/swatches/green-taupe.jpg', premium: 15, supplier: 'LS-3802-09' },
      { name: 'Off White Cream', swatch: '/swatches/off-white.jpg', premium: 20, supplier: 'LS-3803-12' },
    ],
    styleGroups: [
      {
        name: 'Buttons',
        options: [
          { label: '1 Button, Single Breasted', premium: 0 },
          { label: '2 Buttons, Single Breasted', premium: 0 },
          { label: '3 Buttons, Single Breasted', premium: 0 },
          { label: '4 Buttons, Single Breasted', premium: 5 },
          { label: '4 Buttons, Double Breasted', premium: 15 },
          { label: '6 Buttons, Double Breasted', premium: 20 },
        ],
      },
      {
        name: 'Lapel',
        options: [
          { label: 'Notch Lapel', premium: 0 },
          { label: 'Peak Lapel', premium: 15 },
          { label: 'Round Notch Lapel', premium: 10 },
          { label: 'Shawl Lapel', premium: 20 },
        ],
      },
      {
        name: 'Lapel Width',
        options: [
          { label: 'Narrow (2.25 in)', premium: 0 },
          { label: 'Standard (2.75 in)', premium: 0 },
          { label: 'Wide (3.25 in)', premium: 5 },
        ],
      },
      {
        name: 'Buttonhole',
        options: [
          { label: 'No Lapel Buttonhole', premium: 0 },
          { label: 'With Lapel Buttonhole', premium: 0 },
          { label: 'Contrast Thread Buttonhole', premium: 5 },
        ],
      },
      {
        name: 'Pockets',
        options: [
          { label: 'Flap Pockets', premium: 0 },
          { label: 'Slanted Flap Pockets', premium: 5 },
          { label: 'Double Pipe (No Flap)', premium: 0 },
          { label: 'Flap + Ticket Pocket', premium: 10 },
        ],
      },
      {
        name: 'Sleeve Buttons',
        options: [
          { label: '3 Kissing Buttons', premium: 0 },
          { label: '4 Kissing Buttons', premium: 0 },
          { label: '4 Working Buttonholes', premium: 12 },
        ],
      },
      {
        name: 'Vents',
        options: [
          { label: 'Single Center Vent', premium: 0 },
          { label: 'Double Side Vents', premium: 10 },
          { label: 'No Vent', premium: 0 },
        ],
      },
      {
        name: 'Fit',
        options: [
          { label: 'Slim Fit', premium: 0 },
          { label: 'Tailored Fit', premium: 0 },
          { label: 'Classic Regular Fit', premium: 0 },
        ],
      },
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
  const [rows] = await pool.query('SELECT COUNT(*) AS count FROM products');
  const count = Number((rows as { count: number }[])[0].count);
  if (count > 0) return;

  for (const product of SEED_PRODUCTS) {
    const [productResult] = await pool.query(
      'INSERT INTO products (category, name, base_price) VALUES (?, ?, ?) RETURNING id',
      [product.category, product.name, product.basePrice],
    );
    const productId = (productResult as { id: string }[])[0].id;

    for (let i = 0; i < product.fabrics.length; i++) {
      const f = product.fabrics[i];
      await pool.query(
        `INSERT INTO fabric_options (product_id, name, swatch_image_url, price_premium, supplier_ref, sort_order)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [productId, f.name, f.swatch, f.premium, f.supplier, i],
      );
    }

    for (let g = 0; g < product.styleGroups.length; g++) {
      const group = product.styleGroups[g];
      const [groupResult] = await pool.query(
        'INSERT INTO style_groups (product_id, name, sort_order) VALUES (?, ?, ?) RETURNING id',
        [productId, group.name, g],
      );
      const groupId = (groupResult as { id: string }[])[0].id;
      for (let o = 0; o < group.options.length; o++) {
        const opt = group.options[o];
        await pool.query(
          'INSERT INTO style_options (style_group_id, label, price_premium, sort_order) VALUES (?, ?, ?, ?)',
          [groupId, opt.label, opt.premium, o],
        );
      }
    }
  }
}
