import React, { useCallback } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { GlassSurface } from '../../components/ui/GlassSurface';
import {
  EmptyState,
  ErrorBanner,
  Screen,
  StackScreenHeader,
} from '../../components/ui';
import type { Plan } from '../../api/plans';
import type { RootStackParamList } from '../../navigation/types';
import { usePlanStore } from '../../store/planStore';
import { TAB_SCROLL_CONTENT_EXTRA } from '../../lib/tabBarLayout';

type Nav = NativeStackNavigationProp<RootStackParamList>;

function formatPlanDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function PlanHistoryRow({ plan, onPress }: { plan: Plan; onPress: () => void }) {
  const workoutDays = plan.content.workoutPlan.days.length;
  const mealDays = plan.content.mealPlan.days.length;

  return (
    <Pressable onPress={onPress} className="mb-3 min-w-0">
      <GlassSurface className="min-w-0 px-5 py-4" style={{ borderRadius: 20 }}>
        <Text className="font-sans-medium text-xs uppercase tracking-wide text-slate">
          {formatPlanDate(plan.createdAt)}
        </Text>
        <Text
          className="mt-2 font-sans-semibold text-base leading-5 text-ink"
          numberOfLines={2}>
          {plan.content.summary}
        </Text>
        <Text className="mt-2 font-sans text-sm text-slate">
          {workoutDays} workout days · {mealDays} meal days
        </Text>
      </GlassSurface>
    </Pressable>
  );
}

export function PlanHistoryScreen() {
  const navigation = useNavigation<Nav>();
  const history = usePlanStore((s) => s.history);
  const loading = usePlanStore((s) => s.historyLoading);
  const error = usePlanStore((s) => s.error);
  const fetchHistory = usePlanStore((s) => s.fetchHistory);

  useFocusEffect(
    useCallback(() => {
      void fetchHistory();
    }, [fetchHistory]),
  );

  return (
    <Screen tabBarInset={false} edges={['top', 'left', 'right']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: TAB_SCROLL_CONTENT_EXTRA + 24 }}>
        <StackScreenHeader
          title="Plan history"
          subtitle="Your last generated workout and meal plans."
          onBack={() => navigation.goBack()}
        />

        {error ? (
          <ErrorBanner message={error} onRetry={() => void fetchHistory()} />
        ) : null}

        {loading && history.length === 0 ? (
          <ActivityIndicator className="mt-8" />
        ) : null}

        {!loading && history.length === 0 ? (
          <EmptyState
            title="No past plans"
            subtitle="Generate a plan to start building history."
          />
        ) : null}

        {history.map((plan) => (
          <PlanHistoryRow
            key={plan.id}
            plan={plan}
            onPress={() =>
              navigation.navigate('PlanDetail', { planId: plan.id })
            }
          />
        ))}
      </ScrollView>
    </Screen>
  );
}
