import React from 'react';
import { Text, View } from 'react-native';
import type { Plan } from '../../api/plans';
import { GlassSurface } from '../ui/GlassSurface';
import { colors } from '../../theme/tokens';

type TodayMealsCardProps = {
  mealDay: Plan['content']['mealPlan']['days'][number];
  dayLabel: string;
  onPressViewPlan?: () => void;
};

export function TodayMealsCard({
  mealDay,
  dayLabel,
}: TodayMealsCardProps) {
  return (
    <GlassSurface className="mb-5 px-5 py-4">
      <Text className="font-sans-semibold text-lg text-ink">Today&apos;s meals</Text>
      <Text className="mt-1 font-sans text-sm text-slate">
        {dayLabel} · {mealDay.meals.length} meals
      </Text>
      <View className="mt-4 gap-3">
        {mealDay.meals.map((meal) => (
          <View
            key={`${mealDay.day}-${meal.name}`}
            className="border-l-2 pl-3"
            style={{ borderColor: colors.mint }}>
            <Text className="font-sans-semibold text-sm text-ink">{meal.name}</Text>
            <Text className="mt-1 font-sans text-sm leading-5 text-slate">
              {meal.items.join(' · ')}
            </Text>
            {meal.approxCalories ? (
              <Text className="mt-1 font-sans-medium text-xs text-slate">
                ~{meal.approxCalories} kcal
              </Text>
            ) : null}
          </View>
        ))}
      </View>
    </GlassSurface>
  );
}
