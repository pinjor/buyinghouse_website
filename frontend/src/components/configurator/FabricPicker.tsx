import type { FabricOption } from '../../api/catalogApi';
import { hashColor } from './colorHash';

interface Props {
  options: FabricOption[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export default function FabricPicker({ options, selectedId, onSelect }: Props) {
  return (
    <div className="mb-6">
      <h3 className="font-display text-lg text-navy-800 mb-3">Fabric</h3>
      <div className="grid grid-cols-3 gap-3">
        {options.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => onSelect(f.id)}
            className={`rounded-lg border p-2 text-left transition-colors ${
              selectedId === f.id ? 'border-gold-500 ring-2 ring-gold-300' : 'border-navy-100 hover:border-navy-300'
            }`}
          >
            <div className="h-12 w-full rounded mb-2" style={{ backgroundColor: hashColor(f.id) }} />
            <p className="text-xs font-medium text-navy-800 truncate">{f.name}</p>
            <p className="text-xs text-navy-400">
              {f.pricePremium > 0 ? `+$${f.pricePremium.toFixed(2)}` : 'included'}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}
