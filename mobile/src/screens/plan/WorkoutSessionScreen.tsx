import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Platform, Pressable, ScrollView, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SessionExerciseTimeline } from '../../components/plan/SessionExerciseTimeline';
import { EmptyState, Screen, StackScreenHeader } from '../../components/ui';
import { GlassSurface } from '../../components/ui/GlassSurface';
import { formatExerciseDoseLine } from '../../lib/exerciseDose';
import { usePlanStore } from '../../store/planStore';
import { colors, fonts } from '../../theme/tokens';
import type { RootStackParamList } from '../../navigation/types';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Props = NativeStackScreenProps<RootStackParamList, 'WorkoutSession'>;

export function WorkoutSessionScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);
  const timelineY = useRef(0);
  const latest = usePlanStore((s) => s.latest);
  const getPlanById = usePlanStore((s) => s.getPlanById);
  const { dayIndex, planId } = route.params;

  const plan = useMemo(
    () => (planId ? getPlanById(planId) : latest),
    [getPlanById, latest, planId],
  );

  const day = plan?.content.workoutPlan.days[dayIndex];
  const exercises = day?.exercises ?? [];
  const [step, setStep] = useState(0);

  const current = exercises[step];
  const total = exercises.length;
  const isLast = step >= total - 1;
  const progress = total > 0 ? (step + 1) / total : 0;

  useEffect(() => {
    if (step < 2) {
      return;
    }
    scrollRef.current?.scrollTo({
      y: Math.max(0, timelineY.current - 24),
      animated: true,
    });
  }, [step]);

  if (!plan || !day || total === 0 || !current) {
    return (
      <Screen tabBarInset={false}>
        <StackScreenHeader title="Workout" onBack={() => navigation.goBack()} />
        <EmptyState title="Session unavailable" subtitle="This workout day could not be loaded." />
      </Screen>
    );
  }

  const footerPad = Math.max(insets.bottom, 16);

  return (
    <Screen tabBarInset={false} edges={['top', 'left', 'right']}>
      <View className="min-h-0 flex-1">
        <ScrollView
          ref={scrollRef}
          className="flex-1"
          contentContainerStyle={{ paddingBottom: footerPad + 100 }}
          showsVerticalScrollIndicator={false}>
          <StackScreenHeader
            title={day.focus}
            subtitle={`Step ${step + 1} of ${total} · ${day.day}`}
            onBack={() => navigation.goBack()}
          />

          <View
            className="mb-6 h-2 overflow-hidden rounded-full"
            style={{ backgroundColor: `${colors.sage}55` }}>
            <View
              style={{
                width: `${Math.round(progress * 100)}%`,
                height: '100%',
                backgroundColor: colors.mint,
                borderRadius: 999,
              }}
            />
          </View>

          <GlassSurface
            className="min-w-0 px-5 py-6"
            style={{ borderRadius: 24 }}>
            <Text
              style={{
                fontFamily: fonts.sansMedium,
                fontSize: 12,
                letterSpacing: 0.6,
                color: colors.slate,
              }}>
              EXERCISE {step + 1} OF {total}
            </Text>
            <Text
              numberOfLines={3}
              style={{
                fontFamily: fonts.display,
                fontSize: 28,
                lineHeight: Platform.OS === 'android' ? 38 : 36,
                color: colors.ink,
                marginTop: 8,
                ...(Platform.OS === 'android'
                  ? { includeFontPadding: true, paddingBottom: 4 }
                  : {}),
              }}>
              {current.name}
            </Text>
            <View
              className="mt-4 self-start rounded-full px-4 py-2"
              style={{ backgroundColor: `${colors.mint}44` }}>
              <Text
                style={{
                  fontFamily: fonts.sansSemiBold,
                  fontSize: 16,
                  lineHeight: 22,
                  color: colors.ink,
                }}>
                {formatExerciseDoseLine(current.sets, current.reps)}
              </Text>
            </View>
            {current.notes ? (
              <Text
                style={{
                  marginTop: 16,
                  fontFamily: fonts.sans,
                  fontSize: 15,
                  lineHeight: 24,
                  color: colors.slate,
                }}>
                {current.notes}
              </Text>
            ) : (
              <Text
                style={{
                  marginTop: 16,
                  fontFamily: fonts.sans,
                  fontSize: 14,
                  lineHeight: 22,
                  color: colors.slate,
                }}>
                Complete all sets with controlled form. Rest 60–90 seconds between sets
                unless your plan notes say otherwise.
              </Text>
            )}
          </GlassSurface>

          <View
            className="mt-6"
            onLayout={(e) => {
              timelineY.current = e.nativeEvent.layout.y;
            }}>
            <Text
              className="mb-3 font-sans-semibold text-ink"
              style={{ fontSize: 16, lineHeight: 22 }}>
              Session overview
            </Text>
            <SessionExerciseTimeline
              exercises={exercises}
              activeIndex={step}
              onSelectStep={setStep}
            />
          </View>
        </ScrollView>

        <View
          className="flex-row gap-3 border-t border-ink/10 px-1 pt-4"
          style={{
            backgroundColor: colors.mistLight,
            paddingBottom: footerPad,
          }}>
          <Pressable
            accessibilityRole="button"
            disabled={step === 0}
            onPress={() => setStep((s) => Math.max(0, s - 1))}
            className={`flex-1 items-center rounded-2xl border border-ink/15 py-3.5 ${
              step === 0 ? 'opacity-40' : ''
            }`}>
            <Text className="font-sans-semibold text-base text-ink">Previous</Text>
          </Pressable>
          {isLast ? (
            <Pressable
              accessibilityRole="button"
              onPress={() => navigation.goBack()}
              className="flex-1 items-center rounded-2xl bg-ink py-3.5">
              <Text className="font-sans-semibold text-base text-mint">Finish</Text>
            </Pressable>
          ) : (
            <Pressable
              accessibilityRole="button"
              onPress={() => setStep((s) => Math.min(total - 1, s + 1))}
              className="flex-1 items-center rounded-2xl bg-ink py-3.5">
              <Text className="font-sans-semibold text-base text-mint">Next exercise</Text>
            </Pressable>
          )}
        </View>
      </View>
    </Screen>
  );
}
