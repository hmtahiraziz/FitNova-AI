import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { ZodError } from 'zod';
import { upsertProfileSchema } from '../schemas/profile.schemas';
import {
  progressRangeQuerySchema,
  upsertProgressSchema,
} from '../schemas/progress.schemas';
import { planContentSchema } from '../schemas/plan.schemas';

describe('upsertProgressSchema', () => {
  it('accepts partial updates with a valid date', () => {
    const parsed = upsertProgressSchema.parse({
      date: '2026-07-20',
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
          from: '2026-07-21',
          to: '2026-07-20',
        }),
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
