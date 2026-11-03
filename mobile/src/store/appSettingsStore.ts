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
  /** Local mirror of consent to send profile data to OpenAI for plan generation. */
  aiProcessingConsented: boolean;
  setWeightUnit: (unit: WeightUnit) => void;
  setHeightUnit: (unit: HeightUnit) => void;
  setDailyReminders: (value: boolean) => void;
  setWorkoutReminders: (value: boolean) => void;
  setAiProcessingConsented: (value: boolean) => void;
};

export const useAppSettingsStore = create<AppSettingsState>()(
  persist(
    (set) => ({
      weightUnit: 'kg',
      heightUnit: 'cm',
      dailyReminders: true,
      workoutReminders: true,
      aiProcessingConsented: false,
      setWeightUnit: (weightUnit) => set({ weightUnit }),
      setHeightUnit: (heightUnit) => set({ heightUnit }),
      setDailyReminders: (dailyReminders) => set({ dailyReminders }),
      setWorkoutReminders: (workoutReminders) => set({ workoutReminders }),
      setAiProcessingConsented: (aiProcessingConsented) =>
        set({ aiProcessingConsented }),
    }),
    {
      name: 'fitnova-settings',
      storage: createJSONStorage(() => AsyncStorage),
      // Drop legacy analyticsEnabled if present in older persisted payloads.
      partialize: (state) => ({
        weightUnit: state.weightUnit,
        heightUnit: state.heightUnit,
        dailyReminders: state.dailyReminders,
        workoutReminders: state.workoutReminders,
        aiProcessingConsented: state.aiProcessingConsented,
      }),
    },
  ),
);
