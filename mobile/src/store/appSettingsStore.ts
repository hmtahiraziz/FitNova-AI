import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type WeightUnit = 'kg' | 'lb';
export type HeightUnit = 'cm' | 'ft';

export type AppSettingsState = {
  weightUnit: WeightUnit;
  heightUnit: HeightUnit;
  dailyReminders: boolean;
  workoutReminders: boolean;
  analyticsEnabled: boolean;
  setWeightUnit: (unit: WeightUnit) => void;
  setHeightUnit: (unit: HeightUnit) => void;
  setDailyReminders: (value: boolean) => void;
  setWorkoutReminders: (value: boolean) => void;
  setAnalyticsEnabled: (value: boolean) => void;
};

export const useAppSettingsStore = create<AppSettingsState>()(
  persist(
    (set) => ({
      weightUnit: 'kg',
      heightUnit: 'cm',
      dailyReminders: true,
      workoutReminders: true,
      analyticsEnabled: true,
      setWeightUnit: (weightUnit) => set({ weightUnit }),
      setHeightUnit: (heightUnit) => set({ heightUnit }),
      setDailyReminders: (dailyReminders) => set({ dailyReminders }),
      setWorkoutReminders: (workoutReminders) => set({ workoutReminders }),
      setAnalyticsEnabled: (analyticsEnabled) => set({ analyticsEnabled }),
    }),
    {
      name: 'fitnova-settings',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
