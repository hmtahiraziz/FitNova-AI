import { z } from 'zod';
import {
  addDays,
  daysBetween,
  isDateOnlyString,
  todayUtcDateOnly,
} from '../utils/dateOnly';

/** Max days a progress `date` may be in the past. */
export const PROGRESS_MAX_LOOKBACK_DAYS = 90;
/** Allow 1 day ahead for timezone skew vs UTC “today”. */
export const PROGRESS_MAX_FUTURE_DAYS = 1;
/** Max inclusive span for from/to list queries. */
export const PROGRESS_MAX_RANGE_DAYS = 90;

const dateOnly = z
  .string()
  .refine(isDateOnlyString, 'Expected YYYY-MM-DD calendar date');

function assertBoundedCalendarDate(
  value: string,
  ctx: z.RefinementCtx,
  path: (string | number)[],
) {
  const today = todayUtcDateOnly();
  const earliest = addDays(today, -PROGRESS_MAX_LOOKBACK_DAYS);
  const latest = addDays(today, PROGRESS_MAX_FUTURE_DAYS);

  if (value < earliest) {
    ctx.addIssue({
      code: 'custom',
      message: `Date cannot be more than ${PROGRESS_MAX_LOOKBACK_DAYS} days in the past`,
      path,
    });
  }
  if (value > latest) {
    ctx.addIssue({
      code: 'custom',
      message: 'Date cannot be in the future',
      path,
    });
  }
}

export const upsertProgressSchema = z
  .object({
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
  })
  .superRefine((value, ctx) => {
    if (value.date) {
      assertBoundedCalendarDate(value.date, ctx, ['date']);
    }
  });

export const progressRangeQuerySchema = z
  .object({
    from: dateOnly.optional(),
    to: dateOnly.optional(),
    /** Client local "today" so streak aligns with device calendar. */
    today: dateOnly.optional(),
  })
  .superRefine((value, ctx) => {
    if (value.today) {
      assertBoundedCalendarDate(value.today, ctx, ['today']);
    }
    if (value.from) {
      assertBoundedCalendarDate(value.from, ctx, ['from']);
    }
    if (value.to) {
      assertBoundedCalendarDate(value.to, ctx, ['to']);
    }
    if (value.from && value.to && value.from > value.to) {
      ctx.addIssue({
        code: 'custom',
        message: '`from` must be on or before `to`',
        path: ['from'],
      });
    }
    if (value.from && value.to) {
      const span = daysBetween(value.from, value.to) + 1;
      if (span > PROGRESS_MAX_RANGE_DAYS) {
        ctx.addIssue({
          code: 'custom',
          message: `Date range cannot exceed ${PROGRESS_MAX_RANGE_DAYS} days`,
          path: ['to'],
        });
      }
    }
  });

export const progressStatsQuerySchema = z
  .object({
    today: dateOnly.optional(),
  })
  .superRefine((value, ctx) => {
    if (value.today) {
      assertBoundedCalendarDate(value.today, ctx, ['today']);
    }
  });

export type UpsertProgressInput = z.infer<typeof upsertProgressSchema>;
export type ProgressRangeQuery = z.infer<typeof progressRangeQuerySchema>;
export type ProgressStatsQuery = z.infer<typeof progressStatsQuerySchema>;
