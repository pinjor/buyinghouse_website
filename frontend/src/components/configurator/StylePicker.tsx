import type { StyleGroup } from '../../api/catalogApi';
import { useConfiguratorStore } from '../../store/configuratorStore';

interface Props {
  groups: StyleGroup[];
  selections: Record<string, string>;
  onSelect: (groupId: string, optionId: string) => void;
}

// Line art SVG illustrations for suit customization choices
function renderStyleIllustration(groupName: string, label: string) {
  const nameLower = groupName.toLowerCase();
  const labelLower = label.toLowerCase();

  if (nameLower.includes('lapel')) {
    if (labelLower.includes('peak')) {
      return (
        <svg viewBox="0 0 100 120" className="w-16 h-20 stroke-itailor-gold fill-none stroke-[1.5] mx-auto">
          <path d="M50,10 L30,40 L45,45 L40,65 L50,90 Z" />
          <path d="M50,10 L70,40 L55,45 L60,65 L50,90 Z" />
          <line x1="50" y1="10" x2="50" y2="110" strokeDasharray="2 2" strokeOpacity="0.4" />
        </svg>
      );
    }
    if (labelLower.includes('shawl')) {
      return (
        <svg viewBox="0 0 100 120" className="w-16 h-20 stroke-itailor-gold fill-none stroke-[1.5] mx-auto">
          <path d="M50,10 Q35,50 50,90 Z" />
          <path d="M50,10 Q65,50 50,90 Z" />
          <line x1="50" y1="10" x2="50" y2="110" strokeDasharray="2 2" strokeOpacity="0.4" />
        </svg>
      );
    }
    // Notch (Default)
    return (
      <svg viewBox="0 0 100 120" className="w-16 h-20 stroke-itailor-gold fill-none stroke-[1.5] mx-auto">
        <path d="M50,10 L35,42 L42,46 L38,65 L50,90 Z" />
        <path d="M50,10 L65,42 L58,46 L62,65 L50,90 Z" />
        <line x1="50" y1="10" x2="50" y2="110" strokeDasharray="2 2" strokeOpacity="0.4" />
      </svg>
    );
  }

  // Suit Buttons / Style
  if (nameLower.includes('button')) {
    if (labelLower.includes('double breasted')) {
      return (
        <svg viewBox="0 0 100 120" className="w-16 h-20 stroke-itailor-gold fill-none stroke-[1.5] mx-auto">
          <path d="M25,20 Q50,10 75,20 L70,100 L30,100 Z" />
          <path d="M50,20 L35,50 L50,70 L50,100 Z" />
          <circle cx="42" cy="55" r="2" fill="#D4AF37" />
          <circle cx="58" cy="55" r="2" fill="#D4AF37" />
          <circle cx="42" cy="72" r="2" fill="#D4AF37" />
          <circle cx="58" cy="72" r="2" fill="#D4AF37" />
        </svg>
      );
    }
    // Single Breasted
    return (
      <svg viewBox="0 0 100 120" className="w-16 h-20 stroke-itailor-gold fill-none stroke-[1.5] mx-auto">
        <path d="M25,20 Q50,10 75,20 L70,100 L30,100 Z" />
        <path d="M35,20 L50,55 Z" />
        <path d="M65,20 L50,55 Z" />
        <circle cx="50" cy="62" r="2.5" fill="#D4AF37" />
        <circle cx="50" cy="78" r="2.5" fill="#D4AF37" />
      </svg>
    );
  }

  // Default Line Art Graphic
  return (
    <svg viewBox="0 0 100 120" className="w-16 h-20 stroke-itailor-gold/70 fill-none stroke-[1.5] mx-auto">
      <rect x="25" y="30" width="50" height="60" rx="3" />
      <line x1="25" y1="50" x2="75" y2="50" />
    </svg>
  );
}

export default function StylePicker({ groups, selections, onSelect }: Props) {
  const activeSubStep = useConfiguratorStore((s) => s.activeSubStep);

  // Filter groups to match active sub-step if provided
  const targetGroup = groups.find((g) => g.name === activeSubStep) ?? groups[0];
  const displayGroups = targetGroup ? [targetGroup] : groups;

  return (
    <div className="w-full flex flex-col gap-6">
      {displayGroups.map((group) => (
        <div key={group.id} className="flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-itailor-cardBorder pb-2">
            <h3 className="font-display text-lg text-itailor-gold font-bold tracking-wide uppercase">
              ➤ {group.name} Options
            </h3>
            <span className="text-xs text-itailor-cream/50">Select your preferred style</span>
          </div>

          {/* Visual Graphic Tile Grid (iTailor Screenshot 2 & 3 style) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {group.options.map((o) => {
              const isSelected = selections[group.id] === o.id;

              return (
                <button
                  key={o.id}
                  type="button"
                  onClick={() => onSelect(group.id, o.id)}
                  className={`group relative flex flex-col items-center justify-between p-4 rounded-xl border transition-all duration-200 ${
                    isSelected
                      ? 'border-itailor-gold bg-itailor-card ring-2 ring-itailor-gold/50 scale-[1.02] shadow-2xl'
                      : 'border-itailor-cardBorder bg-itailor-card/50 hover:border-itailor-gold/50 hover:bg-itailor-card'
                  }`}
                >
                  {/* Selected Checkmark Badge */}
                  {isSelected && (
                    <div className="absolute top-2 right-2 bg-itailor-gold text-itailor-dark rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold shadow-md">
                      ✓
                    </div>
                  )}

                  {/* Line Art Illustration Box */}
                  <div className="my-2 transition-transform group-hover:scale-105">
                    {renderStyleIllustration(group.name, o.label)}
                  </div>

                  {/* Option Label & Price */}
                  <div className="text-center w-full mt-2 pt-2 border-t border-itailor-cardBorder/60">
                    <p className="text-xs font-bold uppercase tracking-wider text-itailor-cream truncate group-hover:text-itailor-gold transition-colors">
                      {o.label}
                    </p>
                    <p className="text-[11px] font-medium text-itailor-gold mt-0.5">
                      {o.pricePremium > 0 ? `+$${o.pricePremium.toFixed(2)}` : 'Included'}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

