import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { WorkoutDayCard } from '../../components/plan/WorkoutDayCard';
import {
  EmptyState,
  ErrorBanner,
  Screen,
  SegmentedControl,
  TabScreenHeader,
  type SegmentOption,
} from '../../components/ui';
import { GlassSurface } from '../../components/ui/GlassSurface';
import { StalePlanBanner } from '../../components/plan/StalePlanBanner';
import { DISCLAIMER } from '../../constants/disclaimer';
import { resolveTodayFromPlan } from '../../lib/planSchedule';
import { createFocusFetchGate } from '../../lib/tabFocus';
import { usePlanStore } from '../../store/planStore';
import { colors, fonts } from '../../theme/tokens';
import { TAB_SCROLL_CONTENT_EXTRA } from '../../lib/tabBarLayout';
import type { RootStackParamList } from '../../navigation/types';

type TabKey = 'overview' | 'workout' | 'meals';
type RootNav = NativeStackNavigationProp<RootStackParamList>;

const PLAN_TABS: readonly SegmentOption<TabKey>[] = [
  { key: 'overview', label: 'Overview' },
  { key: 'workout', label: 'Workout' },
  { key: 'meals', label: 'Meals' },
];

const STICKY_TAB_INDEX = 1;
const CARD_RADIUS = 22;

function ActionPill({
  label,
  onPress,
  emphasis = false,
}: {
  label: string;
  onPress: () => void;
  emphasis?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      hitSlop={6}
      style={{
        borderRadius: 999,
        paddingHorizontal: 14,
        paddingVertical: 10,
        backgroundColor: emphasis ? colors.ink : colors.mist,
        borderWidth: emphasis ? 0 : 1,
        borderColor: colors.glassBorder,
      }}>
      <Text
        style={{
          fontFamily: fonts.sansSemiBold,
          fontSize: 13,
          lineHeight: 18,
          color: emphasis ? colors.mist : colors.ink,
        }}>
        {label}
      </Text>
    </Pressable>
  );
}

function StatChip({ label }: { label: string }) {
  return (
    <View
      style={{
        maxWidth: '100%',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 999,
        backgroundColor: `${colors.mint}33`,
      }}>
      <Text
        numberOfLines={2}
        style={{
          fontFamily: fonts.sansSemiBold,
          fontSize: 11,
          lineHeight: 15,
          color: colors.ink,
          flexShrink: 1,
        }}>
        {label}
      </Text>
    </View>
  );
}

function GuidanceCard({
  eyebrow,
  body,
}: {
  eyebrow: string;
  body: string;
}) {
  return (
    <GlassSurface
      className="w-full min-w-0 self-stretch px-5 py-4"
      style={{ borderRadius: CARD_RADIUS }}>
      <Text
        style={{
          fontFamily: fonts.sansMedium,
          fontSize: 11,
          lineHeight: 14,
          letterSpacing: 0.5,
          color: colors.slate,
        }}>
        {eyebrow.toUpperCase()}
      </Text>
      <Text
        style={{
          marginTop: 8,
          fontFamily: fonts.sans,
          fontSize: 15,
          lineHeight: 22,
          color: colors.ink,
        }}>
        {body}
      </Text>
    </GlassSurface>
  );
}

