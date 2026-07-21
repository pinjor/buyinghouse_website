import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { getCart, removeCartItem, checkout, confirmStripePayment, Cart as CartType } from '../api/orderApi';

const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY as string | undefined;
const stripePromise = STRIPE_PUBLISHABLE_KEY ? loadStripe(STRIPE_PUBLISHABLE_KEY) : null;

type PaymentMethod = 'stripe' | 'paypal' | 'wire';

export default function Cart() {
  const [cart, setCart] = useState<CartType | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [placing, setPlacing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(stripePromise ? 'stripe' : 'wire');
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

  async function handleWireCheckout() {
    setPlacing(true);
    setError(null);
    try {
      const order = await checkout('wire');
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
                  disabled={!stripePromise}
                  onClick={() => setPaymentMethod('stripe')}
                  className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                    paymentMethod === 'stripe'
                      ? 'border-itailor-gold bg-itailor-card ring-2 ring-itailor-gold/50 shadow-xl'
                      : 'border-itailor-cardBorder bg-itailor-card/40 hover:border-itailor-gold/40'
                  }`}
                >
                  <span className="text-xl">💳</span>
                  <span className="text-xs font-bold text-itailor-cream">Credit Card</span>
                  <span className="text-[9px] text-itailor-gold font-mono">{stripePromise ? 'Stripe SSL' : 'Unavailable'}</span>
                </button>

                {/* PayPal Option — not yet integrated with a real payment processor */}
                <button
                  type="button"
                  disabled
                  title="PayPal checkout is not yet available"
                  className="p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all border-itailor-cardBorder bg-itailor-card/40 opacity-40 cursor-not-allowed"
                >
                  <span className="text-xl">🅿️</span>
                  <span className="text-xs font-bold text-itailor-cream">PayPal</span>
                  <span className="text-[9px] text-itailor-gold font-mono">Coming Soon</span>
                </button>

                {/* B2B Wire / Commercial Invoice Option */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('wire')}
                  className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all ${
                    paymentMethod === 'wire'
                      ? 'border-itailor-gold bg-itailor-card ring-2 ring-itailor-gold/50 shadow-xl'
                      : 'border-itailor-cardBorder bg-itailor-card/40 hover:border-itailor-gold/40'
                  }`}
                >
                  <span className="text-xl">🏦</span>
                  <span className="text-xs font-bold text-itailor-cream">B2B Wire</span>
                  <span className="text-[9px] text-itailor-gold font-mono">Pro Forma Invoice</span>
                </button>
              </div>

              {/* Wire Invoice Banner */}
              {paymentMethod === 'wire' && (
                <div className="p-4 rounded-xl border border-itailor-cardBorder bg-[#070D16] flex flex-col gap-1.5 text-xs">
                  <p className="font-bold text-itailor-gold">B2B Commercial Pro Forma Invoice</p>
                  <p className="text-itailor-cream/70 text-[11px]">
                    Your order is placed on hold pending wire transfer. An official commercial invoice with bank wire
                    details (SWIFT / IBAN) will be emailed to you, and production begins once payment is confirmed by
                    our team.
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

              {error && <p className="text-xs text-red-400">{error}</p>}

              {paymentMethod === 'stripe' && stripePromise ? (
                <Elements stripe={stripePromise}>
                  <StripeCheckoutForm total={cart.total} placing={placing} setPlacing={setPlacing} setError={setError} />
                </Elements>
              ) : (
                <button
                  type="button"
                  onClick={handleWireCheckout}
                  disabled={placing}
                  className="w-full bg-itailor-cyan hover:bg-itailor-cyanHover text-white font-extrabold text-xs uppercase tracking-widest py-3.5 rounded-xl shadow-xl shadow-itailor-cyan/20 transition-all transform active:scale-95 disabled:opacity-50"
                >
                  {placing ? 'Processing…' : 'CONFIRM & GENERATE INVOICE 📄'}
                </button>
              )}

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

function StripeCheckoutForm({
  total,
  placing,
  setPlacing,
  setError,
}: {
  total: number;
  placing: boolean;
  setPlacing: (v: boolean) => void;
  setError: (v: string | null) => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();

  async function handlePay() {
    if (!stripe || !elements) return;
    setPlacing(true);
    setError(null);
    try {
      const order = await checkout('stripe');
      if (!order.clientSecret) throw new Error('payment could not be initialized');

      const cardElement = elements.getElement(CardElement);
      if (!cardElement) throw new Error('card details are required');

      const result = await stripe.confirmCardPayment(order.clientSecret, {
        payment_method: { card: cardElement },
      });

      if (result.error) throw new Error(result.error.message ?? 'payment failed');
      if (result.paymentIntent?.status !== 'succeeded') throw new Error('payment was not completed');

      await confirmStripePayment(order.id);
      navigate(`/orders/${order.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Checkout & Payment failed');
    } finally {
      setPlacing(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="p-4 rounded-xl border border-itailor-cardBorder bg-[#070D16] shadow-inner">
        <div className="flex justify-between items-center text-xs text-itailor-cream/70 mb-3">
          <span>Visa / Mastercard / AMEX</span>
          <span className="text-[10px] text-itailor-gold font-mono">🔒 256-bit SSL Encrypted</span>
        </div>
        <CardElement
          options={{
            style: {
              base: {
                color: '#F5F1E6',
                fontSize: '13px',
                '::placeholder': { color: '#8a8578' },
              },
            },
          }}
        />
      </div>

      <button
        type="button"
        onClick={handlePay}
        disabled={placing || !stripe}
        className="w-full bg-itailor-cyan hover:bg-itailor-cyanHover text-white font-extrabold text-xs uppercase tracking-widest py-3.5 rounded-xl shadow-xl shadow-itailor-cyan/20 transition-all transform active:scale-95 disabled:opacity-50"
      >
        {placing ? 'Processing Payment…' : `PAY $${total.toFixed(2)} WITH STRIPE 🔒`}
      </button>
    </div>
  );
}
