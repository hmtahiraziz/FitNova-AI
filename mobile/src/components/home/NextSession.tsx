import React from 'react';
import { Text, View } from 'react-native';
import type { Plan } from '../../api/plans';
import { GlassSurface } from '../ui/GlassSurface';
import { SecondaryButton } from '../ui';

type NextSessionProps = {
  plan: Plan;
  onPressPlan: () => void;
};

export function NextSession({ plan, onPressPlan }: NextSessionProps) {
  const day = plan.content.workoutPlan.days[0];
  if (!day) {
    return null;
  }

  const exercises = day.exercises.slice(0, 2);

  return (
    <GlassSurface className="mb-5 px-5 py-4" interactive>
      <Text className="font-sans-medium text-xs uppercase tracking-wide text-slate">
        Next session
      </Text>
      <Text className="mt-1 font-display text-2xl text-ink">{day.day}</Text>
      <Text className="mt-1 font-sans text-base text-slate">{day.focus}</Text>
      <View className="mt-4 gap-2">
        {exercises.map((ex) => (
          <View
            key={ex.name}
            className="min-w-0 flex-row items-start justify-between gap-3">
            <Text className="min-w-0 flex-1 shrink font-sans-medium leading-5 text-ink">
              {ex.name}
            </Text>
            <Text className="shrink-0 font-sans text-sm tabular-nums leading-5 text-slate">
              {ex.sets} × {ex.reps}
            </Text>
          </View>
        ))}
      </View>
      <SecondaryButton className="mt-4" label="Open Plan" onPress={onPressPlan} />
    </GlassSurface>
  );
}
