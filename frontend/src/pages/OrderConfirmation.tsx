import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

interface OrderDetail {
  id: string;
  status: string;
  total: number;
  paymentMethod?: string;
  createdAt: string;
}

export default function OrderConfirmation() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<OrderDetail | null>(null);

  useEffect(() => {
    if (!id) return;
    const token = useAuthStore.getState().accessToken;
    fetch(`/api/orders/orders/${id}`, { headers: token ? { Authorization: `Bearer ${token}` } : {} })
      .then((r) => r.json())
      .then(setOrder);
  }, [id]);

  if (!order) return <p className="px-8 py-12 text-navy-400">Loading…</p>;

  return (
    <section className="px-8 py-12 max-w-xl">
      <h1 className="font-display text-3xl text-navy-800 mb-4">
        {order.status === 'pending_payment' ? 'Order received' : 'Order placed'}
      </h1>
      <p className="text-navy-600 mb-2">Order ID: {order.id}</p>
      <p className="text-navy-600 mb-2">Status: {order.status.replace('_', ' ')}</p>
      <p className="text-gold-600 font-display text-xl mb-2">${order.total.toFixed(2)}</p>
      {order.status === 'pending_payment' && order.paymentMethod === 'wire' && (
        <p className="text-navy-500 text-sm">
          A commercial invoice with bank wire details will be emailed to you. Production begins once payment is
          confirmed.
        </p>
      )}
    </section>
  );
}
