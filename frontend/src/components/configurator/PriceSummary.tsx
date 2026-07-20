import { useConfiguratorStore } from '../../store/configuratorStore';

export default function PriceSummary() {
  const price = useConfiguratorStore((s) => s.price);

  if (!price) return <p className="text-navy-400">Calculating price…</p>;

  return (
    <div className="border-t border-navy-100 pt-4">
      <h3 className="font-display text-lg text-navy-800 mb-2">Price</h3>
      <ul className="text-sm text-navy-600 space-y-1 mb-2">
        <li className="flex justify-between">
          <span>Base</span>
          <span>${price.basePrice.toFixed(2)}</span>
        </li>
        <li className="flex justify-between">
          <span>{price.fabric.name}</span>
          <span>+${price.fabric.pricePremium.toFixed(2)}</span>
        </li>
        {price.styles.map((s) => (
          <li key={s.id} className="flex justify-between">
            <span>{s.label}</span>
            <span>+${s.pricePremium.toFixed(2)}</span>
          </li>
        ))}
      </ul>
      <p className="flex justify-between font-display text-xl text-navy-800 border-t border-navy-100 pt-2">
        <span>Total</span>
        <span>${price.total.toFixed(2)}</span>
      </p>
    </div>
  );
}
