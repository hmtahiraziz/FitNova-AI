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
  /** Required true on first generate (or when server has no prior consent). */
  acceptAiProcessing: z.boolean().optional(),
});

export const planReportReasonSchema = z.enum([
  'unsafe_or_harmful',
  'ignores_restrictions',
  'medical_claims',
  'inaccurate',
  'other',
]);

export const planReportBodySchema = z.object({
  reason: planReportReasonSchema,
  details: z
    .string()
    .trim()
    .max(1000)
    .optional()
    .transform((v) => (v === '' ? undefined : v)),
});

export type PlanGenerateBody = z.infer<typeof planGenerateBodySchema>;
export type PlanGenerateFocus = z.infer<typeof planGenerateFocusSchema>;
export type PlanReportBody = z.infer<typeof planReportBodySchema>;
