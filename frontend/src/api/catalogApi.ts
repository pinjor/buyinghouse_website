export interface ProductSummary {
  id: string;
  category: string;
  name: string;
  basePrice: number;
}

export interface FabricOption {
  id: string;
  name: string;
  swatchImageUrl: string;
  pricePremium: number;
  supplierRef: string;
}

export interface StyleOption {
  id: string;
  label: string;
  pricePremium: number;
}

export interface StyleGroup {
  id: string;
  name: string;
  options: StyleOption[];
}

export interface ProductDetail extends ProductSummary {
  fabricOptions: FabricOption[];
  styleOptions: StyleGroup[];
}

export interface PriceBreakdown {
  basePrice: number;
  fabric: { id: string; name: string; pricePremium: number };
  styles: { id: string; label: string; pricePremium: number }[];
  total: number;
}

// Full Demo Product Catalog
const DEMO_FABRICS: FabricOption[] = [
  { id: 'fab-1', name: 'Dark Navy Wool Blend', swatchImageUrl: '/swatches/dark-navy.jpg', pricePremium: 0, supplierRef: 'LS-3799-20' },
  { id: 'fab-2', name: 'Textured Light Grey', swatchImageUrl: '/swatches/light-grey.jpg', pricePremium: 0, supplierRef: 'LS-3799-21' },
  { id: 'fab-3', name: 'Classic Black Suit', swatchImageUrl: '/swatches/black.jpg', pricePremium: 0, supplierRef: 'LS-3799-22' },
  { id: 'fab-4', name: 'Light Navy Wool', swatchImageUrl: '/swatches/light-navy.jpg', pricePremium: 10, supplierRef: 'LS-3800-01' },
  { id: 'fab-5', name: 'Brown Wool Blend', swatchImageUrl: '/swatches/brown.jpg', pricePremium: 10, supplierRef: 'LS-3800-05' },
  { id: 'fab-6', name: 'Textured Charcoal', swatchImageUrl: '/swatches/charcoal.jpg', pricePremium: 15, supplierRef: 'LS-3800-08' },
  { id: 'fab-7', name: 'Khaki Linen Blend', swatchImageUrl: '/swatches/khaki.jpg', pricePremium: 10, supplierRef: 'LS-3801-02' },
  { id: 'fab-8', name: 'Beige Summer Wool', swatchImageUrl: '/swatches/beige.jpg', pricePremium: 10, supplierRef: 'LS-3801-04' },
  { id: 'fab-9', name: 'Green Taupe Twill', swatchImageUrl: '/swatches/green-taupe.jpg', pricePremium: 15, supplierRef: 'LS-3802-09' },
  { id: 'fab-10', name: 'Off White Cream', swatchImageUrl: '/swatches/off-white.jpg', pricePremium: 20, supplierRef: 'LS-3803-12' },
];

