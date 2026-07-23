import type { Profile, ProfileInput } from '../api/profile';

/** Build PUT /profile body from stored profile (e.g. staples-only save). */
export function profileToInput(profile: Profile): ProfileInput {
  return {
    displayName: profile.displayName,
    goal: profile.goal,
    dietaryPreferences: profile.dietaryPreferences,
    restrictions: profile.restrictions,
    localStaples: profile.localStaples,
    activityLevel: profile.activityLevel,
    experienceLevel: profile.experienceLevel,
    daysPerWeek: profile.daysPerWeek,
    mealsPerDay: profile.mealsPerDay,
    equipment: profile.equipment,
    heightCm: profile.heightCm,
    weightKg: profile.weightKg,
    age: profile.age,
    sex: profile.sex,
  };
}
