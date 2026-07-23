import React from 'react';
import { Text, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated from 'react-native-reanimated';
import { GlassSurface } from '../ui/GlassSurface';

type StreakWidgetProps = {
  streak: number;
  subtitle?: string;
  animatedStyle?: StyleProp<ViewStyle>;
  compact?: boolean;
};

export function StreakWidget({
  streak,
  subtitle,
  animatedStyle,
  compact = false,
}: StreakWidgetProps) {
  const line =
    subtitle ??
    (streak === 0
      ? 'Log today to start a streak.'
      : streak === 1
        ? 'day active'
        : 'days active');

  const weekGoal = 7;
  const barPct = Math.min(100, Math.round((streak / weekGoal) * 100));

  return (
    <GlassSurface className={`mb-5 ${compact ? 'px-4 py-3' : 'px-4 py-3'}`}>
      <Text className="font-sans-medium text-xs uppercase tracking-wide text-slate">
        Streak
      </Text>
      <Animated.View style={animatedStyle}>
        <Text className="mt-1 font-display text-3xl tabular-nums text-ink">
          {streak}
        </Text>
      </Animated.View>
      <View className="mt-3 h-1.5 overflow-hidden rounded-full bg-sage/40">
        <View
          className="h-full rounded-full bg-mint"
          style={{ width: `${barPct}%` }}
        />
      </View>
      <Text className="mt-2 font-sans text-xs text-slate">{line}</Text>
    </GlassSurface>
  );
}

type WeekStripWidgetProps = {
  days: Array<{ date: string; active: boolean }>;
  title?: string;
};

function weekdayLabel(date: string): string {
  const [y, m, d] = date.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, {
    weekday: 'narrow',
  });
}

export function WeekStripWidget({
  days,
  title = 'This week',
}: WeekStripWidgetProps) {
  if (!days.length) {
    return null;
  }

  return (
    <View className="mb-5">
      <Text className="mb-3 font-sans-semibold text-ink">{title}</Text>
      <View className="flex-row justify-between">
        {days.map((day) => (
          <View key={day.date} className="items-center">
            <View
              className={`mb-2 h-11 w-9 rounded-xl ${
                day.active ? 'bg-mint' : 'border border-sage/80'
              }`}
            />
            <Text className="font-sans text-xs text-slate">
              {weekdayLabel(day.date)}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}
