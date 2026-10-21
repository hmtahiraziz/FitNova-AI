import { z } from 'zod';

export const GOALS = [
  'lose_weight',
  'build_muscle',
  'maintain',
  'endurance',
] as const;

export const ACTIVITY_LEVELS = [
  'sedentary',
  'light',
  'moderate',
  'active',
  'very_active',
] as const;

export const EXPERIENCE_LEVELS = ['beginner', 'intermediate', 'advanced'] as const;

export const SEX_VALUES = [
  'female',
  'male',
  'other',
  'prefer_not_to_say',
] as const;

const profileTag = z
  .string()
  .trim()
  .min(1)
  .max(80, 'Each tag must be at most 80 characters');

export const upsertProfileSchema = z.object({
  displayName: z
    .string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(40, 'Name is too long')
    .optional()
    .nullable(),
  goal: z.enum(GOALS),
  dietaryPreferences: z.array(profileTag).max(20).default([]),
  restrictions: z.array(profileTag).max(30).default([]),
  localStaples: z
    .array(profileTag)
    .min(1, 'Pick at least one staple')
    .max(40),
  activityLevel: z.enum(ACTIVITY_LEVELS).optional().nullable(),
  experienceLevel: z.enum(EXPERIENCE_LEVELS).optional().nullable(),
  daysPerWeek: z.number().int().min(1).max(7).default(3),
  mealsPerDay: z.number().int().min(2).max(6).default(3),
  equipment: z.array(profileTag).max(20).default([]),
  heightCm: z.number().min(80).max(272).optional().nullable(),
  weightKg: z.number().min(25).max(400).optional().nullable(),
  age: z.number().int().min(13).max(100).optional().nullable(),
  sex: z.enum(SEX_VALUES).optional().nullable(),
});

export type UpsertProfileInput = z.infer<typeof upsertProfileSchema>;
