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
      className="min-w-0 px-5 py-6"
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
              {dayStrip7.map((day) => {
                const [y, m, d] = day.date.split('-').map(Number);
                const label = new Date(y, m - 1, d).toLocaleDateString(
                  undefined,
                  { weekday: 'narrow' },
                );
                return (
                  <View key={day.date} className="min-w-0 flex-1 items-center gap-1.5">
                    <View
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: 5,
                        backgroundColor: day.active ? colors.mint : colors.sage,
                        opacity: day.active ? 1 : 0.35,
                      }}
                    />
                    <Text
                      style={{
                        fontFamily: fonts.sans,
                        fontSize: 10,
                        lineHeight: 12,
                        color: colors.slate,
                      }}>
                      {label}
                    </Text>
                  </View>
                );
              })}
            </View>
          ) : (
            <View className="mt-5 flex-row gap-1.5">
              {Array.from({ length: 7 }).map((_, i) => (
                <View
                  key={i}
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: 5,
                    backgroundColor: colors.sage,
                    opacity: 0.25,
                  }}
                />
              ))}
            </View>
          )}
          <Text className="mt-2 font-sans-medium text-slate" style={{ fontSize: 12 }}>
            Last 7 days · live from your logs
          </Text>
        </View>
      </View>
    </GlassSurface>
  );
}

