const CATALOG_URL = process.env.CATALOG_SERVICE_URL ?? 'http://catalog-service:4002';

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    console.error(`missing required env var ${name}`);
    process.exit(1);
  }
  return value;
}

const INTERNAL_SERVICE_SECRET = requireEnv('INTERNAL_SERVICE_SECRET');

export interface PriceBreakdown {
  basePrice: number;
  fabric: { id: string; name: string; pricePremium: number };
  styles: { id: string; label: string; pricePremium: number }[];
  total: number;
}

export interface CatalogProduct {
  id: string;
  name: string;
}

export async function priceProduct(
  productId: string,
  fabricId: string,
  styleOptionIds: string[],
): Promise<PriceBreakdown> {
  const res = await fetch(`${CATALOG_URL}/price`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-internal-secret': INTERNAL_SERVICE_SECRET },
    body: JSON.stringify({ productId, fabricId, styleOptionIds }),
  });
  if (!res.ok) throw new Error(`catalog price lookup failed: ${res.status}`);
  return res.json();
}

export async function getProduct(productId: string): Promise<CatalogProduct> {
  const res = await fetch(`${CATALOG_URL}/products/${productId}`, {
    headers: { 'x-internal-secret': INTERNAL_SERVICE_SECRET },
  });
  if (!res.ok) throw new Error(`catalog product lookup failed: ${res.status}`);
  return res.json();
}
