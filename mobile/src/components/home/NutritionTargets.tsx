import React from 'react';
import { Text, View } from 'react-native';
import type { Plan } from '../../api/plans';
import { GlassSurface } from '../ui/GlassSurface';

type NutritionTargetsProps = {
  plan: Plan;
};

export function NutritionTargets({ plan }: NutritionTargetsProps) {
  const { calorieGuidance, proteinNote } = plan.content.targets;

  return (
    <GlassSurface className="mb-5 px-5 py-4">
      <Text className="font-sans-semibold text-lg text-ink">Nutrition</Text>
      <View className="mt-3 border-l-2 border-mint pl-3">
        <Text className="font-sans-medium text-xs uppercase tracking-wide text-slate">
          Energy
        </Text>
        <Text className="mt-1 font-sans text-sm leading-5 text-ink">
          {calorieGuidance}
        </Text>
      </View>
      <View className="mt-4 border-l-2 border-sage pl-3">
        <Text className="font-sans-medium text-xs uppercase tracking-wide text-slate">
          Protein
        </Text>
        <Text className="mt-1 font-sans text-sm leading-5 text-ink">
          {proteinNote}
        </Text>
      </View>
    </GlassSurface>
  );
}
