import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { sanitizePlanContent } from './planSanitizer';

const basePlan = {
  summary: 'Balanced week',
  workoutPlan: {
    daysPerWeek: 3,
    days: [
      {
        day: 'Day 1',
        focus: 'Full body',
        exercises: [
          { name: 'Squat', sets: 3, reps: '8-10', notes: '' },
          { name: '  ', sets: 3, reps: '10', notes: '' },
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
            items: ['Eggs', '', 'Oats'],
            approxCalories: 1500,
          },
        ],
      },
    ],
    shoppingHints: ['Eggs', '  '],
  },
  targets: {
    calorieGuidance: 'Crash diet of 800 kcal to lose fast',
    proteinNote: 'Prioritize protein at each meal',
  },
};

describe('sanitizePlanContent', () => {
  it('strips empty entries, clamps extreme meal calories, softens crash language', () => {
    const result = sanitizePlanContent(basePlan);

    assert.equal(result.workoutPlan.days[0]?.exercises.length, 1);
    assert.equal(result.workoutPlan.days[0]?.exercises[0]?.name, 'Squat');
    assert.deepEqual(result.mealPlan.days[0]?.meals[0]?.items, [
      'Eggs',
      'Oats',
    ]);
    assert.equal(result.mealPlan.days[0]?.meals[0]?.approxCalories, 700);
    assert.deepEqual(result.mealPlan.shoppingHints, ['Eggs']);
    assert.match(result.targets.calorieGuidance, /moderate/i);
    assert.doesNotMatch(result.targets.calorieGuidance, /crash/i);
  });

  it('rejects plans that sanitize to empty workouts or meals', () => {
    assert.throws(
      () =>
        sanitizePlanContent({
          ...basePlan,
          workoutPlan: {
            daysPerWeek: 1,
            days: [
              {
                day: 'Day 1',
                focus: 'Rest',
                exercises: [{ name: ' ', sets: 1, reps: '1', notes: '' }],
              },
            ],
          },
        }),
      /missing workout or meal|Too small|expected/i,
    );
  });
});
