/**
 * Seed demo profile + plan + progress logs for a user email.
 *
 * Usage:
 *   npx tsx scripts/seed-user.ts khurramimran908@gmail.com
 */
import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, type Profile } from '../src/generated/prisma/client';
import { PLAN_DISCLAIMER } from '../src/prompts/planPrompt';
import { parseDateOnly, addDays, todayUtcDateOnly } from '../src/utils/dateOnly';

const email = (process.argv[2] ?? 'khurramimran908@gmail.com')
  .trim()
  .toLowerCase();

function buildFallbackPlan(profile: Profile) {
  const staples = profile.localStaples.slice(0, 4);
  const stapleLine = staples.length ? staples.join(', ') : 'eggs, oats, yogurt';
  const days = Math.min(profile.daysPerWeek || 3, 4);

  const workoutDays = Array.from({ length: days }, (_, i) => ({
    day: `Day ${i + 1}`,
    focus: i % 2 === 0 ? 'Full body strength' : 'Conditioning + core',
    exercises: [
      {
        name: i % 2 === 0 ? 'Squat or sit-to-stand' : 'Brisk walk / march',
        sets: 3,
        reps: i % 2 === 0 ? '8-12' : '20-30 min',
        notes: 'Move with control; stop if pain sharpens.',
      },
      {
        name: i % 2 === 0 ? 'Push-up (knee or wall)' : 'Plank',
        sets: 3,
        reps: i % 2 === 0 ? '6-10' : '20-40 sec',
        notes: 'Keep ribs down and neck long.',
      },
      {
        name: 'Glute bridge',
        sets: 3,
        reps: '10-15',
        notes: 'Squeeze at the top briefly.',
      },
    ],
  }));

  const mealDays = Array.from({ length: Math.min(days, 3) }, (_, i) => ({
    day: `Day ${i + 1}`,
    meals: [
      {
        name: 'Breakfast',
        items: [`Oats or eggs with ${staples[0] ?? 'fruit'}`],
        approxCalories: 400,
      },
      {
        name: 'Lunch',
        items: [`Bowl with ${stapleLine}`],
        approxCalories: 550,
      },
      {
        name: 'Dinner',
        items: [
          `Balanced plate: protein + veg + ${staples[1] ?? 'rice or roti'}`,
        ],
        approxCalories: 550,
      },
    ],
  }));

  return {
    summary: `A steady ${days}-day plan for ${profile.goal.replace('_', ' ')}, built around your staples.`,
    workoutPlan: { daysPerWeek: days, days: workoutDays },
    mealPlan: {
      days: mealDays,
      shoppingHints: staples,
    },
    targets: {
      calorieGuidance:
        'Aim near maintenance with a gentle deficit or surplus based on your goal—avoid extremes.',
      proteinNote: 'Include a palm-sized protein source at each meal.',
    },
  };
}

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error('DATABASE_URL is required');
  }

  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: url }),
  });

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      console.error(
        JSON.stringify({
          ok: false,
          error: `User not found: ${email}. Register in the app first.`,
        }),
      );
      process.exit(1);
    }

    const profile = await prisma.profile.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        goal: 'build_muscle',
        dietaryPreferences: ['high_protein', 'balanced'],
        restrictions: [],
        localStaples: ['eggs', 'chicken', 'rice', 'dal', 'yogurt', 'roti'],
        activityLevel: 'moderate',
        experienceLevel: 'beginner',
        daysPerWeek: 4,
        mealsPerDay: 3,
        equipment: ['bodyweight', 'dumbbells'],
        heightCm: 175,
        weightKg: 78,
        age: 28,
        sex: 'male',
      },
      update: {
        goal: 'build_muscle',
        dietaryPreferences: ['high_protein', 'balanced'],
        restrictions: [],
        localStaples: ['eggs', 'chicken', 'rice', 'dal', 'yogurt', 'roti'],
        activityLevel: 'moderate',
        experienceLevel: 'beginner',
        daysPerWeek: 4,
        mealsPerDay: 3,
        equipment: ['bodyweight', 'dumbbells'],
        heightCm: 175,
        weightKg: 78,
        age: 28,
        sex: 'male',
      },
    });

    const content = buildFallbackPlan(profile);
    const plan = await prisma.plan.create({
      data: {
        userId: user.id,
        type: 'combined',
        contentJson: content,
        disclaimer: PLAN_DISCLAIMER,
        openaiModel: 'seed-fallback',
        promptVersion: 'seed-v1',
      },
    });

    const today = todayUtcDateOnly();
    const logSpecs = [
      { offset: 0, workoutDone: true, mealsFollowed: true, weightKg: 78.0, notes: 'Feeling strong' },
      { offset: 1, workoutDone: true, mealsFollowed: true, weightKg: 78.2, notes: null },
      { offset: 2, workoutDone: false, mealsFollowed: true, weightKg: 78.4, notes: 'Rest day, meals on track' },
      { offset: 3, workoutDone: true, mealsFollowed: false, weightKg: 78.1, notes: 'Solid workout' },
      { offset: 4, workoutDone: true, mealsFollowed: true, weightKg: 78.3, notes: null },
    ];

    let logsUpserted = 0;
    for (const spec of logSpecs) {
      const dateStr = addDays(today, -spec.offset);
      await prisma.progressLog.upsert({
        where: {
          userId_date: {
            userId: user.id,
            date: parseDateOnly(dateStr),
          },
        },
        create: {
          userId: user.id,
          date: parseDateOnly(dateStr),
          workoutDone: spec.workoutDone,
          mealsFollowed: spec.mealsFollowed,
          weightKg: spec.weightKg,
          notes: spec.notes,
        },
        update: {
          workoutDone: spec.workoutDone,
          mealsFollowed: spec.mealsFollowed,
          weightKg: spec.weightKg,
          notes: spec.notes,
        },
      });
      logsUpserted += 1;
    }

    console.log(
      JSON.stringify(
        {
          ok: true,
          email,
          userId: user.id,
          profileId: profile.id,
          planId: plan.id,
          logsUpserted,
          today,
          streakHint: 'Open Progress tab — expect a multi-day streak',
        },
        null,
        2,
      ),
    );
  } finally {
    await prisma.$disconnect();
  }
}

void main().catch((err) => {
  console.error(err);
  process.exit(1);
});
