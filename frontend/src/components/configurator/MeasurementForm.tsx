import { useState } from 'react';
import { useConfiguratorStore, Measurements } from '../../store/configuratorStore';

const STANDARD_SIZES = [
  { size: '36R', chest: '36"', waist: '30"' },
  { size: '38R', chest: '38"', waist: '32"' },
  { size: '40R', chest: '40"', waist: '34"' },
  { size: '42R', chest: '42"', waist: '36"' },
  { size: '44R', chest: '44"', waist: '38"' },
  { size: '46R', chest: '46"', waist: '40"' },
  { size: '48L', chest: '48"', waist: '42"' },
];

const CUSTOM_FIELDS: { key: keyof Measurements; label: string; desc: string }[] = [
  { key: 'neck', label: 'Neck Circumference', desc: 'Around neck base' },
  { key: 'chest', label: 'Chest Circumference', desc: 'Fullest part of chest' },
  { key: 'waist', label: 'Jacket Waist', desc: 'Around natural waistline' },
  { key: 'hips', label: 'Hips / Seat', desc: 'Fullest part of hips' },
  { key: 'sleeveLength', label: 'Sleeve Length', desc: 'Shoulder to wrist' },
  { key: 'jacketLength', label: 'Jacket Length', desc: 'Back collar to hem' },
  { key: 'pantsWaist', label: 'Pants Waist', desc: 'Where trousers sit' },
  { key: 'pantsLength', label: 'Pants Outseam', desc: 'Waist to shoe ankle' },
];

export default function MeasurementForm() {
  const measurementMode = useConfiguratorStore((s) => s.measurementMode);
  const setMeasurementMode = useConfiguratorStore((s) => s.setMeasurementMode);
  const standardSize = useConfiguratorStore((s) => s.standardSize);
  const setStandardSize = useConfiguratorStore((s) => s.setStandardSize);
  const measurements = useConfiguratorStore((s) => s.measurements);
  const setMeasurement = useConfiguratorStore((s) => s.setMeasurement);

  const [unit, setUnit] = useState<'in' | 'cm'>('in');

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Mode Switcher Header */}
      <div className="flex items-center justify-between border-b border-itailor-cardBorder pb-4">
        <div>
          <h3 className="font-display text-lg text-itailor-gold font-bold uppercase tracking-wide">
            Sizing & Measurements
          </h3>
          <p className="text-xs text-itailor-cream/60">Choose standard size or submit custom body metrics</p>
        </div>

        {/* Mode Toggle */}
        <div className="flex items-center bg-itailor-card p-1 rounded-lg border border-itailor-cardBorder">
          <button
            type="button"
            onClick={() => setMeasurementMode('standard')}
            className={`px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider transition-all ${
              measurementMode === 'standard'
                ? 'bg-itailor-gold text-itailor-dark shadow'
                : 'text-itailor-cream/60 hover:text-itailor-cream'
            }`}
          >
            Standard Size
          </button>
          <button
            type="button"
            onClick={() => setMeasurementMode('custom')}
            className={`px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider transition-all ${
              measurementMode === 'custom'
                ? 'bg-itailor-gold text-itailor-dark shadow'
                : 'text-itailor-cream/60 hover:text-itailor-cream'
            }`}
          >
            Custom Body Specs
          </button>
        </div>
      </div>

      {/* Standard Sizes View */}
      {measurementMode === 'standard' ? (
        <div className="flex flex-col gap-4">
          <p className="text-xs text-itailor-cream/70">Select your standard jacket size for tailor-fitted precision:</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {STANDARD_SIZES.map((item) => {
              const isSelected = standardSize === item.size;
              return (
                <button
                  key={item.size}
                  type="button"
                  onClick={() => setStandardSize(item.size)}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${
                    isSelected
                      ? 'border-itailor-gold bg-itailor-card ring-2 ring-itailor-gold/50 shadow-xl'
                      : 'border-itailor-cardBorder bg-itailor-card/50 hover:border-itailor-gold/40'
                  }`}
                >
                  <span className={`text-lg font-extrabold ${isSelected ? 'text-itailor-gold' : 'text-itailor-cream'}`}>
                    {item.size}
                  </span>
                  <span className="text-[10px] text-itailor-cream/50 mt-1">
                    Chest: {item.chest} | Waist: {item.waist}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        /* Custom Body Specs View */
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-itailor-cream/70">Enter your exact body dimensions:</span>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-itailor-cream/50">Unit:</span>
              <button
                type="button"
                onClick={() => setUnit('in')}
                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                  unit === 'in' ? 'bg-itailor-gold text-itailor-dark' : 'text-itailor-cream/60'
                }`}
              >
                Inches (in)
              </button>
              <button
                type="button"
                onClick={() => setUnit('cm')}
                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                  unit === 'cm' ? 'bg-itailor-gold text-itailor-dark' : 'text-itailor-cream/60'
                }`}
              >
                Centimeters (cm)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {CUSTOM_FIELDS.map((f) => (
              <div key={f.key} className="flex flex-col gap-1 p-3 rounded-lg border border-itailor-cardBorder bg-itailor-card/50">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-itailor-cream uppercase tracking-wider">{f.label}</label>
                  <span className="text-[10px] text-itailor-gold">{unit}</span>
                </div>
                <input
                  type="number"
                  min={0}
                  step={unit === 'in' ? 0.25 : 0.5}
                  value={measurements[f.key]}
                  onChange={(e) => setMeasurement(f.key, e.target.value)}
                  className="w-full bg-[#0A111C] border border-itailor-cardBorder rounded px-3 py-1.5 text-sm text-itailor-gold font-mono focus:border-itailor-gold focus:outline-none"
                />
                <span className="text-[10px] text-itailor-cream/40 mt-0.5">{f.desc}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

