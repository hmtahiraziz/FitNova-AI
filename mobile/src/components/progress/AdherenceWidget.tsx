import React from 'react';
import { Text, View } from 'react-native';
import type { ProgressLog } from '../../api/progress';
import type { ProgressStats } from '../../api/progress';
import { GlassSurface } from '../ui/GlassSurface';
import { WeekStripWidget } from '../home/StreakWidget';
import { formatWeightAxisKg } from '../../lib/units';
import { useAppSettingsStore } from '../../store/appSettingsStore';

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
  const bits = [
    log.workoutDone ? 'Workout' : null,
    log.mealsFollowed ? 'Meals' : null,
  ].filter(Boolean);

  return (
    <View className="border-b border-sage/40 py-3.5">
      <View className="flex-row items-baseline justify-between">
        <Text className="font-sans-medium text-base text-ink">
          {formatDayLabel(log.date)}
        </Text>
        {log.weightKg != null ? (
          <Text className="font-sans tabular-nums text-sm text-slate">
            {formatWeightAxisKg(log.weightKg, weightUnit)}
          </Text>
        ) : null}
      </View>
      <View className="mt-2 flex-row gap-2">
        <View
          className={`rounded-lg px-2.5 py-1 ${
            log.workoutDone ? 'bg-mint/25' : 'border border-sage/60'
          }`}>
          <Text className="font-sans text-xs text-ink">
            {log.workoutDone ? 'Workout' : 'No workout'}
          </Text>
        </View>
        <View
          className={`rounded-lg px-2.5 py-1 ${
            log.mealsFollowed ? 'bg-mint/25' : 'border border-sage/60'
          }`}>
          <Text className="font-sans text-xs text-ink">
            {log.mealsFollowed ? 'Meals' : 'Meals off'}
          </Text>
        </View>
      </View>
      {log.notes ? (
        <Text className="mt-2 font-sans text-sm text-slate">{log.notes}</Text>
      ) : null}
      {bits.length === 0 ? (
        <Text className="mt-1 font-sans text-sm text-slate">
          Logged, inactive day
        </Text>
      ) : null}
    </View>
  );
}
