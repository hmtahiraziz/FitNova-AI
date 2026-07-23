import type { Profile } from '../generated/prisma/client';
import { env } from '../config/env';
import { getOpenAI, hasOpenAI } from '../lib/openai';
import { prisma } from '../lib/prisma';
import { AppError } from '../middleware/errorHandler';
import {
  PLAN_DISCLAIMER,
  PLAN_PROMPT_VERSION,
  buildPlanSystemPrompt,
  buildPlanUserPrompt,
  buildRegenerateAddendum,
  type ProfileForPrompt,
} from '../prompts/planPrompt';
import { planContentSchema, type PlanContent } from '../schemas/plan.schemas';
import type {
  PlanGenerateBody,
  PlanGenerateFocus,
} from '../schemas/plans.generate.schemas';
import { requireCompleteProfile } from './profile.service';
import { sanitizePlanContent } from '../utils/planSanitizer';
import {
  normalizeShoppingHints,
  validatePlanAgainstProfile,
} from '../utils/planContentValidation';
import {
  getGenerationQuota,
  PLAN_GENERATIONS_PER_HOUR,
} from '../utils/planGenerationLimits';

const MAX_GENERATION_ATTEMPTS = 3;

const MEAL_NAME_PRESETS = [
  ['Breakfast', 'Lunch', 'Dinner'],
  ['Breakfast', 'Snack', 'Lunch', 'Dinner'],
  ['Meal 1', 'Meal 2', 'Meal 3', 'Meal 4', 'Meal 5'],
];

function mealNamesForCount(count: number): string[] {
  if (count <= 3) {
    return MEAL_NAME_PRESETS[0].slice(0, count);
  }
  if (count === 4) {
    return MEAL_NAME_PRESETS[1];
  }
  const base = MEAL_NAME_PRESETS[2];
  return Array.from({ length: count }, (_, i) => base[i] ?? `Meal ${i + 1}`);
}

function buildFallbackPlan(
  profile: Profile,
  focus: PlanGenerateFocus = 'balanced',
): PlanContent {
  const staples = profile.localStaples.slice(0, 4);
  const stapleLine = staples.length
    ? staples.join(', ')
    : 'eggs, oats, yogurt';
  const days = Math.min(Math.max(profile.daysPerWeek, 1), 7);
  const mealsPerDay = Math.min(Math.max(profile.mealsPerDay, 1), 5);
  const mealNames = mealNamesForCount(mealsPerDay);

  const workoutTemplate =
    focus === 'workout_variety'
      ? {
          even: 'Upper push + carry',
          odd: 'Intervals + mobility',
          exA: 'Incline push-up or dumbbell press',
          exB: 'Row or band pull-apart',
          exC: 'Dead bug or bird dog',
        }
      : {
          even: 'Full body strength',
          odd: 'Conditioning + core',
          exA: 'Squat or sit-to-stand',
          exB: 'Push-up (knee or wall)',
          exC: 'Glute bridge',
        };

  const workoutDays = Array.from({ length: days }, (_, i) => ({
    day: `Day ${i + 1}`,
    focus: i % 2 === 0 ? workoutTemplate.even : workoutTemplate.odd,
    exercises: [
      {
        name: i % 2 === 0 ? workoutTemplate.exA : 'Brisk walk / march',
        sets: 3,
        reps: i % 2 === 0 ? '8-12' : '20-30 min',
        notes: 'Move with control; stop if pain sharpens.',
      },
      {
        name: i % 2 === 0 ? workoutTemplate.exB : 'Plank',
        sets: 3,
        reps: i % 2 === 0 ? '6-10' : '20-40 sec',
        notes: 'Keep ribs down and neck long.',
      },
      {
        name: workoutTemplate.exC,
        sets: 3,
        reps: i % 2 === 0 ? '10-15' : '20-40 sec',
        notes: 'Squeeze at the top briefly.',
      },
    ],
  }));

  const calorieBase = focus === 'lighter_meals' ? 320 : 400;
  const calorieMain = focus === 'lighter_meals' ? 480 : 550;

  const mealItemFor = (mi: number) => {
    if (focus === 'meal_variety') {
      const variants = [
        `Stir-fry with ${staples[0] ?? 'veg'} and ${staples[1] ?? 'protein'}`,
        `Grain bowl: ${stapleLine}`,
        `Soup or salad with ${staples[2] ?? staples[0] ?? 'beans'}`,
        `Snack plate: ${staples[0] ?? 'fruit'}, nuts, yogurt`,
      ];
      return variants[mi % variants.length]!;
    }
    return mi === 0
      ? `Oats or eggs with ${staples[0] ?? 'fruit'}`
      : mi === mealNames.length - 1
        ? `Balanced plate: protein + veg + ${staples[1] ?? 'rice or roti'}`
        : `Bowl with ${stapleLine}`;
  };

  const mealDays = Array.from({ length: days }, (_, i) => ({
    day: `Day ${i + 1}`,
    meals: mealNames.map((name, mi) => ({
      name,
      items: [mealItemFor(mi)],
      approxCalories: mi === 0 ? calorieBase : calorieMain,
    })),
  }));

  const focusSummary: Record<PlanGenerateFocus, string> = {
    balanced: `A steady ${days}-day plan for ${profile.goal.replace('_', ' ')}, built around your staples.`,
    meal_variety: `Fresh meal rotations for ${profile.goal.replace('_', ' ')} using your staples in new combinations.`,
    workout_variety: `New training patterns for ${profile.goal.replace('_', ' ')} while meals stay on staples.`,
    lighter_meals: `Lighter meal portions for ${profile.goal.replace('_', ' ')}—moderate energy, not extreme cuts.`,
  };

  const shoppingHints =
    staples.length >= 5
      ? staples
      : [...staples, 'vegetables', 'cooking oil', 'seasonings', 'fruit'];

  const calorieGuidance =
    focus === 'lighter_meals'
      ? 'Aim for slightly smaller portions and steady protein—avoid aggressive deficits.'
      : 'Eat to gentle hunger cues with a moderate intake—avoid crash diets.';

  return {
    summary: focusSummary[focus],
    workoutPlan: { daysPerWeek: days, days: workoutDays },
    mealPlan: {
      days: mealDays,
      shoppingHints: shoppingHints.slice(0, 12),
    },
    targets: {
      calorieGuidance,
      proteinNote:
        'Include a protein source at most meals (eggs, dal, yogurt, chicken, fish).',
    },
  };
}

