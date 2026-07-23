import type { HeightUnit, WeightUnit } from '../store/appSettingsStore';

const LB_PER_KG = 2.204_622_621_8;
const CM_PER_IN = 2.54;

export function weightFieldLabel(unit: WeightUnit): string {
  return unit === 'kg' ? 'Weight (kg)' : 'Weight (lb)';
}

export function heightFieldLabel(unit: HeightUnit): string {
  return unit === 'cm' ? 'Height (cm)' : "Height (ft'in)";
}

export function weightPlaceholder(unit: WeightUnit): string {
  return unit === 'kg' ? 'e.g. 72.5' : 'e.g. 160';
}

export function heightPlaceholder(unit: HeightUnit): string {
  return unit === 'cm' ? 'e.g. 175' : "e.g. 5'10";
}

export function formatWeightFromKg(kg: number, unit: WeightUnit, digits = 1): string {
  if (unit === 'kg') {
    const rounded = Math.round(kg * 10 ** digits) / 10 ** digits;
    return String(rounded);
  }
  const lb = kg * LB_PER_KG;
  return String(Math.round(lb * 10 ** digits) / 10 ** digits);
}

export function parseWeightToKg(raw: string, unit: WeightUnit): number | null {
  const normalized = raw.replace(',', '.').trim();
  if (!normalized) {
    return null;
  }
  const value = Number(normalized);
  if (!Number.isFinite(value) || value <= 0) {
    return null;
  }
  if (unit === 'kg') {
    return value <= 400 ? value : null;
  }
  const kg = value / LB_PER_KG;
  return kg <= 400 ? Math.round(kg * 1000) / 1000 : null;
}

export function formatHeightFromCm(cm: number, unit: HeightUnit): string {
  if (unit === 'cm') {
    return cm % 1 === 0 ? String(Math.round(cm)) : String(Math.round(cm * 10) / 10);
  }
  const totalIn = cm / CM_PER_IN;
  const ft = Math.floor(totalIn / 12);
  let inches = Math.round(totalIn - ft * 12);
  if (inches === 12) {
    return `${ft + 1}'0"`;
  }
  return `${ft}'${inches}"`;
}

export function parseHeightToCm(raw: string, unit: HeightUnit): number | null {
  const trimmed = raw.trim();
  if (!trimmed) {
    return null;
  }
  if (unit === 'cm') {
    const value = Number(trimmed.replace(',', '.'));
    if (!Number.isFinite(value) || value <= 0 || value > 300) {
      return null;
    }
    return value;
  }

  const ftInMatch = trimmed.match(/^(\d+)\s*[''′]\s*(\d{1,2})"?$/);
  if (ftInMatch) {
    const ft = Number(ftInMatch[1]);
    const inches = Number(ftInMatch[2]);
    if (ft >= 3 && ft <= 8 && inches >= 0 && inches < 12) {
      return (ft * 12 + inches) * CM_PER_IN;
    }
    return null;
  }

  const totalInches = Number(trimmed.replace(',', '.'));
  if (Number.isFinite(totalInches) && totalInches >= 48 && totalInches <= 96) {
    return totalInches * CM_PER_IN;
  }

  return null;
}

export function formatWeightDeltaKg(deltaKg: number, unit: WeightUnit): string {
  const sign = deltaKg > 0 ? '+' : '';
  if (unit === 'kg') {
    return `${sign}${deltaKg.toFixed(1)} kg`;
  }
  const deltaLb = deltaKg * LB_PER_KG;
  return `${sign}${deltaLb.toFixed(1)} lb`;
}

export function formatWeightAxisKg(kg: number, unit: WeightUnit): string {
  if (unit === 'kg') {
    return `${kg.toFixed(1)} kg`;
  }
  return `${(kg * LB_PER_KG).toFixed(1)} lb`;
}
