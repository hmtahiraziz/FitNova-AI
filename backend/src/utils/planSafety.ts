import type { Profile } from '../generated/prisma/client';
import type { PlanContent } from '../schemas/plan.schemas';

/** Minimum estimated calories per meal after sanitization. */
export const MIN_MEAL_KCAL = 300;
/** Soft ceiling per meal (very high single meals get clamped). */
export const MAX_MEAL_KCAL = 1100;
/** Minimum estimated daily calories for adults on maintenance-safe plans. */
export const MIN_DAILY_KCAL = 1500;
/** Higher floor when deficit must be blocked (minors / underweight). */
export const MIN_DAILY_KCAL_PROTECTED = 1800;

const DISORDERED_EATING_RE =
  /\b(purge|purging|laxative|laxatives|starve|starving|anorexi|bulimi|binge\s*and\s*purge|make myself throw up)\b/i;

/** Common restriction tokens → substrings to reject in meal text. */
const RESTRICTION_ALIASES: Record<string, string[]> = {
  peanut: ['peanut', 'peanuts', 'groundnut', 'groundnuts'],
  peanuts: ['peanut', 'peanuts', 'groundnut'],
  tree_nut: ['almond', 'cashew', 'walnut', 'pistachio', 'hazelnut', 'pecan', 'tree nut'],
  nuts: ['peanut', 'almond', 'cashew', 'walnut', 'pistachio', 'hazelnut', 'pecan'],
  dairy: ['dairy', 'milk', 'cheese', 'yogurt', 'yoghurt', 'butter', 'cream', 'whey', 'paneer'],
  lactose: ['milk', 'cheese', 'yogurt', 'yoghurt', 'cream', 'lactose', 'paneer'],
  gluten: ['gluten', 'wheat', 'barley', 'rye', 'bread', 'pasta', 'naan', 'roti'],
  wheat: ['wheat', 'bread', 'pasta', 'naan', 'roti', 'chapati'],
  egg: ['egg', 'eggs', 'omelette', 'omelet'],
  eggs: ['egg', 'eggs', 'omelette', 'omelet'],
  soy: ['soy', 'soya', 'tofu', 'edamame'],
  shellfish: ['shrimp', 'prawn', 'crab', 'lobster', 'shellfish'],
  fish: ['fish', 'salmon', 'tuna', 'cod', 'sardine'],
  pork: ['pork', 'bacon', 'ham', 'prosciutto'],
  beef: ['beef', 'steak'],
  alcohol: ['alcohol', 'wine', 'beer', 'vodka'],
  vegan: ['chicken', 'beef', 'pork', 'fish', 'egg', 'eggs', 'milk', 'cheese', 'yogurt', 'yoghurt', 'butter', 'honey', 'paneer'],
  vegetarian: ['chicken', 'beef', 'pork', 'fish', 'shrimp', 'prawn', 'meat', 'bacon'],
  halal: ['pork', 'bacon', 'ham', 'alcohol', 'wine', 'beer'],
};

export function computeBmi(
  weightKg: number | null | undefined,
  heightCm: number | null | undefined,
): number | null {
  if (
    weightKg == null ||
    heightCm == null ||
    weightKg <= 0 ||
    heightCm <= 0
  ) {
    return null;
  }
  const meters = heightCm / 100;
  return weightKg / (meters * meters);
}

export function isProtectedProfile(profile: Profile): boolean {
  const age = profile.age ?? 99;
  if (age < 18) {
    return true;
  }
  const bmi = computeBmi(profile.weightKg, profile.heightCm);
  return bmi != null && bmi < 18.5;
}

export function detectDisorderedEatingSignals(
  profile: Profile,
  content?: PlanContent | null,
): boolean {
  const blobs = [
    ...profile.restrictions,
    ...profile.localStaples,
    ...profile.dietaryPreferences,
    content?.summary ?? '',
    content?.targets.calorieGuidance ?? '',
    content?.targets.proteinNote ?? '',
  ];
  return blobs.some((t) => DISORDERED_EATING_RE.test(t));
}

function restrictionNeedles(restrictions: string[]): string[] {
  const needles = new Set<string>();
  for (const raw of restrictions) {
    const key = raw.trim().toLowerCase().replace(/\s+/g, '_');
    const aliases = RESTRICTION_ALIASES[key] ?? RESTRICTION_ALIASES[raw.trim().toLowerCase()];
    if (aliases) {
      for (const a of aliases) {
        needles.add(a);
      }
    } else if (raw.trim().length >= 3) {
      needles.add(raw.trim().toLowerCase());
    }
  }
  return [...needles];
}

export function itemViolatesRestrictions(
  item: string,
  needles: string[],
): boolean {
  const lower = item.toLowerCase();
  return needles.some((n) => lower.includes(n));
}

