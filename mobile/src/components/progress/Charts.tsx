import React, { useEffect } from 'react';
import { Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import type { DayStripItem } from '../../api/progress';
import { GlassSurface } from '../ui/GlassSurface';
import { colors, fonts } from '../../theme/tokens';
import { useAppSettingsStore } from '../../store/appSettingsStore';
import {
  formatWeightAxisKg,
  formatWeightDeltaKg,
} from '../../lib/units';

function weekdayLabel(date: string): string {
  const [y, m, d] = date.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, {
    weekday: 'narrow',
  });
}

function toneFromRate(rate: number): {
  label: string;
  bg: string;
} {
  if (rate >= 0.7) {
    return { label: 'Strong', bg: `${colors.mint}44` };
  }
  if (rate >= 0.35) {
    return { label: 'Building', bg: `${colors.sage}66` };
  }
  if (rate > 0) {
    return { label: 'Started', bg: `${colors.sage}44` };
  }
  return { label: 'Open', bg: `${colors.sage}33` };
}

function StatusChip({ label, bg }: { label: string; bg: string }) {
  return (
    <View
      style={{
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 999,
        backgroundColor: bg,
      }}>
      <Text
        style={{
          fontFamily: fonts.sansSemiBold,
          fontSize: 10,
          lineHeight: 13,
          color: colors.ink,
        }}>
        {label}
      </Text>
    </View>
  );
}

function AnimatedBar({
  active,
  index,
  maxHeight = 72,
}: {
  active: boolean;
  index: number;
  maxHeight?: number;
}) {
  const height = useSharedValue(4);
  const target = active ? maxHeight : maxHeight * 0.22;

  useEffect(() => {
    height.value = withDelay(
      index * 45,
      withTiming(target, { duration: 420 }),
    );
  }, [height, index, target]);

  const style = useAnimatedStyle(() => ({
    height: height.value,
  }));

  return (
    <View className="flex-1 items-center justify-end" style={{ height: maxHeight }}>
      <Animated.View
        style={[
          {
            width: '70%',
            maxWidth: 28,
            borderRadius: 8,
            backgroundColor: active ? colors.mint : colors.sage,
            opacity: active ? 1 : 0.4,
          },
          style,
        ]}
      />
    </View>
  );
}

type AdherenceChartProps = {
  days: DayStripItem[];
  rate7: number;
  activeDays7: number;
};

export function AdherenceChart({
  days,
  rate7,
  activeDays7,
}: AdherenceChartProps) {
  const pct = Math.round(rate7 * 100);
  const tone = toneFromRate(rate7);
  const emptyWeek = activeDays7 === 0;

  return (
    <GlassSurface className="mb-4 px-5 py-4" style={{ borderRadius: 22 }}>
      <View className="mb-3 flex-row items-start justify-between gap-2">
        <View className="min-w-0 flex-1">
          <Text
            style={{
              fontFamily: fonts.sansSemiBold,
              fontSize: 16,
              lineHeight: 22,
              color: colors.ink,
            }}>
            Weekly adherence
          </Text>
          <Text
            style={{
              marginTop: 2,
              fontFamily: fonts.sans,
              fontSize: 13,
              lineHeight: 18,
              color: colors.slate,
            }}>
            {emptyWeek
              ? 'No active days yet — log today to light a bar.'
              : `${activeDays7}/7 active days this week`}
          </Text>
        </View>
        <View className="items-end gap-1.5">
          <Text
            style={{
              fontFamily: fonts.sansSemiBold,
              fontSize: 28,
              lineHeight: 34,
              color: emptyWeek ? colors.slate : colors.ink,
              fontVariant: ['tabular-nums'],
            }}>
            {pct}%
          </Text>
          <StatusChip label={tone.label} bg={tone.bg} />
        </View>
      </View>
      <View className="mt-1 h-20 flex-row items-end gap-1.5">
        {days.map((day, i) => (
          <View key={day.date} className="flex-1 items-center">
            <AnimatedBar active={day.active} index={i} />
            <Text
              style={{
                marginTop: 8,
                fontFamily: fonts.sans,
                fontSize: 10,
                lineHeight: 12,
                color: colors.slate,
              }}>
              {weekdayLabel(day.date)}
            </Text>
          </View>
        ))}
      </View>
    </GlassSurface>
  );
}

