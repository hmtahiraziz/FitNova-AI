import { apiRequest } from './client';

export type PlanExercise = {
  name: string;
  sets: number;
  reps: string;
  notes?: string;
};

export type PlanContent = {
  summary: string;
  workoutPlan: {
    daysPerWeek: number;
    days: Array<{
      day: string;
      focus: string;
      exercises: PlanExercise[];
    }>;
  };
  mealPlan: {
    days: Array<{
      day: string;
      meals: Array<{
        name: string;
        items: string[];
        approxCalories?: number;
      }>;
    }>;
    shoppingHints: string[];
  };
  targets: {
    calorieGuidance: string;
    proteinNote: string;
  };
};

export type Plan = {
  id: string;
  userId: string;
  type: string;
  content: PlanContent;
  disclaimer: string;
  openaiModel: string | null;
  promptVersion: string;
  createdAt: string;
};

export type PlanGenerateFocus =
  | 'balanced'
  | 'meal_variety'
  | 'workout_variety'
  | 'lighter_meals';

export type PlanGenerateOptions = {
  intent?: 'initial' | 'regenerate';
  focus?: PlanGenerateFocus;
};

export type PlanGenerateMeta = {
  generationsUsedLastHour: number;
  generationsLimitPerHour: number;
  generationsRemainingThisHour: number;
  previousPlanId: string | null;
  profileUpdatedAt: string;
  generateFocus: PlanGenerateFocus;
};

export type LatestPlanResponse = {
  plan: Plan | null;
  stale: boolean;
  profileUpdatedAt: string | null;
  generationsRemainingThisHour: number;
  generationsLimitPerHour: number;
};

export function fetchLatestPlan(token: string) {
  return apiRequest<LatestPlanResponse>('/plans/latest', { token });
}

export function generatePlan(token: string, options: PlanGenerateOptions = {}) {
  return apiRequest<{ plan: Plan; meta: PlanGenerateMeta }>('/plans/generate', {
    method: 'POST',
    token,
    body: options,
  });
}

export function fetchPlans(token: string) {
  return apiRequest<{ plans: Plan[] }>('/plans', { token });
}
