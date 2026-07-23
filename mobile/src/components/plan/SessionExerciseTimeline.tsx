import React from 'react';
import { Pressable, Text, View } from 'react-native';
import type { PlanExercise } from '../../api/plans';
import { GlassSurface } from '../ui/GlassSurface';
import { colors, fonts } from '../../theme/tokens';

type SessionExerciseTimelineProps = {
  exercises: PlanExercise[];
  activeIndex: number;
  onSelectStep?: (index: number) => void;
};

function TimelineItem({
  exercise,
  stepNumber,
  isActive,
  isComplete,
  onPress,
}: {
  exercise: PlanExercise;
  stepNumber: number;
  isActive: boolean;
  isComplete: boolean;
  onPress?: () => void;
}) {
  const nameColor = isActive ? colors.ink : isComplete ? colors.slate : colors.slate;
  const nameWeight = isActive ? fonts.sansSemiBold : fonts.sansMedium;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: isActive }}
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [
        {
          flexDirection: 'row',
          alignItems: 'flex-start',
          gap: 12,
          paddingVertical: 10,
          paddingHorizontal: 12,
          borderRadius: 12,
          backgroundColor: isActive ? colors.mistLight : 'transparent',
          borderLeftWidth: isActive ? 3 : 0,
          borderLeftColor: isActive ? colors.mint : 'transparent',
          opacity: pressed && onPress ? 0.92 : isComplete && !isActive ? 0.72 : 1,
        },
      ]}>
      <View
        style={{
          width: 28,
          height: 28,
          borderRadius: 14,
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: 1,
          backgroundColor: isActive ? colors.mint : 'transparent',
          borderWidth: isActive ? 0 : 1,
          borderColor: isComplete ? `${colors.sage}99` : `${colors.sage}66`,
        }}>
        {isComplete && !isActive ? (
          <Text style={{ fontSize: 12, color: colors.slate }}>✓</Text>
        ) : (
          <Text
            style={{
              fontFamily: fonts.sansSemiBold,
              fontSize: 13,
              lineHeight: 16,
              color: isActive ? colors.ink : colors.slate,
            }}>
            {stepNumber}
          </Text>
        )}
      </View>
      <View style={{ flex: 1, minWidth: 0, paddingTop: 2 }}>
        <Text
          numberOfLines={2}
          style={{
            fontFamily: nameWeight,
            fontSize: 15,
            lineHeight: 21,
            color: nameColor,
          }}>
          {exercise.name}
        </Text>
        <Text
          numberOfLines={1}
          style={{
            marginTop: 2,
            fontFamily: fonts.sans,
            fontSize: 13,
            lineHeight: 18,
            color: colors.slate,
          }}>
          {exercise.sets} sets · {exercise.reps}
        </Text>
      </View>
    </Pressable>
  );
}

/** Compact session timeline — one row per exercise, clear active state (no stacked mint layers). */
export function SessionExerciseTimeline({
  exercises,
  activeIndex,
  onSelectStep,
}: SessionExerciseTimelineProps) {
  return (
    <GlassSurface
      className="min-w-0 overflow-hidden"
      style={{ borderRadius: 20, paddingHorizontal: 8, paddingVertical: 8 }}>
      <Text
        style={{
          paddingHorizontal: 8,
          paddingBottom: 8,
          fontFamily: fonts.sansMedium,
          fontSize: 11,
          letterSpacing: 0.6,
          color: colors.slate,
        }}>
        FULL SESSION
      </Text>
      <View style={{ gap: 4 }}>
        {exercises.map((exercise, index) => (
          <TimelineItem
            key={`${exercise.name}-${index}`}
            exercise={exercise}
            stepNumber={index + 1}
            isActive={index === activeIndex}
            isComplete={index < activeIndex}
            onPress={onSelectStep ? () => onSelectStep(index) : undefined}
          />
        ))}
      </View>
    </GlassSurface>
  );
}
