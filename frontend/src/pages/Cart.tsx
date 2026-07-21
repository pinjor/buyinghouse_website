import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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

  if (error) return <div className="max-w-3xl mx-auto px-6 py-12 text-red-400">{error}</div>;
  if (!cart) return <div className="max-w-3xl mx-auto px-6 py-20 text-center text-itailor-gold font-display text-lg">Loading Cart…</div>;

  return (
    <div className="max-w-3xl mx-auto px-6 py-12 flex flex-col gap-8">
      <div className="border-b border-itailor-cardBorder pb-4 flex justify-between items-end">
        <div>
          <h1 className="font-display text-3xl font-bold text-itailor-gold uppercase tracking-wide">
            Your Custom Shopping Bag
          </h1>
          <p className="text-xs text-itailor-cream/60 mt-1">Tailored items saved for order placement</p>
        </div>
        <span className="text-xs text-itailor-cream/50 uppercase tracking-widest">{cart.items.length} Items</span>
      </div>

      {cart.items.length === 0 ? (
        <div className="py-20 text-center flex flex-col items-center gap-4">
          <p className="text-itailor-cream/50 text-base">Your custom shopping bag is empty.</p>
          <Link
            to="/suit"
            className="bg-itailor-cyan hover:bg-itailor-cyanHover text-white font-extrabold text-xs uppercase tracking-widest px-6 py-3 rounded-lg shadow-lg transition-all"
          >
            START CUSTOMIZING NOW ✂️
          </Link>
        </div>
      ) : (
        <>
          <ul className="space-y-4">
            {cart.items.map((item) => (
              <li
                key={item.id}
                className="flex justify-between items-center border border-itailor-cardBorder bg-itailor-card/50 rounded-2xl p-6 shadow-xl"
              >
                <div>
                  <h3 className="font-display text-lg font-bold text-itailor-cream">{item.productName}</h3>
                  <p className="text-xs text-itailor-gold uppercase mt-1">Quantity: {item.quantity}</p>
                </div>

                <div className="flex items-center gap-6">
                  <span className="font-mono text-lg font-bold text-itailor-gold">${item.unitPrice.toFixed(2)}</span>
                  <button
                    type="button"
                    onClick={() => handleRemove(item.id)}
                    className="text-xs text-itailor-cream/40 hover:text-itailor-red transition-colors"
                  >
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>

          <div className="border-t border-itailor-cardBorder pt-6 flex flex-col gap-6">
            <div className="flex justify-between items-baseline">
              <span className="font-display text-xl font-bold text-itailor-cream uppercase">TOTAL AMOUNT:</span>
              <span className="font-display text-3xl font-bold text-itailor-gold">${cart.total.toFixed(2)}</span>
            </div>

            <button
              type="button"
              onClick={handleCheckout}
              disabled={placing}
              className="w-full bg-itailor-cyan hover:bg-itailor-cyanHover text-white font-extrabold text-xs uppercase tracking-widest py-4 rounded-xl shadow-xl shadow-itailor-cyan/20 transition-all transform active:scale-95 disabled:opacity-50"
            >
              {placing ? 'Placing Order…' : 'PROCEED TO CHECKOUT 🔒'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

