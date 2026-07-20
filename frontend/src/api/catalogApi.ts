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

export async function getProducts(category?: string): Promise<ProductSummary[]> {
  const qs = category ? `?category=${encodeURIComponent(category)}` : '';
  const res = await fetch(`/api/catalog/products${qs}`);
  if (!res.ok) throw new Error('failed to load products');
  return res.json();
}

export async function getProduct(id: string): Promise<ProductDetail> {
  const res = await fetch(`/api/catalog/products/${id}`);
  if (!res.ok) throw new Error('failed to load product');
  return res.json();
}

export async function computePrice(
  productId: string,
  fabricId: string,
  styleOptionIds: string[],
): Promise<PriceBreakdown> {
  const res = await fetch('/api/catalog/price', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ productId, fabricId, styleOptionIds }),
  });
  if (!res.ok) throw new Error('failed to price product');
  return res.json();
}
