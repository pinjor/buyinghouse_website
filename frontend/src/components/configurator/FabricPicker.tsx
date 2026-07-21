import { useState } from 'react';
import type { FabricOption } from '../../api/catalogApi';
import { hashColor } from './colorHash';
import { useConfiguratorStore } from '../../store/configuratorStore';

interface Props {
  options: FabricOption[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export default function FabricPicker({ options, selectedId, onSelect }: Props) {
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('ALL');
  const isZoomModalOpen = useConfiguratorStore((s) => s.isZoomModalOpen);
  const setIsZoomModalOpen = useConfiguratorStore((s) => s.setIsZoomModalOpen);

  const selectedFabric = options.find((f) => f.id === selectedId) ?? options[0];

  // Category Filter logic
  const categories = [
    { id: 'ALL', label: 'All Fabrics' },
    { id: 'PROMO', label: 'Promotion' },
    { id: 'SOLID', label: 'Solid Colors' },
    { id: 'PATTERNS', label: 'Patterns' },
    { id: 'WOOL', label: 'Pure Wool' },
  ];

  const filteredOptions = options.filter((f) => {
    if (activeCategoryFilter === 'ALL') return true;
    if (activeCategoryFilter === 'PROMO') return f.pricePremium === 0;
    if (activeCategoryFilter === 'SOLID') return !f.name.toLowerCase().includes('pinstripe');
    if (activeCategoryFilter === 'PATTERNS') return f.name.toLowerCase().includes('stripe') || f.name.toLowerCase().includes('textured');
    if (activeCategoryFilter === 'WOOL') return f.name.toLowerCase().includes('wool');
    return true;
  });

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Category Submenu Filters */}
      <div className="flex flex-wrap items-center gap-2 border-b border-itailor-cardBorder pb-3">
        <span className="text-xs uppercase tracking-wider text-itailor-gold font-bold mr-2">Filter:</span>
        {categories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setActiveCategoryFilter(cat.id)}
            className={`px-3 py-1 rounded text-xs font-semibold uppercase tracking-wider transition-all ${
              activeCategoryFilter === cat.id
                ? 'bg-itailor-gold text-itailor-dark shadow-md'
                : 'bg-itailor-card text-itailor-cream/70 hover:text-itailor-cream hover:bg-itailor-cardBorder'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Fabric Grid Swatches */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-[500px] overflow-y-auto pr-1">
        {filteredOptions.map((f) => {
          const isSelected = selectedId === f.id;
          const bg = hashColor(f.id);
          const isPromo = f.pricePremium === 0;

          return (
            <button
              key={f.id}
              type="button"
              onClick={() => onSelect(f.id)}
              className={`group relative flex flex-col rounded-lg border p-2 text-left transition-all duration-200 ${
                isSelected
                  ? 'border-itailor-gold bg-itailor-card ring-2 ring-itailor-gold/50 scale-[1.02] shadow-xl'
                  : 'border-itailor-cardBorder bg-itailor-card/60 hover:border-itailor-gold/50 hover:bg-itailor-card'
              }`}
            >
              {/* Promo Ribbon */}
              {isPromo && (
                <div className="absolute top-0 right-0 bg-itailor-red text-white text-[9px] font-bold px-2 py-0.5 rounded-bl-lg rounded-tr-md shadow uppercase tracking-widest z-10">
                  PROMO
                </div>
              )}

              {/* Swatch Image Box */}
              <div
                className="relative h-24 w-full rounded-md mb-2 overflow-hidden border border-itailor-cardBorder shadow-inner flex items-center justify-center"
                style={{ backgroundColor: bg }}
              >
                <div className="absolute inset-0 pattern-pinstripe opacity-30" />

                {/* Selected Overlay Check */}
                {isSelected && (
                  <div className="absolute inset-0 bg-itailor-dark/40 backdrop-blur-[1px] flex items-center justify-center">
                    <span className="bg-itailor-gold text-itailor-dark text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded shadow">
                      SELECTED ✓
                    </span>
                  </div>
                )}
              </div>

              {/* Fabric Name & Specs */}
              <p className="text-xs font-bold uppercase tracking-wider text-itailor-cream truncate group-hover:text-itailor-gold transition-colors">
                {f.name}
              </p>
              <div className="flex items-center justify-between mt-1">
                <span className="text-[10px] text-itailor-cream/50 uppercase">Wool Blend</span>
                <span className={`text-xs font-bold ${isPromo ? 'text-itailor-gold' : 'text-itailor-cream/80'}`}>
                  {f.pricePremium > 0 ? `+$${f.pricePremium.toFixed(2)}` : 'INCLUDED'}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Fabric Zoom Modal */}
      {isZoomModalOpen && selectedFabric && (
        <div className="fixed inset-0 z-50 bg-itailor-dark/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-itailor-sidebar border border-itailor-gold p-6 rounded-2xl max-w-md w-full shadow-2xl flex flex-col items-center gap-4 relative">
            <button
              type="button"
              onClick={() => setIsZoomModalOpen(false)}
              className="absolute top-4 right-4 text-itailor-cream/60 hover:text-itailor-cream text-lg font-bold"
            >
              ✕
            </button>

            <h3 className="font-display text-xl text-itailor-gold font-bold tracking-wide">
              FABRIC CLOSE-UP INSPECTOR
            </h3>

            {/* High Res Swatch Render */}
            <div
              className="w-48 h-48 rounded-xl border-2 border-itailor-gold shadow-2xl relative overflow-hidden"
              style={{ backgroundColor: hashColor(selectedFabric.id) }}
            >
              <div className="absolute inset-0 pattern-pinstripe opacity-60 scale-150" />
            </div>

            <div className="text-center">
              <p className="font-bold text-lg text-itailor-cream uppercase">{selectedFabric.name}</p>
              <p className="text-xs text-itailor-gold uppercase tracking-wider mt-1">Ref: {selectedFabric.supplierRef}</p>
              <p className="text-xs text-itailor-cream/70 mt-2 max-w-xs">
                Premium Super 140s Wool blend engineered for year-round comfort, durability, and elegant drape.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsZoomModalOpen(false)}
              className="mt-2 bg-itailor-gold text-itailor-dark font-bold text-xs uppercase tracking-widest px-6 py-2.5 rounded-lg hover:bg-itailor-goldHover transition-all shadow-lg"
            >
              Done Inspecting
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

