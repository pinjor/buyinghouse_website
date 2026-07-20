import { useConfiguratorStore } from '../../store/configuratorStore';

const fields: { key: 'neck' | 'chest' | 'waist' | 'sleeveLength'; label: string }[] = [
  { key: 'neck', label: 'Neck (in)' },
  { key: 'chest', label: 'Chest (in)' },
  { key: 'waist', label: 'Waist (in)' },
  { key: 'sleeveLength', label: 'Sleeve Length (in)' },
];

export default function MeasurementForm() {
  const measurements = useConfiguratorStore((s) => s.measurements);
  const setMeasurement = useConfiguratorStore((s) => s.setMeasurement);

  return (
    <div className="mb-6">
      <h3 className="font-display text-lg text-navy-800 mb-3">Measurements</h3>
      <div className="grid grid-cols-2 gap-3">
        {fields.map((f) => (
          <label key={f.key} className="text-sm text-navy-600">
            {f.label}
            <input
              type="number"
              min={0}
              step={0.25}
              value={measurements[f.key]}
              onChange={(e) => setMeasurement(f.key, e.target.value)}
              className="mt-1 w-full border border-navy-200 rounded px-2 py-1"
            />
          </label>
        ))}
      </div>
    </div>
  );
}