function profileForPrompt(profile: Profile): ProfileForPrompt {
  return {
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

function finalizePlanContent(
  raw: PlanContent,
  profile: Profile,
): PlanContent {
  const sanitized = sanitizePlanContent(raw);
  const issue = validatePlanAgainstProfile(sanitized, profile);
  if (issue) {
    throw new Error(issue);
  }
  return normalizeShoppingHints(sanitized, profile);
}

function parseModelPlan(raw: string, profile: Profile): PlanContent {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error('Model returned invalid JSON');
  }
  const sanitized = sanitizePlanContent(parsed);
  planContentSchema.parse(sanitized);
  return finalizePlanContent(sanitized, profile);
}

type GenerateContext = {
  previousContent: PlanContent | null;
  focus: PlanGenerateFocus;
  isRegenerate: boolean;
};

async function generateContentFromOpenAI(
  profile: Profile,
  ctx: GenerateContext,
): Promise<{ content: PlanContent; model: string }> {
  const openai = getOpenAI();
  const model = env.OPENAI_MODEL || 'gpt-4o-mini';
  let lastError: unknown;
  let validationFix: string | undefined;

  const regenerateNote = ctx.isRegenerate
    ? buildRegenerateAddendum(ctx.previousContent, ctx.focus)
    : undefined;

  for (let attempt = 1; attempt <= MAX_GENERATION_ATTEMPTS; attempt += 1) {
    try {
      const baseTemp = ctx.isRegenerate ? 0.72 : 0.65;
      const temperature =
        attempt === 1 ? baseTemp : Math.max(0.4, baseTemp - 0.15);

      const completion = await openai.chat.completions.create({
        model,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: buildPlanSystemPrompt() },
          {
            role: 'user',
            content: buildPlanUserPrompt(profileForPrompt(profile), {
              regenerateNote,
              validationFix,
            }),
          },
        ],
        temperature,
      });

      const raw = completion.choices[0]?.message?.content;
      if (!raw) {
        throw new Error('Empty model response');
      }

      const content = parseModelPlan(raw, profile);
      return { content, model };
    } catch (err) {
      lastError = err;
      if (err instanceof Error && err.message.includes('must')) {
        validationFix = err.message;
      }
    }
  }

  throw new AppError(
    'Could not generate a valid plan. Please try again in a moment.',
    502,
    lastError,
  );
}

