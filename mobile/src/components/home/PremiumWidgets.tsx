import React, { useEffect, useMemo } from 'react';
import { Platform, Pressable, Text, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import type { DayStripItem } from '../../api/progress';
import { useResponsive } from '../../hooks/useResponsive';
import { colors, fonts, mistGradient } from '../../theme/tokens';
import { CheckInIcon, type CheckInIconKind } from './CheckInIcons';
import { GlassSurface } from '../ui/GlassSurface';

/** Shared home card radius (8pt grid: 24px). */
export const HOME_CARD_RADIUS = 22;

function quadrantBorderColors(pct: number) {
  return {
    borderTopColor: pct > 0 ? colors.mint : 'transparent',
    borderRightColor: pct > 25 ? colors.mint : 'transparent',
    borderBottomColor: pct > 50 ? colors.mint : 'transparent',
    borderLeftColor: pct > 75 ? colors.mint : 'transparent',
  };
}

function coachContextLine(
  pct: number,
  streak: number,
  longestStreak: number,
  activeDays7: number,
): string {
  if (pct === 0 && streak === 0) {
    return 'Log your first day to begin your streak.';
  }
  if (streak === 0 && activeDays7 === 0) {
    return 'Open Log and check in today — small steps add up.';
  }
  if (longestStreak > streak && streak > 0) {
    const gap = longestStreak - streak;
    return `${gap} day${gap === 1 ? '' : 's'} from your best streak (${longestStreak}).`;
  }
  if (activeDays7 > 0 && activeDays7 < 7) {
    return `${7 - activeDays7} day${7 - activeDays7 === 1 ? '' : 's'} to a full active week.`;
  }
  if (pct >= 70) {
    return 'Strong rhythm — keep today’s log going.';
  }
  return 'Building momentum — consistency beats perfection.';
}

export function CoachScoreRing({
  percent,
  streak = 0,
  longestStreak = 0,
  activeDays7 = 0,
  dayStrip7 = [],
}: {
  percent: number;
  streak?: number;
  longestStreak?: number;
  activeDays7?: number;
  dayStrip7?: DayStripItem[];
}) {
  const { isCompact, isTablet } = useResponsive();
  const pct = Math.max(0, Math.min(100, Math.round(percent)));
  const size = isTablet ? 168 : isCompact ? 140 : 156;
  const stroke = isCompact ? 14 : 16;
  const fill = useSharedValue(0);

  useEffect(() => {
    fill.value = withTiming(pct, { duration: 560 });
  }, [fill, pct]);

  const barStyle = useAnimatedStyle(() => ({
    width: `${Math.min(100, fill.value)}%`,
  }));

  const inner = size - stroke * 2 - 6;
  const quadrants = quadrantBorderColors(pct);
  const contextLine = useMemo(
    () => coachContextLine(pct, streak, longestStreak, activeDays7),
    [pct, streak, longestStreak, activeDays7],
  );
  const statusLabel =
    pct >= 70 ? 'On track' : pct >= 40 ? 'Building' : pct > 0 ? 'Warming up' : 'Getting started';

  return (
    <GlassSurface
      className="min-w-0 overflow-hidden px-5 py-6"
      style={{ borderRadius: HOME_CARD_RADIUS }}>
      <Text
        className="font-sans-medium text-slate"
        style={{ fontSize: 14, lineHeight: 20 }}>
        Coach score
      </Text>
      <Text
        className="mt-1 font-sans text-slate"
        style={{ fontSize: 14, lineHeight: 20 }}>
        Streak and weekly adherence combined
      </Text>

      <View
        className={`mt-5 items-center ${isTablet ? 'flex-row gap-8' : ''}`}
        style={isTablet ? { alignItems: 'center' } : undefined}>
        <View
          style={{
            width: size,
            height: size,
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}>
          <LinearGradient
            colors={[colors.mist, `${colors.mint}55`]}
            start={mistGradient.start}
            end={mistGradient.end}
            style={{
              position: 'absolute',
              width: size,
              height: size,
              borderRadius: size / 2,
              opacity: 0.85,
            }}
          />
          <View
            style={{
              position: 'absolute',
              width: size,
              height: size,
              borderRadius: size / 2,
              borderWidth: stroke,
              borderColor: `${colors.sage}99`,
            }}
          />
          <View
            style={{
              position: 'absolute',
              width: size,
              height: size,
              borderRadius: size / 2,
              borderWidth: stroke,
              borderColor: 'transparent',
              transform: [{ rotate: '-45deg' }],
              ...quadrants,
            }}
          />
          <View
            style={{
              width: inner,
              height: inner,
              borderRadius: inner / 2,
              backgroundColor: colors.mistLight,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <View className="flex-row items-start">
              <Text
                style={{
                  fontFamily: fonts.displayExtraBold,
                  fontSize: isCompact ? 40 : 46,
                  lineHeight: isCompact ? 44 : 50,
                  color: pct === 0 ? colors.slate : colors.ink,
                  ...(Platform.OS === 'android'
                    ? { includeFontPadding: false }
                    : {}),
                }}>
                {pct}
              </Text>
              <Text
                style={{
                  fontFamily: fonts.display,
                  fontSize: isCompact ? 16 : 18,
                  lineHeight: isCompact ? 22 : 24,
                  color: colors.slate,
                  marginTop: isCompact ? 6 : 8,
                  marginLeft: 1,
                }}>
                %
              </Text>
            </View>
            <Text className="mt-1 font-sans-medium text-slate" style={{ fontSize: 12 }}>
              {statusLabel}
            </Text>
          </View>
        </View>

        <View className={isTablet ? 'min-w-0 flex-1' : 'mt-6 w-full min-w-0'}>
          <Text
            className="font-sans text-ink"
            style={{ fontSize: 15, lineHeight: 22 }}>
            {contextLine}
          </Text>
          <View className="mt-5 h-2.5 overflow-hidden rounded-full bg-sage/40">
            <Animated.View
              style={[{ height: '100%', borderRadius: 999, overflow: 'hidden' }, barStyle]}>
              <LinearGradient
                colors={[colors.mist, colors.mint]}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={{ flex: 1, minWidth: 1 }}
              />
            </Animated.View>
          </View>
          {dayStrip7.length > 0 ? (
            <View className="mt-5 flex-row justify-between gap-1">
              {dayStrip7.map((day) => (
                <View key={day.date} className="items-center gap-1">
                  <View
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: day.active ? colors.mint : colors.sage,
                      opacity: day.active ? 1 : 0.35,
                    }}
                  />
                </View>
              ))}
            </View>
          ) : (
            <View className="mt-5 flex-row gap-1.5">
              {Array.from({ length: 7 }).map((_, i) => (
                <View
                  key={i}
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: colors.sage,
                    opacity: 0.25,
                  }}
                />
              ))}
            </View>
          )}
          <Text className="mt-2 font-sans-medium text-slate" style={{ fontSize: 12 }}>
            Last 7 days
          </Text>
        </View>
      </View>
    </GlassSurface>
  );
}

