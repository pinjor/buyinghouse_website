import express from 'express';
import amqplib, { type ChannelModel, type Channel, type ConsumeMessage } from 'amqplib';
import { sendEmail } from './mailer.js';

const app = express();
let ready = false;
app.get('/health', (_req, res) => res.json({ status: ready ? 'ok' : 'connecting' }));

const RABBITMQ_URL = process.env.RABBITMQ_URL ?? 'amqp://rabbitmq:5672';
const EXCHANGE = 'orders_events';
const QUEUE = 'notification-service.order-events';

const templates: Record<string, (payload: any) => { subject: string; body: string }> = {
  'order.placed': (p) => ({
    subject: `Order confirmed — #${p.orderId}`,
    body: `Thanks for your order! Total: $${Number(p.total).toFixed(2)} (${p.itemCount} item(s)). We'll notify you as it moves through production.`,
  }),
  'order.in_production': (p) => ({
    subject: `Order #${p.orderId} is in production`,
    body: `Your custom garment is now being tailored.`,
  }),
  'order.shipped': (p) => ({
    subject: `Order #${p.orderId} has shipped`,
    body: `Your order is on its way.`,
  }),
  'order.delivered': (p) => ({
    subject: `Order #${p.orderId} delivered`,
    body: `Your order has been delivered. Enjoy!`,
  }),
};

async function handleMessage(routingKey: string, payload: any) {
  const template = templates[routingKey];
  if (!template) {
    console.warn(`notification-service: no template for routing key "${routingKey}", skipping`);
    return;
  }
  if (!payload.userEmail) {
    console.warn(`notification-service: event ${routingKey} for order ${payload.orderId} has no userEmail, skipping`);
    return;
  }
  const { subject, body } = template(payload);
  await sendEmail(payload.userEmail, subject, body);
}

async function connectAndConsume(attempt = 1) {
  let connection: ChannelModel;
  try {
    connection = await amqplib.connect(RABBITMQ_URL);
  } catch (err) {
    const delay = Math.min(3000 * attempt, 15000);
    console.warn(`notification-service: RabbitMQ connect failed (attempt ${attempt}), retrying in ${delay}ms`, err);
    setTimeout(() => connectAndConsume(attempt + 1), delay);
    return;
  }

  connection.on('close', () => {
    ready = false;
    console.warn('notification-service: RabbitMQ connection closed, reconnecting');
    setTimeout(() => connectAndConsume(1), 3000);
  });

  const channel: Channel = await connection.createChannel();
  await channel.assertExchange(EXCHANGE, 'topic', { durable: true });
  const queue = await channel.assertQueue(QUEUE, { durable: true });
  await channel.bindQueue(queue.queue, EXCHANGE, 'order.*');

  channel.consume(queue.queue, (msg: ConsumeMessage | null) => {
    if (!msg) return;
    (async () => {
      try {
        const payload = JSON.parse(msg.content.toString());
        await handleMessage(msg.fields.routingKey, payload);
        channel.ack(msg);
      } catch (err) {
        console.error('notification-service: failed to process message', err);
        channel.nack(msg, false, false);
      }
    })();
  });

  ready = true;
  console.log('notification-service connected to RabbitMQ, consuming order events');
}

const PORT = process.env.PORT ?? 4004;
app.listen(PORT, () => console.log(`notification-service listening on ${PORT}`));
connectAndConsume();
