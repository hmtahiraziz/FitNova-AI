import { z } from 'zod';

const exerciseSchema = z.object({
  name: z.string().min(1),
  sets: z.number().int().positive().default(3),
  reps: z.string().min(1),
  notes: z.string().optional().default(''),
});

const workoutDaySchema = z.object({
  day: z.string().min(1),
  focus: z.string().min(1),
  exercises: z.array(exerciseSchema).min(1),
});

const mealSchema = z.object({
  name: z.string().min(1),
  items: z.array(z.string().min(1)).min(1),
  approxCalories: z.number().positive().optional(),
});

const mealDaySchema = z.object({
  day: z.string().min(1),
  meals: z.array(mealSchema).min(1),
});

export const planContentSchema = z.object({
  summary: z.string().min(1),
  workoutPlan: z.object({
    daysPerWeek: z.number().int().min(1).max(7),
    days: z.array(workoutDaySchema).min(1),
  }),
  mealPlan: z.object({
    days: z.array(mealDaySchema).min(1),
    shoppingHints: z.array(z.string()).default([]),
  }),
  targets: z.object({
    calorieGuidance: z.string().min(1),
    proteinNote: z.string().min(1),
  }),
});

export type PlanContent = z.infer<typeof planContentSchema>;
