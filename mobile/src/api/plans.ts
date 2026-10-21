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
  /** Required when the server has not yet recorded AI processing consent. */
  acceptAiProcessing?: boolean;
};

export type PlanReportReason =
  | 'unsafe_or_harmful'
  | 'ignores_restrictions'
  | 'medical_claims'
  | 'inaccurate'
  | 'other';

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

/** OpenAI plan gen often exceeds the default 15s client timeout. */
const GENERATE_TIMEOUT_MS = 90_000;

export function generatePlan(token: string, options: PlanGenerateOptions = {}) {
  return apiRequest<{ plan: Plan; meta: PlanGenerateMeta }>('/plans/generate', {
    method: 'POST',
    token,
    body: options,
    timeout: GENERATE_TIMEOUT_MS,
  });
}

export function fetchPlans(token: string) {
  return apiRequest<{ plans: Plan[] }>('/plans', { token });
}

export function reportPlan(
  token: string,
  planId: string,
  body: { reason: PlanReportReason; details?: string },
) {
  return apiRequest<{ message: string }>(`/plans/${planId}/report`, {
    method: 'POST',
    token,
    body,
  });
}
