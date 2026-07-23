import React from 'react';
import { Text, View } from 'react-native';
import { GlassSurface } from '../ui/GlassSurface';

type PlanSummaryBlockProps = {
  title: string;
  children: React.ReactNode;
};

export function PlanSummaryBlock({ title, children }: PlanSummaryBlockProps) {
  return (
    <GlassSurface
      className="w-full min-w-0 self-stretch px-5 py-4"
      style={{ borderRadius: 24 }}>
      <Text className="font-sans-semibold text-base leading-5 text-ink">{title}</Text>
      <View className="mt-3 min-w-0 gap-2">{children}</View>
    </GlassSurface>
  );
}

type PlanSummaryLineProps = {
  children: React.ReactNode;
};

export function PlanSummaryLine({ children }: PlanSummaryLineProps) {
  return (
    <Text
      className="min-w-0 font-sans text-sm leading-5 text-slate"
      numberOfLines={4}>
      {children}
    </Text>
  );
}

type WorkoutDaySummaryLineProps = {
  dayLabel: string;
  focus: string;
  exerciseCount: number;
};

export function WorkoutDaySummaryLine({
  dayLabel,
  focus,
  exerciseCount,
}: WorkoutDaySummaryLineProps) {
  return (
    <View className="min-w-0 gap-1">
      <Text className="font-sans-semibold text-sm leading-5 text-ink">{dayLabel}</Text>
      <Text className="min-w-0 font-sans text-sm leading-5 text-slate" numberOfLines={2}>
        {focus}
      </Text>
      <Text className="font-sans text-xs tabular-nums leading-4 text-slate">
        {exerciseCount} exercises
      </Text>
    </View>
  );
}
