import Stripe from 'stripe';

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

const stripe = STRIPE_SECRET_KEY ? new Stripe(STRIPE_SECRET_KEY) : null;

export function isStripeConfigured(): boolean {
  return stripe !== null;
}

export async function createPaymentIntent(amount: number, currency: string, orderId: string) {
  if (!stripe) throw new Error('stripe not configured');
  return stripe.paymentIntents.create({
    amount: Math.round(amount * 100),
    currency,
    metadata: { orderId },
  });
}

export async function retrievePaymentIntent(paymentIntentId: string) {
  if (!stripe) throw new Error('stripe not configured');
  return stripe.paymentIntents.retrieve(paymentIntentId);
}

export function constructWebhookEvent(rawBody: Buffer, signature: string) {
  if (!stripe) throw new Error('stripe not configured');
  if (!STRIPE_WEBHOOK_SECRET) throw new Error('stripe webhook secret not configured');
  return stripe.webhooks.constructEvent(rawBody, signature, STRIPE_WEBHOOK_SECRET);
}
