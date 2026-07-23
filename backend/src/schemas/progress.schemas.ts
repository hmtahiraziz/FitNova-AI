import { z } from 'zod';
import { isDateOnlyString } from '../utils/dateOnly';

const dateOnly = z
  .string()
  .refine(isDateOnlyString, 'Expected YYYY-MM-DD calendar date');

export const upsertProgressSchema = z.object({
  date: dateOnly.optional(),
  workoutDone: z.boolean().optional(),
  mealsFollowed: z.boolean().optional(),
  weightKg: z.number().positive().max(500).nullable().optional(),
  notes: z
    .string()
    .trim()
    .max(500)
    .nullable()
    .optional()
    .transform((value) => (value === '' ? null : value)),
});

export const progressRangeQuerySchema = z
  .object({
    from: dateOnly.optional(),
    to: dateOnly.optional(),
    /** Client local "today" so streak aligns with device calendar. */
    today: dateOnly.optional(),
  })
  .superRefine((value, ctx) => {
    if (value.from && value.to && value.from > value.to) {
      ctx.addIssue({
        code: 'custom',
        message: '`from` must be on or before `to`',
        path: ['from'],
      });
    }
  });

export const progressStatsQuerySchema = z.object({
  today: dateOnly.optional(),
});

export type UpsertProgressInput = z.infer<typeof upsertProgressSchema>;
export type ProgressRangeQuery = z.infer<typeof progressRangeQuerySchema>;
export type ProgressStatsQuery = z.infer<typeof progressStatsQuerySchema>;
