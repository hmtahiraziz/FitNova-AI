import type { PlanContent } from '../schemas/plan.schemas';
import { planContentSchema } from '../schemas/plan.schemas';
import { MAX_MEAL_KCAL, MIN_MEAL_KCAL } from './planSafety';

function softenCalorieText(text: string): string {
  const lower = text.toLowerCase();
  if (
    lower.includes('crash') ||
    lower.includes('starve') ||
    lower.includes('extreme') ||
    /\b(800|900|1000)\s*kcal/.test(lower)
  ) {
    return 'Aim for a moderate calorie range around maintenance with a gentle deficit or surplus based on your goal—avoid extremes.';
  }
  return text;
}

/** Best-effort cleanup before Zod so messy model output can still validate. */
function preprocessRawPlan(raw: unknown): unknown {
  if (!raw || typeof raw !== 'object') {
    return raw;
  }

  const plan = structuredClone(raw) as Record<string, unknown>;
  const workoutPlan = plan.workoutPlan as
    | { days?: Array<{ exercises?: Array<{ name?: string }> }> }
    | undefined;
  const mealPlan = plan.mealPlan as
    | {
        days?: Array<{
          meals?: Array<{ items?: string[]; approxCalories?: number }>;
        }>;
        shoppingHints?: string[];
      }
    | undefined;

  if (workoutPlan?.days) {
    workoutPlan.days = workoutPlan.days.map((day) => ({
      ...day,
      exercises: (day.exercises ?? []).filter(
        (ex) => typeof ex.name === 'string' && ex.name.trim().length > 0,
      ),
    }));
  }

  if (mealPlan?.days) {
    mealPlan.days = mealPlan.days.map((day) => ({
      ...day,
      meals: (day.meals ?? []).map((meal) => ({
        ...meal,
        items: (meal.items ?? []).filter(
          (item) => typeof item === 'string' && item.trim().length > 0,
        ),
      })),
    }));
  }

  if (Array.isArray(mealPlan?.shoppingHints)) {
    mealPlan.shoppingHints = mealPlan.shoppingHints.filter(
      (hint) => typeof hint === 'string' && hint.trim().length > 0,
    );
  }

  return plan;
}

function clampMealCalories(value: number | undefined): number | undefined {
  if (value == null) {
    return MIN_MEAL_KCAL;
  }
  if (value > MAX_MEAL_KCAL) {
    return Math.min(MAX_MEAL_KCAL, Math.max(MIN_MEAL_KCAL, 700));
  }
  if (value < MIN_MEAL_KCAL) {
    return MIN_MEAL_KCAL;
  }
  return Math.round(value);
}

export function sanitizePlanContent(raw: unknown): PlanContent {
  const parsed = planContentSchema.parse(preprocessRawPlan(raw));

  const workoutDays = parsed.workoutPlan.days
    .map((day) => ({
      ...day,
      exercises: day.exercises.filter((ex) => ex.name.trim().length > 0),
    }))
    .filter((day) => day.exercises.length > 0);

  const mealDays = parsed.mealPlan.days
    .map((day) => ({
      ...day,
      meals: day.meals
        .map((meal) => ({
          ...meal,
          items: meal.items.filter((item) => item.trim().length > 0),
          approxCalories: clampMealCalories(meal.approxCalories),
        }))
        .filter((meal) => meal.items.length > 0),
    }))
    .filter((day) => day.meals.length > 0);

  if (workoutDays.length === 0 || mealDays.length === 0) {
    throw new Error('Plan missing workout or meal entries after sanitizing');
  }

  return {
    summary: parsed.summary.trim(),
    workoutPlan: {
      daysPerWeek: Math.min(
        7,
        Math.max(1, parsed.workoutPlan.daysPerWeek || workoutDays.length),
      ),
      days: workoutDays,
    },
    mealPlan: {
      days: mealDays,
      shoppingHints: parsed.mealPlan.shoppingHints.filter((h) => h.trim()),
    },
    targets: {
      calorieGuidance: softenCalorieText(parsed.targets.calorieGuidance),
      proteinNote: parsed.targets.proteinNote.trim(),
    },
  };
}
