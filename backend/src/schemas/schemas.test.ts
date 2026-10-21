import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { ZodError } from 'zod';
import { registerSchema, resetPasswordSchema } from '../schemas/auth.schemas';
import { upsertProfileSchema } from '../schemas/profile.schemas';
import {
  progressRangeQuerySchema,
  upsertProgressSchema,
} from '../schemas/progress.schemas';
import { planContentSchema } from '../schemas/plan.schemas';
import { addDays, todayUtcDateOnly } from '../utils/dateOnly';

const recentDate = addDays(todayUtcDateOnly(), -3);
const recentDateNext = addDays(todayUtcDateOnly(), -1);

describe('auth password schemas', () => {
  it('rejects passwords longer than 128 characters', () => {
    const long = 'a'.repeat(129);
    assert.throws(
      () => registerSchema.parse({ email: 'a@example.com', password: long }),
      ZodError,
    );
    assert.throws(
      () =>
        resetPasswordSchema.parse({
          email: 'a@example.com',
          code: '123456',
          newPassword: long,
        }),
      ZodError,
    );
  });

  it('accepts 8–128 character passwords', () => {
    const parsed = registerSchema.parse({
      email: 'A@Example.com',
      password: 'password1',
    });
    assert.equal(parsed.email, 'a@example.com');
  });
});

describe('upsertProgressSchema', () => {
  it('accepts partial updates with a valid date', () => {
    const parsed = upsertProgressSchema.parse({
      date: recentDate,
      workoutDone: true,
      notes: '  solid session  ',
    });
    assert.equal(parsed.workoutDone, true);
    assert.equal(parsed.notes, 'solid session');
  });

  it('rejects invalid dates and blank notes become null', () => {
    assert.throws(
      () => upsertProgressSchema.parse({ date: '20-07-2026' }),
      ZodError,
    );
    const parsed = upsertProgressSchema.parse({ notes: '   ' });
    assert.equal(parsed.notes, null);
  });
});

describe('progressRangeQuerySchema', () => {
  it('rejects inverted ranges', () => {
    assert.throws(
      () =>
        progressRangeQuerySchema.parse({
          from: recentDateNext,
          to: recentDate,
        }),
      ZodError,
    );
  });

  it('rejects far-future today and oversized ranges', () => {
    assert.throws(
      () => progressRangeQuerySchema.parse({ today: '2099-01-01' }),
      ZodError,
    );
    assert.throws(
      () =>
        progressRangeQuerySchema.parse({
          from: '2020-01-01',
          to: '2020-06-01',
        }),
      ZodError,
    );
  });
});

describe('upsertProgressSchema date bounds', () => {
  it('rejects dates too far in the past', () => {
    assert.throws(
      () => upsertProgressSchema.parse({ date: '2019-01-01', workoutDone: true }),
      ZodError,
    );
  });
});

describe('upsertProfileSchema', () => {
  it('requires at least one staple', () => {
    assert.throws(
      () =>
        upsertProfileSchema.parse({
          goal: 'maintain',
          localStaples: [],
        }),
      ZodError,
    );

    const parsed = upsertProfileSchema.parse({
      goal: 'build_muscle',
      localStaples: ['eggs'],
      dietaryPreferences: ['high_protein'],
    });
    assert.equal(parsed.daysPerWeek, 3);
    assert.deepEqual(parsed.localStaples, ['eggs']);
  });

  it('bounds array sizes and body metrics', () => {
    assert.throws(
      () =>
        upsertProfileSchema.parse({
          goal: 'maintain',
          localStaples: ['eggs'],
          restrictions: Array.from({ length: 31 }, (_, i) => `r${i}`),
        }),
      ZodError,
    );
    assert.throws(
      () =>
        upsertProfileSchema.parse({
          goal: 'maintain',
          localStaples: ['eggs'],
          heightCm: 50,
        }),
      ZodError,
    );
  });
});

describe('planContentSchema', () => {
  it('requires workout and meal structure', () => {
    assert.throws(() => planContentSchema.parse({ summary: 'x' }), ZodError);

    const parsed = planContentSchema.parse({
      summary: 'Week plan',
      workoutPlan: {
        daysPerWeek: 2,
        days: [
          {
            day: 'Day 1',
            focus: 'Push',
            exercises: [{ name: 'Push-up', sets: 3, reps: '10' }],
          },
        ],
      },
      mealPlan: {
        days: [
          {
            day: 'Day 1',
            meals: [{ name: 'Lunch', items: ['Dal', 'Rice'] }],
          },
        ],
        shoppingHints: [],
      },
      targets: {
        calorieGuidance: 'Eat near maintenance',
        proteinNote: 'Include protein each meal',
      },
    });
    assert.equal(parsed.workoutPlan.daysPerWeek, 2);
  });
});
