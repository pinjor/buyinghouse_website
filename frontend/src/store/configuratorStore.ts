import { create } from 'zustand';
import type { ProductDetail, PriceBreakdown } from '../api/catalogApi';

export interface Measurements {
  neck: string;
  chest: string;
  waist: string;
  hips: string;
  sleeveLength: string;
  jacketLength: string;
  pantsWaist: string;
  pantsLength: string;
}

export interface ContrastSelections {
  liningColor: string;
  liningPattern: string;
  buttonThreadColor: string;
  monogramText: string;
  monogramColor: string;
}

export type CustomizerStep = 'FABRIC' | 'STYLE' | 'CONTRAST' | 'MEASUREMENTS' | 'SUMMARY';
export type ViewAngle = 'front' | 'back' | 'lining' | 'zoom';
export type MeasurementMode = 'standard' | 'custom';

interface ConfiguratorState {
  product: ProductDetail | null;
  fabricId: string | null;
  styleSelections: Record<string, string>;
  measurements: Measurements;
  contrastSelections: ContrastSelections;
  price: PriceBreakdown | null;
  activeStep: CustomizerStep;
  activeSubStep: string;
  fabricCategoryFilter: string;
  viewAngle: ViewAngle;
  measurementMode: MeasurementMode;
  standardSize: string;
  isZoomModalOpen: boolean;

  // Actions
  loadProduct: (product: ProductDetail) => void;
  setFabric: (fabricId: string) => void;
  setStyleOption: (groupId: string, optionId: string) => void;
  setMeasurement: (field: keyof Measurements, value: string) => void;
  setContrastSelection: <K extends keyof ContrastSelections>(key: K, value: ContrastSelections[K]) => void;
  setPrice: (price: PriceBreakdown | null) => void;
  setActiveStep: (step: CustomizerStep) => void;
  setActiveSubStep: (subStep: string) => void;
  setFabricCategoryFilter: (category: string) => void;
  setViewAngle: (angle: ViewAngle) => void;
  setMeasurementMode: (mode: MeasurementMode) => void;
  setStandardSize: (size: string) => void;
  setIsZoomModalOpen: (isOpen: boolean) => void;
  nextStep: () => void;
  prevStep: () => void;
}

const emptyMeasurements: Measurements = {
  neck: '15.5',
  chest: '40.0',
  waist: '34.0',
  hips: '41.0',
  sleeveLength: '25.0',
  jacketLength: '29.5',
  pantsWaist: '34.0',
  pantsLength: '32.0',
};

const defaultContrast: ContrastSelections = {
  liningColor: 'Matching Navy',
  liningPattern: 'Solid Silk',
  buttonThreadColor: 'Matching Thread',
  monogramText: '',
  monogramColor: 'Gold',
};

const STEP_ORDER: CustomizerStep[] = ['FABRIC', 'STYLE', 'CONTRAST', 'MEASUREMENTS', 'SUMMARY'];

export const useConfiguratorStore = create<ConfiguratorState>((set, get) => ({
  product: null,
  fabricId: null,
  styleSelections: {},
  measurements: emptyMeasurements,
  contrastSelections: defaultContrast,
  price: null,
  activeStep: 'FABRIC',
  activeSubStep: 'Buttons',
  fabricCategoryFilter: 'all',
  viewAngle: 'front',
  measurementMode: 'standard',
  standardSize: '40R',
  isZoomModalOpen: false,

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
      contrastSelections: defaultContrast,
      price: null,
      activeStep: 'FABRIC',
      activeSubStep: product.styleOptions[0]?.name ?? 'Buttons',
    }),
  setFabric: (fabricId) => set({ fabricId }),
  setStyleOption: (groupId, optionId) =>
    set((s) => ({ styleSelections: { ...s.styleSelections, [groupId]: optionId } })),
  setMeasurement: (field, value) => set((s) => ({ measurements: { ...s.measurements, [field]: value } })),
  setContrastSelection: (key, value) =>
    set((s) => ({ contrastSelections: { ...s.contrastSelections, [key]: value } })),
  setPrice: (price) => set({ price }),
  setActiveStep: (activeStep) => set({ activeStep }),
  setActiveSubStep: (activeSubStep) => set({ activeSubStep }),
  setFabricCategoryFilter: (fabricCategoryFilter) => set({ fabricCategoryFilter }),
  setViewAngle: (viewAngle) => set({ viewAngle }),
  setMeasurementMode: (measurementMode) => set({ measurementMode }),
  setStandardSize: (standardSize) => set({ standardSize }),
  setIsZoomModalOpen: (isZoomModalOpen) => set({ isZoomModalOpen }),
  nextStep: () => {
    const { activeStep } = get();
    const idx = STEP_ORDER.indexOf(activeStep);
    if (idx < STEP_ORDER.length - 1) {
      set({ activeStep: STEP_ORDER[idx + 1] });
    }
  },
  prevStep: () => {
    const { activeStep } = get();
    const idx = STEP_ORDER.indexOf(activeStep);
    if (idx > 0) {
      set({ activeStep: STEP_ORDER[idx - 1] });
    }
  },
}));