function MealDayCard({
  dayLabel,
  dayIndex,
  meals,
}: {
  dayLabel: string;
  dayIndex: number;
  meals: Array<{
    name: string;
    approxCalories?: number | null;
    items: string[];
  }>;
}) {
  const totalKcal = meals.reduce(
    (sum, m) => sum + (m.approxCalories ?? 0),
    0,
  );

  return (
    <GlassSurface
      className="w-full min-w-0 self-stretch px-0 py-0"
      style={{ borderRadius: 24 }}>
      <View
        style={{
          paddingHorizontal: 20,
          paddingTop: 16,
          paddingBottom: 14,
          borderBottomWidth: 1,
          borderBottomColor: colors.glassBorder,
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
            DAY {dayIndex + 1}
          </Text>
          <View className="flex-row flex-wrap gap-1.5">
            <StatChip label={`${meals.length} meals`} />
            {totalKcal > 0 ? (
              <StatChip label={`~${totalKcal} kcal`} />
            ) : null}
          </View>
        </View>
        <Text
          style={{
            marginTop: 6,
            fontFamily: fonts.display,
            fontSize: 24,
            lineHeight: 30,
            color: colors.ink,
          }}
          numberOfLines={1}>
          {dayLabel}
        </Text>
      </View>

      <View style={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 16 }}>
        {meals.map((meal, mealIndex) => (
          <View
            key={`${dayLabel}-${meal.name}-${mealIndex}`}
            style={{
              marginTop: mealIndex === 0 ? 8 : 14,
              paddingTop: mealIndex === 0 ? 0 : 14,
              borderTopWidth: mealIndex === 0 ? 0 : 1,
              borderTopColor: colors.glassBorder,
            }}>
            <View className="flex-row items-start justify-between gap-2">
              <Text
                style={{
                  flex: 1,
                  minWidth: 0,
                  fontFamily: fonts.sansSemiBold,
                  fontSize: 15,
                  lineHeight: 20,
                  color: colors.ink,
                }}>
                {meal.name}
              </Text>
              {meal.approxCalories ? (
                <View
                  style={{
                    paddingHorizontal: 8,
                    paddingVertical: 3,
                    borderRadius: 999,
                    backgroundColor: `${colors.sage}44`,
                  }}>
                  <Text
                    style={{
                      fontFamily: fonts.sansSemiBold,
                      fontSize: 11,
                      lineHeight: 14,
                      color: colors.ink,
                    }}>
                    ~{meal.approxCalories} kcal
                  </Text>
                </View>
              ) : null}
            </View>
            {meal.items.map((item) => (
              <Text
                key={item}
                style={{
                  marginTop: 4,
                  fontFamily: fonts.sans,
                  fontSize: 14,
                  lineHeight: 20,
                  color: colors.slate,
                }}>
                · {item}
              </Text>
            ))}
          </View>
        ))}
      </View>
    </GlassSurface>
  );
}

export function PlanScreen() {
  const navigation = useNavigation<RootNav>();
  const latest = usePlanStore((s) => s.latest);
  const stale = usePlanStore((s) => s.stale);
  const error = usePlanStore((s) => s.error);
  const loading = usePlanStore((s) => s.loading);
  const fetchLatest = usePlanStore((s) => s.fetchLatest);
  const [tab, setTab] = useState<TabKey>('overview');
  const [refreshing, setRefreshing] = useState(false);
  const allowFocusFetch = useRef(createFocusFetchGate()).current;
  const didEnter = useRef(false);
  const fade = useSharedValue(0);

  const headerStyle = useAnimatedStyle(() => ({
    opacity: fade.value,
    transform: [{ translateY: (1 - fade.value) * 8 }],
  }));

  useFocusEffect(
    useCallback(() => {
      if (!didEnter.current) {
        didEnter.current = true;
        fade.value = withTiming(1, { duration: 280 });
      } else {
        fade.value = 1;
      }
      if (allowFocusFetch.tryAcquire()) {
        void fetchLatest();
      }
    }, [allowFocusFetch, fetchLatest, fade]),
  );

  const onRefresh = async () => {
    setRefreshing(true);
    allowFocusFetch.mark();
    await fetchLatest();
    setRefreshing(false);
  };

  const todayWorkoutIndex = useMemo(() => {
    if (!latest) {
      return 0;
    }
    const slice = resolveTodayFromPlan(latest);
    return slice?.workoutIndex ?? 0;
  }, [latest]);

  const orderedWorkoutDays = useMemo(() => {
    if (!latest) {
      return [];
    }
    const days = latest.content.workoutPlan.days;
    if (days.length === 0) {
      return [];
    }
    const items: Array<{
      day: (typeof days)[number];
      planIndex: number;
      displayDayNumber: number;
    }> = [];
    for (let i = 0; i < days.length; i++) {
      const planIndex = (todayWorkoutIndex + i) % days.length;
      items.push({
        day: days[planIndex],
        planIndex,
        displayDayNumber: i + 1,
      });
    }
    return items;
  }, [latest, todayWorkoutIndex]);

  const totalExercises = useMemo(() => {
    if (!latest) {
      return 0;
    }
    return latest.content.workoutPlan.days.reduce(
      (n, d) => n + d.exercises.length,
      0,
    );
  }, [latest]);

  const mealDayCount = latest?.content.mealPlan.days.length ?? 0;
  const initialLoading = loading && !latest;

  if (!latest) {
    return (
      <Screen>
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={{ paddingBottom: TAB_SCROLL_CONTENT_EXTRA }}>
          <TabScreenHeader
            title="Plan"
            subtitle="Your weekly workout and meals."
          />
          {error ? (
            <ErrorBanner message={error} onRetry={() => void fetchLatest()} />
          ) : null}
          {initialLoading ? (
            <GlassSurface
              className="mb-4 items-center px-5 py-10"
              style={{ borderRadius: CARD_RADIUS }}>
              <ActivityIndicator color={colors.mint} />
              <Text
                style={{
                  marginTop: 12,
                  fontFamily: fonts.sansMedium,
                  fontSize: 14,
                  lineHeight: 20,
                  color: colors.slate,
                }}>
                Loading your plan…
              </Text>
            </GlassSurface>
          ) : (
            <GlassSurface
              className="px-5 py-5"
              style={{ borderRadius: CARD_RADIUS }}>
              <EmptyState
                title="No plan yet"
                subtitle="Generate a workout + meal plan from your profile. It will show up here with today’s focus first."
                actionLabel="Generate plan"
                onAction={() => navigation.navigate('GeneratePlan')}
                secondaryLabel="View history"
                onSecondary={() => navigation.navigate('PlanHistory')}
              />
            </GlassSurface>
          )}
        </ScrollView>
      </Screen>
    );
  }

  const { content, disclaimer } = latest;

  const todayFocus =
    content.workoutPlan.days[todayWorkoutIndex]?.focus ?? '—';
  const todayDayLabel =
    content.workoutPlan.days[todayWorkoutIndex]?.day ?? 'Today';

  const openSession = (planIndex: number) => {
    navigation.navigate('WorkoutSession', { dayIndex: planIndex });
  };

  return (
    <Screen>
      <ScrollView
        className="flex-1"
        stickyHeaderIndices={[STICKY_TAB_INDEX]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: TAB_SCROLL_CONTENT_EXTRA }}>
        <Animated.View style={headerStyle} className="min-w-0">
          <TabScreenHeader
            title="Your plan"
            subtitle={content.summary}
            trailing={
              <ActionPill
                label="History"
                onPress={() => navigation.navigate('PlanHistory')}
              />
            }
          />

          {error ? (
            <ErrorBanner message={error} onRetry={() => void fetchLatest()} />
          ) : null}

          {stale ? (
            <View className="mb-3">
              <StalePlanBanner
                onRegenerate={() => navigation.navigate('GeneratePlan')}
              />
            </View>
          ) : null}

          <GlassSurface
            className="mb-3 w-full min-w-0 self-stretch px-5 py-4"
            style={{ borderRadius: CARD_RADIUS }}>
            <View className="flex-row items-center justify-between gap-2">
              <Text
                style={{
                  fontFamily: fonts.sansMedium,
                  fontSize: 11,
                  lineHeight: 14,
                  letterSpacing: 0.5,
                  color: colors.slate,
                }}>
                TODAY
              </Text>
              <View
                style={{
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                  borderRadius: 999,
                  backgroundColor: stale
                    ? `${colors.sage}66`
                    : `${colors.mint}44`,
                }}>
                <Text
                  style={{
                    fontFamily: fonts.sansSemiBold,
                    fontSize: 11,
                    lineHeight: 14,
                    color: colors.ink,
                  }}>
                  {stale ? 'Needs refresh' : 'Active'}
                </Text>
              </View>
            </View>
            <Text
              style={{
                marginTop: 8,
                fontFamily: fonts.display,
                fontSize: 26,
                lineHeight: 32,
                color: colors.ink,
              }}
              numberOfLines={2}>
              {todayFocus}
            </Text>
            <Text
              style={{
                marginTop: 4,
                fontFamily: fonts.sans,
                fontSize: 14,
                lineHeight: 20,
                color: colors.slate,
              }}>
              {todayDayLabel} · start from Workout tab
            </Text>
            <View className="mt-3 flex-row flex-wrap gap-2">
              <StatChip
                label={`${content.workoutPlan.daysPerWeek} training days`}
              />
              <StatChip label={`${totalExercises} exercises`} />
              <StatChip
                label={`${mealDayCount} meal day${mealDayCount === 1 ? '' : 's'}`}
              />
            </View>
          </GlassSurface>

          <View className="mb-4 flex-row flex-wrap gap-2">
            <ActionPill
              label="Regenerate"
              emphasis
              onPress={() => navigation.navigate('GeneratePlan')}
            />
            <ActionPill
              label="Start today’s workout"
              onPress={() => openSession(todayWorkoutIndex)}
            />
          </View>
        </Animated.View>

        <View
          style={{
            backgroundColor: colors.mistLight,
            paddingTop: 6,
            paddingBottom: 18,
            // Room for the control’s soft shadow so sticky header doesn’t clip it.
            paddingHorizontal: 1,
            overflow: 'visible',
            zIndex: 2,
          }}>
          <SegmentedControl options={PLAN_TABS} value={tab} onChange={setTab} />
        </View>

        {tab === 'overview' ? (
          <Animated.View
            entering={FadeInDown.duration(320)}
            className="gap-3 pt-2">
            <GuidanceCard
              eyebrow="Energy"
              body={content.targets.calorieGuidance}
            />
            <GuidanceCard
              eyebrow="Protein"
              body={content.targets.proteinNote}
            />
            {content.mealPlan.shoppingHints.length > 0 ? (
              <GlassSurface
                className="w-full min-w-0 self-stretch px-5 py-4"
                style={{ borderRadius: CARD_RADIUS }}>
                <Text
                  style={{
                    fontFamily: fonts.sansMedium,
                    fontSize: 11,
                    lineHeight: 14,
                    letterSpacing: 0.5,
                    color: colors.slate,
                  }}>
                  SHOPPING HINTS
                </Text>
                <Text
                  style={{
                    marginTop: 6,
                    marginBottom: 10,
                    fontFamily: fonts.sans,
                    fontSize: 13,
                    lineHeight: 18,
                    color: colors.slate,
                  }}>
                  Staples to keep on hand this week.
                </Text>
                <View className="flex-row flex-wrap gap-2">
                  {content.mealPlan.shoppingHints.map((hint) => (
                    <View
                      key={hint}
                      style={{
                        paddingHorizontal: 12,
                        paddingVertical: 8,
                        borderRadius: 999,
                        backgroundColor: colors.mist,
                        borderWidth: 1,
                        borderColor: colors.glassBorder,
                        maxWidth: '100%',
                      }}>
                      <Text
                        style={{
                          fontFamily: fonts.sansMedium,
                          fontSize: 13,
                          lineHeight: 18,
                          color: colors.ink,
                        }}>
                        {hint}
                      </Text>
                    </View>
                  ))}
                </View>
              </GlassSurface>
            ) : null}

            <GlassSurface
              className="w-full min-w-0 self-stretch px-5 py-4"
              style={{ borderRadius: CARD_RADIUS }}>
              <Text
                style={{
                  fontFamily: fonts.sansMedium,
                  fontSize: 11,
                  lineHeight: 14,
                  letterSpacing: 0.5,
                  color: colors.slate,
                }}>
                WEEK AT A GLANCE
              </Text>
              <View className="mt-3 gap-2.5">
                {content.workoutPlan.days.map((day, index) => (
                  <Pressable
                    key={`${day.day}-${index}`}
                    onPress={() => {
                      setTab('workout');
                    }}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 10,
                      paddingVertical: 10,
                      paddingHorizontal: 12,
                      borderRadius: 14,
                      backgroundColor:
                        index === todayWorkoutIndex
                          ? `${colors.mint}33`
                          : colors.mist,
                      borderWidth: 1,
                      borderColor: colors.glassBorder,
                    }}>
                    <View className="min-w-0 flex-1">
                      <Text
                        style={{
                          fontFamily: fonts.sansSemiBold,
                          fontSize: 14,
                          lineHeight: 18,
                          color: colors.ink,
                        }}
                        numberOfLines={1}>
                        {day.focus}
                      </Text>
                      <Text
                        style={{
                          marginTop: 2,
                          fontFamily: fonts.sans,
                          fontSize: 12,
                          lineHeight: 16,
                          color: colors.slate,
                        }}>
                        {day.day} · {day.exercises.length} exercises
                        {index === todayWorkoutIndex ? ' · today' : ''}
                      </Text>
                    </View>
                    <Text
                      style={{
                        fontFamily: fonts.sansSemiBold,
                        fontSize: 14,
                        color: colors.mint,
                      }}>
                      →
                    </Text>
                  </Pressable>
                ))}
              </View>
            </GlassSurface>
          </Animated.View>
        ) : null}

        {tab === 'workout' ? (
          <Animated.View
            entering={FadeInDown.duration(320)}
            className="gap-4 pt-2">
            <GlassSurface
              className="w-full min-w-0 self-stretch px-5 py-4"
              style={{ borderRadius: CARD_RADIUS, overflow: 'visible' }}>
              <View className="min-w-0 gap-2.5">
                <Text
                  style={{
                    fontFamily: fonts.sansMedium,
                    fontSize: 11,
                    lineHeight: 16,
                    letterSpacing: 0.5,
                    color: colors.slate,
                    // Avoid Android clipping uppercase labels inside the card.
                    includeFontPadding: true,
                  }}>
                  WEEKLY ROTATION
                </Text>
                <View className="min-w-0 self-start" style={{ maxWidth: '100%' }}>
                  <StatChip label={`Today · ${todayFocus}`} />
                </View>
              </View>
              <Text
                style={{
                  marginTop: 12,
                  fontFamily: fonts.sansSemiBold,
                  fontSize: 16,
                  lineHeight: 22,
                  color: colors.ink,
                }}>
                {content.workoutPlan.daysPerWeek} training days ·{' '}
                {totalExercises} exercises
              </Text>
              <Text
                style={{
                  marginTop: 4,
                  fontFamily: fonts.sans,
                  fontSize: 13,
                  lineHeight: 18,
                  color: colors.slate,
                }}>
                Days are ordered from today so your next session is always on
                top.
              </Text>
            </GlassSurface>
            {orderedWorkoutDays.map(({ day, planIndex, displayDayNumber }) => (
              <WorkoutDayCard
                key={`${day.day}-${planIndex}`}
                day={day}
                displayDayNumber={displayDayNumber}
                isToday={planIndex === todayWorkoutIndex}
                collapsible={planIndex !== todayWorkoutIndex}
                defaultExpanded={planIndex === todayWorkoutIndex}
                onStartWorkout={() => openSession(planIndex)}
              />
            ))}
          </Animated.View>
        ) : null}

        {tab === 'meals' ? (
          <Animated.View
            entering={FadeInDown.duration(320)}
            className="gap-4 pt-2">
            {content.mealPlan.days.length === 0 ? (
              <GlassSurface
                className="px-5 py-5"
                style={{ borderRadius: CARD_RADIUS }}>
                <EmptyState
                  title="No meals in this plan"
                  subtitle="Regenerate to get a fresh meal schedule based on your staples."
                  actionLabel="Regenerate plan"
                  onAction={() => navigation.navigate('GeneratePlan')}
                />
              </GlassSurface>
            ) : (
              content.mealPlan.days.map((day, index) => (
                <MealDayCard
                  key={day.day}
                  dayLabel={day.day}
                  dayIndex={index}
                  meals={day.meals}
                />
              ))
            )}
          </Animated.View>
        ) : null}

        <Text
          style={{
            marginTop: 28,
            fontFamily: fonts.sans,
            fontSize: 12,
            lineHeight: 18,
            color: colors.slate,
          }}>
          {disclaimer || DISCLAIMER}
        </Text>
      </ScrollView>
    </Screen>
  );
}
