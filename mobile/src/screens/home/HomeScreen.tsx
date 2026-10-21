import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  EmptyState,
  ErrorBanner,
  Screen,
} from '../../components/ui';
import {
  CoachScoreRing,
  MetricTile,
  StatCarouselCard,
  TodayCheckInGrid,
} from '../../components/home/PremiumWidgets';
import { HomeGreeting } from '../../components/home/HomeGreeting';
import { HomeTopBar } from '../../components/home/HomeTopBar';
import { TodayWorkoutCard } from '../../components/home/TodayWorkoutCard';
import { NutritionTargets } from '../../components/home/NutritionTargets';
import { TodayMealsCard } from '../../components/home/TodayMealsCard';
import { WeekStripWidget } from '../../components/home/StreakWidget';
import { StalePlanBanner } from '../../components/plan/StalePlanBanner';
import { useResponsive } from '../../hooks/useResponsive';
import { getDisplayName, getInitial } from '../../lib/displayName';
import { resolveTodayFromPlan } from '../../lib/planSchedule';
import { TAB_SCROLL_CONTENT_EXTRA } from '../../lib/tabBarLayout';
import { createFocusFetchGate } from '../../lib/tabFocus';
import { useAuthStore } from '../../store/authStore';
import { usePlanStore } from '../../store/planStore';
import { useProfileStore } from '../../store/profileStore';
import { useProgressStore } from '../../store/progressStore';
import { useAppTabs } from '../../navigation/AppTabContext';
import type { RootStackParamList } from '../../navigation/types';

type RootNav = NativeStackNavigationProp<RootStackParamList>;

/** Vertical rhythm — 8pt grid (24 / 32px between major blocks). */
const HOME_BLOCK_GAP = 24;
const HOME_BLOCK_GAP_LG = 32;

