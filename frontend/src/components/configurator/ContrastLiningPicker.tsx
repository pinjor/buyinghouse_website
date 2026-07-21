import { useConfiguratorStore } from '../../store/configuratorStore';

const LINING_OPTIONS = [
  { name: 'Matching Navy', type: 'Solid Silk', bg: '#1B2A4A' },
  { name: 'Royal Blue Silk', type: 'Pure Silk', bg: '#1E3A8A' },
  { name: 'Gold Paisley', type: 'Jacquard Weave', bg: '#D4AF37' },
  { name: 'Crimson Red', type: 'Satin Silk', bg: '#991B1B' },
  { name: 'Silver Satin', type: 'Lustrous Satin', bg: '#9CA3AF' },
];

const BUTTON_THREADS = ['Matching Thread', 'Contrast Gold', 'Crimson Red Thread', 'Royal Blue Thread'];
const MONOGRAM_COLORS = ['Gold', 'Silver', 'White', 'Red', 'Navy'];

export default function ContrastLiningPicker() {
  const contrastSelections = useConfiguratorStore((s) => s.contrastSelections);
  const setContrastSelection = useConfiguratorStore((s) => s.setContrastSelection);

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Step Header */}
      <div className="border-b border-itailor-cardBorder pb-3">
        <h3 className="font-display text-lg text-itailor-gold font-bold uppercase tracking-wide">
          Color Contrast & Personalization
        </h3>
        <p className="text-xs text-itailor-cream/60">Customize inner lining, accent threads, and custom monogramming</p>
      </div>

      {/* 1. Inner Lining Selection */}
      <div className="flex flex-col gap-3">
        <label className="text-xs font-bold text-itailor-cream uppercase tracking-wider">
          1. Select Inner Jacket Lining:
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {LINING_OPTIONS.map((lining) => {
            const isSelected = contrastSelections.liningColor === lining.name;
            return (
              <button
                key={lining.name}
                type="button"
                onClick={() => setContrastSelection('liningColor', lining.name)}
                className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                  isSelected
                    ? 'border-itailor-gold bg-itailor-card ring-2 ring-itailor-gold/50 shadow-xl'
                    : 'border-itailor-cardBorder bg-itailor-card/50 hover:border-itailor-gold/40'
                }`}
              >
                <div
                  className="w-7 h-7 rounded-full border border-itailor-gold/40 shadow-inner flex-shrink-0"
                  style={{ backgroundColor: lining.bg }}
                />
                <div className="text-left truncate">
                  <p className="text-xs font-bold text-itailor-cream truncate">{lining.name}</p>
                  <p className="text-[10px] text-itailor-gold">{lining.type}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Buttonhole Accent Thread */}
      <div className="flex flex-col gap-3 pt-2">
        <label className="text-xs font-bold text-itailor-cream uppercase tracking-wider">
          2. Buttonhole Accent Thread:
        </label>
        <div className="flex flex-wrap gap-2">
          {BUTTON_THREADS.map((thread) => {
            const isSelected = contrastSelections.buttonThreadColor === thread;
            return (
              <button
                key={thread}
                type="button"
                onClick={() => setContrastSelection('buttonThreadColor', thread)}
                className={`px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all border ${
                  isSelected
                    ? 'border-itailor-gold bg-itailor-gold text-itailor-dark shadow-md'
                    : 'border-itailor-cardBorder bg-itailor-card text-itailor-cream/80 hover:border-itailor-gold/40'
                }`}
              >
                {thread}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Monogramming */}
      <div className="flex flex-col gap-3 pt-2">
        <label className="text-xs font-bold text-itailor-cream uppercase tracking-wider">
          3. Custom Monogram Embroidery (Optional):
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-xl border border-itailor-cardBorder bg-itailor-card/40">
          <div>
            <label className="text-[11px] text-itailor-cream/70 block mb-1">Monogram Initials (e.g. N.A.)</label>
            <input
              type="text"
              maxLength={6}
              placeholder="e.g. J.D."
              value={contrastSelections.monogramText}
              onChange={(e) => setContrastSelection('monogramText', e.target.value)}
              className="w-full bg-[#0A111C] border border-itailor-cardBorder rounded px-3 py-1.5 text-sm text-itailor-gold font-mono uppercase focus:border-itailor-gold focus:outline-none"
            />
          </div>

          <div>
            <label className="text-[11px] text-itailor-cream/70 block mb-1">Thread Embroidery Color</label>
            <select
              value={contrastSelections.monogramColor}
              onChange={(e) => setContrastSelection('monogramColor', e.target.value)}
              className="w-full bg-[#0A111C] border border-itailor-cardBorder rounded px-3 py-1.5 text-xs text-itailor-cream font-medium focus:border-itailor-gold focus:outline-none"
            >
              {MONOGRAM_COLORS.map((c) => (
                <option key={c} value={c}>
                  {c} Thread
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
