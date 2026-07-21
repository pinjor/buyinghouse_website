import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getCart, removeCartItem, checkout, Cart as CartType } from '../api/orderApi';

export default function Cart() {
  const [cart, setCart] = useState<CartType | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [placing, setPlacing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'paypal' | 'invoice'>('stripe');
  
  // Form State for Credit Card
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [cardName, setCardName] = useState('');

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
      setError(err instanceof Error ? err.message : 'Checkout & Payment failed');
    } finally {
      setPlacing(false);
    }
  }

  if (error) return <div className="max-w-3xl mx-auto px-6 py-12 text-red-400">{error}</div>;
  if (!cart) return <div className="max-w-3xl mx-auto px-6 py-20 text-center text-itailor-gold font-display text-lg">Loading Cart…</div>;

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 flex flex-col gap-8">
      {/* Page Header */}
      <div className="border-b border-itailor-cardBorder pb-4 flex justify-between items-end">
        <div>
          <h1 className="font-display text-3xl font-bold text-itailor-gold uppercase tracking-wide">
            Checkout & Secure Payment
          </h1>
          <p className="text-xs text-itailor-cream/60 mt-1">Review tailored items and select your preferred payment gateway</p>
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
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8">
          {/* Left Column: Cart Items & Payment Method Selector */}
          <div className="flex flex-col gap-6">
            <h2 className="text-xs font-bold text-itailor-gold uppercase tracking-widest border-b border-itailor-cardBorder pb-2">
              1. ORDER ITEMS SUMMARY
            </h2>
            <ul className="space-y-3">
              {cart.items.map((item) => (
                <li
                  key={item.id}
                  className="flex justify-between items-center border border-itailor-cardBorder bg-itailor-card/50 rounded-xl p-4 shadow-md"
                >
                  <div>
                    <h3 className="font-display text-base font-bold text-itailor-cream">{item.productName}</h3>
                    <p className="text-[11px] text-itailor-gold uppercase mt-0.5">Quantity: {item.quantity}</p>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="font-mono text-base font-bold text-itailor-gold">${item.unitPrice.toFixed(2)}</span>
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

            {/* PAYMENT GATEWAY SELECTOR */}
            <div className="flex flex-col gap-4 pt-4 border-t border-itailor-cardBorder">
              <h2 className="text-xs font-bold text-itailor-gold uppercase tracking-widest">
                2. SELECT PAYMENT GATEWAY
              </h2>

              <div className="grid grid-cols-3 gap-3">
                {/* Stripe Card Option */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('stripe')}
                  className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all ${
                    paymentMethod === 'stripe'
                      ? 'border-itailor-gold bg-itailor-card ring-2 ring-itailor-gold/50 shadow-xl'
                      : 'border-itailor-cardBorder bg-itailor-card/40 hover:border-itailor-gold/40'
                  }`}
                >
                  <span className="text-xl">💳</span>
                  <span className="text-xs font-bold text-itailor-cream">Credit Card</span>
                  <span className="text-[9px] text-itailor-gold font-mono">Stripe SSL</span>
                </button>

                {/* PayPal Option */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('paypal')}
                  className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all ${
                    paymentMethod === 'paypal'
                      ? 'border-itailor-gold bg-itailor-card ring-2 ring-itailor-gold/50 shadow-xl'
                      : 'border-itailor-cardBorder bg-itailor-card/40 hover:border-itailor-gold/40'
                  }`}
                >
                  <span className="text-xl">🅿️</span>
                  <span className="text-xs font-bold text-itailor-cream">PayPal</span>
                  <span className="text-[9px] text-itailor-gold font-mono">Express Checkout</span>
                </button>

                {/* B2B Wire / Commercial Invoice Option */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('invoice')}
                  className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all ${
                    paymentMethod === 'invoice'
                      ? 'border-itailor-gold bg-itailor-card ring-2 ring-itailor-gold/50 shadow-xl'
                      : 'border-itailor-cardBorder bg-itailor-card/40 hover:border-itailor-gold/40'
                  }`}
                >
                  <span className="text-xl">🏦</span>
                  <span className="text-xs font-bold text-itailor-cream">B2B Wire</span>
                  <span className="text-[9px] text-itailor-gold font-mono">Pro Forma Invoice</span>
                </button>
              </div>

              {/* Stripe Payment Input Form */}
              {paymentMethod === 'stripe' && (
                <div className="p-4 rounded-xl border border-itailor-cardBorder bg-[#070D16] flex flex-col gap-3 shadow-inner">
                  <div className="flex justify-between items-center text-xs text-itailor-cream/70">
                    <span>Visa / Mastercard / AMEX / Apple Pay</span>
                    <span className="text-[10px] text-itailor-gold font-mono">🔒 256-bit SSL Encrypted</span>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-itailor-cream/70 uppercase">Cardholder Name</label>
                    <input
                      type="text"
                      placeholder="e.g. John Doe"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      className="bg-itailor-card border border-itailor-cardBorder rounded px-3 py-1.5 text-xs text-itailor-cream focus:border-itailor-gold focus:outline-none"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-itailor-cream/70 uppercase">Card Number</label>
                    <input
                      type="text"
                      maxLength={19}
                      placeholder="4532 •••• •••• 8921"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="bg-itailor-card border border-itailor-cardBorder rounded px-3 py-1.5 text-xs text-itailor-gold font-mono focus:border-itailor-gold focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-itailor-cream/70 uppercase">Expiry Date</label>
                      <input
                        type="text"
                        maxLength={5}
                        placeholder="MM / YY"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        className="bg-itailor-card border border-itailor-cardBorder rounded px-3 py-1.5 text-xs text-itailor-cream font-mono focus:border-itailor-gold focus:outline-none"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-itailor-cream/70 uppercase">CVC / CVV</label>
                      <input
                        type="text"
                        maxLength={4}
                        placeholder="123"
                        value={cardCvc}
                        onChange={(e) => setCardCvc(e.target.value)}
                        className="bg-itailor-card border border-itailor-cardBorder rounded px-3 py-1.5 text-xs text-itailor-cream font-mono focus:border-itailor-gold focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* PayPal Express Banner */}
              {paymentMethod === 'paypal' && (
                <div className="p-4 rounded-xl border border-itailor-cardBorder bg-[#070D16] text-center flex flex-col items-center gap-2">
                  <p className="text-xs text-itailor-cream/80">
                    You will be redirected to PayPal Express to securely complete your payment.
                  </p>
                  <span className="text-sm font-bold text-itailor-gold">PayPal Buyer Protection Included</span>
                </div>
              )}

              {/* Invoice Banner */}
              {paymentMethod === 'invoice' && (
                <div className="p-4 rounded-xl border border-itailor-cardBorder bg-[#070D16] flex flex-col gap-1.5 text-xs">
                  <p className="font-bold text-itailor-gold">B2B Commercial Pro Forma Invoice</p>
                  <p className="text-itailor-cream/70 text-[11px]">
                    An official commercial invoice with bank wire details (SWIFT / IBAN) will be generated and emailed for corporate procurement.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Order Total & Payment Submit Card */}
          <div className="p-6 rounded-2xl border border-itailor-cardBorder bg-itailor-card/60 flex flex-col justify-between shadow-2xl h-fit">
            <div>
              <h2 className="font-display text-lg font-bold text-itailor-gold uppercase border-b border-itailor-cardBorder pb-3 mb-4">
                Payment Summary
              </h2>

              <ul className="space-y-2 text-xs text-itailor-cream/80">
                <li className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-mono">${cart.total.toFixed(2)}</span>
                </li>
                <li className="flex justify-between text-itailor-gold">
                  <span>Worldwide Bespoke Delivery</span>
                  <span className="font-mono font-bold">FREE</span>
                </li>
                <li className="flex justify-between text-itailor-cream/50 text-[11px]">
                  <span>Custom Tailoring Specs</span>
                  <span>Included</span>
                </li>
              </ul>
            </div>

            <div className="border-t border-itailor-gold/40 pt-4 mt-6 flex flex-col gap-4">
              <div className="flex justify-between items-baseline">
                <span className="font-display text-base font-bold text-itailor-cream uppercase">Total Amount:</span>
                <span className="font-display text-2xl font-bold text-itailor-gold">${cart.total.toFixed(2)}</span>
              </div>

              <button
                type="button"
                onClick={handleCheckout}
                disabled={placing}
                className="w-full bg-itailor-cyan hover:bg-itailor-cyanHover text-white font-extrabold text-xs uppercase tracking-widest py-3.5 rounded-xl shadow-xl shadow-itailor-cyan/20 transition-all transform active:scale-95 disabled:opacity-50"
              >
                {placing
                  ? 'Processing Payment…'
                  : paymentMethod === 'stripe'
                  ? `PAY $${cart.total.toFixed(2)} WITH STRIPE 🔒`
                  : paymentMethod === 'paypal'
                  ? 'PAY WITH PAYPAL 🅿️'
                  : 'CONFIRM & GENERATE INVOICE 📄'}
              </button>

              <div className="text-center text-[10px] text-itailor-cream/40 flex items-center justify-center gap-2">
                <span>🔒 256-Bit Encryption</span>
                <span>•</span>
                <span>100% Fit Guarantee</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


