import { create } from 'zustand';
import type { ProductDetail, PriceBreakdown } from '../api/catalogApi';

interface Measurements {
  neck: string;
  chest: string;
  waist: string;
  sleeveLength: string;
}

interface ConfiguratorState {
  product: ProductDetail | null;
  fabricId: string | null;
  styleSelections: Record<string, string>;
  measurements: Measurements;
  price: PriceBreakdown | null;
  loadProduct: (product: ProductDetail) => void;
  setFabric: (fabricId: string) => void;
  setStyleOption: (groupId: string, optionId: string) => void;
  setMeasurement: (field: keyof Measurements, value: string) => void;
  setPrice: (price: PriceBreakdown | null) => void;
}

const emptyMeasurements: Measurements = { neck: '', chest: '', waist: '', sleeveLength: '' };

export const useConfiguratorStore = create<ConfiguratorState>((set) => ({
  product: null,
  fabricId: null,
  styleSelections: {},
  measurements: emptyMeasurements,
  price: null,
  loadProduct: (product) =>
    set({
      product,
      fabricId: product.fabricOptions[0]?.id ?? null,
      styleSelections: Object.fromEntries(
        product.styleOptions
          .map((g) => [g.id, g.options[0]?.id] as const)
          .filter((entry): entry is [string, string] => Boolean(entry[1])),
      ),
      measurements: emptyMeasurements,
      price: null,
    }),
  setFabric: (fabricId) => set({ fabricId }),
  setStyleOption: (groupId, optionId) =>
    set((s) => ({ styleSelections: { ...s.styleSelections, [groupId]: optionId } })),
  setMeasurement: (field, value) => set((s) => ({ measurements: { ...s.measurements, [field]: value } })),
  setPrice: (price) => set({ price }),
}));
