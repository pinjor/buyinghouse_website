const CATALOG_URL = process.env.CATALOG_SERVICE_URL ?? 'http://catalog-service:4002';

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
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ productId, fabricId, styleOptionIds }),
  });
  if (!res.ok) throw new Error(`catalog price lookup failed: ${res.status}`);
  return res.json();
}

export async function getProduct(productId: string): Promise<CatalogProduct> {
  const res = await fetch(`${CATALOG_URL}/products/${productId}`);
  if (!res.ok) throw new Error(`catalog product lookup failed: ${res.status}`);
  return res.json();
}
