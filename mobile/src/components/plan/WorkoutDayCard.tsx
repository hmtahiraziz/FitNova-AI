import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { GlassSurface } from '../ui/GlassSurface';
import { useResponsive } from '../../hooks/useResponsive';
import { colors, fonts } from '../../theme/tokens';
import { WorkoutExerciseRow } from './WorkoutExerciseRow';

const CARD_RADIUS = 24;

type WorkoutDay = {
  day: string;
  focus: string;
  exercises: Array<{
    name: string;
    sets: number;
    reps: string;
    notes?: string;
  }>;
};

type WorkoutDayCardProps = {
  day: WorkoutDay;
  /** Display label e.g. rotation position 1..N */
  displayDayNumber: number;
  isToday?: boolean;
  collapsible?: boolean;
  defaultExpanded?: boolean;
  onStartWorkout?: () => void;
};

export function WorkoutDayCard({
  day,
  displayDayNumber,
  isToday = false,
  collapsible = false,
  defaultExpanded = true,
  onStartWorkout,
}: WorkoutDayCardProps) {
  const { isCompact } = useResponsive();
  const [expanded, setExpanded] = useState(defaultExpanded);
  const showExercises = !collapsible || expanded;
  const lastExerciseIndex = day.exercises.length - 1;

  const toggleExpanded = () => {
    if (collapsible) {
      setExpanded((v) => !v);
    }
  };

  return (
    <GlassSurface
      className="w-full self-stretch overflow-hidden px-0 py-0"
      style={{ borderRadius: CARD_RADIUS }}>
      <Pressable
        accessibilityRole={collapsible ? 'button' : undefined}
        accessibilityState={{ expanded: showExercises }}
        onPress={collapsible ? toggleExpanded : undefined}
        disabled={!collapsible}>
        <View className="min-w-0 bg-ink px-5 py-4">
          <View className="flex-row items-center justify-between gap-2">
            <Text className="font-sans-medium text-xs uppercase tracking-wide text-mint">
              Day {displayDayNumber}
            </Text>
            {isToday ? (
              <View className="rounded-full bg-mint px-2.5 py-1">
                <Text
                  className="font-sans-semibold text-ink"
                  style={{ fontSize: 11, lineHeight: 14 }}>
                  Today
                </Text>
              </View>
            ) : null}
            {collapsible ? (
              <Text className="font-sans-semibold text-sm text-sage">
                {showExercises ? '−' : '+'}
              </Text>
            ) : null}
          </View>
          <Text
            style={{
              fontFamily: fonts.display,
              fontSize: isCompact ? 22 : 26,
              lineHeight: isCompact ? 30 : 34,
              color: colors.mist,
              marginTop: 4,
            }}
            numberOfLines={2}>
            {day.focus}
          </Text>
          <Text className="mt-1 font-sans text-sm leading-5 text-sage">
            {day.day} · {day.exercises.length} exercises
          </Text>
        </View>
      </Pressable>

      {showExercises ? (
        <View className="min-w-0 px-5 pb-5 pt-4">
          <Text
            className="mb-3 font-sans-medium text-slate"
            style={{ fontSize: 12, letterSpacing: 0.5 }}>
            EXERCISE STEPS
          </Text>
          {day.exercises.map((ex, index) => (
            <WorkoutExerciseRow
              key={`${day.day}-${ex.name}-${index}`}
              {...ex}
              stepNumber={index + 1}
              isLast={index === lastExerciseIndex}
            />
          ))}
          {onStartWorkout ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Start guided workout"
              onPress={onStartWorkout}
              className="mt-2 items-center rounded-full bg-ink py-3.5">
              <Text className="font-sans-semibold text-base text-mint">
                Start workout
              </Text>
            </Pressable>
          ) : null}
        </View>
      ) : (
        <Pressable
          onPress={toggleExpanded}
          className="px-5 py-3"
          accessibilityRole="button">
          <Text className="font-sans-medium text-sm text-slate">
            Tap to view {day.exercises.length} exercises
          </Text>
        </Pressable>
      )}
    </GlassSurface>
  );
}
