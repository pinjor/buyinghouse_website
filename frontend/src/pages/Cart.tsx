import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCart, removeCartItem, checkout, Cart as CartType } from '../api/orderApi';

export default function Cart() {
  const [cart, setCart] = useState<CartType | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [placing, setPlacing] = useState(false);
  const navigate = useNavigate();

  function refresh() {
    getCart()
      .then(setCart)
      .catch((err) => setError(err.message));
  }

  useEffect(refresh, []);

  async function handleRemove(itemId: string) {
    try {
      setCart(await removeCartItem(itemId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove item');
    }
  }

  async function handleCheckout() {
    setPlacing(true);
    setError(null);
    try {
      const order = await checkout();
      navigate(`/orders/${order.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Checkout failed');
    } finally {
      setPlacing(false);
    }
  }

  if (error) return <p className="px-8 py-12 text-red-600">{error}</p>;
  if (!cart) return <p className="px-8 py-12 text-navy-400">Loading…</p>;

  return (
    <section className="px-8 py-12 max-w-2xl">
      <h1 className="font-display text-3xl text-navy-800 mb-8">Cart</h1>
      {cart.items.length === 0 ? (
        <p className="text-navy-400">Your cart is empty.</p>
      ) : (
        <>
          <ul className="space-y-4 mb-8">
            {cart.items.map((item) => (
              <li key={item.id} className="flex justify-between items-center border border-navy-100 rounded p-4">
                <div>
                  <p className="font-medium text-navy-800">{item.productName}</p>
                  <p className="text-sm text-navy-400">Qty {item.quantity}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-gold-600 font-medium">${item.unitPrice.toFixed(2)}</span>
                  <button onClick={() => handleRemove(item.id)} className="text-sm text-navy-400 hover:text-red-600">
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
          <p className="flex justify-between font-display text-xl text-navy-800 border-t border-navy-100 pt-4 mb-6">
            <span>Total</span>
            <span>${cart.total.toFixed(2)}</span>
          </p>
          <button
            onClick={handleCheckout}
            disabled={placing}
            className="bg-navy-800 text-white rounded px-6 py-2 hover:bg-navy-700 disabled:opacity-50"
          >
            {placing ? 'Placing order…' : 'Checkout'}
          </button>
        </>
      )}
    </section>
  );
}
