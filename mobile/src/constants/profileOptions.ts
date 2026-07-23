export const GOALS = [
  { value: 'lose_weight', label: 'Lose weight' },
  { value: 'build_muscle', label: 'Build muscle' },
  { value: 'maintain', label: 'Maintain' },
  { value: 'endurance', label: 'Endurance' },
] as const;

export const DIET_PREFS = [
  'Vegetarian',
  'Vegan',
  'High protein',
  'Low carb',
  'Halal',
  'Flexible',
] as const;

export const RESTRICTIONS = [
  'No dairy',
  'No gluten',
  'No nuts',
  'No pork',
  'No shellfish',
  'No spicy',
] as const;

export const EQUIPMENT = [
  'Bodyweight only',
  'Dumbbells',
  'Resistance bands',
  'Barbell',
  'Gym machines',
  'Cardio machine',
] as const;

export const ACTIVITY_LEVELS = [
  { value: 'sedentary', label: 'Mostly seated' },
  { value: 'light', label: 'Light movement' },
  { value: 'moderate', label: 'Moderately active' },
  { value: 'active', label: 'Very active' },
  { value: 'very_active', label: 'Athlete / manual work' },
] as const;

export const EXPERIENCE_LEVELS = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
] as const;

export const SEX_OPTIONS = [
  { value: 'female', label: 'Female' },
  { value: 'male', label: 'Male' },
  { value: 'other', label: 'Other' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' },
] as const;
