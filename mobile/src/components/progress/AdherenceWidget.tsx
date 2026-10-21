import React from 'react';
import { Text, View } from 'react-native';
import type { ProgressLog } from '../../api/progress';
import type { ProgressStats } from '../../api/progress';
import { GlassSurface } from '../ui/GlassSurface';
import { WeekStripWidget } from '../home/StreakWidget';
import { formatWeightAxisKg } from '../../lib/units';
import { useAppSettingsStore } from '../../store/appSettingsStore';
import { colors, fonts } from '../../theme/tokens';

type AdherenceWidgetProps = {
  stats: ProgressStats;
};

export function AdherenceWidget({ stats }: AdherenceWidgetProps) {
  const rate7 = Math.round(stats.rate7 * 100);
  const rate30 = Math.round(stats.rate30 * 100);

  return (
    <View className="mb-6">
      <WeekStripWidget days={stats.dayStrip7} title="Last 7 days" />
      <View className="mt-2 flex-row gap-3">
        <GlassSurface className="flex-1 px-4 py-3">
          <Text className="font-sans-medium text-xs uppercase tracking-wide text-slate">
            This week
          </Text>
          <Text className="mt-1 font-display text-3xl tabular-nums text-ink">
            {rate7}%
          </Text>
          <View className="mt-3 h-1.5 overflow-hidden rounded-full bg-sage/40">
            <View
              className="h-full rounded-full bg-mint"
              style={{ width: `${Math.min(100, rate7)}%` }}
            />
          </View>
          <Text className="mt-2 font-sans text-xs text-slate">
            {stats.activeDays7}/7 active days
          </Text>
        </GlassSurface>
        <GlassSurface className="flex-1 px-4 py-3">
          <Text className="font-sans-medium text-xs uppercase tracking-wide text-slate">
            30 days
          </Text>
          <Text className="mt-1 font-display text-3xl tabular-nums text-ink">
            {rate30}%
          </Text>
          <View className="mt-3 h-1.5 overflow-hidden rounded-full bg-sage/40">
            <View
              className="h-full rounded-full bg-mint"
              style={{ width: `${Math.min(100, rate30)}%` }}
            />
          </View>
          <Text className="mt-2 font-sans text-xs text-slate">
            {stats.activeDays30}/30 active
          </Text>
        </GlassSurface>
      </View>
    </View>
  );
}

function formatDayLabel(date: string): string {
  const [y, m, d] = date.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  return dt.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

export function HistoryRow({ log }: { log: ProgressLog }) {
  const weightUnit = useAppSettingsStore((s) => s.weightUnit);
  const active = log.workoutDone || log.mealsFollowed;

  return (
    <GlassSurface
      className="mb-2.5 px-4 py-3.5"
      style={{
        borderRadius: 18,
        borderColor: active ? `${colors.mint}55` : colors.glassBorder,
      }}>
      <View className="flex-row items-baseline justify-between gap-2">
        <Text
          style={{
            flex: 1,
            minWidth: 0,
            fontFamily: fonts.sansSemiBold,
            fontSize: 15,
            lineHeight: 20,
            color: colors.ink,
          }}>
          {formatDayLabel(log.date)}
        </Text>
        {log.weightKg != null ? (
          <Text
            style={{
              fontFamily: fonts.sansMedium,
              fontSize: 13,
              lineHeight: 18,
              color: colors.slate,
              fontVariant: ['tabular-nums'],
            }}>
            {formatWeightAxisKg(log.weightKg, weightUnit)}
          </Text>
        ) : null}
      </View>
      <View className="mt-2.5 flex-row flex-wrap gap-2">
        <View
          style={{
            borderRadius: 999,
            paddingHorizontal: 10,
            paddingVertical: 4,
            backgroundColor: log.workoutDone
              ? `${colors.mint}33`
              : `${colors.sage}33`,
            borderWidth: log.workoutDone ? 0 : 1,
            borderColor: `${colors.sage}88`,
          }}>
          <Text
            style={{
              fontFamily: fonts.sansMedium,
              fontSize: 11,
              lineHeight: 14,
              color: colors.ink,
            }}>
            {log.workoutDone ? 'Workout' : 'No workout'}
          </Text>
        </View>
        <View
          style={{
            borderRadius: 999,
            paddingHorizontal: 10,
            paddingVertical: 4,
            backgroundColor: log.mealsFollowed
              ? `${colors.mint}33`
              : `${colors.sage}33`,
            borderWidth: log.mealsFollowed ? 0 : 1,
            borderColor: `${colors.sage}88`,
          }}>
          <Text
            style={{
              fontFamily: fonts.sansMedium,
              fontSize: 11,
              lineHeight: 14,
              color: colors.ink,
            }}>
            {log.mealsFollowed ? 'Meals' : 'Meals off'}
          </Text>
        </View>
        {!active ? (
          <View
            style={{
              borderRadius: 999,
              paddingHorizontal: 10,
              paddingVertical: 4,
              backgroundColor: `${colors.sage}22`,
            }}>
            <Text
              style={{
                fontFamily: fonts.sansMedium,
                fontSize: 11,
                lineHeight: 14,
                color: colors.slate,
              }}>
              Inactive
            </Text>
          </View>
        ) : null}
      </View>
      {log.notes ? (
        <Text
          style={{
            marginTop: 10,
            fontFamily: fonts.sans,
            fontSize: 13,
            lineHeight: 18,
            color: colors.slate,
          }}>
          {log.notes}
        </Text>
      ) : null}
    </GlassSurface>
  );
}
