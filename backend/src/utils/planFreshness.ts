import type { PlanContent } from '../schemas/plan.schemas';
import type { PlanGenerateFocus } from '../schemas/plans.generate.schemas';

/** Normalize labels so "Push-up" ≈ "push up" ≈ "Pushups". */
export function normalizePlanLabel(raw: string): string {
  return raw
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function collectExerciseNames(plan: PlanContent): string[] {
  const names: string[] = [];
  for (const day of plan.workoutPlan.days) {
    for (const ex of day.exercises) {
      const n = ex.name?.trim();
      if (n) {
        names.push(n);
      }
    }
  }
  return names;
}

export function collectMealItems(plan: PlanContent): string[] {
  const items: string[] = [];
  for (const day of plan.mealPlan.days) {
    for (const meal of day.meals) {
      for (const item of meal.items) {
        const n = item?.trim();
        if (n) {
          items.push(n);
        }
      }
    }
  }
  return items;
}

function toNormalizedSet(labels: string[]): Set<string> {
  const out = new Set<string>();
  for (const label of labels) {
    const n = normalizePlanLabel(label);
    if (n.length >= 3) {
      out.add(n);
    }
  }
  return out;
}

/**
 * Fraction of previous labels that reappear in next (0–1).
 * Empty previous → 0.
 */
export function reuseRate(previous: string[], next: string[]): number {
  const prev = toNormalizedSet(previous);
  if (prev.size === 0) {
    return 0;
  }
  const nxt = toNormalizedSet(next);
  let hit = 0;
  for (const p of prev) {
    if (nxt.has(p)) {
      hit += 1;
    }
  }
  return hit / prev.size;
}

export type FreshnessThresholds = {
  maxExerciseReuse: number;
  maxMealReuse: number;
};

export function thresholdsForFocus(focus: PlanGenerateFocus): FreshnessThresholds {
  switch (focus) {
    case 'workout_variety':
      // Strict on exercises; meals may stay similar.
      return { maxExerciseReuse: 0.35, maxMealReuse: 1 };
    case 'meal_variety':
      // Strict on meals; workouts may stay similar.
      return { maxExerciseReuse: 1, maxMealReuse: 0.35 };
    case 'lighter_meals':
      return { maxExerciseReuse: 0.55, maxMealReuse: 0.4 };
    default:
      return { maxExerciseReuse: 0.45, maxMealReuse: 0.45 };
  }
}

export type FreshnessResult = {
  ok: boolean;
  exerciseReuse: number;
  mealReuse: number;
  /** Machine-readable fix hint for the next model attempt. */
  message?: string;
};

export function evaluatePlanFreshness(
  previous: PlanContent,
  next: PlanContent,
  focus: PlanGenerateFocus,
): FreshnessResult {
  const exerciseReuse = reuseRate(
    collectExerciseNames(previous),
    collectExerciseNames(next),
  );
  const mealReuse = reuseRate(
    collectMealItems(previous),
    collectMealItems(next),
  );
  const { maxExerciseReuse, maxMealReuse } = thresholdsForFocus(focus);

  const exerciseTooSimilar = exerciseReuse > maxExerciseReuse;
  const mealTooSimilar = mealReuse > maxMealReuse;

  if (!exerciseTooSimilar && !mealTooSimilar) {
    return { ok: true, exerciseReuse, mealReuse };
  }

  const parts: string[] = [
    'Plan is too similar to the previous one — regenerate with more variety.',
  ];
  if (exerciseTooSimilar) {
    parts.push(
      `Exercise reuse ${(exerciseReuse * 100).toFixed(0)}% exceeds limit ${(maxExerciseReuse * 100).toFixed(0)}%. Replace most exercise names; do not reuse the avoid-list exercises.`,
    );
  }
  if (mealTooSimilar) {
    parts.push(
      `Meal item reuse ${(mealReuse * 100).toFixed(0)}% exceeds limit ${(maxMealReuse * 100).toFixed(0)}%. Use different meal items while keeping the same staples and restrictions.`,
    );
  }

  return {
    ok: false,
    exerciseReuse,
    mealReuse,
    message: parts.join(' '),
  };
}

/** Cap list length so prompts stay small. */
export function uniqueLabelsForPrompt(labels: string[], max = 24): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const label of labels) {
    const key = normalizePlanLabel(label);
    if (!key || seen.has(key)) {
      continue;
    }
    seen.add(key);
    out.push(label.trim());
    if (out.length >= max) {
      break;
    }
  }
  return out;
}
