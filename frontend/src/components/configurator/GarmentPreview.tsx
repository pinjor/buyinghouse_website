import { useConfiguratorStore } from '../../store/configuratorStore';
import { hashColor } from './colorHash';

const collarPaths: Record<string, string> = {
  Spread: 'M70,20 L100,45 L130,20 L124,10 L100,28 L76,10 Z',
  'Button-Down': 'M78,16 L100,40 L122,16 L118,8 L100,24 L82,8 Z',
  Cutaway: 'M62,22 L100,48 L138,22 L130,8 L100,30 L70,8 Z',
};

export default function GarmentPreview() {
  const product = useConfiguratorStore((s) => s.product);
  const fabricId = useConfiguratorStore((s) => s.fabricId);
  const styleSelections = useConfiguratorStore((s) => s.styleSelections);

  if (!product) return null;

  const bodyColor = fabricId ? hashColor(fabricId) : '#e5e5e5';

  const collarGroup = product.styleOptions.find((g) => g.name === 'Collar');
  const collarLabel = collarGroup
    ? collarGroup.options.find((o) => o.id === styleSelections[collarGroup.id])?.label
    : undefined;
  const collarPath = (collarLabel && collarPaths[collarLabel]) ?? collarPaths.Spread;

  const cuffGroup = product.styleOptions.find((g) => g.name === 'Cuff');
  const cuffLabel = cuffGroup
    ? cuffGroup.options.find((o) => o.id === styleSelections[cuffGroup.id])?.label
    : undefined;
  const cuffHeight = cuffLabel === 'French' ? 22 : 14;

  return (
    <div className="lg:sticky lg:top-6 flex justify-center">
      <svg viewBox="0 0 200 260" className="w-full max-w-sm">
        <path
          d="M40,60 L20,90 L40,110 L50,95 L50,240 L150,240 L150,95 L160,110 L180,90 L160,60 L130,40 L100,50 L70,40 Z"
          fill={bodyColor}
          stroke="#0B1B33"
          strokeWidth={1.5}
        />
        <path d={collarPath} fill="#ffffff" stroke="#0B1B33" strokeWidth={1} opacity={0.9} />
        <rect x={22} y={92} width={22} height={cuffHeight} fill="#ffffff" stroke="#0B1B33" strokeWidth={1} />
        <rect x={156} y={92} width={22} height={cuffHeight} fill="#ffffff" stroke="#0B1B33" strokeWidth={1} />
        {[80, 110, 140, 170, 200].map((y) => (
          <circle key={y} cx={100} cy={y} r={2} fill="#0B1B33" opacity={0.5} />
        ))}
      </svg>
    </div>
  );
}
