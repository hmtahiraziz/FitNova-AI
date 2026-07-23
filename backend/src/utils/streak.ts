import { addDays, daysBetween } from './dateOnly';

export type LogActivity = {
  date: string;
  workoutDone: boolean;
  mealsFollowed: boolean;
};

export function isActiveDay(log: {
  workoutDone: boolean;
  mealsFollowed: boolean;
}): boolean {
  return log.workoutDone || log.mealsFollowed;
}

/**
 * Current streak = consecutive active days ending today.
 * If today has no active log, the streak may still end at yesterday.
 */
export function computeCurrentStreak(
  activeDates: Iterable<string>,
  today: string,
): number {
  const active = new Set(activeDates);
  let cursor = today;

  if (!active.has(today)) {
    cursor = addDays(today, -1);
    if (!active.has(cursor)) {
      return 0;
    }
  }

  let streak = 0;
  while (active.has(cursor)) {
    streak += 1;
    cursor = addDays(cursor, -1);
  }
  return streak;
}

export function computeLongestStreak(activeDates: Iterable<string>): number {
  const sorted = [...new Set(activeDates)].sort();
  if (sorted.length === 0) {
    return 0;
  }

  let longest = 1;
  let current = 1;

  for (let i = 1; i < sorted.length; i += 1) {
    if (daysBetween(sorted[i - 1], sorted[i]) === 1) {
      current += 1;
      longest = Math.max(longest, current);
    } else {
      current = 1;
    }
  }

  return longest;
}

/**
 * Adherence rate over the last `windowDays` calendar days ending on `today`
 * (inclusive). A day counts if it is active.
 */
export function computeAdherenceRate(
  activeDates: Iterable<string>,
  today: string,
  windowDays: number,
): { activeDays: number; windowDays: number; rate: number } {
  const active = new Set(activeDates);
  const start = addDays(today, -(windowDays - 1));
  let activeDays = 0;

  for (let i = 0; i < windowDays; i += 1) {
    const day = addDays(start, i);
    if (active.has(day)) {
      activeDays += 1;
    }
  }

  return {
    activeDays,
    windowDays,
    rate: windowDays === 0 ? 0 : activeDays / windowDays,
  };
}

export function activeDatesFromLogs(logs: LogActivity[]): string[] {
  return logs.filter(isActiveDay).map((log) => log.date);
}

/** Last N calendar days as YYYY-MM-DD, oldest → newest. */
export function buildDayStrip(
  today: string,
  days: number,
  activeDates: Iterable<string>,
): Array<{ date: string; active: boolean }> {
  const active = new Set(activeDates);
  const start = addDays(today, -(days - 1));
  const strip: Array<{ date: string; active: boolean }> = [];

  for (let i = 0; i < days; i += 1) {
    const date = addDays(start, i);
    strip.push({ date, active: active.has(date) });
  }

  return strip;
}
