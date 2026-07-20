import type { StyleGroup } from '../../api/catalogApi';

interface Props {
  groups: StyleGroup[];
  selections: Record<string, string>;
  onSelect: (groupId: string, optionId: string) => void;
}

export default function StylePicker({ groups, selections, onSelect }: Props) {
  return (
    <div className="mb-6 space-y-5">
      {groups.map((group) => (
        <div key={group.id}>
          <h3 className="font-display text-lg text-navy-800 mb-3">{group.name}</h3>
          <div className="flex flex-wrap gap-2">
            {group.options.map((o) => (
              <button
                key={o.id}
                type="button"
                onClick={() => onSelect(group.id, o.id)}
                className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
                  selections[group.id] === o.id
                    ? 'border-gold-500 bg-gold-50 text-navy-800'
                    : 'border-navy-100 text-navy-600 hover:border-navy-300'
                }`}
              >
                {o.label}
                {o.pricePremium > 0 && <span className="text-navy-400"> +${o.pricePremium.toFixed(2)}</span>}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
