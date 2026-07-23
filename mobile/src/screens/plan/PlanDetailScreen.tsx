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
        {content.mealPlan.days.map((day, index) => (
          <GlassSurface
            key={`${plan.id}-meal-${day.day}`}
            className="mb-3 w-full min-w-0 px-5 py-4"
            style={{ borderRadius: 24 }}>
            <Text className="font-sans-medium text-xs uppercase tracking-wide text-slate">
              Day {index + 1}
            </Text>
            <Text className="mt-1 font-sans-semibold text-ink">{day.day}</Text>
            <Text className="mt-1 font-sans text-sm text-slate">
              {day.meals.length} meals planned
            </Text>
          </GlassSurface>
        ))}

        <Text className="mt-8 font-sans text-xs leading-5 text-slate/80">
          {disclaimer || DISCLAIMER}
        </Text>
      </ScrollView>
    </Screen>
  );
}
