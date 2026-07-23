import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useFocusEffect } from '@react-navigation/native';
import {
  EmptyState,
  ErrorBanner,
  Screen,
  TabScreenHeader,
} from '../../components/ui';
import { StreakWidget } from '../../components/home/StreakWidget';
import { HistoryRow } from '../../components/progress/AdherenceWidget';
import {
  ActivityMix,
  AdherenceChart,
  RateMeter,
  WeightSparkline,
  buildWeightPoints,
} from '../../components/progress/Charts';
import { useProgressStore } from '../../store/progressStore';
import { useResponsive } from '../../hooks/useResponsive';
import { colors } from '../../theme/tokens';
import { TAB_SCROLL_CONTENT_EXTRA } from '../../lib/tabBarLayout';

export function ProgressScreen() {
  const stats = useProgressStore((s) => s.stats);
  const logs = useProgressStore((s) => s.logs);
  const loading = useProgressStore((s) => s.loading);
  const error = useProgressStore((s) => s.error);
  const refresh = useProgressStore((s) => s.refresh);
  const { isTablet } = useResponsive();
  const [refreshing, setRefreshing] = useState(false);
  const pulse = useSharedValue(1);

  const streakStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  const weightPoints = useMemo(() => buildWeightPoints(logs), [logs]);

  useFocusEffect(
    useCallback(() => {
      void refresh().then(() => {
        pulse.value = withSequence(
          withTiming(1.04, { duration: 200 }),
          withTiming(1, { duration: 280 }),
        );
      });
    }, [refresh, pulse]),
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  const streak = stats?.currentStreak ?? 0;
  const hasHistory = logs.length > 0;
  const streakSubtitle =
    streak === 1
      ? `day${stats && stats.longestStreak > 0 ? ` · best ${stats.longestStreak}` : ''}`
      : `${streak === 0 ? 'Log today to begin' : 'days'}${
          stats && stats.longestStreak > 0
            ? ` · best ${stats.longestStreak}`
            : ''
        }`;

  return (
    <Screen>
      <ScrollView
        nestedScrollEnabled
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={{ paddingBottom: TAB_SCROLL_CONTENT_EXTRA }}
        showsVerticalScrollIndicator={false}>
        <TabScreenHeader
          title="Progress"
          titleDescenderSafe
          subtitle="Trends from your daily check-ins — streak, adherence, weight."
        />

        {error ? (
          <ErrorBanner message={error} onRetry={() => void refresh()} />
        ) : null}

        {loading && !stats ? (
          <ActivityIndicator className="mt-8" color={colors.mint} />
        ) : null}

        <View className={isTablet ? 'flex-row gap-4' : undefined}>
          <View className={isTablet ? 'flex-1' : undefined}>
            <StreakWidget
              streak={streak}
              subtitle={streakSubtitle}
              animatedStyle={streakStyle as ViewStyle}
              compact={isTablet}
            />
          </View>
          {stats && isTablet ? (
            <View className="flex-1 justify-center">
              <Text className="font-sans text-base leading-6 text-slate">
                {stats.activeDays7}/7 days active this week. Keep the mint
                streak going with a quick Log check-in.
              </Text>
            </View>
          ) : null}
        </View>

        {stats ? (
          <>
            <AdherenceChart
              days={stats.dayStrip7}
              rate7={stats.rate7}
              activeDays7={stats.activeDays7}
            />
            <View className="mb-5 flex-row gap-3">
              <RateMeter
                label="7 days"
                rate={stats.rate7}
                detail={`${stats.activeDays7}/7 active`}
              />
              <RateMeter
                label="30 days"
                rate={stats.rate30}
                detail={`${stats.activeDays30}/30 active`}
              />
            </View>
          </>
        ) : null}

        <WeightSparkline points={weightPoints} />

        {hasHistory ? <ActivityMix logs={logs} /> : null}

        {!hasHistory && !loading ? (
          <EmptyState
            title="No logs yet"
            subtitle="Open Log and check in for today. Charts fill in as you track."
          />
        ) : (
          <View>
            <Text className="mb-1 font-sans-semibold text-lg text-ink">
              Recent history
            </Text>
            {logs.map((log) => (
              <HistoryRow key={log.id} log={log} />
            ))}
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}