function HomeSectionTitle({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <View className="min-w-0">
      <Text
        className="font-sans-semibold text-ink"
        style={{ fontSize: 21, lineHeight: 28 }}>
        {title}
      </Text>
      {subtitle ? (
        <Text
          className="mt-1 font-sans text-slate"
          style={{ fontSize: 14, lineHeight: 20 }}>
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}

export function HomeScreen() {
  const navigation = useNavigation<RootNav>();
  const user = useAuthStore((s) => s.user);
  const profile = useProfileStore((s) => s.profile);
  const latest = usePlanStore((s) => s.latest);
  const stale = usePlanStore((s) => s.stale);
  const fetchLatest = usePlanStore((s) => s.fetchLatest);
  const stats = useProgressStore((s) => s.stats);
  const fetchStats = useProgressStore((s) => s.fetchStats);
  const { navigateTo, active: activeTab } = useAppTabs();
  const { isCompact, isTablet } = useResponsive();
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const allowFocusFetch = useRef(createFocusFetchGate()).current;
  const didEnter = useRef(false);
  const rise = useSharedValue(10);
  const opacity = useSharedValue(0);

  const headerStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: rise.value }],
  }));

  useFocusEffect(
    useCallback(() => {
      if (activeTab !== 'Home') {
        return;
      }
      if (!didEnter.current) {
        didEnter.current = true;
        opacity.value = withTiming(1, { duration: 280 });
        rise.value = withTiming(0, { duration: 280 });
      } else {
        opacity.value = 1;
        rise.value = 0;
      }
      if (!allowFocusFetch.tryAcquire()) {
        return;
      }
      void Promise.all([fetchLatest(), fetchStats()]).catch((err) => {
        setError(err instanceof Error ? err.message : 'Could not refresh');
      });
    }, [activeTab, allowFocusFetch, fetchLatest, fetchStats, opacity, rise]),
  );

  const refetchHome = useCallback(async () => {
    setError(null);
    allowFocusFetch.mark();
    try {
      await Promise.all([fetchLatest(), fetchStats()]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not refresh');
      throw err;
    }
  }, [fetchLatest, fetchStats]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refetchHome();
    } catch {
      // Error banner set in refetchHome
    } finally {
      setRefreshing(false);
    }
  };

  const openGeneratePlan = () => {
    navigation.navigate('GeneratePlan');
  };

  const todaySlice = useMemo(
    () => (latest ? resolveTodayFromPlan(latest) : null),
    [latest],
  );

  const displayName = getDisplayName(profile, user);
  const initial = getInitial(displayName);
  const streak = stats?.currentStreak ?? 0;
  const coachScore = useMemo(() => {
    const rate = stats ? Math.round(stats.rate7 * 100) : 0;
    const streakBoost = Math.min(30, streak * 5);
    return Math.min(100, Math.round(rate * 0.7 + streakBoost));
  }, [stats, streak]);

  const weekPct = stats ? Math.round(stats.rate7 * 100) : 0;
  const workoutDone = Boolean(stats?.todayLog?.workoutDone);
  const mealsDone = Boolean(stats?.todayLog?.mealsFollowed);

  const workoutDay = todaySlice?.workoutDay;
  const today = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  return (
    <Screen>
      <ScrollView
        style={{ flex: 1 }}
        nestedScrollEnabled
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          // Screen already pads for the floating tab bar — keep a small scroll tail only.
          paddingBottom: TAB_SCROLL_CONTENT_EXTRA,
          flexGrow: 0,
        }}>
        <Animated.View style={headerStyle}>
          <HomeTopBar
            displayName={displayName}
            profileInitial={initial}
            avatarUrl={profile?.avatarUrl}
            avatarCacheKey={profile?.updatedAt}
            onProfilePress={() => navigateTo('Profile')}
          />
          <HomeGreeting
            displayName={displayName}
            dateLabel={today}
            compact={isCompact}
          />
        </Animated.View>

        {error ? (
          <View style={{ marginTop: HOME_BLOCK_GAP }}>
            <ErrorBanner
              message={error}
              onRetry={() => {
                void refetchHome().catch(() => {
                  // Keep banner; message already set
                });
              }}
            />
          </View>
        ) : null}

        {latest && stale ? (
          <View style={{ marginTop: HOME_BLOCK_GAP }}>
            <StalePlanBanner onRegenerate={openGeneratePlan} />
          </View>
        ) : null}

        <View style={{ marginTop: HOME_BLOCK_GAP_LG }}>
          <CoachScoreRing
            percent={coachScore}
            streak={streak}
            longestStreak={stats?.longestStreak ?? 0}
            activeDays7={stats?.activeDays7 ?? 0}
            dayStrip7={stats?.dayStrip7 ?? []}
          />
        </View>

        <View
          className="flex-row items-end justify-between gap-3"
          style={{ marginTop: HOME_BLOCK_GAP_LG, marginBottom: 8 }}>
          <View className="min-w-0 flex-1">
            <HomeSectionTitle
              title="Today's check-in"
              subtitle="Tap a card to log or open Progress."
            />
          </View>
          <Pressable onPress={() => navigateTo('Progress')} hitSlop={8}>
            <Text
              className="font-sans-medium text-slate"
              style={{ fontSize: 14 }}>
              See trends
            </Text>
          </Pressable>
        </View>

        <View style={{ marginBottom: HOME_BLOCK_GAP_LG }}>
          <TodayCheckInGrid>
            <StatCarouselCard
              gridCell
              icon="streak"
              filled={streak > 0}
              title="Streak"
              value={streak === 0 ? '0 days' : `${streak} day${streak === 1 ? '' : 's'}`}
              hint="Active days in a row"
              onPress={() => navigateTo('Progress')}
            />
            <StatCarouselCard
              gridCell
              icon="workout"
              filled={workoutDone}
              title="Workout"
              value={workoutDone ? 'Complete' : 'Pending'}
              hint="Today's session"
              onPress={() => navigateTo('Log')}
            />
            <StatCarouselCard
              gridCell
              icon="meals"
              filled={mealsDone}
              title="Meals"
              value={mealsDone ? 'On plan' : 'Pending'}
              hint="Followed today"
              onPress={() => navigateTo('Log')}
            />
            <StatCarouselCard
              gridCell
              icon="week"
              filled={weekPct >= 50}
              title="7-day"
              value={`${weekPct}%`}
              hint="Weekly adherence"
              onPress={() => navigateTo('Progress')}
            />
          </TodayCheckInGrid>
        </View>

        <View style={{ marginTop: HOME_BLOCK_GAP, marginBottom: 8 }}>
          <HomeSectionTitle
            title="Habits at a glance"
            subtitle="Real check-in rates from your Log — tap for Progress."
          />
        </View>
        <View
          className={`flex-row gap-3 ${isTablet ? 'max-w-md' : ''}`}
          style={{ marginBottom: HOME_BLOCK_GAP_LG }}>
          <MetricTile
            title="Active days"
            value={`${stats?.activeDays7 ?? 0}/7`}
            hint="Check-ins this week"
            progress={(stats?.activeDays7 ?? 0) / 7}
            onPress={() => navigateTo('Progress')}
          />
          <MetricTile
            title="30-day"
            value={`${stats ? Math.round(stats.rate30 * 100) : 0}%`}
            hint="Adherence over a month"
            progress={stats?.rate30 ?? 0}
            onPress={() => navigateTo('Progress')}
          />
        </View>

        {workoutDay && todaySlice ? (
          <View style={{ marginTop: HOME_BLOCK_GAP_LG, marginBottom: 4 }}>
            <TodayWorkoutCard
              focus={workoutDay.focus}
              dayLabel={todaySlice.planDayLabel ?? workoutDay.day}
              exercises={workoutDay.exercises}
              onViewPlan={() => navigateTo('Plan')}
              onLogWorkout={() => navigateTo('Log')}
              onStartGuidedWorkout={() =>
                navigation.navigate('WorkoutSession', {
                  dayIndex: todaySlice.workoutIndex,
                })
              }
            />
          </View>
        ) : latest ? (
          <View
            className="mb-4 border border-ink/10 bg-sage/25 px-5 py-5"
            style={{ marginTop: HOME_BLOCK_GAP_LG, borderRadius: 22 }}>
            <Text className="font-sans-semibold text-lg text-ink">
              Today&apos;s workout
            </Text>
            <Text className="mt-2 font-sans text-sm leading-5 text-slate">
              Open Plan to view today&apos;s session from your program.
            </Text>
            <Pressable
              onPress={() => navigateTo('Plan')}
              className="mt-4 self-start rounded-full bg-ink px-4 py-2.5">
              <Text className="font-sans-semibold text-sm text-mint">View plan</Text>
            </Pressable>
          </View>
        ) : (
          <EmptyState
            title="No plan yet"
            subtitle="Generate your first workout and meal plan in Plan forge."
            actionLabel="Generate plan"
            onAction={openGeneratePlan}
          />
        )}

        {latest && todaySlice ? (
          <View style={{ marginTop: HOME_BLOCK_GAP_LG }}>
            <TodayMealsCard
              mealDay={todaySlice.mealDay}
              dayLabel={todaySlice.mealDay.day}
              onPressViewPlan={() => navigateTo('Plan')}
            />
          </View>
        ) : latest ? (
          <View
            className="mb-4 border border-ink/10 bg-mint/15 px-5 py-5"
            style={{ marginTop: HOME_BLOCK_GAP_LG, borderRadius: 22 }}>
            <Text className="font-sans-semibold text-lg text-ink">
              Today&apos;s meals
            </Text>
            <Text className="mt-2 font-sans text-sm leading-5 text-slate">
              Meal rotation is on the Plan tab.
            </Text>
            <Pressable
              onPress={() => navigateTo('Plan')}
              className="mt-4 self-start rounded-full bg-ink px-4 py-2.5">
              <Text className="font-sans-semibold text-sm text-mint">View meals</Text>
            </Pressable>
          </View>
        ) : null}

        {latest ? (
          <View style={{ marginTop: HOME_BLOCK_GAP_LG }}>
            <NutritionTargets plan={latest} />
          </View>
        ) : null}

        {stats?.dayStrip7?.length ? (
          <View style={{ marginTop: HOME_BLOCK_GAP_LG }}>
            <WeekStripWidget days={stats.dayStrip7} title="Week pulse" />
          </View>
        ) : null}
      </ScrollView>
    </Screen>
  );
}
