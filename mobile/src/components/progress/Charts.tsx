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
import { colors } from '../../theme/tokens';
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
            opacity: active ? 1 : 0.45,
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

  return (
    <GlassSurface className="mb-5 px-5 py-4">
      <View className="mb-3 flex-row items-end justify-between">
        <View>
          <Text className="font-sans-semibold text-lg text-ink">
            Weekly adherence
          </Text>
          <Text className="mt-1 font-sans text-sm text-slate">
            {activeDays7}/7 active days
          </Text>
        </View>
        <Text className="font-display text-3xl tabular-nums text-mint">
          {pct}%
        </Text>
      </View>
      <View className="mt-2 h-20 flex-row items-end gap-1.5">
        {days.map((day, i) => (
          <View key={day.date} className="flex-1 items-center">
            <AnimatedBar active={day.active} index={i} />
            <Text className="mt-2 font-sans text-[10px] text-slate">
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
  const fill = useSharedValue(0);

  useEffect(() => {
    fill.value = withTiming(pct, { duration: 500 });
  }, [fill, pct]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${Math.min(100, fill.value)}%`,
  }));

  return (
    <GlassSurface className="flex-1 px-4 py-3">
      <Text className="font-sans-medium text-xs uppercase tracking-wide text-slate">
        {label}
      </Text>
      <Text className="mt-1 font-display text-3xl tabular-nums text-ink">
        {pct}%
      </Text>
      <View className="mt-3 h-1.5 overflow-hidden rounded-full bg-sage/40">
        <Animated.View
          className="h-full rounded-full bg-mint"
          style={fillStyle}
        />
      </View>
      <Text className="mt-2 font-sans text-xs text-slate">{detail}</Text>
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

  return (
    <GlassSurface className="mb-5 px-5 py-4">
      <Text className="font-sans-semibold text-lg text-ink">Activity mix</Text>
      <Text className="mt-1 font-sans text-sm text-slate">
        From your recent logs
      </Text>
      <View className="mt-4 h-3 flex-row overflow-hidden rounded-full">
        <View
          className="h-full bg-mint"
          style={{ width: `${wPct}%` }}
        />
        <View
          className="h-full bg-sage"
          style={{ width: `${mPct}%` }}
        />
      </View>
      <View className="mt-3 flex-row justify-between">
        <Text className="font-sans text-sm text-ink">
          Workouts · {workouts}
        </Text>
        <Text className="font-sans text-sm text-ink">Meals · {meals}</Text>
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

  if (points.length < 3) {
    return (
      <GlassSurface className="mb-5 px-5 py-4">
        <Text className="font-sans-semibold text-lg text-ink">Weight trend</Text>
        <Text className="mt-2 font-sans text-sm leading-5 text-slate">
          Log weight on 3+ days to unlock a trend sparkline.
        </Text>
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
    <GlassSurface className="mb-5 px-5 py-4">
      <View className="mb-3 flex-row items-end justify-between">
        <View>
          <Text className="font-sans-semibold text-lg text-ink">
            Weight trend
          </Text>
          <Text className="mt-1 font-sans text-sm text-slate">
            {points.length} logged points
          </Text>
        </View>
        <Text
          className={`font-sans-semibold tabular-nums ${
            delta <= 0 ? 'text-mint' : 'text-slate'
          }`}>
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
