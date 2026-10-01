import React, { useCallback, useMemo, useState } from 'react';
import {
  RefreshControl,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { WorkoutDayCard } from '../../components/plan/WorkoutDayCard';
import {
  EmptyState,
  ErrorBanner,
  Screen,
  SegmentedControl,
  TabScreenHeader,
  type SegmentOption,
} from '../../components/ui';
import { GlassSurface } from '../../components/ui/GlassSurface';
import { StalePlanBanner } from '../../components/plan/StalePlanBanner';
import { DISCLAIMER } from '../../constants/disclaimer';
import { resolveTodayFromPlan } from '../../lib/planSchedule';
import { usePlanStore } from '../../store/planStore';
import { colors } from '../../theme/tokens';
import { TAB_SCROLL_CONTENT_EXTRA } from '../../lib/tabBarLayout';
import type { RootStackParamList } from '../../navigation/types';

type TabKey = 'overview' | 'workout' | 'meals';
type RootNav = NativeStackNavigationProp<RootStackParamList>;

const PLAN_TABS: readonly SegmentOption<TabKey>[] = [
  { key: 'overview', label: 'Overview' },
  { key: 'workout', label: 'Workout' },
  { key: 'meals', label: 'Meals' },
];

const STICKY_TAB_INDEX = 1;

function HistoryPill({ onPress }: { onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={8}
      className="rounded-full border border-ink/10 bg-mist px-3 py-2">
      <Text className="font-sans-semibold text-xs text-ink">History</Text>
    </Pressable>
  );
}

export function PlanScreen() {
  const navigation = useNavigation<RootNav>();
  const latest = usePlanStore((s) => s.latest);
  const stale = usePlanStore((s) => s.stale);
  const error = usePlanStore((s) => s.error);
  const fetchLatest = usePlanStore((s) => s.fetchLatest);
  const [tab, setTab] = useState<TabKey>('overview');
  const [refreshing, setRefreshing] = useState(false);
  const fade = useSharedValue(0);

  const headerStyle = useAnimatedStyle(() => ({
    opacity: fade.value,
    transform: [{ translateY: (1 - fade.value) * 8 }],
  }));

  useFocusEffect(
    useCallback(() => {
      fade.value = withTiming(1, { duration: 380 });
      void fetchLatest();
    }, [fetchLatest, fade]),
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchLatest();
    setRefreshing(false);
  };

  const todayWorkoutIndex = useMemo(() => {
    if (!latest) {
      return 0;
    }
    const slice = resolveTodayFromPlan(latest);
    return slice?.workoutIndex ?? 0;
  }, [latest]);

  const orderedWorkoutDays = useMemo(() => {
    if (!latest) {
      return [];
    }
    const days = latest.content.workoutPlan.days;
    if (days.length === 0) {
      return [];
    }
    const items: Array<{
      day: (typeof days)[number];
      planIndex: number;
      displayDayNumber: number;
    }> = [];
    for (let i = 0; i < days.length; i++) {
      const planIndex = (todayWorkoutIndex + i) % days.length;
      items.push({
        day: days[planIndex],
        planIndex,
        displayDayNumber: i + 1,
      });
    }
    return items;
  }, [latest, todayWorkoutIndex]);

  const totalExercises = useMemo(() => {
    if (!latest) {
      return 0;
    }
    return latest.content.workoutPlan.days.reduce(
      (n, d) => n + d.exercises.length,
      0,
    );
  }, [latest]);

  if (!latest) {
    return (
      <Screen>
        <TabScreenHeader
          title="Plan"
          subtitle="Your weekly workout and meals."
        />
        {error ? (
          <ErrorBanner message={error} onRetry={() => void fetchLatest()} />
        ) : null}
        <EmptyState
          title="Nothing here yet"
          subtitle="Generate a plan from Home to see workouts and meals here."
        />
      </Screen>
    );
  }

  const { content, disclaimer } = latest;

  const todayFocus =
    content.workoutPlan.days[todayWorkoutIndex]?.focus ?? '—';

  const openSession = (planIndex: number) => {
    navigation.navigate('WorkoutSession', { dayIndex: planIndex });
  };

  return (
    <Screen>
      <ScrollView
        className="flex-1"
        stickyHeaderIndices={[STICKY_TAB_INDEX]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: TAB_SCROLL_CONTENT_EXTRA }}>
        <Animated.View style={headerStyle} className="min-w-0">
          <TabScreenHeader
            title="Your plan"
            subtitle={content.summary}
            trailing={
              <HistoryPill
                onPress={() => navigation.navigate('PlanHistory')}
              />
            }
          />

          {stale ? (
            <View className="mb-3">
              <StalePlanBanner
                onRegenerate={() => navigation.navigate('GeneratePlan')}
              />
            </View>
          ) : null}

          <Pressable
            onPress={() => navigation.navigate('GeneratePlan')}
            className="mb-4 self-start rounded-full border border-ink/10 bg-mist/90 px-4 py-2.5">
            <Text className="font-sans-semibold text-sm text-ink">
              Regenerate workout + meals
            </Text>
          </Pressable>
        </Animated.View>

        <View
          className="pb-4 pt-1"
          style={{ backgroundColor: colors.mistLight }}>
          <SegmentedControl options={PLAN_TABS} value={tab} onChange={setTab} />
        </View>

        {tab === 'overview' ? (
          <Animated.View entering={FadeInDown.duration(320)} className="gap-4 pt-2">
            <GlassSurface
              className="w-full min-w-0 self-stretch px-5 py-4"
              style={{ borderRadius: 24 }}>
              <Text className="font-sans-medium text-xs uppercase tracking-wide text-slate">
                Energy
              </Text>
              <Text className="mt-2 min-w-0 font-sans text-base leading-6 text-ink">
                {content.targets.calorieGuidance}
              </Text>
            </GlassSurface>
            <GlassSurface
              className="w-full min-w-0 self-stretch px-5 py-4"
              style={{ borderRadius: 24 }}>
              <Text className="font-sans-medium text-xs uppercase tracking-wide text-slate">
                Protein
              </Text>
              <Text className="mt-2 min-w-0 font-sans text-base leading-6 text-ink">
                {content.targets.proteinNote}
              </Text>
            </GlassSurface>
            {content.mealPlan.shoppingHints.length > 0 ? (
              <GlassSurface
                className="w-full min-w-0 self-stretch px-5 py-4"
                style={{ borderRadius: 24 }}>
                <Text className="mb-2 font-sans-semibold text-ink">Shopping hints</Text>
                {content.mealPlan.shoppingHints.map((hint) => (
                  <Text key={hint} className="mb-1 min-w-0 font-sans leading-5 text-slate">
                    · {hint}
                  </Text>
                ))}
              </GlassSurface>
            ) : null}
          </Animated.View>
        ) : null}

        {tab === 'workout' ? (
          <Animated.View entering={FadeInDown.duration(320)} className="gap-4 pt-2">
            <GlassSurface
              className="w-full min-w-0 self-stretch px-5 py-4"
              style={{ borderRadius: 24 }}>
              <Text
                className="font-sans-medium text-slate"
                style={{ fontSize: 12, letterSpacing: 0.5 }}>
                WEEKLY ROTATION
              </Text>
              <Text
                className="mt-2 font-sans-semibold text-ink"
                style={{ fontSize: 16, lineHeight: 22 }}>
                {content.workoutPlan.daysPerWeek} training days · {totalExercises}{' '}
                total exercises
              </Text>
              <Text className="mt-1 font-sans text-sm leading-5 text-slate">
                Today&apos;s focus:{' '}
                <Text className="font-sans-semibold text-ink">{todayFocus}</Text>
              </Text>
            </GlassSurface>
            {orderedWorkoutDays.map(({ day, planIndex, displayDayNumber }) => (
              <WorkoutDayCard
                key={`${day.day}-${planIndex}`}
                day={day}
                displayDayNumber={displayDayNumber}
                isToday={planIndex === todayWorkoutIndex}
                collapsible={planIndex !== todayWorkoutIndex}
                defaultExpanded={planIndex === todayWorkoutIndex}
                onStartWorkout={() => openSession(planIndex)}
              />
            ))}
          </Animated.View>
        ) : null}

        {tab === 'meals' ? (
          <Animated.View entering={FadeInDown.duration(320)} className="gap-4 pt-2">
            {content.mealPlan.days.map((day, index) => (
              <GlassSurface
                key={day.day}
                className="w-full min-w-0 self-stretch px-5 py-4"
                style={{ borderRadius: 28 }}>
                <Text className="font-sans-medium text-xs uppercase tracking-wide text-slate">
                  Day {index + 1}
                </Text>
                <Text className="mt-1 min-w-0 font-display text-2xl leading-tight text-ink">
                  {day.day}
                </Text>
                {day.meals.map((meal) => (
                  <View key={`${day.day}-${meal.name}`} className="mt-3 min-w-0">
                    <Text className="min-w-0 font-sans-semibold leading-5 text-ink">
                      {meal.name}
                      {meal.approxCalories
                        ? ` · ~${meal.approxCalories} kcal`
                        : ''}
                    </Text>
                    {meal.items.map((item) => (
                      <Text
                        key={item}
                        className="min-w-0 font-sans leading-5 text-slate">
                        · {item}
                      </Text>
                    ))}
                  </View>
                ))}
              </GlassSurface>
            ))}
          </Animated.View>
        ) : null}

        <Text className="mt-8 min-w-0 font-sans text-xs leading-5 text-slate/80">
          {disclaimer || DISCLAIMER}
        </Text>
      </ScrollView>
    </Screen>
  );
}
