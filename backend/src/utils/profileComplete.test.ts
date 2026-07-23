import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { Profile } from '../generated/prisma/client';
import { isProfileComplete } from './profileComplete';

function baseProfile(overrides: Partial<Profile> = {}): Profile {
  return {
    id: 'p1',
    userId: 'u1',
    displayName: 'Alex',
    goal: 'maintain',
    dietaryPreferences: [],
    restrictions: [],
    localStaples: ['eggs'],
    activityLevel: 'moderate',
    experienceLevel: 'beginner',
    daysPerWeek: 3,
    mealsPerDay: 3,
    equipment: ['Bodyweight only'],
    heightCm: 170,
    weightKg: 70,
    age: 30,
    sex: 'female',
    updatedAt: new Date(),
    ...overrides,
  };
}

describe('isProfileComplete', () => {
  it('requires coaching-critical body and activity fields', () => {
    assert.equal(isProfileComplete(baseProfile()), true);
    assert.equal(isProfileComplete(baseProfile({ activityLevel: null })), false);
    assert.equal(isProfileComplete(baseProfile({ weightKg: null })), false);
    assert.equal(isProfileComplete(baseProfile({ localStaples: [] })), false);
  });
});
