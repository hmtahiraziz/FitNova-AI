import { z } from 'zod';

export const planGenerateFocusSchema = z.enum([
  'balanced',
  'meal_variety',
  'workout_variety',
  'lighter_meals',
]);

export const planGenerateBodySchema = z.object({
  intent: z.enum(['initial', 'regenerate']).optional().default('initial'),
  focus: planGenerateFocusSchema.optional().default('balanced'),
});

export type PlanGenerateBody = z.infer<typeof planGenerateBodySchema>;
export type PlanGenerateFocus = z.infer<typeof planGenerateFocusSchema>;
