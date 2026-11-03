import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { Profile } from '../generated/prisma/client';
import type { PlanContent } from '../schemas/plan.schemas';
import {
  applyPlanSafety,
  computeBmi,
  detectDisorderedEatingSignals,
  isProtectedProfile,
  validateRestrictionsAgainstPlan,
  MIN_DAILY_KCAL_PROTECTED,
  MIN_MEAL_KCAL,
} from './planSafety';

function stubProfile(overrides: Partial<Profile> = {}): Profile {
  return {
    id: 'p1',
    userId: 'u1',
    displayName: 'Test',
    avatarUrl: null,
    goal: 'lose_weight',
    dietaryPreferences: [],
    restrictions: ['dairy'],
    localStaples: ['rice', 'dal'],
    activityLevel: 'moderate',
    experienceLevel: 'beginner',
    daysPerWeek: 3,
    mealsPerDay: 3,
    equipment: [],
    heightCm: 170,
    weightKg: 70,
    age: 25,
    sex: 'male',
    updatedAt: new Date(),
    ...overrides,
  };
}

const samplePlan: PlanContent = {
  summary: 'Cut hard this week',
  workoutPlan: {
    daysPerWeek: 3,
    days: [
      {
        day: 'Day 1',
        focus: 'Full',
        exercises: [{ name: 'Squat', sets: 3, reps: '8', notes: '' }],
      },
    ],
  },
  mealPlan: {
    days: [
      {
        day: 'Day 1',
        meals: [
          { name: 'Breakfast', items: ['Oats with milk'], approxCalories: 200 },
          { name: 'Lunch', items: ['Rice and dal'], approxCalories: 400 },
          { name: 'Dinner', items: ['Rice bowl'], approxCalories: 400 },
        ],
      },
    ],
    shoppingHints: ['rice'],
  },
  targets: {
    calorieGuidance: 'Eat 1200 kcal to lose 5 kg in 2 weeks',
    proteinNote: 'Protein at meals',
  },
};

describe('planSafety', () => {
  it('computes BMI and flags protected profiles', () => {
    assert.ok(computeBmi(50, 170)! < 18.5);
    assert.equal(isProtectedProfile(stubProfile({ age: 16 })), true);
    assert.equal(
      isProtectedProfile(stubProfile({ age: 30, weightKg: 50, heightCm: 170 })),
      true,
    );
    assert.equal(isProtectedProfile(stubProfile({ age: 30 })), false);
  });

  it('detects disordered-eating language in profile fields', () => {
    assert.equal(
      detectDisorderedEatingSignals(
        stubProfile({ restrictions: ['I want to purge after meals'] }),
      ),
      true,
    );
  });

  it('flags dairy restriction conflicts for model retry', () => {
    const issue = validateRestrictionsAgainstPlan(
      samplePlan,
      stubProfile({ restrictions: ['dairy'] }),
    );
    assert.match(issue ?? '', /conflicts|dairy|milk/i);
  });

  it('scrubs restricted items and raises calorie floors for protected users', () => {
    const safe = applyPlanSafety(
      samplePlan,
      stubProfile({ age: 16, restrictions: ['dairy'] }),
    );
    const breakfast = safe.mealPlan.days[0]?.meals[0];
    assert.ok(breakfast);
    assert.doesNotMatch(breakfast.items.join(' '), /milk/i);
    assert.ok((breakfast.approxCalories ?? 0) >= MIN_MEAL_KCAL);
    const daily = safe.mealPlan.days[0]!.meals.reduce(
      (s, m) => s + (m.approxCalories ?? 0),
      0,
    );
    assert.ok(daily >= MIN_DAILY_KCAL_PROTECTED);
    assert.match(safe.targets.calorieGuidance, /maintenance|under-18|clinician/i);
  });
});
