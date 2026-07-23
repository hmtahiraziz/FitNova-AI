import notifee, {
  AndroidImportance,
  RepeatFrequency,
  TriggerType,
} from '@notifee/react-native';
import type { Profile } from '../api/profile';
import type { AppSettingsState } from '../store/appSettingsStore';

const CHANNEL_ID = 'fitnova-reminders';
const DAILY_ID = 'fitnova-daily-log';
const WORKOUT_ID = 'fitnova-workout';

async function ensureChannel() {
  await notifee.createChannel({
    id: CHANNEL_ID,
    name: 'FitNova reminders',
    importance: AndroidImportance.DEFAULT,
  });
}

function nextDailyTrigger(hour: number, minute: number): number {
  const next = new Date();
  next.setHours(hour, minute, 0, 0);
  if (next.getTime() <= Date.now()) {
    next.setDate(next.getDate() + 1);
  }
  return next.getTime();
}

/** Map days-per-week to weekday indices (0 = Sunday). */
function workoutWeekdays(daysPerWeek: number): number[] {
  const schedules: Record<number, number[]> = {
    1: [1],
    2: [1, 4],
    3: [1, 3, 5],
    4: [1, 2, 4, 6],
    5: [1, 2, 3, 5, 6],
    6: [1, 2, 3, 4, 5, 6],
    7: [0, 1, 2, 3, 4, 5, 6],
  };
  return schedules[Math.max(1, Math.min(7, daysPerWeek))] ?? schedules[3]!;
}

function nextWeekdayTrigger(weekday: number, hour: number, minute: number): number {
  const next = new Date();
  next.setHours(hour, minute, 0, 0);
  const dayDelta = (weekday - next.getDay() + 7) % 7;
  next.setDate(next.getDate() + (dayDelta === 0 && next.getTime() <= Date.now() ? 7 : dayDelta));
  if (dayDelta === 0 && next.getTime() <= Date.now()) {
    next.setDate(next.getDate() + 7);
  }
  return next.getTime();
}

export async function requestReminderPermission(): Promise<boolean> {
  const settings = await notifee.requestPermission();
  return (
    settings.authorizationStatus >= 1 ||
    settings.ios?.authorizationStatus === 1 ||
    settings.android?.alarm === 1
  );
}

export async function syncReminderNotifications(
  settings: Pick<
    AppSettingsState,
    'dailyReminders' | 'workoutReminders'
  >,
  profile: Profile | null,
): Promise<void> {
  await ensureChannel();
  await notifee.cancelTriggerNotification(DAILY_ID);
  await notifee.cancelTriggerNotification(WORKOUT_ID);

  if (settings.dailyReminders) {
    await notifee.createTriggerNotification(
      {
        id: DAILY_ID,
        title: 'Log your day',
        body: 'Quick check-in: workout and meals on FitNova AI.',
        android: { channelId: CHANNEL_ID, pressAction: { id: 'default' } },
      },
      {
        type: TriggerType.TIMESTAMP,
        timestamp: nextDailyTrigger(20, 0),
        repeatFrequency: RepeatFrequency.DAILY,
      },
    );
  }

  if (settings.workoutReminders && profile) {
    const weekdays = workoutWeekdays(profile.daysPerWeek);
    const timestamp = nextWeekdayTrigger(weekdays[0]!, 9, 0);
    await notifee.createTriggerNotification(
      {
        id: WORKOUT_ID,
        title: 'Workout day',
        body: `You planned ${profile.daysPerWeek} sessions this week — open your plan when ready.`,
        android: { channelId: CHANNEL_ID, pressAction: { id: 'default' } },
      },
      {
        type: TriggerType.TIMESTAMP,
        timestamp,
        repeatFrequency: RepeatFrequency.WEEKLY,
      },
    );
  }
}
