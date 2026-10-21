import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import {
  EmptyState,
  ErrorBanner,
  GlassSurface,
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
import { useAppTabs } from '../../navigation/AppTabContext';
import { createFocusFetchGate } from '../../lib/tabFocus';
import { colors, fonts } from '../../theme/tokens';
import { TAB_SCROLL_CONTENT_EXTRA } from '../../lib/tabBarLayout';

export function ProgressScreen() {
  const stats = useProgressStore((s) => s.stats);
  const logs = useProgressStore((s) => s.logs);
  const loading = useProgressStore((s) => s.loading);
  const error = useProgressStore((s) => s.error);
  const refresh = useProgressStore((s) => s.refresh);
  const { navigateTo } = useAppTabs();
  const { isTablet } = useResponsive();
  const [refreshing, setRefreshing] = useState(false);
  const allowFocusFetch = useRef(createFocusFetchGate()).current;

  const weightPoints = useMemo(() => buildWeightPoints(logs), [logs]);

  useFocusEffect(
    useCallback(() => {
      if (allowFocusFetch.tryAcquire()) {
        void refresh();
      }
    }, [allowFocusFetch, refresh]),
  );

  const onRefresh = async () => {
    setRefreshing(true);
    allowFocusFetch.mark();
    await refresh();
    setRefreshing(false);
  };

  const streak = stats?.currentStreak ?? 0;
  const hasHistory = logs.length > 0;
  const initialLoading = loading && !stats && !hasHistory;
  const streakSubtitle =
    streak === 1
      ? `day${stats && stats.longestStreak > 0 ? ` · best ${stats.longestStreak}` : ''}`
      : `${streak === 0 ? 'Log today to begin' : 'days'}${
          stats && stats.longestStreak > 0
            ? ` · best ${stats.longestStreak}`
            : ''
        }`;

  const summaryTone =
    !stats || stats.activeDays7 === 0
      ? { label: 'Start logging', bg: `${colors.sage}33` }
      : stats.rate7 >= 0.7
        ? { label: 'On track', bg: `${colors.mint}44` }
        : stats.rate7 >= 0.35
          ? { label: 'Building', bg: `${colors.sage}66` }
          : { label: 'Keep going', bg: `${colors.sage}44` };

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
          subtitle="Live trends from your Log check-ins."
        />

        {error ? (
          <ErrorBanner message={error} onRetry={() => void refresh()} />
        ) : null}

        {initialLoading ? (
          <GlassSurface className="mb-4 items-center px-5 py-10" style={{ borderRadius: 22 }}>
            <ActivityIndicator color={colors.mint} />
            <Text
              style={{
                marginTop: 12,
                fontFamily: fonts.sansMedium,
                fontSize: 14,
                lineHeight: 20,
                color: colors.slate,
              }}>
              Loading your trends…
            </Text>
          </GlassSurface>
        ) : null}

        {!initialLoading ? (
          <GlassSurface
            className="mb-4 px-4 py-3.5"
            style={{ borderRadius: 20 }}>
            <View className="flex-row items-center justify-between gap-2">
              <View className="min-w-0 flex-1">
                <Text
                  style={{
                    fontFamily: fonts.sansMedium,
                    fontSize: 11,
                    lineHeight: 14,
                    letterSpacing: 0.5,
                    color: colors.slate,
                  }}>
                  THIS WEEK
                </Text>
                <Text
                  style={{
                    marginTop: 4,
                    fontFamily: fonts.sans,
                    fontSize: 14,
                    lineHeight: 20,
                    color: colors.ink,
                  }}>
                  {stats
                    ? `${stats.activeDays7}/7 active · streak ${streak}`
                    : 'Pull to refresh your stats'}
                </Text>
              </View>
              <View
                style={{
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                  borderRadius: 999,
                  backgroundColor: summaryTone.bg,
                }}>
                <Text
                  style={{
                    fontFamily: fonts.sansSemiBold,
                    fontSize: 11,
                    lineHeight: 14,
                    color: colors.ink,
                  }}>
                  {summaryTone.label}
                </Text>
              </View>
            </View>
          </GlassSurface>
        ) : null}

        <View className={isTablet ? 'flex-row gap-4' : undefined}>
          <View className={isTablet ? 'flex-1' : undefined}>
            <StreakWidget
              streak={streak}
              subtitle={streakSubtitle}
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
            <View className="mb-4 flex-row gap-3">
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
          <GlassSurface className="mb-2 px-5 py-2" style={{ borderRadius: 22 }}>
            <EmptyState
              title="No check-ins yet"
              subtitle="Log a workout or meals today. Streak, charts, and history fill in from real logs."
              actionLabel="Open Log"
              onAction={() => navigateTo('Log')}
            />
          </GlassSurface>
        ) : hasHistory ? (
          <View className="mb-2">
            <View className="mb-3 flex-row items-end justify-between gap-2">
              <Text
                style={{
                  fontFamily: fonts.sansSemiBold,
                  fontSize: 16,
                  lineHeight: 22,
                  color: colors.ink,
                }}>
                Recent history
              </Text>
              <Text
                style={{
                  fontFamily: fonts.sans,
                  fontSize: 12,
                  lineHeight: 16,
                  color: colors.slate,
                }}>
                {logs.length} day{logs.length === 1 ? '' : 's'}
              </Text>
            </View>
            {logs.map((log) => (
              <HistoryRow key={log.id} log={log} />
            ))}
          </View>
        ) : null}
      </ScrollView>
    </Screen>
  );
}
