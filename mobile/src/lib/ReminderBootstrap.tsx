import { useEffect } from 'react';
import { syncRemindersFromAppState } from './syncReminders';
import { useAppSettingsStore } from '../store/appSettingsStore';
import { useProfileStore } from '../store/profileStore';

/** Keeps local Notifee triggers aligned with settings and profile. */
export function ReminderBootstrap() {
  useEffect(() => {
    void syncRemindersFromAppState();
  }, []);

  useEffect(
    () =>
      useAppSettingsStore.subscribe((state, prev) => {
        if (
          state.dailyReminders !== prev.dailyReminders ||
          state.workoutReminders !== prev.workoutReminders
        ) {
          void syncRemindersFromAppState();
        }
      }),
    [],
  );

  useEffect(
    () =>
      useProfileStore.subscribe((state, prev) => {
        if (state.profile?.daysPerWeek !== prev.profile?.daysPerWeek) {
          void syncRemindersFromAppState();
        }
      }),
    [],
  );

  return null;
}
