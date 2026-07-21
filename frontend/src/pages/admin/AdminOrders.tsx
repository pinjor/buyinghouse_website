import { useEffect, useState } from 'react';
import { getAdminOrders, advanceOrderStatus, AdminOrder } from '../../api/adminApi';

const NEXT_STATUS: Record<string, string | null> = {
  pending_payment: 'placed',
  placed: 'in_production',
  in_production: 'shipped',
  shipped: 'delivered',
  delivered: null,
};

export default function AdminOrders() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  function refresh() {
    getAdminOrders()
      .then(setOrders)
      .catch((err) => setError(err.message));
  }

  useEffect(refresh, []);

  async function handleAdvance(order: AdminOrder) {
    const next = NEXT_STATUS[order.status];
    if (!next) return;
    setBusyId(order.id);
    setError(null);
    try {
      await advanceOrderStatus(order.id, next);
      refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update status');
    } finally {
      setBusyId(null);
    }
  }

  return (
    <section className="px-8 py-12">
      <h1 className="font-display text-3xl text-navy-800 mb-8">Orders</h1>
      {error && <p className="text-red-600 mb-4">{error}</p>}
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="text-left text-navy-400 border-b border-navy-100">
              <th className="py-2 pr-4">Order</th>
              <th className="py-2 pr-4">Customer</th>
              <th className="py-2 pr-4">Status</th>
              <th className="py-2 pr-4">Total</th>
              <th className="py-2 pr-4">Placed</th>
              <th className="py-2 pr-4" />
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-b border-navy-50">
                <td className="py-2 pr-4 text-navy-800">{o.id.slice(0, 8)}</td>
                <td className="py-2 pr-4">{o.userEmail ?? o.userId.slice(0, 8)}</td>
                <td className="py-2 pr-4 capitalize">{o.status.replace('_', ' ')}</td>
                <td className="py-2 pr-4">${o.total.toFixed(2)}</td>
                <td className="py-2 pr-4 text-navy-400">{new Date(o.createdAt).toLocaleDateString()}</td>
                <td className="py-2 pr-4">
                  {NEXT_STATUS[o.status] && (
                    <button
                      onClick={() => handleAdvance(o)}
                      disabled={busyId === o.id}
                      className="text-gold-600 hover:underline disabled:opacity-50"
                    >
                      Mark {NEXT_STATUS[o.status]?.replace('_', ' ')}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {orders.length === 0 && <p className="text-navy-400 mt-4">No orders yet.</p>}
      </div>
    </section>
  );
}