/** Human-readable issue for model retry, or null if OK. */
export function validateRestrictionsAgainstPlan(
  content: PlanContent,
  profile: Profile,
): string | null {
  const needles = restrictionNeedles(profile.restrictions);
  if (needles.length === 0) {
    return null;
  }
  for (const day of content.mealPlan.days) {
    for (const meal of day.meals) {
      for (const item of meal.items) {
        if (itemViolatesRestrictions(item, needles)) {
          return `Meal item "${item}" conflicts with dietary restrictions (${profile.restrictions.join(', ')}). Remove restricted foods and regenerate that meal.`;
        }
      }
    }
  }
  return null;
}

function clampMealCalories(
  value: number | undefined,
  minMeal: number,
): number {
  if (value == null || Number.isNaN(value)) {
    return minMeal;
  }
  return Math.min(MAX_MEAL_KCAL, Math.max(minMeal, Math.round(value)));
}

function enforceDailyFloor(
  content: PlanContent,
  minDaily: number,
  minMeal: number,
): PlanContent {
  const days = content.mealPlan.days.map((day) => {
    let meals = day.meals.map((meal) => ({
      ...meal,
      approxCalories: clampMealCalories(meal.approxCalories, minMeal),
    }));

    let daily = meals.reduce((sum, m) => sum + (m.approxCalories ?? 0), 0);
    if (daily < minDaily && meals.length > 0) {
      const bump = Math.ceil((minDaily - daily) / meals.length);
      meals = meals.map((m) => ({
        ...m,
        approxCalories: Math.min(
          MAX_MEAL_KCAL,
          (m.approxCalories ?? minMeal) + bump,
        ),
      }));
    }
    return { ...day, meals };
  });

  return {
    ...content,
    mealPlan: { ...content.mealPlan, days },
  };
}

function stripRestrictedItems(
  content: PlanContent,
  profile: Profile,
): PlanContent {
  const needles = restrictionNeedles(profile.restrictions);
  if (needles.length === 0) {
    return content;
  }
  const staple =
    profile.localStaples.find(
      (s) => !itemViolatesRestrictions(s, needles),
    ) ?? 'vegetables and a permitted protein';

  const days = content.mealPlan.days.map((day) => ({
    ...day,
    meals: day.meals.map((meal) => {
      const items = meal.items.filter(
        (item) => !itemViolatesRestrictions(item, needles),
      );
      return {
        ...meal,
        items:
          items.length > 0
            ? items
            : [`Restriction-safe plate with ${staple}`],
      };
    }),
  }));

  return {
    ...content,
    mealPlan: { ...content.mealPlan, days },
  };
}

/**
 * Code-level safety pass after structural sanitize/validate.
 * Enforces calorie floors, restriction scrubbing, and protected-profile messaging.
 */
export function applyPlanSafety(
  content: PlanContent,
  profile: Profile,
): PlanContent {
  const protectedProfile = isProtectedProfile(profile);
  const minDaily = protectedProfile
    ? MIN_DAILY_KCAL_PROTECTED
    : MIN_DAILY_KCAL;
  const minMeal = MIN_MEAL_KCAL;

  let next = stripRestrictedItems(content, profile);
  next = enforceDailyFloor(next, minDaily, minMeal);

  let calorieGuidance = next.targets.calorieGuidance;
  let summary = next.summary;

  if (protectedProfile) {
    calorieGuidance =
      'Stay near maintenance calories with steady meals—no aggressive deficits. If you have concerns about weight or growth, talk with a parent/guardian and a qualified clinician.';
    if (profile.age != null && profile.age < 18) {
      summary = `${summary.replace(/\s+$/, '')} This plan uses maintenance-focused guidance suitable for under-18 users—not a weight-loss diet.`;
    } else {
      summary = `${summary.replace(/\s+$/, '')} Because your stats suggest a lower BMI, this plan prioritizes adequate fuel rather than a calorie deficit. Consider speaking with a clinician.`;
    }
  } else if (profile.goal === 'lose_weight') {
    // Cap aggressive “lose X kg fast” language in guidance.
    if (/\b\d+\s*kg\b/i.test(calorieGuidance) && /week|days?/i.test(calorieGuidance)) {
      calorieGuidance =
        'Aim for a modest deficit of roughly 250–500 kcal below maintenance, with protein at most meals—progress should be gradual.';
    }
  }

  return {
    ...next,
    summary: summary.trim(),
    targets: {
      ...next.targets,
      calorieGuidance,
      proteinNote: next.targets.proteinNote.trim(),
    },
  };
}

/** Throws a user-facing message string if generation must be refused. */
export function assertSafeToGeneratePlan(profile: Profile): void {
  if (detectDisorderedEatingSignals(profile)) {
    throw new Error(
      'SUPPORTIVE_REFUSAL: We cannot create a restriction or weight-loss plan from language that suggests disordered eating. Please reach out to someone you trust or a clinician, and consider resources like https://www.nationaleatingdisorders.org/help-support/.',
    );
  }
}
