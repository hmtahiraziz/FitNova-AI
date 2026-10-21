import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { PlanContent } from '../schemas/plan.schemas';
import {
  collectExerciseNames,
  collectMealItems,
  evaluatePlanFreshness,
  normalizePlanLabel,
  reuseRate,
  thresholdsForFocus,
  uniqueLabelsForPrompt,
} from './planFreshness';

function samplePlan(overrides?: {
  exercises?: string[];
  meals?: string[];
}): PlanContent {
  const exercises = overrides?.exercises ?? ['Squat', 'Push-up', 'Row'];
  const meals = overrides?.meals ?? [
    'Oats with yogurt',
    'Chicken rice bowl',
    'Egg scramble',
  ];
  return {
    summary: 'A sample plan for tests.',
    workoutPlan: {
      daysPerWeek: 1,
      days: [
        {
          day: 'Day 1',
          focus: 'Full body',
          exercises: exercises.map((name) => ({
            name,
            sets: 3,
            reps: '8-12',
            notes: '',
          })),
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
              items: [meals[0]!],
              approxCalories: 400,
            },
            {
              name: 'Lunch',
              items: [meals[1]!],
              approxCalories: 500,
            },
            {
              name: 'Dinner',
              items: [meals[2]!],
              approxCalories: 500,
            },
          ],
        },
      ],
      shoppingHints: ['oats', 'eggs'],
    },
    targets: {
      calorieGuidance: 'Moderate intake.',
      proteinNote: 'Include protein each meal.',
    },
  };
}

describe('planFreshness', () => {
  it('normalizes labels for fuzzy match', () => {
    assert.equal(normalizePlanLabel('Push-up'), normalizePlanLabel('push up'));
    assert.equal(normalizePlanLabel('  Squats!! '), 'squats');
  });

  it('computes full reuse when identical', () => {
    const a = ['Squat', 'Push-up'];
    assert.equal(reuseRate(a, ['squat', 'push up']), 1);
  });

  it('computes partial reuse', () => {
    assert.equal(
      reuseRate(
        ['Alpha', 'Bravo', 'Charlie', 'Delta'],
        ['Alpha', 'Xray', 'Yankee', 'Zulu'],
      ),
      0.25,
    );
  });

  it('accepts a clearly different regenerate plan', () => {
    const previous = samplePlan();
    const next = samplePlan({
      exercises: ['Deadlift', 'Pull-up', 'Lunges'],
      meals: ['Tofu stir fry', 'Lentil soup', 'Fish with veg'],
    });
    const result = evaluatePlanFreshness(previous, next, 'balanced');
    assert.equal(result.ok, true);
  });

  it('rejects near-duplicate on balanced focus', () => {
    const previous = samplePlan();
    const next = samplePlan({
      exercises: ['Squat', 'Push-up', 'Plank'],
      meals: ['Oats with yogurt', 'Chicken rice bowl', 'Salad'],
    });
    const result = evaluatePlanFreshness(previous, next, 'balanced');
    assert.equal(result.ok, false);
    assert.match(result.message ?? '', /too similar/i);
  });

  it('workout_variety is strict on exercises, lenient on meals', () => {
    const previous = samplePlan();
    // Same meals, new exercises → should pass workout_variety
    const freshWorkouts = samplePlan({
      exercises: ['Kettlebell swing', 'Band row', 'Step-up'],
      meals: previous.mealPlan.days[0]!.meals.flatMap((m) => m.items),
    });
    assert.equal(
      evaluatePlanFreshness(previous, freshWorkouts, 'workout_variety').ok,
      true,
    );

    // Same exercises, new meals → should fail workout_variety
    const sameWorkouts = samplePlan({
      exercises: ['Squat', 'Push-up', 'Row'],
      meals: ['Tofu bowl', 'Bean chili', 'Veg omelette'],
    });
    assert.equal(
      evaluatePlanFreshness(previous, sameWorkouts, 'workout_variety').ok,
      false,
    );
  });

  it('meal_variety is strict on meals', () => {
    const previous = samplePlan();
    const sameMeals = samplePlan({
      exercises: ['Deadlift', 'Pull-up', 'Lunges'],
      meals: ['Oats with yogurt', 'Chicken rice bowl', 'Egg scramble'],
    });
    assert.equal(
      evaluatePlanFreshness(previous, sameMeals, 'meal_variety').ok,
      false,
    );
  });

  it('thresholds match focus intent', () => {
    assert.ok(
      thresholdsForFocus('workout_variety').maxExerciseReuse <
        thresholdsForFocus('meal_variety').maxExerciseReuse,
    );
    assert.ok(
      thresholdsForFocus('meal_variety').maxMealReuse <
        thresholdsForFocus('workout_variety').maxMealReuse,
    );
  });

  it('collects and dedupes prompt labels', () => {
    const plan = samplePlan({
      exercises: ['Squat', 'squat', 'Push-up'],
    });
    assert.deepEqual(collectExerciseNames(plan), ['Squat', 'squat', 'Push-up']);
    assert.deepEqual(uniqueLabelsForPrompt(collectExerciseNames(plan), 10), [
      'Squat',
      'Push-up',
    ]);
    assert.equal(collectMealItems(plan).length, 3);
  });
});
