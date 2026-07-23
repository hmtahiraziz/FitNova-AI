import { prisma } from '../lib/prisma';

export const PLAN_GENERATIONS_PER_HOUR = 5;
export const PLAN_GENERATION_WINDOW_MS = 60 * 60 * 1000;

export type GenerationQuota = {
  generationsUsedLastHour: number;
  generationsLimitPerHour: number;
  generationsRemainingThisHour: number;
  retryAfterSeconds: number;
};

export async function getGenerationQuota(userId: string): Promise<GenerationQuota> {
  const since = new Date(Date.now() - PLAN_GENERATION_WINDOW_MS);
  const recent = await prisma.plan.findMany({
    where: { userId, createdAt: { gte: since } },
    orderBy: { createdAt: 'asc' },
    select: { createdAt: true },
  });

  const used = recent.length;
  const limit = PLAN_GENERATIONS_PER_HOUR;
  let retryAfterSeconds = 0;

  if (used >= limit && recent[0]) {
    const unlockAt = recent[0].createdAt.getTime() + PLAN_GENERATION_WINDOW_MS;
    retryAfterSeconds = Math.max(0, Math.ceil((unlockAt - Date.now()) / 1000));
  }

  return {
    generationsUsedLastHour: used,
    generationsLimitPerHour: limit,
    generationsRemainingThisHour: Math.max(0, limit - used),
    retryAfterSeconds,
  };
}
