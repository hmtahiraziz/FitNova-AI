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

export const upsertProfileSchema = z.object({
  displayName: z
    .string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(40, 'Name is too long')
    .optional()
    .nullable(),
  goal: z.enum(GOALS),
  dietaryPreferences: z.array(z.string().min(1)).default([]),
  restrictions: z.array(z.string().min(1)).default([]),
  localStaples: z.array(z.string().min(1)).min(1, 'Pick at least one staple'),
  activityLevel: z.enum(ACTIVITY_LEVELS).optional().nullable(),
  experienceLevel: z.enum(EXPERIENCE_LEVELS).optional().nullable(),
  daysPerWeek: z.number().int().min(1).max(7).default(3),
  mealsPerDay: z.number().int().min(2).max(6).default(3),
  equipment: z.array(z.string().min(1)).default([]),
  heightCm: z.number().positive().optional().nullable(),
  weightKg: z.number().positive().optional().nullable(),
  age: z.number().int().min(13).max(100).optional().nullable(),
  sex: z.enum(SEX_VALUES).optional().nullable(),
});

export type UpsertProfileInput = z.infer<typeof upsertProfileSchema>;