type RateRingProps = {
  label: string;
  rate: number;
  detail: string;
};

export function RateMeter({ label, rate, detail }: RateRingProps) {
  const pct = Math.round(rate * 100);
  const tone = toneFromRate(rate);
  const fill = useSharedValue(0);

  useEffect(() => {
    fill.value = withTiming(pct, { duration: 500 });
  }, [fill, pct]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${Math.min(100, fill.value)}%`,
  }));

  return (
    <GlassSurface className="flex-1 px-4 py-3.5" style={{ borderRadius: 20 }}>
      <View className="flex-row items-center justify-between gap-2">
        <Text
          numberOfLines={1}
          style={{
            flex: 1,
            fontFamily: fonts.sansMedium,
            fontSize: 11,
            lineHeight: 14,
            letterSpacing: 0.5,
            color: colors.slate,
          }}>
          {label.toUpperCase()}
        </Text>
        <StatusChip label={tone.label} bg={tone.bg} />
      </View>
      <Text
        style={{
          marginTop: 8,
          fontFamily: fonts.sansSemiBold,
          fontSize: 28,
          lineHeight: 34,
          color: colors.ink,
          fontVariant: ['tabular-nums'],
        }}>
        {pct}%
      </Text>
      <View className="mt-3 h-2 overflow-hidden rounded-full bg-sage/40">
        <Animated.View
          className="h-full rounded-full bg-mint"
          style={fillStyle}
        />
      </View>
      <Text
        style={{
          marginTop: 8,
          fontFamily: fonts.sans,
          fontSize: 12,
          lineHeight: 16,
          color: colors.slate,
        }}>
        {detail}
      </Text>
    </GlassSurface>
  );
}

type ActivityMixProps = {
  logs: Array<{ workoutDone: boolean; mealsFollowed: boolean }>;
};

export function ActivityMix({ logs }: ActivityMixProps) {
  const workouts = logs.filter((l) => l.workoutDone).length;
  const meals = logs.filter((l) => l.mealsFollowed).length;
  const total = Math.max(workouts + meals, 1);
  const wPct = Math.round((workouts / total) * 100);
  const mPct = 100 - wPct;
  const empty = workouts === 0 && meals === 0;

  return (
    <GlassSurface className="mb-4 px-5 py-4" style={{ borderRadius: 22 }}>
      <View className="mb-1 flex-row items-center justify-between gap-2">
        <Text
          style={{
            fontFamily: fonts.sansSemiBold,
            fontSize: 16,
            lineHeight: 22,
            color: colors.ink,
          }}>
          Activity mix
        </Text>
        <StatusChip
          label={empty ? 'Open' : workouts >= meals ? 'Training' : 'Nutrition'}
          bg={empty ? `${colors.sage}33` : `${colors.mint}33`}
        />
      </View>
      <Text
        style={{
          fontFamily: fonts.sans,
          fontSize: 13,
          lineHeight: 18,
          color: colors.slate,
        }}>
        {empty
          ? 'Mark workout or meals in Log to see the split.'
          : 'From your recent check-ins'}
      </Text>
      <View className="mt-4 h-3 flex-row overflow-hidden rounded-full bg-sage/30">
        {empty ? null : (
          <>
            <View className="h-full bg-mint" style={{ width: `${wPct}%` }} />
            <View className="h-full bg-sage" style={{ width: `${mPct}%` }} />
          </>
        )}
      </View>
      <View className="mt-3 flex-row justify-between">
        <Text
          style={{
            fontFamily: fonts.sansMedium,
            fontSize: 13,
            color: colors.ink,
          }}>
          Workouts · {workouts}
        </Text>
        <Text
          style={{
            fontFamily: fonts.sansMedium,
            fontSize: 13,
            color: colors.ink,
          }}>
          Meals · {meals}
        </Text>
      </View>
    </GlassSurface>
  );
}

type WeightPoint = { date: string; weightKg: number };

type WeightSparklineProps = {
  points: WeightPoint[];
};

export function WeightSparkline({ points }: WeightSparklineProps) {
  const weightUnit = useAppSettingsStore((s) => s.weightUnit);
  const needed = 3;
  const have = points.length;

  if (have < needed) {
    const remaining = needed - have;
    const fillPct = Math.round((have / needed) * 100);
    return (
      <GlassSurface className="mb-4 px-5 py-4" style={{ borderRadius: 22 }}>
        <View className="mb-2 flex-row items-center justify-between gap-2">
          <Text
            style={{
              fontFamily: fonts.sansSemiBold,
              fontSize: 16,
              lineHeight: 22,
              color: colors.ink,
            }}>
            Weight trend
          </Text>
          <StatusChip
            label={`${have}/${needed}`}
            bg={have > 0 ? `${colors.sage}66` : `${colors.sage}33`}
          />
        </View>
        <Text
          style={{
            fontFamily: fonts.sans,
            fontSize: 13,
            lineHeight: 18,
            color: colors.slate,
          }}>
          {have === 0
            ? 'Add weight on Log to start a trend. Need 3 days.'
            : `${remaining} more weight log${remaining === 1 ? '' : 's'} to unlock the sparkline.`}
        </Text>
        <View className="mt-4 h-2 overflow-hidden rounded-full bg-sage/40">
          <View
            className="h-full rounded-full bg-mint"
            style={{ width: `${fillPct}%` }}
          />
        </View>
      </GlassSurface>
    );
  }

  const weights = points.map((p) => p.weightKg);
  const min = Math.min(...weights);
  const max = Math.max(...weights);
  const span = Math.max(max - min, 0.5);
  const chartH = 88;
  const delta = weights[weights.length - 1]! - weights[0]!;

  return (
    <GlassSurface className="mb-4 px-5 py-4" style={{ borderRadius: 22 }}>
      <View className="mb-3 flex-row items-end justify-between gap-2">
        <View className="min-w-0 flex-1">
          <Text
            style={{
              fontFamily: fonts.sansSemiBold,
              fontSize: 16,
              lineHeight: 22,
              color: colors.ink,
            }}>
            Weight trend
          </Text>
          <Text
            style={{
              marginTop: 2,
              fontFamily: fonts.sans,
              fontSize: 13,
              lineHeight: 18,
              color: colors.slate,
            }}>
            {points.length} logged points
          </Text>
        </View>
        <Text
          style={{
            fontFamily: fonts.sansSemiBold,
            fontSize: 14,
            lineHeight: 20,
            color: delta <= 0 ? colors.ink : colors.slate,
            fontVariant: ['tabular-nums'],
          }}>
          {formatWeightDeltaKg(delta, weightUnit)}
        </Text>
      </View>
      <View
        className="flex-row items-end justify-between"
        style={{ height: chartH }}>
        {points.map((p, i) => {
          const norm = (p.weightKg - min) / span;
          const h = 12 + norm * (chartH - 16);
          return (
            <View key={`${p.date}-${i}`} className="flex-1 items-center">
              <View
                style={{
                  width: 6,
                  height: h,
                  borderRadius: 3,
                  backgroundColor: colors.mint,
                  opacity: 0.35 + norm * 0.65,
                }}
              />
            </View>
          );
        })}
      </View>
      <View className="mt-2 flex-row justify-between">
        <Text className="font-sans tabular-nums text-xs text-slate">
          {formatWeightAxisKg(min, weightUnit)}
        </Text>
        <Text className="font-sans tabular-nums text-xs text-slate">
          {formatWeightAxisKg(max, weightUnit)}
        </Text>
      </View>
    </GlassSurface>
  );
}

export function buildWeightPoints(
  logs: Array<{ date: string; weightKg: number | null }>,
): WeightPoint[] {
  return logs
    .filter((l): l is { date: string; weightKg: number } => l.weightKg != null)
    .map((l) => ({ date: l.date, weightKg: l.weightKg }))
    .sort((a, b) => (a.date < b.date ? -1 : 1));
}
