import { useConfiguratorStore } from '../../store/configuratorStore';
import { hashColor } from './colorHash';

export default function ConfiguratorSummary() {
  const product = useConfiguratorStore((s) => s.product);
  const fabricId = useConfiguratorStore((s) => s.fabricId);
  const styleSelections = useConfiguratorStore((s) => s.styleSelections);
  const contrastSelections = useConfiguratorStore((s) => s.contrastSelections);
  const measurementMode = useConfiguratorStore((s) => s.measurementMode);
  const standardSize = useConfiguratorStore((s) => s.standardSize);
  const measurements = useConfiguratorStore((s) => s.measurements);
  const price = useConfiguratorStore((s) => s.price);

  if (!product) return null;

  const currentFabric = product.fabricOptions.find((f) => f.id === fabricId) ?? product.fabricOptions[0];
  const suitColor = fabricId ? hashColor(fabricId) : '#1B2A4A';

  // Gather selected style labels
  const selectedStyleItems = product.styleOptions.map((g) => {
    const selectedOpt = g.options.find((o) => o.id === styleSelections[g.id]);
    return {
      groupName: g.name,
      label: selectedOpt?.label ?? 'Standard',
      price: selectedOpt?.pricePremium ?? 0,
    };
  });

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Summary Header */}
      <div className="border-b border-itailor-cardBorder pb-3 flex justify-between items-center">
        <div>
          <h3 className="font-display text-xl text-itailor-gold font-bold uppercase tracking-wide">
            Design Summary Review
          </h3>
          <p className="text-xs text-itailor-cream/60">Review your customized suit specifications before placing order</p>
        </div>
        <button
          type="button"
          onClick={() => window.print()}
          className="text-xs text-itailor-gold border border-itailor-gold/40 px-3 py-1 rounded hover:bg-itailor-gold hover:text-itailor-dark transition-all"
        >
          🖨️ Print Spec
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Specifications List Card */}
        <div className="p-5 rounded-2xl border border-itailor-cardBorder bg-itailor-card/60 flex flex-col gap-4 shadow-xl">
          <div className="flex items-center gap-4 border-b border-itailor-cardBorder/60 pb-3">
            <div
              className="w-12 h-12 rounded-lg border border-itailor-gold/50 shadow-inner"
              style={{ backgroundColor: suitColor }}
            />
            <div>
              <h4 className="font-bold text-sm text-itailor-cream uppercase">{product.name}</h4>
              <p className="text-xs text-itailor-gold uppercase font-medium">{currentFabric.name}</p>
            </div>
          </div>

          <div className="flex flex-col gap-2 text-xs">
            <span className="font-bold text-itailor-gold uppercase tracking-wider text-[11px]">Selected Styles:</span>
            <ul className="space-y-1.5 pl-2 text-itailor-cream/80 border-l border-itailor-cardBorder">
              {selectedStyleItems.map((item) => (
                <li key={item.groupName} className="flex justify-between items-center">
                  <span className="text-itailor-cream/60">{item.groupName}:</span>
                  <span className="font-semibold text-itailor-cream">{item.label}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Contrast & Personalization */}
          <div className="flex flex-col gap-1.5 text-xs pt-2 border-t border-itailor-cardBorder/60">
            <span className="font-bold text-itailor-gold uppercase tracking-wider text-[11px]">Lining & Personalization:</span>
            <div className="flex justify-between text-itailor-cream/80">
              <span className="text-itailor-cream/60">Lining:</span>
              <span className="font-semibold">{contrastSelections.liningColor}</span>
            </div>
            <div className="flex justify-between text-itailor-cream/80">
              <span className="text-itailor-cream/60">Button Thread:</span>
              <span className="font-semibold">{contrastSelections.buttonThreadColor}</span>
            </div>
            {contrastSelections.monogramText && (
              <div className="flex justify-between text-itailor-cream/80">
                <span className="text-itailor-cream/60">Monogram Initials:</span>
                <span className="font-mono font-bold text-itailor-gold">{contrastSelections.monogramText} ({contrastSelections.monogramColor})</span>
              </div>
            )}
          </div>

          {/* Sizing & Measurements */}
          <div className="flex flex-col gap-1.5 text-xs pt-2 border-t border-itailor-cardBorder/60">
            <span className="font-bold text-itailor-gold uppercase tracking-wider text-[11px]">Sizing Specification:</span>
            {measurementMode === 'standard' ? (
              <div className="flex justify-between text-itailor-cream/80">
                <span className="text-itailor-cream/60">Standard Size:</span>
                <span className="font-bold text-itailor-gold">{standardSize}</span>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-1 text-[11px] text-itailor-cream/80">
                <span>Chest: {measurements.chest}"</span>
                <span>Waist: {measurements.waist}"</span>
                <span>Sleeve: {measurements.sleeveLength}"</span>
                <span>Jacket L: {measurements.jacketLength}"</span>
              </div>
            )}
          </div>
        </div>

        {/* Itemized Price Breakdown Table */}
        <div className="p-5 rounded-2xl border border-itailor-cardBorder bg-itailor-card/60 flex flex-col justify-between shadow-xl">
          <div>
            <h4 className="font-display text-base text-itailor-gold font-bold uppercase tracking-wider mb-4 border-b border-itailor-cardBorder/60 pb-2">
              Itemized Pricing Table
            </h4>

            {price ? (
              <ul className="space-y-2.5 text-xs text-itailor-cream/80">
                <li className="flex justify-between items-center">
                  <span>Base Tailored Suit</span>
                  <span className="font-mono">${price.basePrice.toFixed(2)}</span>
                </li>
                <li className="flex justify-between items-center">
                  <span>{price.fabric.name}</span>
                  <span className="font-mono text-itailor-gold">+${price.fabric.pricePremium.toFixed(2)}</span>
                </li>
                {price.styles.map((s) => (
                  <li key={s.id} className="flex justify-between items-center">
                    <span>{s.label}</span>
                    <span className="font-mono text-itailor-gold">+${s.pricePremium.toFixed(2)}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-itailor-cream/50">Calculating price specs...</p>
            )}
          </div>

          <div className="border-t border-itailor-gold/40 pt-4 mt-6">
            <div className="flex justify-between items-baseline">
              <span className="font-display text-lg text-itailor-cream font-bold">TOTAL PRICE:</span>
              <span className="font-display text-2xl font-bold text-itailor-gold">
                ${price ? price.total.toFixed(2) : (product.basePrice + currentFabric.pricePremium).toFixed(2)}
              </span>
            </div>
            <p className="text-[10px] text-itailor-cream/50 mt-1 text-right">Includes custom tailoring & worldwide delivery</p>
          </div>
        </div>
      </div>
    </div>
  );
}
