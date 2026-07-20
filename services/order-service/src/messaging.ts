import amqplib, { type Channel } from 'amqplib';

const RABBITMQ_URL = process.env.RABBITMQ_URL ?? 'amqp://rabbitmq:5672';
const EXCHANGE = 'orders_events';

let channel: Channel | null = null;

export async function connectMessaging() {
  try {
    const connection = await amqplib.connect(RABBITMQ_URL);
    channel = await connection.createChannel();
    await channel.assertExchange(EXCHANGE, 'topic', { durable: true });
    console.log('order-service connected to RabbitMQ');
  } catch (err) {
    console.warn('order-service: RabbitMQ unavailable, continuing without event publishing', err);
    channel = null;
  }
}

export function publishOrderEvent(routingKey: string, payload: unknown) {
  if (!channel) return;
  channel.publish(EXCHANGE, routingKey, Buffer.from(JSON.stringify(payload)), { contentType: 'application/json' });
}