const CHECK_IN_CARD_MIN_HEIGHT = 108;
const CHECK_IN_GRID_GAP = 10;

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
            alignItems: 'stretch',
            gap: CHECK_IN_GRID_GAP,
          }}>
          {row.map((cell, colIndex) => (
            <View key={colIndex} style={{ flex: 1, minWidth: 0 }}>
              {cell}
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}

/**
 * Home check-in tile — equal-height glass cards, clear status chip.
 */
export function StatCarouselCard({
  title,
  value,
  hint,
  icon,
  filled = false,
  primaryAction: _primaryAction = false,
  onPress,
  style,
  gridCell = false,
}: {
  title: string;
  value: string;
  hint?: string;
  icon?: CheckInIconKind;
  filled?: boolean;
  /** @deprecated Kept for call-site compatibility; no longer changes chrome. */
  primaryAction?: boolean;
  onPress?: () => void;
  style?: object;
  gridCell?: boolean;
}) {
  void _primaryAction;
  const iconColor = filled ? colors.ink : colors.slate;
  const statusLabel = filled ? 'Done' : 'Open';

  const surfaceStyle = {
    borderRadius: HOME_CARD_RADIUS,
    minHeight: CHECK_IN_CARD_MIN_HEIGHT,
    width: gridCell ? ('100%' as const) : undefined,
    flex: 1,
    overflow: 'visible' as const,
    borderWidth: 1,
    borderColor: filled ? `${colors.mint}66` : colors.glassBorder,
    backgroundColor: colors.glass,
    ...(Platform.OS === 'ios'
      ? {
          shadowColor: colors.ink,
          shadowOpacity: filled ? 0.06 : 0.03,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 2 },
        }
      : { elevation: filled ? 2 : 1 }),
  };

  const inner = (
    <View
      style={{
        flex: 1,
        minWidth: 0,
        paddingTop: 12,
        paddingBottom: 12,
        paddingRight: 14,
        paddingLeft: filled ? 16 : 14,
        justifyContent: 'space-between',
      }}>
      {filled ? (
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            left: 0,
            top: 10,
            bottom: 10,
            width: 3,
            borderRadius: 2,
            backgroundColor: colors.mint,
          }}
        />
      ) : null}

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 8,
          minWidth: 0,
        }}>
        <Text
          style={{
            flex: 1,
            minWidth: 0,
            fontFamily: fonts.sansMedium,
            fontSize: 11,
            lineHeight: 14,
            letterSpacing: 0.6,
            color: colors.slate,
          }}
          numberOfLines={1}>
          {title.toUpperCase()}
        </Text>
        {icon ? (
          <View
            style={{
              width: 28,
              height: 28,
              borderRadius: 14,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: filled ? `${colors.mint}33` : `${colors.sage}44`,
            }}>
            <CheckInIcon kind={icon} size={14} color={iconColor} />
          </View>
        ) : null}
      </View>

      <Text
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.78}
        style={{
          marginTop: 10,
          fontFamily: fonts.sansSemiBold,
          fontSize: 20,
          lineHeight: 26,
          letterSpacing: -0.3,
          color: colors.ink,
          fontVariant: ['tabular-nums'],
        }}>
        {value}
      </Text>

      <View
        style={{
          marginTop: 10,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 8,
          minWidth: 0,
        }}>
        {hint ? (
          <Text
            numberOfLines={1}
            style={{
              flex: 1,
              minWidth: 0,
              fontFamily: fonts.sans,
              fontSize: 11,
              lineHeight: 14,
              color: colors.slate,
            }}>
            {hint}
          </Text>
        ) : (
          <View style={{ flex: 1 }} />
        )}
        <View
          style={{
            paddingHorizontal: 8,
            paddingVertical: 3,
            borderRadius: 999,
            backgroundColor: filled ? `${colors.mint}44` : `${colors.sage}55`,
          }}>
          <Text
            style={{
              fontFamily: fonts.sansSemiBold,
              fontSize: 10,
              lineHeight: 13,
              color: colors.ink,
            }}>
            {statusLabel}
          </Text>
        </View>
      </View>
    </View>
  );

  if (onPress) {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ selected: filled }}
        accessibilityLabel={`${title}: ${value}. ${statusLabel}. ${hint ?? ''}`}
        onPress={onPress}
        style={({ pressed }) => [
          surfaceStyle,
          style,
          pressed ? { opacity: 0.9, transform: [{ scale: 0.985 }] } : null,
        ]}>
        {inner}
      </Pressable>
    );
  }

  return (
    <GlassSurface className="min-w-0" style={[surfaceStyle, style]}>
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
      className="mb-5 w-full min-w-0 self-stretch"
      style={{ borderRadius: 28 }}>
      <View
        className="min-w-0 bg-ink/90 px-5 pb-5 pt-6"
        style={{ borderRadius: 27 }}>
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
  onPress,
}: {
  title: string;
  value: string;
  hint: string;
  /** 0–1 fill for gradient progress bar */
  progress?: number;
  onPress?: () => void;
}) {
  const pct = Math.max(0, Math.min(1, progress));
  const pctLabel = Math.round(pct * 100);
  const tone =
    pct >= 0.7 ? 'strong' : pct >= 0.35 ? 'building' : pct > 0 ? 'warm' : 'idle';
  const toneLabel =
    tone === 'strong'
      ? 'Strong'
      : tone === 'building'
        ? 'Building'
        : tone === 'warm'
          ? 'Started'
          : 'Open';
  const toneBg =
    tone === 'strong'
      ? `${colors.mint}44`
      : tone === 'building'
        ? `${colors.sage}66`
        : tone === 'warm'
          ? `${colors.sage}44`
          : `${colors.sage}33`;
  const barColors: [string, string] =
    tone === 'strong'
      ? [colors.mint, `${colors.mint}CC`]
      : tone === 'building'
        ? [`${colors.mint}99`, colors.mint]
        : [colors.sage, `${colors.mint}88`];

  const body = (
    <View style={{ minWidth: 0, flex: 1, paddingHorizontal: 14, paddingVertical: 14 }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 8,
        }}>
        <Text
          numberOfLines={1}
          style={{
            flex: 1,
            minWidth: 0,
            fontFamily: fonts.sansMedium,
            fontSize: 11,
            lineHeight: 14,
            letterSpacing: 0.6,
            color: colors.slate,
          }}>
          {title.toUpperCase()}
        </Text>
        <View
          style={{
            paddingHorizontal: 8,
            paddingVertical: 3,
            borderRadius: 999,
            backgroundColor: toneBg,
          }}>
          <Text
            style={{
              fontFamily: fonts.sansSemiBold,
              fontSize: 10,
              lineHeight: 13,
              color: colors.ink,
            }}>
            {toneLabel}
          </Text>
        </View>
      </View>

      <Text
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.8}
        style={{
          marginTop: 10,
          fontFamily: fonts.sansSemiBold,
          fontSize: 26,
          lineHeight: 32,
          letterSpacing: -0.4,
          color: colors.ink,
          fontVariant: ['tabular-nums'],
        }}>
        {value}
      </Text>

      <Text
        numberOfLines={1}
        style={{
          marginTop: 4,
          fontFamily: fonts.sans,
          fontSize: 12,
          lineHeight: 16,
          color: colors.slate,
        }}>
        {hint}
      </Text>

      <View
        style={{
          marginTop: 14,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
        }}>
        <View
          style={{
            flex: 1,
            height: 8,
            borderRadius: 999,
            backgroundColor: `${colors.sage}55`,
            overflow: 'hidden',
          }}>
          <LinearGradient
            colors={barColors}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={{
              width: `${Math.max(pct > 0 ? 6 : 0, pctLabel)}%`,
              height: '100%',
              borderRadius: 999,
            }}
          />
        </View>
        <Text
          style={{
            fontFamily: fonts.sansSemiBold,
            fontSize: 11,
            lineHeight: 14,
            color: colors.slate,
            fontVariant: ['tabular-nums'],
            minWidth: 32,
            textAlign: 'right',
          }}>
          {pctLabel}%
        </Text>
      </View>
    </View>
  );

  if (onPress) {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${title}: ${value}. ${hint}. ${toneLabel}`}
        onPress={onPress}
        style={({ pressed }) => [
          {
            flex: 1,
            minWidth: 0,
            borderRadius: HOME_CARD_RADIUS,
            borderWidth: 1,
            borderColor:
              tone === 'strong' ? `${colors.mint}66` : colors.glassBorder,
            backgroundColor: colors.glass,
            overflow: 'visible',
          },
          pressed ? { opacity: 0.92 } : null,
        ]}>
        {body}
      </Pressable>
    );
  }

  return (
    <GlassSurface
      elevated
      className="min-w-0 flex-1"
      style={{ borderRadius: HOME_CARD_RADIUS }}>
      {body}
    </GlassSurface>
  );
}
