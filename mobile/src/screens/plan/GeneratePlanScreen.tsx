import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  PlanSummaryBlock,
  PlanSummaryLine,
  WorkoutDaySummaryLine,
} from '../../components/plan/PlanSummaryBlock';
import {
  RegenerationFocusGrid,
  focusOptionLabel,
} from '../../components/plan/RegenerationFocusGrid';
import { GenerationsQuotaHint } from '../../components/plan/StalePlanBanner';
import {
  EmptyState,
  ErrorBanner,
  PrimaryButton,
  SaveSuccessHint,
  Screen,
  StackScreenHeader,
} from '../../components/ui';
import { GlassSurface } from '../../components/ui/GlassSurface';
import { DISCLAIMER } from '../../constants/disclaimer';
import { useResponsive } from '../../hooks/useResponsive';
import { ApiError } from '../../api/client';
import type { PlanGenerateFocus } from '../../api/plans';
import { usePlanStore } from '../../store/planStore';
import { colors, displayCardStyle, mistGradient } from '../../theme/tokens';
import type { RootStackParamList } from '../../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const FOCUS_OPTIONS: { value: PlanGenerateFocus; label: string }[] = [
  { value: 'balanced', label: 'Balanced' },
  { value: 'meal_variety', label: 'New meals' },
  { value: 'workout_variety', label: 'New workouts' },
  { value: 'lighter_meals', label: 'Lighter meals' },
];

const SUCCESS_MS = 2200;
/** Space between items inside a section (e.g. focus grid). */
const INNER_GAP = 8;
/** Space between major screen sections. */
const SECTION_GAP = 24;

function formatGenerateError(err: unknown): string {
  if (!(err instanceof ApiError)) {
    return err instanceof Error ? err.message : 'Generate failed';
  }
  const details = err.details as { retryAfterSeconds?: number } | undefined;
  if (err.status === 429 && details?.retryAfterSeconds) {
    const mins = Math.max(1, Math.ceil(details.retryAfterSeconds / 60));
    return `${err.message} Try again in about ${mins} min.`;
  }
  return err.message;
}

