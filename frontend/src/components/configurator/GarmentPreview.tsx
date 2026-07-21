import { useConfiguratorStore } from '../../store/configuratorStore';
import { hashColor } from './colorHash';

export default function GarmentPreview() {
  const product = useConfiguratorStore((s) => s.product);
  const fabricId = useConfiguratorStore((s) => s.fabricId);
  const styleSelections = useConfiguratorStore((s) => s.styleSelections);
  const viewAngle = useConfiguratorStore((s) => s.viewAngle);
  const setViewAngle = useConfiguratorStore((s) => s.setViewAngle);
  const contrastSelections = useConfiguratorStore((s) => s.contrastSelections);
  const setIsZoomModalOpen = useConfiguratorStore((s) => s.setIsZoomModalOpen);

  if (!product) return null;

  const currentFabric = product.fabricOptions.find((f) => f.id === fabricId) ?? product.fabricOptions[0];
  const garmentColor = hashColor(fabricId || '', currentFabric?.name);
  const category = (product.category || 'suit').toLowerCase();

  // Helper to extract option label by group keyword
  function getSelectedOptionLabel(groupKeyword: string, fallback: string): string {
    if (!product) return fallback;
    const group = product.styleOptions.find((g) => g.name.toLowerCase().includes(groupKeyword.toLowerCase()));
    if (!group) return fallback;
    const opt = group.options.find((o) => o.id === styleSelections[group.id]);
    return opt?.label ?? fallback;
  }

  // Active customization options
  const buttonLabel = getSelectedOptionLabel('button', '2 Buttons, Single Breasted');
  const lapelLabel = getSelectedOptionLabel('lapel', 'Notch Lapel');
  const widthLabel = getSelectedOptionLabel('width', 'Standard (2.75 in)');
  const buttonholeLabel = getSelectedOptionLabel('buttonhole', 'With Lapel Buttonhole');
  const pocketLabel = getSelectedOptionLabel('pocket', 'Flap Pockets');
  const sleeveLabel = getSelectedOptionLabel('sleeve', '4 Kissing Buttons');
  const ventLabel = getSelectedOptionLabel('vent', 'Double Side Vents');
  const collarLabel = getSelectedOptionLabel('collar', 'Spread Collar');
  const cuffLabel = getSelectedOptionLabel('cuff', 'Single Button Barrel');

  const isDoubleBreasted = buttonLabel.toLowerCase().includes('double breasted');
  const buttonCount = buttonLabel.includes('1') ? 1 : buttonLabel.includes('3') ? 3 : buttonLabel.includes('4') ? 4 : buttonLabel.includes('6') ? 6 : 2;

  const lapelType = lapelLabel.toLowerCase().includes('peak')
    ? 'peak'
    : lapelLabel.toLowerCase().includes('shawl')
    ? 'shawl'
    : lapelLabel.toLowerCase().includes('round')
    ? 'round'
    : 'notch';

  const lapelWidthFactor = widthLabel.toLowerCase().includes('wide') ? 1.25 : widthLabel.toLowerCase().includes('narrow') ? 0.8 : 1.0;
  const hasButtonhole = !buttonholeLabel.toLowerCase().includes('no');
  const isContrastButtonhole = buttonholeLabel.toLowerCase().includes('contrast');
  const hasTicketPocket = pocketLabel.toLowerCase().includes('ticket');
  const isSlantedPocket = pocketLabel.toLowerCase().includes('slanted');
  const isPipePocket = pocketLabel.toLowerCase().includes('double pipe');

  // Lining color mapping
  const liningColorMap: Record<string, string> = {
    'Matching Navy': garmentColor,
    'Royal Blue Silk': '#1E3A8A',
    'Gold Paisley': '#D4AF37',
    'Crimson Red': '#991B1B',
    'Silver Satin': '#9CA3AF',
  };
  const liningColor = liningColorMap[contrastSelections.liningColor] ?? '#1E3A8A';

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-between p-6 bg-[#0B121D] border border-itailor-cardBorder rounded-xl overflow-hidden shadow-2xl select-none">
      {/* Top Floating View Angle Toggles */}
      <div className="w-full flex items-center justify-between z-10">
        <div className="flex items-center gap-1.5 bg-itailor-sidebar/80 p-1 rounded-lg border border-itailor-cardBorder backdrop-blur-md">
          <button
            type="button"
            onClick={() => setViewAngle('front')}
            className={`px-3 py-1 rounded text-xs font-semibold uppercase tracking-wider transition-all ${
              viewAngle === 'front'
                ? 'bg-itailor-gold text-itailor-dark shadow-md'
                : 'text-itailor-cream/70 hover:text-itailor-cream hover:bg-itailor-card'
            }`}
          >
            Front View
          </button>
          <button
            type="button"
            onClick={() => setViewAngle('back')}
            className={`px-3 py-1 rounded text-xs font-semibold uppercase tracking-wider transition-all ${
              viewAngle === 'back'
                ? 'bg-itailor-gold text-itailor-dark shadow-md'
                : 'text-itailor-cream/70 hover:text-itailor-cream hover:bg-itailor-card'
            }`}
          >
            Back View
          </button>
          {(category === 'suit' || category === 'tuxedo' || category === 'jacket') && (
            <button
              type="button"
              onClick={() => setViewAngle('lining')}
              className={`px-3 py-1 rounded text-xs font-semibold uppercase tracking-wider transition-all ${
                viewAngle === 'lining'
                  ? 'bg-itailor-gold text-itailor-dark shadow-md'
                  : 'text-itailor-cream/70 hover:text-itailor-cream hover:bg-itailor-card'
              }`}
            >
              Lining View
            </button>
          )}
        </div>

        {/* Zoom Button */}
        <button
          type="button"
          onClick={() => setIsZoomModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-itailor-sidebar/80 border border-itailor-cardBorder text-xs text-itailor-gold hover:bg-itailor-card transition-all"
        >
          🔍 <span>Zoom Fabric</span>
        </button>
      </div>

      {/* Central Interactive Mannequin SVG Render Engine */}
      <div className="relative my-auto w-full max-w-[340px] aspect-[3/4] flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-t from-itailor-gold/10 via-transparent to-itailor-cyan/10 rounded-full filter blur-3xl opacity-40 pointer-events-none" />

        <svg viewBox="0 0 300 400" className="w-full h-full drop-shadow-[0_20px_35px_rgba(0,0,0,0.85)]">
          <defs>
            <linearGradient id="garmentGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={garmentColor} stopOpacity={1} />
              <stop offset="50%" stopColor={garmentColor} stopOpacity={0.95} />
              <stop offset="100%" stopColor="#080C14" stopOpacity={0.7} />
            </linearGradient>

            <linearGradient id="lapelHighlightGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity={0.12} />
              <stop offset="100%" stopColor="#000000" stopOpacity={0.35} />
            </linearGradient>

            <pattern id="pinstripePattern" width="10" height="10" patternUnits="userSpaceOnUse">
              <line x1="0" y1="0" x2="0" y2="10" stroke="rgba(255,255,255,0.15)" strokeWidth="0.8" />
            </pattern>
          </defs>

          {/* 1. SHIRT PREVIEW ENGINE */}
          {category === 'shirt' && (
            <g id="shirt-render">
              {/* Collar Back */}
              <path d="M120,60 Q150,75 180,60 L175,85 Q150,95 125,85 Z" fill="#E2E8F0" />
              {/* Main Shirt Body */}
              <path
                d="M75,85 L225,85 L240,170 L230,360 L150,370 L70,360 L60,170 Z"
                fill="url(#garmentGrad)"
                stroke="#080C14"
                strokeWidth="2"
              />
              {/* Shirt Sleeves */}
              <path d="M75,85 L42,190 L54,320 L78,315 L74,190 L85,125 Z" fill={garmentColor} stroke="#080C14" strokeWidth="1.5" />
              <path d="M225,85 L258,190 L246,320 L222,315 L226,190 L215,125 Z" fill={garmentColor} stroke="#080C14" strokeWidth="1.5" />
              {/* Front Placket Line */}
              <rect x="144" y="85" width="12" height="280" fill="#000000" opacity="0.1" />
              <line x1="150" y1="85" x2="150" y2="365" stroke="#FFFFFF" strokeWidth="1" strokeDasharray="4 4" opacity="0.6" />
              {/* Placket Buttons */}
              <circle cx="150" cy="110" r="3" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1" />
              <circle cx="150" cy="150" r="3" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1" />
              <circle cx="150" cy="190" r="3" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1" />
              <circle cx="150" cy="230" r="3" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1" />
              <circle cx="150" cy="270" r="3" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1" />
              <circle cx="150" cy="310" r="3" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1" />

              {/* Collar Wing Style */}
              {collarLabel.toLowerCase().includes('button') ? (
                /* Button Down Collar */
                <g>
                  <polygon points="120,60 148,110 135,115 110,85" fill={garmentColor} stroke="#080C14" strokeWidth="1" />
                  <polygon points="180,60 152,110 165,115 190,85" fill={garmentColor} stroke="#080C14" strokeWidth="1" />
                  <circle cx="143" cy="104" r="1.5" fill="#FFFFFF" />
                  <circle cx="157" cy="104" r="1.5" fill="#FFFFFF" />
                </g>
              ) : collarLabel.toLowerCase().includes('cutaway') ? (
                /* Cutaway Wide Collar */
                <g>
                  <polygon points="120,60 132,100 120,105 110,85" fill={garmentColor} stroke="#080C14" strokeWidth="1" />
                  <polygon points="180,60 168,100 180,105 190,85" fill={garmentColor} stroke="#080C14" strokeWidth="1" />
                </g>
              ) : (
                /* Spread Collar (Standard) */
                <g>
                  <polygon points="120,60 142,108 128,112 110,85" fill={garmentColor} stroke="#080C14" strokeWidth="1" />
                  <polygon points="180,60 158,108 172,112 190,85" fill={garmentColor} stroke="#080C14" strokeWidth="1" />
                </g>
              )}

              {/* Chest Pocket */}
              <path d="M85,150 L115,150 L115,185 L100,195 L85,185 Z" fill="none" stroke="#FFFFFF" strokeWidth="1" opacity="0.5" />

              {/* Cuffs */}
              <rect x="52" y="295" width="28" height="20" fill={garmentColor} stroke="#080C14" strokeWidth="1" />
              <rect x="220" y="295" width="28" height="20" fill={garmentColor} stroke="#080C14" strokeWidth="1" />
              {cuffLabel.toLowerCase().includes('french') ? (
                /* French Cuff Cufflinks */
                <g>
                  <rect x="62" y="302" width="8" height="6" fill="#D4AF37" rx="1" />
                  <rect x="230" y="302" width="8" height="6" fill="#D4AF37" rx="1" />
                </g>
              ) : (
                /* Single Button Barrel */
                <g>
                  <circle cx="66" cy="305" r="2" fill="#FFFFFF" />
                  <circle cx="234" cy="305" r="2" fill="#FFFFFF" />
                </g>
              )}
            </g>
          )}

          {/* 2. PANTS & JEANS PREVIEW ENGINE */}
          {(category === 'pants' || category === 'jeans') && (
            <g id="pants-render">
              {/* Waistband */}
              <rect x="80" y="70" width="140" height="25" fill={garmentColor} stroke="#080C14" strokeWidth="2" rx="2" />
              {/* Belt Loops */}
              <rect x="92" y="68" width="6" height="29" fill="#080C14" />
              <rect x="120" y="68" width="6" height="29" fill="#080C14" />
              <rect x="147" y="68" width="6" height="29" fill="#D4AF37" />
              <rect x="174" y="68" width="6" height="29" fill="#080C14" />
              <rect x="202" y="68" width="6" height="29" fill="#080C14" />
              {/* Center Fly & Closure Button */}
              <line x1="150" y1="70" x2="150" y2="160" stroke="#080C14" strokeWidth="2" />
              <circle cx="150" cy="82" r="3.5" fill="#D4AF37" stroke="#000" strokeWidth="1" />

              {/* Trousers Legs Path */}
              <path
                d="M80,95 L65,370 L135,370 L150,170 L165,370 L235,370 L220,95 Z"
                fill="url(#garmentGrad)"
                stroke="#080C14"
                strokeWidth="2"
              />

              {/* Side Slash Pockets */}
              <path d="M80,95 L110,135" stroke="#D4AF37" strokeWidth="1.5" />
              <path d="M220,95 L190,135" stroke="#D4AF37" strokeWidth="1.5" />

              {/* Front Leg Crease Lines */}
              <line x1="100" y1="110" x2="100" y2="365" stroke="#FFFFFF" strokeWidth="0.8" opacity="0.4" />
              <line x1="200" y1="110" x2="200" y2="365" stroke="#FFFFFF" strokeWidth="0.8" opacity="0.4" />

              {/* Bottom Leg Hem Cuffs */}
              <rect x="65" y="358" width="70" height="12" fill={garmentColor} stroke="#080C14" strokeWidth="1" />
              <rect x="165" y="358" width="70" height="12" fill={garmentColor} stroke="#080C14" strokeWidth="1" />
            </g>
          )}

          {/* 3. VEST / WAISTCOAT PREVIEW ENGINE */}
          {category === 'vest' && (
            <g id="vest-render">
              {/* Shirt Inner V & Tie Layer */}
              <path d="M120,50 L150,150 L180,50 Z" fill="#FAFAFA" />
              <path d="M145,60 L155,60 L153,160 L147,160 Z" fill="#881337" />

              {/* Main Vest Body with Pointed Hem Bottom */}
              <path
                d="M90,70 Q150,45 210,70 L225,170 L210,310 L150,350 L90,310 L75,170 Z"
                fill="url(#garmentGrad)"
                stroke="#080C14"
                strokeWidth="2"
              />

              {/* V-Neckline Cutout */}
              <path d="M115,70 L150,180 L185,70 Z" fill="none" stroke="#080C14" strokeWidth="2" />

              {/* Vest Welt Pockets */}
              <rect x="95" y="220" width="38" height="6" fill="#080C14" rx="1" stroke="#D4AF37" strokeWidth="0.5" />
              <rect x="167" y="220" width="38" height="6" fill="#080C14" rx="1" stroke="#D4AF37" strokeWidth="0.5" />
              <rect x="95" y="250" width="38" height="6" fill="#080C14" rx="1" stroke="#D4AF37" strokeWidth="0.5" />
              <rect x="167" y="250" width="38" height="6" fill="#080C14" rx="1" stroke="#D4AF37" strokeWidth="0.5" />

              {/* 5 Vertical Gold Vest Buttons */}
              <circle cx="150" cy="190" r="3.5" fill="#D4AF37" stroke="#000" strokeWidth="1" />
              <circle cx="150" cy="218" r="3.5" fill="#D4AF37" stroke="#000" strokeWidth="1" />
              <circle cx="150" cy="246" r="3.5" fill="#D4AF37" stroke="#000" strokeWidth="1" />
              <circle cx="150" cy="274" r="3.5" fill="#D4AF37" stroke="#000" strokeWidth="1" />
              <circle cx="150" cy="302" r="3.5" fill="#D4AF37" stroke="#000" strokeWidth="1" />
            </g>
          )}

          {/* 4. SILK TIE PREVIEW ENGINE */}
          {category === 'tie' && (
            <g id="tie-render">
              {/* Shirt Collar Background */}
              <path d="M100,80 L140,130 L160,130 L200,80 Z" fill="#FAFAFA" stroke="#CBD5E1" strokeWidth="2" />

              {/* Tie Knot */}
              <polygon points="138,125 162,125 158,150 142,150" fill={garmentColor} stroke="#080C14" strokeWidth="1.5" />

              {/* Main Tie Blade */}
              <polygon points="142,150 158,150 175,320 150,360 125,320" fill="url(#garmentGrad)" stroke="#080C14" strokeWidth="2" />

              {/* Silk Texture Sheen */}
              <line x1="140" y1="155" x2="168" y2="330" stroke="#FFFFFF" strokeWidth="1.5" opacity="0.3" />
            </g>
          )}

          {/* 5. SUIT & TUXEDO PREVIEW ENGINE (DEFAULT) */}
          {(category === 'suit' || category === 'tuxedo' || category === 'jacket') && (
            <>
              {viewAngle === 'front' && (
                <g id="suit-front-render">
                  {/* Shirt Inner V & Tie Layer */}
                  <path d="M115,55 L150,155 L185,55 Z" fill="#FAFAFA" />
                  {/* Tie */}
                  <path d="M144,65 L156,65 L153,165 L147,165 Z" fill="#881337" />
                  <path d="M142,60 L158,60 L155,72 L145,72 Z" fill="#9F1239" />

                  {/* Main Suit Jacket Body */}
                  {isDoubleBreasted ? (
                    /* Double Breasted Overlapping Front Fold */
                    <path
                      d="M70,75 Q150,42 230,75 L245,175 L235,365 L135,375 L65,360 L55,175 Z"
                      fill="url(#garmentGrad)"
                      stroke="#080C14"
                      strokeWidth="2"
                    />
                  ) : (
                    /* Single Breasted Standard Front */
                    <path
                      d="M70,75 Q150,42 230,75 L245,175 L235,365 L150,375 L65,360 L55,175 Z"
                      fill="url(#garmentGrad)"
                      stroke="#080C14"
                      strokeWidth="2"
                    />
                  )}

                  {/* Fabric Pinstripe Overlay if striped */}
                  {currentFabric.name.toLowerCase().includes('stripe') && (
                    <path
                      d="M70,75 Q150,42 230,75 L245,175 L235,365 L150,375 L65,360 L55,175 Z"
                      fill="url(#pinstripePattern)"
                    />
                  )}

                  {/* Sleeves */}
                  <path d="M70,75 L38,185 L50,335 L78,330 L73,185 L85,125 Z" fill={garmentColor} stroke="#070B12" strokeWidth="1.5" />
                  <path d="M230,75 L262,185 L250,335 L222,330 L227,185 L215,125 Z" fill={garmentColor} stroke="#070B12" strokeWidth="1.5" />

                  {/* DYNAMIC LAPEL RENDER ENGINE */}
                  {lapelType === 'peak' ? (
                    /* Peak Lapel (Upward Pointed Peak Tips) */
                    <g>
                      <path
                        d={`M115,55 L${85 - 12 * lapelWidthFactor},125 L115,140 L108,180 L150,250 L115,55 Z`}
                        fill={garmentColor}
                        stroke="#070B12"
                        strokeWidth="1.5"
                      />
                      <path d={`M115,55 L${85 - 12 * lapelWidthFactor},125 L115,140 L108,180 L150,250 Z`} fill="url(#lapelHighlightGrad)" />

                      <path
                        d={`M185,55 L${215 + 12 * lapelWidthFactor},125 L185,140 L192,180 L150,250 L185,55 Z`}
                        fill={garmentColor}
                        stroke="#070B12"
                        strokeWidth="1.5"
                      />
                      <path d={`M185,55 L${215 + 12 * lapelWidthFactor},125 L185,140 L192,180 L150,250 Z`} fill="url(#lapelHighlightGrad)" />
                    </g>
                  ) : lapelType === 'shawl' ? (
                    /* Shawl Lapel (Smooth Curved Band) */
                    <g>
                      <path
                        d={`M115,55 Q${95 - 10 * lapelWidthFactor},145 150,250 Q${120 - 5 * lapelWidthFactor},165 115,55 Z`}
                        fill={garmentColor}
                        stroke="#070B12"
                        strokeWidth="1.5"
                      />
                      <path
                        d={`M185,55 Q${205 + 10 * lapelWidthFactor},145 150,250 Q${180 + 5 * lapelWidthFactor},165 185,55 Z`}
                        fill={garmentColor}
                        stroke="#070B12"
                        strokeWidth="1.5"
                      />
                    </g>
                  ) : lapelType === 'round' ? (
                    /* Round Notch Lapel */
                    <g>
                      <path
                        d={`M115,55 Q${90 - 8 * lapelWidthFactor},120 102,138 Q95,175 150,250 L115,55 Z`}
                        fill={garmentColor}
                        stroke="#070B12"
                        strokeWidth="1.5"
                      />
                      <path
                        d={`M185,55 Q${210 + 8 * lapelWidthFactor},120 198,138 Q205,175 150,250 L185,55 Z`}
                        fill={garmentColor}
                        stroke="#070B12"
                        strokeWidth="1.5"
                      />
                    </g>
                  ) : (
                    /* Notch Lapel (Classic Default) */
                    <g>
                      <path
                        d={`M115,55 L${90 - 10 * lapelWidthFactor},130 L104,138 L98,180 L150,250 L115,55 Z`}
                        fill={garmentColor}
                        stroke="#070B12"
                        strokeWidth="1.5"
                      />
                      <path d={`M115,55 L${90 - 10 * lapelWidthFactor},130 L104,138 L98,180 L150,250 Z`} fill="url(#lapelHighlightGrad)" />

                      <path
                        d={`M185,55 L${210 + 10 * lapelWidthFactor},130 L196,138 L202,180 L150,250 L185,55 Z`}
                        fill={garmentColor}
                        stroke="#070B12"
                        strokeWidth="1.5"
                      />
                      <path d={`M185,55 L${210 + 10 * lapelWidthFactor},130 L196,138 L202,180 L150,250 Z`} fill="url(#lapelHighlightGrad)" />
                    </g>
                  )}

                  {/* Lapel Buttonhole Slot Render */}
                  {hasButtonhole && (
                    <g>
                      <rect
                        x="94"
                        y="105"
                        width="10"
                        height="2.5"
                        rx="1"
                        fill={isContrastButtonhole ? '#D4AF37' : '#080C14'}
                        stroke={isContrastButtonhole ? '#D4AF37' : '#FFFFFF'}
                        strokeWidth="0.6"
                      />
                    </g>
                  )}

                  {/* Breast Pocket & Pocket Square */}
                  <rect x="82" y="148" width="30" height="4" fill="#080C14" rx="1" />
                  <path d="M85,148 L98,132 L111,148 Z" fill="#FFFFFF" opacity="0.95" />

                  {/* MAIN POCKETS VISUAL ENGINE */}
                  {isPipePocket ? (
                    /* Double Pipe Piping Lines (No Flap) */
                    <g>
                      <rect x="68" y="270" width="52" height="3" fill="#D4AF37" />
                      <rect x="68" y="275" width="52" height="3" fill="#D4AF37" />
                      <rect x="180" y="270" width="52" height="3" fill="#D4AF37" />
                      <rect x="180" y="275" width="52" height="3" fill="#D4AF37" />
                    </g>
                  ) : isSlantedPocket ? (
                    /* Slanted Flap Pockets */
                    <g>
                      <polygon points="68,268 122,278 122,290 68,280" fill="#080C14" stroke="#D4AF37" strokeWidth="0.6" />
                      <polygon points="178,278 232,268 232,280 178,290" fill="#080C14" stroke="#D4AF37" strokeWidth="0.6" />
                    </g>
                  ) : (
                    /* Standard Flap Pockets */
                    <g>
                      <rect x="68" y="270" width="52" height="13" rx="1.5" fill="#080C14" stroke="#D4AF37" strokeWidth="0.5" />
                      <rect x="180" y="270" width="52" height="13" rx="1.5" fill="#080C14" stroke="#D4AF37" strokeWidth="0.5" />
                    </g>
                  )}

                  {/* Ticket Pocket Addition */}
                  {hasTicketPocket && (
                    <rect x="182" y="246" width="34" height="9" rx="1" fill="#080C14" stroke="#D4AF37" strokeWidth="0.5" />
                  )}

                  {/* DYNAMIC BUTTONS ENGINE */}
                  {isDoubleBreasted ? (
                    /* Double Breasted 4 or 6 Buttons Layout */
                    <g>
                      <circle cx="128" cy="215" r="4" fill="#D4AF37" stroke="#000" strokeWidth="1" />
                      <circle cx="172" cy="215" r="4" fill="#D4AF37" stroke="#000" strokeWidth="1" />
                      <circle cx="128" cy="245" r="4" fill="#D4AF37" stroke="#000" strokeWidth="1" />
                      <circle cx="172" cy="245" r="4" fill="#D4AF37" stroke="#000" strokeWidth="1" />
                      {buttonCount >= 6 && (
                        <>
                          <circle cx="128" cy="275" r="4" fill="#D4AF37" stroke="#000" strokeWidth="1" />
                          <circle cx="172" cy="275" r="4" fill="#D4AF37" stroke="#000" strokeWidth="1" />
                        </>
                      )}
                    </g>
                  ) : (
                    /* Single Breasted Buttons Layout */
                    <g>
                      {buttonCount === 1 && (
                        <circle cx="150" cy="240" r="4" fill="#D4AF37" stroke="#000" strokeWidth="1" />
                      )}
                      {buttonCount === 2 && (
                        <>
                          <circle cx="150" cy="230" r="4" fill="#D4AF37" stroke="#000" strokeWidth="1" />
                          <circle cx="150" cy="265" r="4" fill="#D4AF37" stroke="#000" strokeWidth="1" />
                        </>
                      )}
                      {buttonCount === 3 && (
                        <>
                          <circle cx="150" cy="210" r="4" fill="#D4AF37" stroke="#000" strokeWidth="1" />
                          <circle cx="150" cy="240" r="4" fill="#D4AF37" stroke="#000" strokeWidth="1" />
                          <circle cx="150" cy="270" r="4" fill="#D4AF37" stroke="#000" strokeWidth="1" />
                        </>
                      )}
                      {buttonCount >= 4 && (
                        <>
                          <circle cx="150" cy="195" r="4" fill="#D4AF37" stroke="#000" strokeWidth="1" />
                          <circle cx="150" cy="220" r="4" fill="#D4AF37" stroke="#000" strokeWidth="1" />
                          <circle cx="150" cy="245" r="4" fill="#D4AF37" stroke="#000" strokeWidth="1" />
                          <circle cx="150" cy="270" r="4" fill="#D4AF37" stroke="#000" strokeWidth="1" />
                        </>
                      )}
                    </g>
                  )}

                  {/* Sleeve Cuffs Buttons */}
                  <g>
                    <circle cx="54" cy="310" r="1.8" fill="#D4AF37" />
                    <circle cx="54" cy="316" r="1.8" fill="#D4AF37" />
                    <circle cx="54" cy="322" r="1.8" fill="#D4AF37" />
                    {sleeveLabel.includes('4') && <circle cx="54" cy="328" r="1.8" fill="#D4AF37" />}

                    <circle cx="246" cy="310" r="1.8" fill="#D4AF37" />
                    <circle cx="246" cy="316" r="1.8" fill="#D4AF37" />
                    <circle cx="246" cy="322" r="1.8" fill="#D4AF37" />
                    {sleeveLabel.includes('4') && <circle cx="246" cy="328" r="1.8" fill="#D4AF37" />}
                  </g>
                </g>
              )}

              {viewAngle === 'back' && (
                <g id="suit-back-render">
                  {/* Back Collar */}
                  <path d="M115,55 Q150,70 185,55 L180,78 Q150,88 120,78 Z" fill="#0A0E17" />
                  {/* Back Body */}
                  <path
                    d="M70,75 Q150,45 230,75 L245,175 L235,365 L150,375 L65,360 L55,175 Z"
                    fill="url(#garmentGrad)"
                    stroke="#080C14"
                    strokeWidth="2"
                  />
                  {/* Center Back Seam */}
                  <line x1="150" y1="75" x2="150" y2="300" stroke="#070B12" strokeWidth="1.5" />

                  {/* DYNAMIC VENTS ENGINE */}
                  {ventLabel.toLowerCase().includes('single') ? (
                    /* Single Center Vent Slit */
                    <line x1="150" y1="280" x2="150" y2="370" stroke="#D4AF37" strokeWidth="1.5" strokeDasharray="3 3" />
                  ) : ventLabel.toLowerCase().includes('double') ? (
                    /* Double Side Vents Slits */
                    <g>
                      <line x1="95" y1="280" x2="95" y2="362" stroke="#D4AF37" strokeWidth="1.5" strokeDasharray="3 3" />
                      <line x1="205" y1="280" x2="205" y2="362" stroke="#D4AF37" strokeWidth="1.5" strokeDasharray="3 3" />
                    </g>
                  ) : null}
                </g>
              )}

              {viewAngle === 'lining' && (
                <g id="suit-lining-render">
                  {/* Inner Lining Background Fill */}
                  <path
                    d="M70,75 L230,75 L220,355 L80,355 Z"
                    fill={liningColor}
                    stroke="#D4AF37"
                    strokeWidth="1.5"
                  />
                  {/* Folded Lapel Facings */}
                  <path d="M70,75 L120,55 L88,210 Z" fill={garmentColor} />
                  <path d="M230,75 L180,55 L212,210 Z" fill={garmentColor} />
                  {/* Internal Pocket */}
                  <rect x="155" y="165" width="45" height="24" fill="#080C14" rx="2" stroke="#D4AF37" strokeWidth="0.8" />
                  <text x="177" y="180" fill="#D4AF37" fontSize="7" fontWeight="bold" textAnchor="middle">
                    NOVATERRA BESPOKE
                  </text>
                </g>
              )}
            </>
          )}
        </svg>
      </div>

      {/* Bottom Selected Specs & Fabric Card overlay */}
      <div className="w-full bg-itailor-sidebar/90 border border-itailor-cardBorder p-3 rounded-lg flex items-center justify-between z-10 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-md border border-itailor-gold/40 shadow-inner overflow-hidden" style={{ backgroundColor: garmentColor }}>
            <div className="w-full h-full pattern-pinstripe opacity-40" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-itailor-cream truncate max-w-[170px]">
              {currentFabric.name}
            </span>
            <span className="text-[10px] text-itailor-gold uppercase tracking-wider">
              {product.name}
            </span>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] uppercase text-itailor-cream/50 block">Base Custom</span>
          <span className="text-sm font-bold text-itailor-gold">${(product.basePrice + currentFabric.pricePremium).toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}