const SUIT_STYLE_GROUPS: StyleGroup[] = [
  {
    id: 'grp-buttons',
    name: 'Buttons',
    options: [
      { id: 'btn-1', label: '1 Button, Single Breasted', pricePremium: 0 },
      { id: 'btn-2', label: '2 Buttons, Single Breasted', pricePremium: 0 },
      { id: 'btn-3', label: '3 Buttons, Single Breasted', pricePremium: 0 },
      { id: 'btn-4', label: '4 Buttons, Single Breasted', pricePremium: 5 },
      { id: 'btn-5', label: '4 Buttons, Double Breasted', pricePremium: 15 },
      { id: 'btn-6', label: '6 Buttons, Double Breasted', pricePremium: 20 },
    ],
  },
  {
    id: 'grp-lapel',
    name: 'Lapel',
    options: [
      { id: 'lap-1', label: 'Notch Lapel', pricePremium: 0 },
      { id: 'lap-2', label: 'Peak Lapel', pricePremium: 15 },
      { id: 'lap-3', label: 'Round Notch Lapel', pricePremium: 10 },
      { id: 'lap-4', label: 'Shawl Lapel', pricePremium: 20 },
    ],
  },
  {
    id: 'grp-width',
    name: 'Lapel Width',
    options: [
      { id: 'w-1', label: 'Narrow (2.25 in)', pricePremium: 0 },
      { id: 'w-2', label: 'Standard (2.75 in)', pricePremium: 0 },
      { id: 'w-3', label: 'Wide (3.25 in)', pricePremium: 5 },
    ],
  },
  {
    id: 'grp-buttonhole',
    name: 'Buttonhole',
    options: [
      { id: 'bh-1', label: 'No Lapel Buttonhole', pricePremium: 0 },
      { id: 'bh-2', label: 'With Lapel Buttonhole', pricePremium: 0 },
      { id: 'bh-3', label: 'Contrast Thread Buttonhole', pricePremium: 5 },
    ],
  },
  {
    id: 'grp-pockets',
    name: 'Pockets',
    options: [
      { id: 'poc-1', label: 'Flap Pockets', pricePremium: 0 },
      { id: 'poc-2', label: 'Slanted Flap Pockets', pricePremium: 5 },
      { id: 'poc-3', label: 'Double Pipe (No Flap)', pricePremium: 0 },
      { id: 'poc-4', label: 'Flap + Ticket Pocket', pricePremium: 10 },
    ],
  },
  {
    id: 'grp-sleeves',
    name: 'Sleeve Buttons',
    options: [
      { id: 'slv-1', label: '3 Kissing Buttons', pricePremium: 0 },
      { id: 'slv-2', label: '4 Kissing Buttons', pricePremium: 0 },
      { id: 'slv-3', label: '4 Working Buttonholes', pricePremium: 12 },
    ],
  },
  {
    id: 'grp-vents',
    name: 'Vents',
    options: [
      { id: 'vnt-1', label: 'Single Center Vent', pricePremium: 0 },
      { id: 'vnt-2', label: 'Double Side Vents', pricePremium: 10 },
      { id: 'vnt-3', label: 'No Vent', pricePremium: 0 },
    ],
  },
  {
    id: 'grp-fit',
    name: 'Fit',
    options: [
      { id: 'fit-1', label: 'Slim Fit', pricePremium: 0 },
      { id: 'fit-2', label: 'Tailored Fit', pricePremium: 0 },
      { id: 'fit-3', label: 'Classic Regular Fit', pricePremium: 0 },
    ],
  },
];

