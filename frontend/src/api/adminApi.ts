import { useAuthStore } from '../store/authStore';

export interface AdminOrder {
  id: string;
  userId: string;
  userEmail: string | null;
  status: string;
  total: number;
  createdAt: string;
}

function authHeaders(): HeadersInit {
  const token = useAuthStore.getState().accessToken;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function handle<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error ?? `request failed (${res.status})`);
  }
  return res.json();
}

export function getAdminOrders(): Promise<AdminOrder[]> {
  return fetch('/api/admin/orders/orders', { headers: authHeaders() }).then((r) => handle(r));
}

export function advanceOrderStatus(orderId: string, status: string): Promise<{ id: string; status: string }> {
  return fetch(`/api/admin/orders/orders/${orderId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ status }),
  }).then((r) => handle(r));
}

export function createProduct(input: { category: string; name: string; basePrice: number }) {
  return fetch('/api/admin/catalog/products', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(input),
  }).then((r) => handle<{ id: string; category: string; name: string; basePrice: number }>(r));
}

export function addFabric(
  productId: string,
  input: { name: string; swatchImageUrl: string; pricePremium: number; supplierRef: string },
) {
  return fetch(`/api/admin/catalog/products/${productId}/fabrics`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(input),
  }).then((r) => handle(r));
}

export function addStyleGroup(productId: string, name: string) {
  return fetch(`/api/admin/catalog/products/${productId}/style-groups`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ name }),
  }).then((r) => handle<{ id: string; name: string }>(r));
}

export function addStyleOption(groupId: string, input: { label: string; pricePremium: number }) {
  return fetch(`/api/admin/catalog/style-groups/${groupId}/options`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(input),
  }).then((r) => handle(r));
}
