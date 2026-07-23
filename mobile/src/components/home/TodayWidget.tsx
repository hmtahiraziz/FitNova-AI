import React from 'react';
import { Text, View } from 'react-native';
import type { ProgressLog } from '../../api/progress';
import { GlassSurface } from '../ui/GlassSurface';
import { SecondaryButton } from '../ui';

type TodayWidgetProps = {
  todayLog: ProgressLog | null;
  onPressLog: () => void;
};

export function TodayWidget({ todayLog, onPressLog }: TodayWidgetProps) {
  const workout = todayLog?.workoutDone ?? false;
  const meals = todayLog?.mealsFollowed ?? false;

  return (
    <GlassSurface className="mb-5 px-5 py-4" interactive>
      <Text className="font-sans-semibold text-lg text-ink">Today</Text>
      <Text className="mt-1 font-sans text-sm text-slate">
        {todayLog
          ? 'Update your check-in when you finish moving or eating on plan.'
          : 'No check-in yet — log when you are ready.'}
      </Text>
      <View className="mt-4 flex-row gap-3">
        <View
          className={`flex-1 rounded-xl px-3 py-3 ${
            workout ? 'bg-mint/30' : 'border border-sage'
          }`}>
          <Text className="font-sans-medium text-xs uppercase text-slate">
            Workout
          </Text>
          <Text className="mt-1 font-sans-semibold text-ink">
            {workout ? 'Done' : 'Open'}
          </Text>
        </View>
        <View
          className={`flex-1 rounded-xl px-3 py-3 ${
            meals ? 'bg-mint/30' : 'border border-sage'
          }`}>
          <Text className="font-sans-medium text-xs uppercase text-slate">
            Meals
          </Text>
          <Text className="mt-1 font-sans-semibold text-ink">
            {meals ? 'On track' : 'Open'}
          </Text>
        </View>
      </View>
      <SecondaryButton className="mt-4" label="Open Log" onPress={onPressLog} />
    </GlassSurface>
  );
}
