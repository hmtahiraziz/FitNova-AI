import type { ProgressLog } from '../generated/prisma/client';
import { prisma } from '../lib/prisma';
import { AppError } from '../middleware/errorHandler';
import type {
  ProgressRangeQuery,
  ProgressStatsQuery,
  UpsertProgressInput,
} from '../schemas/progress.schemas';
import {
  addDays,
  formatDateOnly,
  parseDateOnly,
  todayUtcDateOnly,
} from '../utils/dateOnly';
import {
  activeDatesFromLogs,
  buildDayStrip,
  computeAdherenceRate,
  computeCurrentStreak,
  computeLongestStreak,
  isActiveDay,
} from '../utils/streak';

const DEFAULT_RANGE_DAYS = 30;
const HISTORY_LOOKBACK_DAYS = 120;

export function serializeProgressLog(log: ProgressLog) {
  return {
    id: log.id,
    userId: log.userId,
    date: formatDateOnly(log.date),
    workoutDone: log.workoutDone,
    mealsFollowed: log.mealsFollowed,
    weightKg: log.weightKg,
    notes: log.notes,
    createdAt: log.createdAt,
    active: isActiveDay(log),
  };
}

function resolveToday(today?: string): string {
  return today ?? todayUtcDateOnly();
}

export async function upsertProgress(
  userId: string,
  input: UpsertProgressInput,
) {
  const dateStr = input.date ?? todayUtcDateOnly();
  const date = parseDateOnly(dateStr);

  const existing = await prisma.progressLog.findUnique({
    where: { userId_date: { userId, date } },
  });

  const workoutDone = input.workoutDone ?? existing?.workoutDone ?? false;
  const mealsFollowed =
    input.mealsFollowed ?? existing?.mealsFollowed ?? false;

  const weightKg =
    input.weightKg === undefined
      ? (existing?.weightKg ?? null)
      : input.weightKg;
  const notes =
    input.notes === undefined ? (existing?.notes ?? null) : input.notes;

  const log = await prisma.progressLog.upsert({
    where: { userId_date: { userId, date } },
    create: {
      userId,
      date,
      workoutDone,
      mealsFollowed,
      weightKg,
      notes,
    },
    update: {
      workoutDone,
      mealsFollowed,
      weightKg,
      notes,
    },
  });

  return serializeProgressLog(log);
}

export async function listProgress(
  userId: string,
  query: ProgressRangeQuery,
) {
  const today = resolveToday(query.today);
  const to = query.to ?? today;
  const from = query.from ?? addDays(to, -(DEFAULT_RANGE_DAYS - 1));

  if (from > to) {
    throw new AppError('`from` must be on or before `to`', 400);
  }

  const logs = await prisma.progressLog.findMany({
    where: {
      userId,
      date: {
        gte: parseDateOnly(from),
        lte: parseDateOnly(to),
      },
    },
    orderBy: { date: 'desc' },
  });

  return {
    from,
    to,
    logs: logs.map(serializeProgressLog),
  };
}

export async function getProgressStats(
  userId: string,
  query: ProgressStatsQuery = {},
) {
  const today = resolveToday(query.today);
  const lookbackStart = addDays(today, -(HISTORY_LOOKBACK_DAYS - 1));

  const logs = await prisma.progressLog.findMany({
    where: {
      userId,
      date: {
        gte: parseDateOnly(lookbackStart),
        lte: parseDateOnly(today),
      },
    },
    orderBy: { date: 'asc' },
  });

  const activity = logs.map((log) => ({
    date: formatDateOnly(log.date),
    workoutDone: log.workoutDone,
    mealsFollowed: log.mealsFollowed,
  }));
  const activeDates = activeDatesFromLogs(activity);

  const rate7 = computeAdherenceRate(activeDates, today, 7);
  const rate30 = computeAdherenceRate(activeDates, today, 30);
  const todayLog = logs.find((log) => formatDateOnly(log.date) === today);

  return {
    today,
    currentStreak: computeCurrentStreak(activeDates, today),
    longestStreak: computeLongestStreak(activeDates),
    rate7: Number(rate7.rate.toFixed(4)),
    rate30: Number(rate30.rate.toFixed(4)),
    activeDays7: rate7.activeDays,
    activeDays30: rate30.activeDays,
    dayStrip7: buildDayStrip(today, 7, activeDates),
    todayLog: todayLog ? serializeProgressLog(todayLog) : null,
  };
}
