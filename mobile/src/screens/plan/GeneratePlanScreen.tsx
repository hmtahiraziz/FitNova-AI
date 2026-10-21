import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
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
  type FocusOption,
} from '../../components/plan/RegenerationFocusGrid';
import {
  EmptyState,
  ErrorBanner,
  PrimaryButton,
  SaveSuccessHint,
  Screen,
  SecondaryButton,
  StackScreenHeader,
} from '../../components/ui';
import { GlassSurface } from '../../components/ui/GlassSurface';
import { DISCLAIMER } from '../../constants/disclaimer';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';
import { useResponsive } from '../../hooks/useResponsive';
import { ApiError } from '../../api/client';
import type { PlanGenerateFocus, PlanReportReason } from '../../api/plans';
import * as plansApi from '../../api/plans';
import { requireOnline } from '../../lib/offline';
import { useAppSettingsStore } from '../../store/appSettingsStore';
import { useAuthStore } from '../../store/authStore';
import { showDialog } from '../../store/dialogStore';
import { usePlanStore } from '../../store/planStore';
import { showToast } from '../../store/toastStore';
import {
  colors,
  displayCardStyle,
  fonts,
  mistGradient,
} from '../../theme/tokens';
import type { RootStackParamList } from '../../navigation/types';

const REPORT_REASONS: { reason: PlanReportReason; label: string }[] = [
  { reason: 'unsafe_or_harmful', label: 'Unsafe or harmful advice' },
  { reason: 'ignores_restrictions', label: 'Ignores my dietary restrictions' },
  { reason: 'medical_claims', label: 'Makes medical claims' },
  { reason: 'inaccurate', label: 'Inaccurate or unusable' },
  { reason: 'other', label: 'Other' },
];

type Nav = NativeStackNavigationProp<RootStackParamList>;

const FOCUS_OPTIONS: FocusOption[] = [
  {
    value: 'balanced',
    label: 'Balanced',
    description: 'Even refresh of workouts and meals.',
  },
  {
    value: 'meal_variety',
    label: 'New meals',
    description: 'More variety in daily meals and staples.',
  },
  {
    value: 'workout_variety',
    label: 'New workouts',
    description: 'Fresh exercise rotation and focus days.',
  },
  {
    value: 'lighter_meals',
    label: 'Lighter meals',
    description: 'Simpler plates with lighter calorie feel.',
  },
];

const SUCCESS_MS = 2200;
const INNER_GAP = 8;
const SECTION_GAP = 22;
const CARD_RADIUS = 22;

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

