import type { Profile } from '../generated/prisma/client';

export function isProfileComplete(profile: Profile | null | undefined): boolean {
  if (!profile) {
    return false;
  }

  return Boolean(
    profile.displayName?.trim() &&
      profile.goal &&
      profile.localStaples.length > 0 &&
      profile.daysPerWeek >= 1 &&
      profile.activityLevel &&
      profile.experienceLevel &&
      profile.heightCm != null &&
      profile.heightCm > 0 &&
      profile.weightKg != null &&
      profile.weightKg > 0 &&
      profile.age != null &&
      profile.age >= 13 &&
      profile.sex,
  );
}
