import { useAppSettingsStore } from '../store/appSettingsStore';
import {
  formatHeightFromCm,
  formatWeightFromKg,
  heightFieldLabel,
  heightPlaceholder,
  parseHeightToCm,
  parseWeightToKg,
  weightFieldLabel,
  weightPlaceholder,
} from '../lib/units';

export function useUnitSettings() {
  const weightUnit = useAppSettingsStore((s) => s.weightUnit);
  const heightUnit = useAppSettingsStore((s) => s.heightUnit);

  return {
    weightUnit,
    heightUnit,
    weightLabel: weightFieldLabel(weightUnit),
    heightLabel: heightFieldLabel(heightUnit),
    weightPlaceholder: weightPlaceholder(weightUnit),
    heightPlaceholder: heightPlaceholder(heightUnit),
    formatWeightFromKg: (kg: number, digits?: number) =>
      formatWeightFromKg(kg, weightUnit, digits),
    formatHeightFromCm: (cm: number) => formatHeightFromCm(cm, heightUnit),
    parseWeightToKg: (raw: string) => parseWeightToKg(raw, weightUnit),
    parseHeightToCm: (raw: string) => parseHeightToCm(raw, heightUnit),
  };
}
