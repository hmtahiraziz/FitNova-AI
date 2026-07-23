import { syncReminderNotifications } from '../services/reminderNotifications';
import { useAppSettingsStore } from '../store/appSettingsStore';
import { useProfileStore } from '../store/profileStore';

export async function syncRemindersFromAppState(): Promise<void> {
  const settings = useAppSettingsStore.getState();
  const profile = useProfileStore.getState().profile;
  await syncReminderNotifications(
    {
      dailyReminders: settings.dailyReminders,
      workoutReminders: settings.workoutReminders,
    },
    profile,
  );
}
