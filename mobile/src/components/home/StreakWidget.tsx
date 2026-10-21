import React from 'react';
import { Text, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated from 'react-native-reanimated';
import { GlassSurface } from '../ui/GlassSurface';
import { colors, fonts } from '../../theme/tokens';

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
        <Text
          style={{
            marginTop: 4,
            fontFamily: fonts.sansSemiBold,
            fontSize: 32,
            lineHeight: 38,
            color: colors.ink,
            fontVariant: ['tabular-nums'],
          }}>
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

function isTodayDate(date: string): boolean {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return date === `${y}-${m}-${d}`;
}

export function WeekStripWidget({
  days,
  title = 'This week',
}: WeekStripWidgetProps) {
  if (!days.length) {
    return null;
  }

  const activeCount = days.filter((d) => d.active).length;

  return (
    <GlassSurface
      className="mb-2 px-4 py-4"
      style={{ borderRadius: 22 }}>
      <View className="mb-3 flex-row items-end justify-between gap-2">
        <View className="min-w-0 flex-1">
          <Text
            style={{
              fontFamily: fonts.sansSemiBold,
              fontSize: 16,
              lineHeight: 22,
              color: colors.ink,
            }}>
            {title}
          </Text>
          <Text
            style={{
              marginTop: 2,
              fontFamily: fonts.sans,
              fontSize: 12,
              lineHeight: 16,
              color: colors.slate,
            }}>
            {activeCount} of {days.length} days active
          </Text>
        </View>
        <View
          style={{
            paddingHorizontal: 8,
            paddingVertical: 3,
            borderRadius: 999,
            backgroundColor:
              activeCount >= 5
                ? `${colors.mint}44`
                : activeCount > 0
                  ? `${colors.sage}55`
                  : `${colors.sage}33`,
          }}>
          <Text
            style={{
              fontFamily: fonts.sansSemiBold,
              fontSize: 10,
              lineHeight: 13,
              color: colors.ink,
            }}>
            {activeCount >= 5
              ? 'On track'
              : activeCount > 0
                ? 'Building'
                : 'Start'}
          </Text>
        </View>
      </View>

      <View className="flex-row justify-between gap-1.5">
        {days.map((day) => {
          const today = isTodayDate(day.date);
          return (
            <View key={day.date} className="min-w-0 flex-1 items-center">
              <View
                style={{
                  width: '100%',
                  maxWidth: 40,
                  height: 44,
                  borderRadius: 12,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: day.active ? colors.mint : colors.mistLight,
                  borderWidth: today ? 2 : day.active ? 0 : 1,
                  borderColor: today
                    ? colors.ink
                    : day.active
                      ? 'transparent'
                      : `${colors.sage}99`,
                }}>
                {day.active ? (
                  <Text
                    style={{
                      fontFamily: fonts.sansSemiBold,
                      fontSize: 12,
                      color: colors.ink,
                    }}>
                    ✓
                  </Text>
                ) : (
                  <View
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: 3,
                      backgroundColor: `${colors.sage}AA`,
                    }}
                  />
                )}
              </View>
              <Text
                style={{
                  marginTop: 6,
                  fontFamily: today ? fonts.sansSemiBold : fonts.sans,
                  fontSize: 11,
                  lineHeight: 14,
                  color: today ? colors.ink : colors.slate,
                }}>
                {weekdayLabel(day.date)}
              </Text>
            </View>
          );
        })}
      </View>
    </GlassSurface>
  );
}