const DEMO_PRODUCTS_MAP: Record<string, ProductDetail> = {
  // 1. SUITS & TUXEDOS (Link Sourcing Woven Suits Line)
  'suit-001': {
    id: 'suit-001',
    category: 'suit',
    name: 'Bespoke Tailored 2-Piece Suit',
    basePrice: 239,
    fabricOptions: DEMO_FABRICS,
    styleOptions: SUIT_STYLE_GROUPS,
  },
  'suit-002': {
    id: 'suit-002',
    category: 'suit',
    name: 'Executive 3-Piece Suit & Vest',
    basePrice: 289,
    fabricOptions: DEMO_FABRICS,
    styleOptions: SUIT_STYLE_GROUPS,
  },
  'suit-003': {
    id: 'suit-003',
    category: 'suit',
    name: 'Italian Double-Breasted Suit',
    basePrice: 299,
    fabricOptions: DEMO_FABRICS,
    styleOptions: SUIT_STYLE_GROUPS,
  },
  'tuxedo-001': {
    id: 'tuxedo-001',
    category: 'tuxedo',
    name: 'Formal Black Tie Tuxedo Set',
    basePrice: 319,
    fabricOptions: DEMO_FABRICS,
    styleOptions: SUIT_STYLE_GROUPS,
  },

  // 2. DRESS SHIRTS & WOVEN TOPS (Link Sourcing Woven Shirts Line)
  'shirt-001': {
    id: 'shirt-001',
    category: 'shirt',
    name: 'Egyptian Cotton Custom Dress Shirt',
    basePrice: 60,
    fabricOptions: DEMO_FABRICS.slice(0, 6),
    styleOptions: [
      {
        id: 's-collar',
        name: 'Collar Style',
        options: [
          { id: 'col-1', label: 'Spread Collar', pricePremium: 0 },
          { id: 'col-2', label: 'Button-Down Collar', pricePremium: 0 },
          { id: 'col-3', label: 'Cutaway Italian Collar', pricePremium: 5 },
        ],
      },
      {
        id: 's-cuff',
        name: 'Cuff Style',
        options: [
          { id: 'cuf-1', label: 'Single Button Barrel Cuff', pricePremium: 0 },
          { id: 'cuf-2', label: 'French Double Cuff for Cufflinks', pricePremium: 6 },
        ],
      },
      {
        id: 's-fit',
        name: 'Fit Type',
        options: [
          { id: 'sfit-1', label: 'Slim Fit', pricePremium: 0 },
          { id: 'sfit-2', label: 'Tailored Fit', pricePremium: 0 },
          { id: 'sfit-3', label: 'Classic Comfort Fit', pricePremium: 0 },
        ],
      },
    ],
  },
  'shirt-002': {
    id: 'shirt-002',
    category: 'shirt',
    name: 'Oxford Button-Down Business Shirt',
    basePrice: 65,
    fabricOptions: DEMO_FABRICS.slice(0, 5),
    styleOptions: [
      {
        id: 's-collar',
        name: 'Collar Style',
        options: [
          { id: 'col-2', label: 'Button-Down Collar', pricePremium: 0 },
          { id: 'col-1', label: 'Spread Collar', pricePremium: 0 },
        ],
      },
    ],
  },
  'shirt-003': {
    id: 'shirt-003',
    category: 'shirt',
    name: 'Pure Linen Riviera Summer Shirt',
    basePrice: 70,
    fabricOptions: [DEMO_FABRICS[6], DEMO_FABRICS[7], DEMO_FABRICS[9]],
    styleOptions: [],
  },

  // 3. JACKETS & OVERCOATS (Link Sourcing Outerwear Line)
  'jacket-001': {
    id: 'jacket-001',
    category: 'jacket',
    name: 'Handcrafted Wool Sport Coat',
    basePrice: 159,
    fabricOptions: DEMO_FABRICS,
    styleOptions: SUIT_STYLE_GROUPS,
  },
  'jacket-002': {
    id: 'jacket-002',
    category: 'jacket',
    name: 'Cashmere Blend Winter Overcoat',
    basePrice: 280,
    fabricOptions: DEMO_FABRICS,
    styleOptions: SUIT_STYLE_GROUPS,
  },
  'jacket-003': {
    id: 'jacket-003',
    category: 'jacket',
    name: 'Tweed Heritage Blazer',
    basePrice: 189,
    fabricOptions: DEMO_FABRICS,
    styleOptions: SUIT_STYLE_GROUPS,
  },

  // 4. KNITS & SWEATERS (Link Sourcing 500-Loom Knitwear Line)
  'knit-001': {
    id: 'knit-001',
    category: 'knit',
    name: 'Pique Cotton Polo Shirt',
    basePrice: 45,
    fabricOptions: DEMO_FABRICS.slice(0, 4),
    styleOptions: [],
  },
  'knit-002': {
    id: 'knit-002',
    category: 'knit',
    name: '100% Merino Wool Knit Sweater',
    basePrice: 85,
    fabricOptions: DEMO_FABRICS.slice(0, 6),
    styleOptions: [],
  },
  'knit-003': {
    id: 'knit-003',
    category: 'knit',
    name: 'Jacquard Patterned Pullover',
    basePrice: 95,
    fabricOptions: DEMO_FABRICS.slice(0, 5),
    styleOptions: [],
  },

  // 5. TROUSERS, CHINOS & DENIM (Link Sourcing Bottoms Line)
  'pants-001': {
    id: 'pants-001',
    category: 'pants',
    name: 'Tailored Wool Dress Trousers',
    basePrice: 74,
    fabricOptions: DEMO_FABRICS,
    styleOptions: [],
  },
  'pants-002': {
    id: 'pants-002',
    category: 'pants',
    name: 'Slim Fit Stretch Cotton Chinos',
    basePrice: 65,
    fabricOptions: DEMO_FABRICS.slice(4, 9),
    styleOptions: [],
  },
  'jeans-001': {
    id: 'jeans-001',
    category: 'jeans',
    name: 'Japanese Selvedge Raw Denim Jeans',
    basePrice: 95,
    fabricOptions: DEMO_FABRICS.slice(0, 3),
    styleOptions: [],
  },

  // 6. VESTS & WAISTCOATS (Link Sourcing Vest Line)
  'vest-001': {
    id: 'vest-001',
    category: 'vest',
    name: 'Bespoke Suit Vest / Waistcoat',
    basePrice: 74,
    fabricOptions: DEMO_FABRICS,
    styleOptions: SUIT_STYLE_GROUPS.slice(0, 2),
  },
  'vest-002': {
    id: 'vest-002',
    category: 'vest',
    name: 'Silk Jacquard Tuxedo Vest',
    basePrice: 89,
    fabricOptions: DEMO_FABRICS,
    styleOptions: SUIT_STYLE_GROUPS.slice(0, 2),
  },

  // 7. ACCESSORIES (Link Sourcing Silk Accessories Line)
  'tie-001': {
    id: 'tie-001',
    category: 'tie',
    name: 'Handmade Pure Silk Tie',
    basePrice: 35,
    fabricOptions: DEMO_FABRICS.slice(0, 4),
    styleOptions: [],
  },
  'tie-002': {
    id: 'tie-002',
    category: 'tie',
    name: 'Pocket Square & Silk Tie Set',
    basePrice: 45,
    fabricOptions: DEMO_FABRICS.slice(0, 4),
    styleOptions: [],
  },
};


