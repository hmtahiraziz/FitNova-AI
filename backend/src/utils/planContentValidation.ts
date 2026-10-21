import type { Profile } from '../generated/prisma/client';
import type { PlanContent } from '../schemas/plan.schemas';
import { validateRestrictionsAgainstPlan } from './planSafety';

/** Schedule / structure checks for model retry. */
export function validatePlanAgainstProfile(
  content: PlanContent,
  profile: Profile,
): string | null {
  const { daysPerWeek, mealsPerDay } = profile;

  if (content.workoutPlan.days.length !== daysPerWeek) {
    return `workoutPlan.days must have exactly ${daysPerWeek} entries (got ${content.workoutPlan.days.length}).`;
  }

  if (content.mealPlan.days.length !== daysPerWeek) {
    return `mealPlan.days must have exactly ${daysPerWeek} entries (got ${content.mealPlan.days.length}).`;
  }

  for (const day of content.mealPlan.days) {
    if (day.meals.length !== mealsPerDay) {
      return `Each meal day must have exactly ${mealsPerDay} meals; "${day.day}" has ${day.meals.length}.`;
    }
  }

  for (const day of content.workoutPlan.days) {
    if (day.exercises.length < 1) {
      return `Each workout day needs at least one exercise; "${day.day}" is empty.`;
    }
  }

  return null;
}

/** Restriction check used for OpenAI retry; finalize also scrubs leftovers in code. */
export function validatePlanRestrictions(
  content: PlanContent,
  profile: Profile,
): string | null {
  return validateRestrictionsAgainstPlan(content, profile);
}

export function normalizeShoppingHints(
  content: PlanContent,
  profile: Profile,
): PlanContent {
  let hints = content.mealPlan.shoppingHints.filter((h) => h.trim().length > 0);
  if (hints.length < 5) {
    const fromStaples = profile.localStaples.filter(
      (s) => !hints.some((h) => h.toLowerCase() === s.toLowerCase()),
    );
    hints = [...hints, ...fromStaples].slice(0, 12);
  }
  if (hints.length > 12) {
    hints = hints.slice(0, 12);
  }
  return {
    ...content,
    mealPlan: { ...content.mealPlan, shoppingHints: hints },
  };
}
