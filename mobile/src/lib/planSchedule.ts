import type { Plan } from '../api/plans';

/** UTC calendar-day difference between two dates. */
export function calendarDaysBetween(from: Date, to: Date): number {
  const fromUtc = Date.UTC(from.getFullYear(), from.getMonth(), from.getDate());
  const toUtc = Date.UTC(to.getFullYear(), to.getMonth(), to.getDate());
  return Math.floor((toUtc - fromUtc) / 86_400_000);
}

/** Rotate plan day index from a stable anchor (plan creation date). */
export function planDayIndex(dayCount: number, anchor: Date, today = new Date()): number {
  if (dayCount <= 0) {
    return 0;
  }
  const offset = calendarDaysBetween(anchor, today);
  return ((offset % dayCount) + dayCount) % dayCount;
}

export type TodayPlanSlice = {
  workoutDay: Plan['content']['workoutPlan']['days'][number];
  mealDay: Plan['content']['mealPlan']['days'][number];
  workoutIndex: number;
  mealIndex: number;
  planDayLabel: string;
};

export function resolveTodayFromPlan(
  plan: Plan,
  today = new Date(),
): TodayPlanSlice | null {
  const workoutDays = plan.content.workoutPlan.days;
  const mealDays = plan.content.mealPlan.days;
  if (workoutDays.length === 0 || mealDays.length === 0) {
    return null;
  }

  const anchor = new Date(plan.createdAt);
  const workoutIndex = planDayIndex(workoutDays.length, anchor, today);
  const mealIndex = planDayIndex(mealDays.length, anchor, today);
  const workoutDay = workoutDays[workoutIndex];
  const mealDay = mealDays[mealIndex];

  return {
    workoutDay,
    mealDay,
    workoutIndex,
    mealIndex,
    planDayLabel: workoutDay.day,
  };
}