const CHECK_IN_CARD_MIN_HEIGHT = 112;
const CHECK_IN_GRID_GAP = 12;

type TodayCheckInGridProps = {
  children: React.ReactNode;
};

export function TodayCheckInGrid({ children }: TodayCheckInGridProps) {
  const cells = React.Children.toArray(children).slice(0, 4);
  const rows = [cells.slice(0, 2), cells.slice(2, 4)];

  return (
    <View style={{ gap: CHECK_IN_GRID_GAP }}>
      {rows.map((row, rowIndex) => (
        <View
          key={rowIndex}
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            gap: CHECK_IN_GRID_GAP,
          }}>
          {row.map((cell, colIndex) => (
            <View
              key={colIndex}
              style={{ width: '48%', maxWidth: '48%', minWidth: 0 }}>
              {cell}
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}

export function StatCarouselCard({
  title,
  value,
  hint,
  icon,
  filled = false,
  primaryAction = false,
  onPress,
  style,
  gridCell = false,
}: {
  title: string;
  value: string;
  hint?: string;
  icon?: CheckInIconKind;
  filled?: boolean;
  /** Mint accent strip for core today actions when empty. */
  primaryAction?: boolean;
  onPress?: () => void;
  style?: object;
  gridCell?: boolean;
}) {
  const iconColor = filled ? colors.ink : colors.slate;

  const surfaceStyle = gridCell
    ? {
        borderRadius: HOME_CARD_RADIUS,
        minHeight: CHECK_IN_CARD_MIN_HEIGHT,
        borderWidth: 1,
        width: '100%' as const,
        borderStyle: (filled ? 'solid' : 'dashed') as 'solid' | 'dashed',
        borderColor: filled ? colors.glassBorder : `${colors.sage}99`,
        backgroundColor: filled ? colors.glass : 'transparent',
        overflow: 'hidden' as const,
      }
    : {
        borderRadius: HOME_CARD_RADIUS,
        minHeight: CHECK_IN_CARD_MIN_HEIGHT,
        borderWidth: 1,
        flex: 1,
      };

  const inner = (
    <View className="min-w-0 px-4 py-4">
      {filled ? (
        <LinearGradient
          colors={[colors.mist, colors.mistLight]}
          start={mistGradient.start}
          end={mistGradient.end}
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
            opacity: 0.65,
          }}
        />
      ) : null}
      <View className="min-w-0 flex-row items-start justify-between gap-2">
        <View className="min-w-0 flex-1">
          <Text
            className="font-sans-medium text-slate"
            style={{ fontSize: 13, lineHeight: 18, letterSpacing: 0.4 }}>
            {title.toUpperCase()}
          </Text>
          <Text
            className="mt-2 font-display text-2xl tabular-nums text-ink"
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.75}>
            {value}
          </Text>
          {hint ? (
            <Text className="mt-1 font-sans text-xs text-slate" numberOfLines={2}>
              {hint}
            </Text>
          ) : null}
        </View>
        {icon ? (
          <CheckInIcon kind={icon} size={20} color={iconColor} />
        ) : null}
      </View>
      {!filled && primaryAction ? (
        <View
          className="mt-3 rounded-full py-1.5"
          style={{ backgroundColor: `${colors.mint}44` }}>
          <Text className="text-center font-sans-semibold text-[11px] text-ink">
            Tap to log
          </Text>
        </View>
      ) : null}
      {!filled && !primaryAction ? (
        <Text className="mt-3 font-sans text-[11px] text-slate">Tap card</Text>
      ) : null}
    </View>
  );

  if (gridCell && onPress) {
    return (
      <Pressable
        accessibilityRole="button"
        onPress={onPress}
        style={({ pressed }) => [
          surfaceStyle,
          style,
          pressed ? { opacity: 0.92 } : null,
        ]}>
        {inner}
      </Pressable>
    );
  }

  return (
    <GlassSurface
      interactive={Boolean(onPress)}
      onPress={onPress}
      className="min-w-0"
      style={[surfaceStyle, style]}>
      {inner}
    </GlassSurface>
  );
}

export function WorkoutHeroCard({
  title,
  subtitle,
  meta,
  onPress,
  ctaLabel = 'Log workout',
  onCtaPress,
}: {
  title: string;
  subtitle: string;
  meta: string;
  onPress: () => void;
  ctaLabel?: string;
  onCtaPress?: () => void;
}) {
  return (
    <GlassSurface
      interactive
      onPress={onPress}
      className="mb-5 w-full min-w-0 self-stretch overflow-hidden"
      style={{ borderRadius: 28 }}>
      <View className="min-w-0 bg-ink/90 px-5 pb-5 pt-6">
        <Text className="font-sans-medium text-xs uppercase tracking-wide text-mint">
          Today&apos;s workout
        </Text>
        <Text
          className="mt-2 font-display text-2xl leading-tight text-mist"
          numberOfLines={2}>
          {title}
        </Text>
        <Text className="mt-1 font-sans text-base leading-5 text-sage">{subtitle}</Text>
        <View className="mt-5 min-w-0 flex-row flex-wrap items-center gap-3">
          <View className="min-w-0 flex-1 rounded-full border border-mist/20 bg-mist/10 px-3 py-1.5">
            <Text
              className="font-sans-medium text-xs leading-4 text-mist"
              numberOfLines={1}>
              {meta}
            </Text>
          </View>
          {onCtaPress ? (
            <Pressable
              accessibilityRole="button"
              onPress={onCtaPress}
              className="rounded-full bg-mint px-4 py-2.5">
              <Text className="font-sans-semibold text-sm text-ink">{ctaLabel}</Text>
            </Pressable>
          ) : null}
        </View>
      </View>
    </GlassSurface>
  );
}

export function MetricTile({
  title,
  value,
  hint,
  progress = 0,
}: {
  title: string;
  value: string;
  hint: string;
  /** 0–1 fill for gradient progress bar */
  progress?: number;
}) {
  const pct = Math.max(0, Math.min(1, progress));

  return (
    <GlassSurface
      elevated
      className="min-w-0 flex-1 overflow-hidden px-4 py-4"
      style={{
        borderRadius: HOME_CARD_RADIUS,
        shadowColor: colors.ink,
        shadowOpacity: 0.05,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 4 },
        elevation: 2,
      }}>
      <LinearGradient
        colors={[colors.mist, colors.mistLight]}
        start={mistGradient.start}
        end={mistGradient.end}
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 0,
          bottom: 0,
          opacity: 0.7,
        }}
      />
      <Text
        className="font-sans-medium text-slate"
        style={{ fontSize: 13, lineHeight: 18, letterSpacing: 0.4 }}>
        {title.toUpperCase()}
      </Text>
      <Text
        className="mt-2 font-display text-2xl tabular-nums text-ink"
        adjustsFontSizeToFit
        numberOfLines={1}
        minimumFontScale={0.8}>
        {value}
      </Text>
      <Text className="mt-1 font-sans text-slate" style={{ fontSize: 13, lineHeight: 18 }}>
        {hint}
      </Text>
      <View className="mt-3 h-2 overflow-hidden rounded-full bg-sage/40">
        <View style={{ width: `${pct * 100}%`, height: '100%' }}>
          <LinearGradient
            colors={[colors.mist, colors.mint]}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={{ flex: 1 }}
          />
        </View>
      </View>
    </GlassSurface>
  );
}