export function GeneratePlanScreen() {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);
  const { isCompact } = useResponsive();
  const latest = usePlanStore((s) => s.latest);
  const generating = usePlanStore((s) => s.generating);
  const generate = usePlanStore((s) => s.generate);
  const lastGenerateFocus = usePlanStore((s) => s.lastGenerateFocus);
  const generationsRemaining = usePlanStore(
    (s) => s.generationsRemainingThisHour,
  );
  const generationsLimit = usePlanStore((s) => s.generationsLimitPerHour);
  const [error, setError] = useState<string | null>(null);
  const [focus, setFocus] = useState<PlanGenerateFocus>('balanced');
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (!showSuccess) {
      return;
    }
    const t = setTimeout(() => setShowSuccess(false), SUCCESS_MS);
    return () => clearTimeout(t);
  }, [showSuccess]);

  const workoutDays = latest?.content.workoutPlan.days ?? [];
  const mealDays = latest?.content.mealPlan.days ?? [];
  const sampleMeals = mealDays[0]?.meals.slice(0, 2) ?? [];

  const headline = latest ? 'Regenerate plan' : 'Generate plan';
  const subtitle = useMemo(
    () =>
      latest
        ? isCompact
          ? 'Fresh workout and meal plan. Previous plan stays in history.'
          : 'Create a fresh workout and meal plan together. Your previous plan stays in history.'
        : isCompact
          ? 'From your profile and local staples.'
          : 'Build a workout and meal plan from your profile and local staples.',
    [latest, isCompact],
  );

  const appliedFocusLabel =
    lastGenerateFocus != null
      ? focusOptionLabel(lastGenerateFocus, FOCUS_OPTIONS)
      : null;

  const runGenerate = async () => {
    setError(null);
    try {
      await generate({ focus });
      setShowSuccess(true);
      requestAnimationFrame(() => {
        scrollRef.current?.scrollTo({ y: 0, animated: true });
      });
    } catch (err) {
      setError(formatGenerateError(err));
    }
  };

  const onPrimaryPress = () => {
    if (generating) {
      return;
    }
    if (latest) {
      Alert.alert(
        'Regenerate plan?',
        'This replaces your current plan with a new workout and meal rotation. Estimated calories are guidance only—not medical advice.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Regenerate', onPress: () => void runGenerate() },
        ],
      );
      return;
    }
    void runGenerate();
  };

  const primaryLabel = generating
    ? 'Generating…'
    : latest
      ? 'Regenerate plan'
      : 'Generate plan';

  const readyTitleStyle = useMemo(
    () => displayCardStyle(isCompact),
    [isCompact],
  );

  const footerPad = Math.max(insets.bottom, 16);

  return (
    <Screen tabBarInset={false} edges={['top', 'left', 'right']}>
      <View className="min-h-0 flex-1">
        <ScrollView
          ref={scrollRef}
          className="flex-1"
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            paddingBottom: footerPad + 8,
            flexGrow: 0,
          }}>
          <StackScreenHeader
            title={headline}
            subtitle={subtitle}
            onBack={() => navigation.goBack()}
          />

          <View className="mb-1 min-h-[0.5rem] justify-center">
            <SaveSuccessHint
              visible={showSuccess}
              message={
                latest
                  ? 'Plan updated — preview below matches your new plan.'
                  : 'Plan created — preview below.'
              }
            />
          </View>

          <View style={{ marginBottom: SECTION_GAP }}>
            <View
              style={{
                backgroundColor: `${colors.sage}40`,
                borderRadius: 14,
                paddingHorizontal: 14,
                paddingVertical: 10,
                alignSelf: 'stretch',
              }}>
              <Text className="font-sans text-xs leading-5 text-slate">
                {DISCLAIMER}
              </Text>
            </View>
            <View style={{ marginTop: 16 }}>
              <GenerationsQuotaHint
                remaining={generationsRemaining}
                limit={generationsLimit}
              />
            </View>
          </View>

          {error ? (
            <View style={{ marginBottom: INNER_GAP }}>
              <ErrorBanner message={error} onRetry={() => setError(null)} />
            </View>
          ) : null}

          <View style={{ marginBottom: SECTION_GAP }}>
            <Text className="mb-3 font-sans-semibold text-sm text-ink">
              Regeneration focus
            </Text>
            <RegenerationFocusGrid
              options={FOCUS_OPTIONS}
              value={focus}
              onChange={setFocus}
              disabled={generating}
            />
            {appliedFocusLabel && latest && !generating ? (
              <Text
                className="font-sans text-xs leading-5 text-slate"
                style={{ marginTop: INNER_GAP }}>
                Current plan generated with focus:{' '}
                <Text className="font-sans-semibold text-ink">
                  {appliedFocusLabel}
                </Text>
              </Text>
            ) : null}
          </View>

          {generating ? (
            <GlassSurface
              className="w-full min-w-0 items-center px-5 py-10"
              style={{ borderRadius: 24 }}>
              <ActivityIndicator color={colors.mint} size="large" />
              <Text className="mt-4 font-sans-semibold text-lg leading-6 text-ink">
                Forging your plan…
              </Text>
              <Text className="mt-2 max-w-sm text-center font-sans text-sm leading-5 text-slate">
                Applying {focusOptionLabel(focus, FOCUS_OPTIONS)} focus. This
                can take up to a minute.
              </Text>
            </GlassSurface>
          ) : null}

          {!generating && latest ? (
            <View style={{ marginBottom: SECTION_GAP }}>
              <View
                style={{
                  borderRadius: 24,
                  borderWidth: 1,
                  borderColor: colors.glassBorder,
                  overflow: 'hidden',
                }}>
                <LinearGradient
                  colors={[...mistGradient.colors]}
                  start={mistGradient.start}
                  end={mistGradient.end}
                  style={{ paddingHorizontal: 20, paddingVertical: 20 }}>
                  <Text className="font-sans-medium text-xs uppercase tracking-wide text-slate">
                    Current plan
                  </Text>
                  <Text className="mt-3" style={readyTitleStyle}>
                    Ready
                  </Text>
                  <Text className="mt-3 min-w-0 font-sans text-base leading-6 text-slate">
                    {latest.content.summary}
                  </Text>
                </LinearGradient>
              </View>

              <View style={{ marginTop: SECTION_GAP, gap: INNER_GAP }}>
                <PlanSummaryBlock title="Targets">
                  <PlanSummaryLine>
                    {latest.content.targets.calorieGuidance}
                  </PlanSummaryLine>
                  <PlanSummaryLine>
                    {latest.content.targets.proteinNote}
                  </PlanSummaryLine>
                </PlanSummaryBlock>

                <PlanSummaryBlock
                  title={`Workout days · ${workoutDays.length}`}>
                  {workoutDays.map((day) => (
                    <WorkoutDaySummaryLine
                      key={day.day}
                      dayLabel={day.day}
                      focus={day.focus}
                      exerciseCount={day.exercises.length}
                    />
                  ))}
                </PlanSummaryBlock>

                <PlanSummaryBlock title={`Meal days · ${mealDays.length}`}>
                  {sampleMeals.map((meal) => (
                    <PlanSummaryLine key={meal.name}>
                      {meal.name}: {meal.items[0]}
                      {meal.approxCalories
                        ? ` (~${meal.approxCalories} kcal est.)`
                        : ''}
                    </PlanSummaryLine>
                  ))}
                  {mealDays.length > 1 ? (
                    <PlanSummaryLine>
                      +{mealDays.length - 1} more days in rotation
                    </PlanSummaryLine>
                  ) : null}
                </PlanSummaryBlock>
              </View>
            </View>
          ) : null}

          {!generating && !latest ? (
            <EmptyState
              title="No plan yet"
              subtitle="Tap generate to create your first workout and meal plan."
            />
          ) : null}
        </ScrollView>

        <View
          className="border-t border-ink/10 px-1 pt-4"
          style={{
            backgroundColor: colors.mistLight,
            paddingBottom: footerPad,
          }}>
          <PrimaryButton
            className="rounded-full"
            label={primaryLabel}
            onPress={onPrimaryPress}
            disabled={generating || generationsRemaining <= 0}
          />
        </View>
      </View>
    </Screen>
  );
}
