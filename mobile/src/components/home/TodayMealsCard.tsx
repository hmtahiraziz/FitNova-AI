import React from 'react';
import { Pressable, Text, View } from 'react-native';
import type { Plan } from '../../api/plans';
import { GlassSurface } from '../ui/GlassSurface';
import { colors, fonts } from '../../theme/tokens';

type TodayMealsCardProps = {
  mealDay: Plan['content']['mealPlan']['days'][number];
  dayLabel: string;
  onPressViewPlan?: () => void;
};

export function TodayMealsCard({
  mealDay,
  dayLabel,
  onPressViewPlan,
}: TodayMealsCardProps) {
  const dayKcal = mealDay.meals.reduce(
    (sum, meal) => sum + (meal.approxCalories ?? 0),
    0,
  );

  return (
    <GlassSurface className="mb-2 px-5 py-4" style={{ borderRadius: 22 }}>
      <View className="mb-1 flex-row items-start justify-between gap-2">
        <View className="min-w-0 flex-1">
          <Text
            style={{
              fontFamily: fonts.sansSemiBold,
              fontSize: 16,
              lineHeight: 22,
              color: colors.ink,
            }}>
            Today&apos;s meals
          </Text>
          <Text
            style={{
              marginTop: 2,
              fontFamily: fonts.sans,
              fontSize: 13,
              lineHeight: 18,
              color: colors.slate,
            }}>
            {dayLabel} · {mealDay.meals.length} meal
            {mealDay.meals.length === 1 ? '' : 's'}
            {dayKcal > 0 ? ` · ~${dayKcal} kcal` : ''}
          </Text>
        </View>
        {onPressViewPlan ? (
          <Pressable
            accessibilityRole="button"
            onPress={onPressViewPlan}
            hitSlop={8}
            style={{
              paddingHorizontal: 10,
              paddingVertical: 6,
              borderRadius: 999,
              borderWidth: 1,
              borderColor: colors.glassBorder,
              backgroundColor: colors.mist,
            }}>
            <Text
              style={{
                fontFamily: fonts.sansSemiBold,
                fontSize: 12,
                lineHeight: 16,
                color: colors.ink,
              }}>
              Plan
            </Text>
          </Pressable>
        ) : null}
      </View>

      <View className="mt-3 gap-3">
        {mealDay.meals.map((meal) => (
          <View
            key={`${mealDay.day}-${meal.name}`}
            style={{
              borderLeftWidth: 3,
              borderLeftColor: colors.mint,
              paddingLeft: 12,
            }}>
            <View className="flex-row items-baseline justify-between gap-2">
              <Text
                style={{
                  flex: 1,
                  minWidth: 0,
                  fontFamily: fonts.sansSemiBold,
                  fontSize: 14,
                  lineHeight: 20,
                  color: colors.ink,
                }}>
                {meal.name}
              </Text>
              {meal.approxCalories ? (
                <Text
                  style={{
                    fontFamily: fonts.sansMedium,
                    fontSize: 12,
                    lineHeight: 16,
                    color: colors.slate,
                    fontVariant: ['tabular-nums'],
                  }}>
                  ~{meal.approxCalories} kcal
                </Text>
              ) : null}
            </View>
            <Text
              style={{
                marginTop: 4,
                fontFamily: fonts.sans,
                fontSize: 13,
                lineHeight: 18,
                color: colors.slate,
              }}>
              {meal.items.join(' · ')}
            </Text>
          </View>
        ))}
      </View>
    </GlassSurface>
  );
}
