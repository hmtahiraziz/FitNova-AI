import React from 'react';
import { Platform, Pressable, Text, View } from 'react-native';
import type { Plan } from '../../api/plans';
import { useResponsive } from '../../hooks/useResponsive';
import { GlassSurface } from '../ui/GlassSurface';
import { colors, fonts } from '../../theme/tokens';

type Exercise = Plan['content']['workoutPlan']['days'][number]['exercises'][number];

type TodayWorkoutCardProps = {
  focus: string;
  dayLabel: string;
  exercises: Exercise[];
  onViewPlan?: () => void;
  onLogWorkout?: () => void;
  onStartGuidedWorkout?: () => void;
};

const RADIUS = 24;
const SP = { sm: 8, md: 12, lg: 16, xl: 20 } as const;

export function TodayWorkoutCard({
  focus,
  dayLabel,
  exercises,
  onViewPlan,
  onLogWorkout,
  onStartGuidedWorkout,
}: TodayWorkoutCardProps) {
  const { isCompact } = useResponsive();
  const preview = exercises.slice(0, 3);
  const more = exercises.length - preview.length;
  const focusFont = isCompact ? 20 : 24;
  const focusLine = isCompact ? 28 : 32;

  return (
    <GlassSurface
      className="min-w-0"
      style={{ borderRadius: RADIUS }}>
      {/* Header */}
      <View style={{ paddingHorizontal: SP.xl, paddingTop: SP.xl, paddingBottom: SP.md }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: SP.md,
            minHeight: 40,
          }}>
          <Text
            style={{
              flex: 1,
              minWidth: 0,
              fontFamily: fonts.sansSemiBold,
              fontSize: 20,
              lineHeight: 26,
              color: colors.ink,
            }}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.88}>
            Today&apos;s workout
          </Text>
          {onViewPlan ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="View workout plan"
              onPress={onViewPlan}
              hitSlop={10}
              style={{
                flexShrink: 0,
                borderRadius: 999,
                borderWidth: 1,
                borderColor: colors.glassBorder,
                backgroundColor: colors.mist,
                paddingHorizontal: 14,
                paddingVertical: 8,
              }}>
              <Text
                style={{
                  fontFamily: fonts.sansSemiBold,
                  fontSize: 12,
                  lineHeight: 16,
                  color: colors.ink,
                }}>
                View plan
              </Text>
            </Pressable>
          ) : null}
        </View>
        <Text
          style={{
            marginTop: SP.sm,
            fontFamily: fonts.sans,
            fontSize: 14,
            lineHeight: 20,
            color: colors.slate,
          }}
          numberOfLines={2}>
          {dayLabel} · {exercises.length} exercise{exercises.length === 1 ? '' : 's'}
        </Text>
      </View>

      {/* Focus hero — matches Plan workout day cards */}
      <View
        style={{
          backgroundColor: colors.ink,
          paddingHorizontal: SP.xl,
          paddingVertical: SP.lg,
        }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: SP.md,
          }}>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text
              style={{
                fontFamily: fonts.sansMedium,
                fontSize: 11,
                letterSpacing: 0.8,
                color: colors.mint,
                textTransform: 'uppercase',
              }}>
              Today&apos;s focus
            </Text>
            <Text
              numberOfLines={3}
              style={{
                fontFamily: fonts.display,
                fontSize: focusFont,
                lineHeight: focusLine,
                color: colors.mist,
                marginTop: 6,
                ...(Platform.OS === 'android'
                  ? { includeFontPadding: true, paddingBottom: 4 }
                  : {}),
              }}>
              {focus}
            </Text>
          </View>
          <View
            style={{
              width: 52,
              height: 52,
              borderRadius: 26,
              borderWidth: 1,
              borderColor: `${colors.mint}55`,
              backgroundColor: `${colors.mint}18`,
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
            <Text
              style={{
                fontFamily: fonts.display,
                fontSize: 22,
                lineHeight: 26,
                color: colors.mist,
              }}>
              {exercises.length}
            </Text>
            <Text
              style={{
                fontFamily: fonts.sansMedium,
                fontSize: 9,
                lineHeight: 12,
                color: colors.sage,
                marginTop: -2,
              }}>
              moves
            </Text>
          </View>
        </View>
      </View>

      {/* Exercise list */}
      <View style={{ paddingHorizontal: SP.xl, paddingTop: SP.lg, paddingBottom: SP.xl }}>
        <View
          style={{
            borderRadius: 16,
            backgroundColor: colors.mistLight,
            paddingHorizontal: SP.md,
            paddingVertical: SP.md,
            gap: SP.sm,
          }}>
          <Text
            style={{
              paddingHorizontal: 4,
              fontFamily: fonts.sansMedium,
              fontSize: 11,
              letterSpacing: 0.5,
              color: colors.slate,
            }}>
            UP NEXT
          </Text>
          {preview.map((ex, index) => (
            <View
              key={`${ex.name}-${index}`}
              style={{
                flexDirection: 'row',
                alignItems: 'flex-start',
                gap: SP.md,
                paddingHorizontal: 4,
                paddingVertical: 6,
              }}>
              <View
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: colors.mint,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <Text
                  style={{
                    fontFamily: fonts.sansSemiBold,
                    fontSize: 14,
                    lineHeight: 18,
                    color: colors.ink,
                  }}>
                  {index + 1}
                </Text>
              </View>
              <View style={{ flex: 1, minWidth: 0, paddingTop: 2 }}>
                <Text
                  style={{
                    fontFamily: fonts.sansSemiBold,
                    fontSize: 15,
                    lineHeight: 21,
                    color: colors.ink,
                  }}
                  numberOfLines={2}>
                  {ex.name}
                </Text>
                <Text
                  style={{
                    marginTop: 2,
                    fontFamily: fonts.sans,
                    fontSize: 13,
                    lineHeight: 18,
                    color: colors.slate,
                  }}
                  numberOfLines={1}>
                  {ex.sets} sets · {ex.reps}
                </Text>
              </View>
            </View>
          ))}
          {more > 0 ? (
            <Text
              style={{
                paddingHorizontal: 4,
                fontFamily: fonts.sans,
                fontSize: 13,
                lineHeight: 18,
                color: colors.slate,
              }}>
              +{more} more in your plan
            </Text>
          ) : null}
        </View>

        <View style={{ marginTop: SP.xl, gap: SP.md }}>
          {onStartGuidedWorkout ? (
            <Pressable
              accessibilityRole="button"
              onPress={onStartGuidedWorkout}
              style={{
                alignItems: 'center',
                borderRadius: 999,
                borderWidth: 1,
                borderColor: `${colors.ink}18`,
                backgroundColor: colors.mist,
                paddingVertical: 14,
              }}>
              <Text
                style={{
                  fontFamily: fonts.sansSemiBold,
                  fontSize: 16,
                  lineHeight: 22,
                  color: colors.ink,
                }}>
                Start guided workout
              </Text>
            </Pressable>
          ) : null}
          {onLogWorkout ? (
            <Pressable
              accessibilityRole="button"
              onPress={onLogWorkout}
              style={{
                alignItems: 'center',
                borderRadius: 999,
                backgroundColor: colors.ink,
                paddingVertical: 14,
              }}>
              <Text
                style={{
                  fontFamily: fonts.sansSemiBold,
                  fontSize: 16,
                  lineHeight: 22,
                  color: colors.mist,
                }}>
                Log workout
              </Text>
            </Pressable>
          ) : null}
        </View>
      </View>
    </GlassSurface>
  );
}