const ALL_DEMO_SUMMARIES: ProductSummary[] = Object.values(DEMO_PRODUCTS_MAP).map((p) => ({
  id: p.id,
  category: p.category,
  name: p.name,
  basePrice: p.basePrice,
}));

export async function getProducts(category?: string): Promise<ProductSummary[]> {
  try {
    const qs = category ? `?category=${encodeURIComponent(category)}` : '';
    const res = await fetch(`/api/catalog/products${qs}`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) return data;
    }
  } catch (err) {
    // Fetch failed, use demo fallback
  }

  if (category) {
    const filtered = ALL_DEMO_SUMMARIES.filter((p) => p.category.toLowerCase() === category.toLowerCase());
    return filtered.length > 0 ? filtered : ALL_DEMO_SUMMARIES;
  }
  return ALL_DEMO_SUMMARIES;
}

export async function getProduct(id: string): Promise<ProductDetail> {
  try {
    const res = await fetch(`/api/catalog/products/${id}`);
    if (res.ok) {
      const data = await res.json();
      if (data && data.id) return data;
    }
  } catch (err) {
    // Fetch failed, use demo fallback
  }

  // Return requested product or default suit
  return DEMO_PRODUCTS_MAP[id] ?? DEMO_PRODUCTS_MAP['suit-001'];
}

export async function computePrice(
  productId: string,
  fabricId: string,
  styleOptionIds: string[],
): Promise<PriceBreakdown> {
  try {
    const res = await fetch('/api/catalog/price', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, fabricId, styleOptionIds }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.total) return data;
    }
  } catch (err) {
    // Fetch failed, compute locally
  }

  const p = DEMO_PRODUCTS_MAP[productId] ?? DEMO_PRODUCTS_MAP['suit-001'];
  const fab = p.fabricOptions.find((f) => f.id === fabricId) ?? p.fabricOptions[0];

  const matchedStyles: { id: string; label: string; pricePremium: number }[] = [];
  let stylesTotal = 0;

  p.styleOptions.forEach((g) => {
    g.options.forEach((o) => {
      if (styleOptionIds.includes(o.id)) {
        matchedStyles.push({ id: o.id, label: o.label, pricePremium: o.pricePremium });
        stylesTotal += o.pricePremium;
      }
    });
  });

  const basePrice = p.basePrice;
  const fabricPremium = fab ? fab.pricePremium : 0;
  const total = basePrice + fabricPremium + stylesTotal;

  return {
    basePrice,
    fabric: { id: fab ? fab.id : 'default', name: fab ? fab.name : 'Wool Blend', pricePremium: fabricPremium },
    styles: matchedStyles,
    total,
  };
}

