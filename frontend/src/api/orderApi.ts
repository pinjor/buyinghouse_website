import { useAuthStore } from '../store/authStore';

export interface CartItem {
  id: string;
  productId: string;
  productName: string;
  fabricId: string;
  styleOptionIds: string[];
  measurements: Record<string, string>;
  unitPrice: number;
  quantity: number;
}

export interface Cart {
  id: string;
  items: CartItem[];
  total: number;
}

export interface Order {
  id: string;
  status: string;
  total: number;
  items: CartItem[];
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

export function getCart(): Promise<Cart> {
  return fetch('/api/orders/cart', { headers: authHeaders() }).then((r) => handle(r));
}

export function addCartItem(item: {
  productId: string;
  fabricId: string;
  styleOptionIds: string[];
  measurements: { neck: string; chest: string; waist: string; sleeveLength: string };
}): Promise<Cart> {
  return fetch('/api/orders/cart/items', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(item),
  }).then((r) => handle(r));
}

export function removeCartItem(itemId: string): Promise<Cart> {
  return fetch(`/api/orders/cart/items/${itemId}`, {
    method: 'DELETE',
    headers: authHeaders(),
  }).then((r) => handle(r));
}

export function checkout(): Promise<Order> {
  return fetch('/api/orders/checkout', {
    method: 'POST',
    headers: authHeaders(),
  }).then((r) => handle(r));
}