function SectionLabel({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <View className="mb-2.5">
      <Text
        style={{
          fontFamily: fonts.sansSemiBold,
          fontSize: 12,
          lineHeight: 16,
          letterSpacing: 0.6,
          color: colors.slate,
        }}>
        {title.toUpperCase()}
      </Text>
      {subtitle ? (
        <Text
          style={{
            marginTop: 4,
            fontFamily: fonts.sans,
            fontSize: 13,
            lineHeight: 18,
            color: colors.slate,
          }}>
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}

function StatChip({ label }: { label: string }) {
  return (
    <View
      style={{
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 999,
        backgroundColor: `${colors.mint}33`,
      }}>
      <Text
        style={{
          fontFamily: fonts.sansSemiBold,
          fontSize: 11,
          lineHeight: 14,
          color: colors.ink,
        }}>
        {label}
      </Text>
    </View>
  );
}

export function GeneratePlanScreen() {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);
  const { isCompact, isTablet } = useResponsive();
  const { isOffline } = useNetworkStatus();
  const latest = usePlanStore((s) => s.latest);
  const generating = usePlanStore((s) => s.generating);
  const generate = usePlanStore((s) => s.generate);
  const lastGenerateFocus = usePlanStore((s) => s.lastGenerateFocus);
  const generationsRemaining = usePlanStore(
    (s) => s.generationsRemainingThisHour,
  );
  const generationsLimit = usePlanStore((s) => s.generationsLimitPerHour);
  const aiConsented = useAppSettingsStore((s) => s.aiProcessingConsented);
  const setAiConsented = useAppSettingsStore((s) => s.setAiProcessingConsented);
  const accessToken = useAuthStore((s) => s.token);
  const [error, setError] = useState<string | null>(null);
  const [focus, setFocus] = useState<PlanGenerateFocus>('balanced');
  const [showSuccess, setShowSuccess] = useState(false);
  const [consentChecked, setConsentChecked] = useState(aiConsented);
  const [reporting, setReporting] = useState(false);

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
  const totalExercises = workoutDays.reduce(
    (n, d) => n + d.exercises.length,
    0,
  );

  const headline = latest ? 'Regenerate plan' : 'Generate plan';
  const subtitle = useMemo(
    () =>
      latest
        ? isCompact
          ? 'Fresh workout and meals. Previous plan stays in history.'
          : 'Create a fresh workout and meal plan. Your previous plan stays in history.'
        : isCompact
          ? 'From your profile and local staples.'
          : 'Build a workout and meal plan from your profile and local staples.',
    [latest, isCompact],
  );

  const appliedFocusLabel =
    lastGenerateFocus != null
      ? focusOptionLabel(lastGenerateFocus, FOCUS_OPTIONS)
      : null;

  const quotaLow = generationsRemaining <= 1;
  const quotaEmpty = generationsRemaining <= 0;
  const canGenerate =
    !generating &&
    !quotaEmpty &&
    !isOffline &&
    (aiConsented || consentChecked);

  const runGenerate = async () => {
    if (
      !requireOnline(
        latest
          ? 'Connect to regenerate your plan.'
          : 'Connect to generate your plan.',
      )
    ) {
      return;
    }
    setError(null);
    try {
      await generate({
        focus,
        acceptAiProcessing: consentChecked || aiConsented ? true : undefined,
      });
      if (consentChecked) {
        setAiConsented(true);
      }
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
    if (isOffline) {
      setError(
        latest
          ? 'Connect to the internet to regenerate your plan.'
          : 'Connect to the internet to generate your plan.',
      );
      return;
    }
    if (!aiConsented && !consentChecked) {
      setError(
        'Please confirm AI processing consent before generating a plan.',
      );
      return;
    }
    if (latest) {
      showDialog({
        title: 'Regenerate plan?',
        message:
          'This replaces your current plan with a new workout and meal rotation. Estimated calories are guidance only—not medical advice.',
        actions: [
          { label: 'Cancel', variant: 'secondary' },
          {
            label: 'Regenerate',
            variant: 'primary',
            onPress: () => void runGenerate(),
          },
        ],
      });
      return;
    }
    void runGenerate();
  };

  const onReportPlan = () => {
    if (!latest || !accessToken || reporting) {
      return;
    }
    if (!requireOnline('Connect to report this plan.')) {
      return;
    }
    showDialog({
      title: 'Report this plan',
      message:
        'Choose why this AI plan is a problem. We do not send your report to OpenAI.',
      actions: [
        ...REPORT_REASONS.map(({ reason, label }) => ({
          label,
          variant: 'option' as const,
          onPress: () => {
            void (async () => {
              setReporting(true);
              try {
                const result = await plansApi.reportPlan(
                  accessToken,
                  latest.id,
                  { reason },
                );
                showToast(result.message, 'success');
              } catch (err) {
                showToast(
                  err instanceof ApiError ? err.message : 'Try again later.',
                  'error',
                );
              } finally {
                setReporting(false);
              }
            })();
          },
        })),
        { label: 'Cancel', variant: 'secondary' as const },
      ],
    });
  };

  const primaryLabel = generating
    ? 'Generating…'
    : quotaEmpty
      ? 'Hourly limit reached'
      : latest
        ? 'Regenerate plan'
        : 'Generate plan';

  const readyTitleStyle = useMemo(
    () => displayCardStyle(isCompact),
    [isCompact],
  );

  const footerExtra = isTablet ? 28 : isCompact ? 20 : 24;
  const footerPad = Math.max(insets.bottom, 16) + footerExtra;
  const footerTopPad = isCompact ? 14 : 16;
  const scrollBottomPad = footerPad + (isCompact ? 20 : 24);
  const selectedFocusLabel = focusOptionLabel(focus, FOCUS_OPTIONS);

  return (
    <Screen tabBarInset={false} edges={['top', 'left', 'right']}>
      <View className="min-h-0 flex-1">
        <ScrollView
          ref={scrollRef}
          className="flex-1"
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            paddingBottom: scrollBottomPad,
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

          <GlassSurface
            className="mb-4 px-4 py-3.5"
            style={{ borderRadius: CARD_RADIUS }}>
            <View className="flex-row items-center justify-between gap-2">
              <View className="min-w-0 flex-1">
                <Text
                  style={{
                    fontFamily: fonts.sansMedium,
                    fontSize: 11,
                    lineHeight: 14,
                    letterSpacing: 0.5,
                    color: colors.slate,
                  }}>
                  THIS HOUR
                </Text>
                <Text
                  style={{
                    marginTop: 4,
                    fontFamily: fonts.sansSemiBold,
                    fontSize: 15,
                    lineHeight: 20,
                    color: colors.ink,
                  }}>
                  {generationsRemaining} of {generationsLimit} generations left
                </Text>
              </View>
              <View
                style={{
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                  borderRadius: 999,
                  backgroundColor: quotaEmpty
                    ? `${colors.coral}22`
                    : quotaLow
                      ? `${colors.sage}66`
                      : `${colors.mint}44`,
                }}>
                <Text
                  style={{
                    fontFamily: fonts.sansSemiBold,
                    fontSize: 11,
                    lineHeight: 14,
                    color: quotaEmpty ? colors.coral : colors.ink,
                  }}>
                  {quotaEmpty ? 'Limit reached' : quotaLow ? 'Low' : 'Available'}
                </Text>
              </View>
            </View>
            <Text
              style={{
                marginTop: 10,
                fontFamily: fonts.sans,
                fontSize: 12,
                lineHeight: 17,
                color: colors.slate,
              }}>
              {DISCLAIMER}
            </Text>
          </GlassSurface>

          {!aiConsented ? (
            <Pressable
              accessibilityRole="checkbox"
              accessibilityState={{ checked: consentChecked }}
              onPress={() => setConsentChecked((v) => !v)}
              style={{ marginBottom: SECTION_GAP }}>
              <GlassSurface
                className="flex-row items-start gap-3 px-4 py-3.5"
                style={{
                  borderRadius: CARD_RADIUS,
                  borderColor: consentChecked
                    ? `${colors.mint}88`
                    : colors.glassBorder,
                }}>
                <View
                  style={{
                    marginTop: 2,
                    width: 22,
                    height: 22,
                    borderRadius: 6,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderWidth: 1.5,
                    borderColor: consentChecked ? colors.mint : colors.slate,
                    backgroundColor: consentChecked
                      ? colors.mint
                      : 'transparent',
                  }}>
                  {consentChecked ? (
                    <Text
                      style={{
                        fontFamily: fonts.sansSemiBold,
                        fontSize: 12,
                        color: colors.ink,
                      }}>
                      ✓
                    </Text>
                  ) : null}
                </View>
                <View className="min-w-0 flex-1">
                  <Text
                    style={{
                      fontFamily: fonts.sansSemiBold,
                      fontSize: 14,
                      lineHeight: 18,
                      color: colors.ink,
                    }}>
                    AI processing consent
                  </Text>
                  <Text
                    style={{
                      marginTop: 4,
                      fontFamily: fonts.sans,
                      fontSize: 13,
                      lineHeight: 18,
                      color: colors.slate,
                    }}>
                    Profile details (not email or photo) may be sent to OpenAI
                    solely to generate your plan.
                  </Text>
                </View>
              </GlassSurface>
            </Pressable>
          ) : (
            <View
              style={{
                marginBottom: SECTION_GAP,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 8,
              }}>
              <View
                style={{
                  paddingHorizontal: 8,
                  paddingVertical: 3,
                  borderRadius: 999,
                  backgroundColor: `${colors.mint}33`,
                }}>
                <Text
                  style={{
                    fontFamily: fonts.sansSemiBold,
                    fontSize: 10,
                    lineHeight: 13,
                    color: colors.ink,
                  }}>
                  Consent on file
                </Text>
              </View>
              <Text
                style={{
                  flex: 1,
                  fontFamily: fonts.sans,
                  fontSize: 12,
                  lineHeight: 17,
                  color: colors.slate,
                }}>
                You can regenerate within your hourly limit.
              </Text>
            </View>
          )}

          {error ? (
            <View style={{ marginBottom: INNER_GAP }}>
              <ErrorBanner message={error} onRetry={() => setError(null)} />
            </View>
          ) : null}

          <View style={{ marginBottom: SECTION_GAP }}>
            <SectionLabel
              title="Regeneration focus"
              subtitle="Choose what should change most in the next plan."
            />
            <RegenerationFocusGrid
              options={FOCUS_OPTIONS}
              value={focus}
              onChange={setFocus}
              disabled={generating}
            />
            {appliedFocusLabel && latest && !generating ? (
              <Text
                style={{
                  marginTop: 10,
                  fontFamily: fonts.sans,
                  fontSize: 12,
                  lineHeight: 17,
                  color: colors.slate,
                }}>
                Current plan focus:{' '}
                <Text
                  style={{
                    fontFamily: fonts.sansSemiBold,
                    color: colors.ink,
                  }}>
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
              <Text
                style={{
                  marginTop: 16,
                  fontFamily: fonts.sansSemiBold,
                  fontSize: 18,
                  lineHeight: 24,
                  color: colors.ink,
                }}>
                Forging your plan…
              </Text>
              <Text
                style={{
                  marginTop: 8,
                  maxWidth: 300,
                  textAlign: 'center',
                  fontFamily: fonts.sans,
                  fontSize: 14,
                  lineHeight: 20,
                  color: colors.slate,
                }}>
                Applying {selectedFocusLabel} focus. This can take up to a
                minute.
              </Text>
              <View
                style={{
                  marginTop: 16,
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 999,
                  backgroundColor: `${colors.mint}33`,
                }}>
                <Text
                  style={{
                    fontFamily: fonts.sansSemiBold,
                    fontSize: 12,
                    lineHeight: 16,
                    color: colors.ink,
                  }}>
                  {selectedFocusLabel}
                </Text>
              </View>
            </GlassSurface>
          ) : null}

          {!generating && latest ? (
            <View style={{ marginBottom: SECTION_GAP }}>
              <SectionLabel
                title="Current plan preview"
                subtitle="What you have now — regenerating replaces this."
              />
              <View
                style={{
                  borderRadius: 24,
                  borderWidth: 1,
                  borderColor: colors.glassBorder,
                  overflow: 'visible',
                }}>
                <LinearGradient
                  colors={[...mistGradient.colors]}
                  start={mistGradient.start}
                  end={mistGradient.end}
                  style={{
                    paddingHorizontal: 20,
                    paddingVertical: 20,
                    borderRadius: 23,
                  }}>
                  <View className="flex-row items-center justify-between gap-2">
                    <Text
                      style={{
                        fontFamily: fonts.sansMedium,
                        fontSize: 11,
                        lineHeight: 14,
                        letterSpacing: 0.5,
                        color: colors.slate,
                      }}>
                      CURRENT PLAN
                    </Text>
                    <View
                      style={{
                        paddingHorizontal: 10,
                        paddingVertical: 4,
                        borderRadius: 999,
                        backgroundColor: `${colors.mint}44`,
                      }}>
                      <Text
                        style={{
                          fontFamily: fonts.sansSemiBold,
                          fontSize: 11,
                          lineHeight: 14,
                          color: colors.ink,
                        }}>
                        Active
                      </Text>
                    </View>
                  </View>
                  <Text className="mt-3" style={readyTitleStyle}>
                    Ready
                  </Text>
                  <Text
                    style={{
                      marginTop: 10,
                      fontFamily: fonts.sans,
                      fontSize: 15,
                      lineHeight: 22,
                      color: colors.slate,
                    }}>
                    {latest.content.summary}
                  </Text>
                  <View className="mt-3 flex-row flex-wrap gap-2">
                    <StatChip
                      label={`${latest.content.workoutPlan.daysPerWeek} training days`}
                    />
                    <StatChip label={`${totalExercises} exercises`} />
                    <StatChip
                      label={`${mealDays.length} meal day${mealDays.length === 1 ? '' : 's'}`}
                    />
                  </View>
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

                <PlanSummaryBlock title={`Meal sample · day 1`}>
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
            <GlassSurface
              className="px-5 py-5"
              style={{ borderRadius: CARD_RADIUS }}>
              <EmptyState
                title="Ready when you are"
                subtitle="Pick a focus above, then generate your first workout and meal plan."
              />
            </GlassSurface>
          ) : null}
        </ScrollView>

        <View
          style={{
            borderTopWidth: 1,
            borderTopColor: colors.glassBorder,
            backgroundColor: colors.mistLight,
            paddingTop: footerTopPad,
            paddingBottom: footerPad,
            paddingHorizontal: 4,
            gap: latest && !generating ? (isCompact ? 10 : 12) : 0,
          }}>
          {!generating ? (
            <Text
              style={{
                marginBottom: 4,
                textAlign: 'center',
                fontFamily: fonts.sans,
                fontSize: 12,
                lineHeight: 16,
                color: colors.slate,
              }}>
              Focus: {selectedFocusLabel}
              {isOffline
                ? ' · offline'
                : quotaEmpty
                  ? ' · try again next hour'
                  : ''}
            </Text>
          ) : null}
          <PrimaryButton
            className="rounded-full"
            label={primaryLabel}
            onPress={onPrimaryPress}
            disabled={!canGenerate}
          />
          {latest && !generating ? (
            <SecondaryButton
              label={reporting ? 'Sending report…' : 'Report this AI plan'}
              onPress={onReportPlan}
              disabled={reporting || isOffline}
            />
          ) : null}
        </View>
      </View>
    </Screen>
  );
}
