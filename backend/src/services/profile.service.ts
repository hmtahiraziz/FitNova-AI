import type { Profile } from '../generated/prisma/client';
import { prisma } from '../lib/prisma';
import { AppError } from '../middleware/errorHandler';
import type { UpsertProfileInput } from '../schemas/profile.schemas';
import { isProfileComplete } from '../utils/profileComplete';

export { isProfileComplete };

export function serializeProfile(profile: Profile) {
  return {
    id: profile.id,
    userId: profile.userId,
    displayName: profile.displayName,
    avatarUrl: profile.avatarUrl,
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
    updatedAt: profile.updatedAt,
    complete: isProfileComplete(profile),
  };
}

export async function getProfile(userId: string) {
  const profile = await prisma.profile.findUnique({ where: { userId } });
  if (!profile) {
    return null;
  }
  return serializeProfile(profile);
}

export async function upsertProfile(userId: string, input: UpsertProfileInput) {
  const data = {
    displayName: input.displayName?.trim() || null,
    goal: input.goal,
    dietaryPreferences: input.dietaryPreferences,
    restrictions: input.restrictions,
    localStaples: input.localStaples,
    activityLevel: input.activityLevel ?? null,
    experienceLevel: input.experienceLevel ?? null,
    daysPerWeek: input.daysPerWeek,
    mealsPerDay: input.mealsPerDay,
    equipment: input.equipment,
    heightCm: input.heightCm ?? null,
    weightKg: input.weightKg ?? null,
    age: input.age ?? null,
    sex: input.sex ?? null,
  };

  const profile = await prisma.profile.upsert({
    where: { userId },
    create: { userId, ...data },
    update: data,
  });

  return serializeProfile(profile);
}

export async function requireCompleteProfile(userId: string) {
  const profile = await prisma.profile.findUnique({ where: { userId } });
  if (!isProfileComplete(profile)) {
    throw new AppError(
      'Complete your profile (display name, goal, staples, activity, body stats, and schedule) before generating a plan',
      400,
    );
  }
  return profile!;
}
