import type { PlanContent } from '../schemas/plan.schemas';
import type { PlanGenerateFocus } from '../schemas/plans.generate.schemas';

export const PLAN_DISCLAIMER =
  'This is general wellness guidance, not medical advice. Consult a qualified professional before making major diet or exercise changes.';

export const PLAN_PROMPT_VERSION = 'v3-regenerate';

export type ProfileForPrompt = {
  goal: string;
  dietaryPreferences: string[];
  restrictions: string[];
  localStaples: string[];
  activityLevel: string | null;
  experienceLevel: string | null;
  daysPerWeek: number;
  mealsPerDay: number;
  equipment: string[];
  heightCm: number | null;
  weightKg: number | null;
  age: number | null;
  sex: string | null;
};

export function buildPlanSystemPrompt(): string {
  return [
    'You are FitNova, an AI fitness and nutrition coach for the FitNova AI app.',
    'Return ONLY valid JSON matching the required schema. No markdown, no code fences.',
    '',
    'Coaching rules:',
    '- Personalize using goal, activityLevel, experienceLevel, age, sex, heightCm, weightKg.',
    '- Use localStaples as primary meal ingredients; respect dietaryPreferences and never include restricted foods.',
    '- workoutPlan.days.length must equal daysPerWeek (each entry is a training day in the weekly rotation).',
    '- Vary movement patterns across days (push/pull/legs or full-body splits suited to experience).',
    '- Include sets/reps appropriate to experienceLevel; note regressions/progressions in exercise notes.',
    '- mealPlan.days.length must equal daysPerWeek; each day must have exactly mealsPerDay meals.',
    '- Provide realistic approxCalories per meal; calorieGuidance should be moderate (no crash diets or extreme deficits).',
    '- proteinNote should be actionable and aligned with goal and body weight when known.',
    '- shoppingHints: 5–12 practical items drawn from staples.',
    '- No unsafe supplements, detoxes, or medical claims.',
  ].join('\n');
}

function focusAddendum(focus: PlanGenerateFocus): string {
  switch (focus) {
    case 'meal_variety':
      return 'Focus: emphasize new meal combinations and staple-based recipes; keep workouts aligned with goal.';
    case 'workout_variety':
      return 'Focus: emphasize new exercises and training splits; keep meals aligned with staples and preferences.';
    case 'lighter_meals':
      return 'Focus: slightly lighter meal portions and moderate approxCalories—still balanced, never extreme.';
    default:
      return 'Focus: balanced refresh of both workouts and meals.';
  }
}

export function buildRegenerateAddendum(
  previous: PlanContent | null,
  focus: PlanGenerateFocus,
): string {
  const lines = [
    'This is a REGENERATION request. Create a fresh weekly plan that differs meaningfully from the previous plan.',
    'Use different exercises and meal items while keeping the same goal, schedule, staples, and restrictions.',
    focusAddendum(focus),
  ];
  if (previous) {
    lines.push(
      `Previous plan summary (do not copy verbatim): ${previous.summary.slice(0, 280)}`,
    );
  }
  return lines.join('\n');
}

export function buildPlanUserPrompt(
  profile: ProfileForPrompt,
  extras?: { regenerateNote?: string; validationFix?: string },
): string {
  const parts = [
    'Create a combined workout + meal plan for this profile:',
    JSON.stringify(profile, null, 2),
  ];
  if (extras?.regenerateNote) {
    parts.push('', extras.regenerateNote);
  }
  if (extras?.validationFix) {
    parts.push('', 'Fix the following validation issue:', extras.validationFix);
  }
  parts.push(
    '',
    'JSON shape (follow exactly):',
    JSON.stringify(
      {
        summary: 'string — 2–3 sentences referencing goal and schedule',
        workoutPlan: {
          daysPerWeek: 3,
          days: [
            {
              day: 'Day 1',
              focus: 'string',
              exercises: [
                {
                  name: 'string',
                  sets: 3,
                  reps: '8-12 or time-based string',
                  notes: 'string with form or progression tip',
                },
              ],
            },
          ],
        },
        mealPlan: {
          days: [
            {
              day: 'Day 1',
              meals: [
                {
                  name: 'Breakfast',
                  items: ['string'],
                  approxCalories: 400,
                },
              ],
            },
          ],
          shoppingHints: ['string'],
        },
        targets: {
          calorieGuidance: 'string',
          proteinNote: 'string',
        },
      },
      null,
      2,
    ),
  );
  return parts.join('\n');
}
