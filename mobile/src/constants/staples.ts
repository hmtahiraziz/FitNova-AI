/** Curated local staples for onboarding chips (Story 1). */
export const STAPLES = [
  'Rice',
  'Roti',
  'Dal',
  'Yogurt',
  'Chicken',
  'Eggs',
  'Oats',
  'Paneer',
  'Fish',
  'Beans',
  'Lentils',
  'Spinach',
  'Potatoes',
  'Bananas',
  'Peanut butter',
] as const;

export type Staple = (typeof STAPLES)[number];
