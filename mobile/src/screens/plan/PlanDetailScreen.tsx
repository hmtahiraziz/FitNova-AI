import React, { useMemo } from 'react';
import { ScrollView, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { WorkoutDayCard } from '../../components/plan/WorkoutDayCard';
import { GlassSurface } from '../../components/ui/GlassSurface';
import { EmptyState, Screen, StackScreenHeader } from '../../components/ui';
import { DISCLAIMER } from '../../constants/disclaimer';
import type { RootStackParamList } from '../../navigation/types';
import { usePlanStore } from '../../store/planStore';
import { TAB_SCROLL_CONTENT_EXTRA } from '../../lib/tabBarLayout';

type Props = NativeStackScreenProps<RootStackParamList, 'PlanDetail'>;

export function PlanDetailScreen({ navigation, route }: Props) {
  const getPlanById = usePlanStore((s) => s.getPlanById);
  const plan = useMemo(
    () => getPlanById(route.params.planId),
    [getPlanById, route.params.planId],
  );

  if (!plan) {
    return (
      <Screen tabBarInset={false}>
        <StackScreenHeader
          title="Plan"
          onBack={() => navigation.goBack()}
        />
        <EmptyState title="Plan not found" subtitle="It may have been removed." />
      </Screen>
    );
  }

  const { content, disclaimer, createdAt } = plan;
  const dateLabel = new Date(createdAt).toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <Screen tabBarInset={false} edges={['top', 'left', 'right']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: TAB_SCROLL_CONTENT_EXTRA + 24 }}>
        <StackScreenHeader
          title="Saved plan"
          subtitle={dateLabel}
          onBack={() => navigation.goBack()}
        />

        <GlassSurface
          className="mb-4 w-full min-w-0 px-5 py-4"
          style={{ borderRadius: 24 }}>
          <Text className="font-sans text-base leading-6 text-slate">{content.summary}</Text>
        </GlassSurface>

        <GlassSurface className="mb-4 px-5 py-4" style={{ borderRadius: 24 }}>
          <Text className="font-sans-semibold text-ink">Targets</Text>
          <Text className="mt-2 font-sans text-sm leading-5 text-slate">
            {content.targets.calorieGuidance}
          </Text>
          <Text className="mt-2 font-sans text-sm leading-5 text-slate">
            {content.targets.proteinNote}
          </Text>
        </GlassSurface>

        <Text className="mb-3 font-sans-semibold text-lg text-ink">Workouts</Text>
        <View className="gap-4">
          {content.workoutPlan.days.map((day, index) => (
            <WorkoutDayCard
              key={`${plan.id}-${day.day}`}
              day={day}
              displayDayNumber={index + 1}
              defaultExpanded
              onStartWorkout={() =>
                navigation.navigate('WorkoutSession', {
                  dayIndex: index,
                  planId: plan.id,
                })
              }
            />
          ))}
        </View>

        <Text className="mb-3 mt-6 font-sans-semibold text-lg text-ink">Meals</Text>
        <View className="gap-3">
          {content.mealPlan.days.map((day, index) => {
            const dayKcal = day.meals.reduce(
              (sum, meal) => sum + (meal.approxCalories ?? 0),
              0,
            );
            return (
              <GlassSurface
                key={`${plan.id}-meal-${day.day}`}
                className="w-full min-w-0 self-stretch px-5 py-4"
                style={{ borderRadius: 24 }}>
                <Text className="font-sans-medium text-xs uppercase tracking-wide text-slate">
                  Day {index + 1}
                </Text>
                <Text className="mt-1 min-w-0 font-sans-semibold text-lg leading-6 text-ink">
                  {day.day}
                </Text>
                <Text className="mt-1 font-sans text-sm leading-5 text-slate">
                  {day.meals.length} meal{day.meals.length === 1 ? '' : 's'}
                  {dayKcal > 0 ? ` · ~${dayKcal} kcal` : ''}
                </Text>
                {day.meals.map((meal) => (
                  <View
                    key={`${day.day}-${meal.name}`}
                    className="mt-4 min-w-0 border-l-2 border-mint/70 pl-3">
                    <Text className="min-w-0 font-sans-semibold leading-5 text-ink">
                      {meal.name}
                      {meal.approxCalories
                        ? ` · ~${meal.approxCalories} kcal`
                        : ''}
                    </Text>
                    {meal.items.map((item) => (
                      <Text
                        key={item}
                        className="mt-1 min-w-0 font-sans text-sm leading-5 text-slate">
                        · {item}
                      </Text>
                    ))}
                  </View>
                ))}
              </GlassSurface>
            );
          })}
        </View>

        {content.mealPlan.shoppingHints.length > 0 ? (
          <GlassSurface
            className="mt-4 w-full min-w-0 self-stretch px-5 py-4"
            style={{ borderRadius: 24 }}>
            <Text className="mb-2 font-sans-semibold text-ink">Shopping hints</Text>
            {content.mealPlan.shoppingHints.map((hint) => (
              <Text
                key={hint}
                className="mb-1 min-w-0 font-sans text-sm leading-5 text-slate">
                · {hint}
              </Text>
            ))}
          </GlassSurface>
        ) : null}

        <Text className="mt-8 font-sans text-xs leading-5 text-slate/80">
          {disclaimer || DISCLAIMER}
        </Text>
      </ScrollView>
    </Screen>
  );
}
