import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { Profile } from '../generated/prisma/client';
import type { PlanContent } from '../schemas/plan.schemas';
import {
  normalizeShoppingHints,
  validatePlanAgainstProfile,
} from './planContentValidation';

const baseProfile = (): Profile =>
  ({
    id: 'p1',
    userId: 'u1',
    displayName: 'Test',
    avatarUrl: null,
    goal: 'maintain',
    dietaryPreferences: [],
    restrictions: [],
    localStaples: ['rice', 'dal', 'eggs', 'yogurt', 'spinach'],
    activityLevel: 'moderate',
    experienceLevel: 'beginner',
    daysPerWeek: 3,
    mealsPerDay: 3,
    equipment: ['Bodyweight only'],
    heightCm: 170,
    weightKg: 70,
    age: 30,
    sex: 'prefer_not_to_say',
    updatedAt: new Date(),
  }) as Profile;

const samplePlan = (): PlanContent => ({
  summary: 'Test plan',
  workoutPlan: {
    daysPerWeek: 3,
    days: [
      {
        day: 'Day 1',
        focus: 'Full body',
        exercises: [{ name: 'Squat', sets: 3, reps: '10', notes: '' }],
      },
      {
        day: 'Day 2',
        focus: 'Cardio',
        exercises: [{ name: 'Walk', sets: 1, reps: '20 min', notes: '' }],
      },
      {
        day: 'Day 3',
        focus: 'Core',
        exercises: [{ name: 'Plank', sets: 3, reps: '30s', notes: '' }],
      },
    ],
  },
  mealPlan: {
    days: [1, 2, 3].map((i) => ({
      day: `Day ${i}`,
      meals: [
        { name: 'Breakfast', items: ['Oats and eggs'], approxCalories: 400 },
        { name: 'Lunch', items: ['Rice and dal'], approxCalories: 550 },
        { name: 'Dinner', items: ['Yogurt bowl'], approxCalories: 500 },
      ],
    })),
    shoppingHints: ['rice'],
  },
  targets: {
    calorieGuidance: 'Moderate intake',
    proteinNote: 'Protein each meal',
  },
});

describe('validatePlanAgainstProfile', () => {
  it('accepts matching schedule', () => {
    assert.equal(validatePlanAgainstProfile(samplePlan(), baseProfile()), null);
  });

  it('rejects wrong meal day count', () => {
    const plan = samplePlan();
    plan.mealPlan.days = plan.mealPlan.days.slice(0, 2);
    const issue = validatePlanAgainstProfile(plan, baseProfile());
    assert.ok(issue?.includes('mealPlan.days'));
  });
});

describe('normalizeShoppingHints', () => {
  it('pads hints from staples', () => {
    const plan = samplePlan();
    const out = normalizeShoppingHints(plan, baseProfile());
    assert.ok(out.mealPlan.shoppingHints.length >= 5);
  });
});