async function assertRateLimit(userId: string) {
  const quota = await getGenerationQuota(userId);
  if (quota.generationsRemainingThisHour <= 0) {
    throw new AppError(
      `Plan generation limit reached (${PLAN_GENERATIONS_PER_HOUR} per hour). Try again later.`,
      429,
      {
        retryAfterSeconds: quota.retryAfterSeconds,
        generationsUsedLastHour: quota.generationsUsedLastHour,
        generationsLimitPerHour: quota.generationsLimitPerHour,
      },
    );
  }
}

function serializePlan(plan: {
  id: string;
  userId: string;
  type: string;
  contentJson: unknown;
  disclaimer: string;
  openaiModel: string | null;
  promptVersion: string;
  createdAt: Date;
}) {
  return {
    id: plan.id,
    userId: plan.userId,
    type: plan.type,
    content: plan.contentJson as PlanContent,
    disclaimer: plan.disclaimer,
    openaiModel: plan.openaiModel,
    promptVersion: plan.promptVersion,
    createdAt: plan.createdAt.toISOString(),
  };
}

function assertPlanGenerationAvailable() {
  if (env.NODE_ENV === 'production' && !hasOpenAI()) {
    throw new AppError(
      'AI plan generation is not configured. Contact support.',
      503,
    );
  }
}

export type PlanGenerateMeta = {
  generationsUsedLastHour: number;
  generationsLimitPerHour: number;
  generationsRemainingThisHour: number;
  previousPlanId: string | null;
  profileUpdatedAt: string;
  generateFocus: PlanGenerateFocus;
};

export async function generatePlan(
  userId: string,
  input: PlanGenerateBody = { intent: 'initial', focus: 'balanced' },
) {
  await assertRateLimit(userId);
  assertPlanGenerationAvailable();
  const profile = await requireCompleteProfile(userId);

  const previous = await prisma.plan.findFirst({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });
  const previousContent = previous
    ? (previous.contentJson as PlanContent)
    : null;
  const isRegenerate =
    input.intent === 'regenerate' || Boolean(previousContent);

  let content: PlanContent;
  let model: string | null = null;

  if (hasOpenAI()) {
    const generated = await generateContentFromOpenAI(profile, {
      previousContent,
      focus: input.focus,
      isRegenerate,
    });
    content = generated.content;
    model = generated.model;
  } else {
    if (env.NODE_ENV !== 'production') {
      console.warn(
        '[dev] OPENAI_API_KEY is not set — serving template fallback plan',
      );
    }
    content = finalizePlanContent(
      sanitizePlanContent(buildFallbackPlan(profile, input.focus)),
      profile,
    );
    model = 'fallback-local';
  }

  const plan = await prisma.plan.create({
    data: {
      userId,
      type: 'combined',
      contentJson: content,
      disclaimer: PLAN_DISCLAIMER,
      openaiModel: model,
      promptVersion: PLAN_PROMPT_VERSION,
    },
  });

  const quota = await getGenerationQuota(userId);

  return {
    plan: serializePlan(plan),
    meta: {
      generationsUsedLastHour: quota.generationsUsedLastHour,
      generationsLimitPerHour: quota.generationsLimitPerHour,
      generationsRemainingThisHour: quota.generationsRemainingThisHour,
      previousPlanId: previous?.id ?? null,
      profileUpdatedAt: profile.updatedAt.toISOString(),
      generateFocus: input.focus,
    } satisfies PlanGenerateMeta,
  };
}

export async function getLatestPlanPayload(userId: string) {
  const [profile, planRow, quota] = await Promise.all([
    prisma.profile.findUnique({ where: { userId } }),
    prisma.plan.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    }),
    getGenerationQuota(userId),
  ]);

  const plan = planRow ? serializePlan(planRow) : null;
  const profileUpdatedAt = profile?.updatedAt.toISOString() ?? null;
  const stale =
    Boolean(plan && profile) &&
    new Date(profile!.updatedAt) > new Date(planRow!.createdAt);

  return {
    plan,
    stale,
    profileUpdatedAt,
    generationsRemainingThisHour: quota.generationsRemainingThisHour,
    generationsLimitPerHour: quota.generationsLimitPerHour,
  };
}

export async function getLatestPlan(userId: string) {
  const payload = await getLatestPlanPayload(userId);
  return payload.plan;
}

export async function listPlans(userId: string) {
  const plans = await prisma.plan.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 10,
  });
  return plans.map(serializePlan);
}
