import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Text,
  View,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useFocusEffect } from '@react-navigation/native';
import { localDateOnly } from '../../api/progress';
import { ApiError } from '../../api/client';
import {
  ErrorBanner,
  KeyboardForm,
  PrimaryButton,
  SaveSuccessHint,
  Screen,
  TabScreenHeader,
  TextField,
  useKeyboardForm,
} from '../../components/ui';
import { GlassSurface } from '../../components/ui/GlassSurface';
import { MissionToggle } from '../../components/log/MissionToggle';
import { useProgressStore } from '../../store/progressStore';
import { useSaveFeedback } from '../../hooks/useSaveFeedback';
import { useUnitSettings } from '../../hooks/useUnitSettings';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';
import { createFocusFetchGate } from '../../lib/tabFocus';
import { requireOnline } from '../../lib/offline';
import { colors, fonts } from '../../theme/tokens';
import { TAB_SCROLL_CONTENT_EXTRA } from '../../lib/tabBarLayout';
import { formatWeightFromKg } from '../../lib/units';

const CARD_RADIUS = 22;

function OptionalFields({
  weight,
  setWeight,
  notes,
  setNotes,
  weightLabel,
  weightPlaceholder,
  saving,
}: {
  weight: string;
  setWeight: (v: string) => void;
  notes: string;
  setNotes: (v: string) => void;
  weightLabel: string;
  weightPlaceholder: string;
  saving: boolean;
}) {
  const { scrollFocusedIntoView } = useKeyboardForm();

  return (
    <GlassSurface
      className="mt-2 mb-4 px-4 py-4"
      style={{ borderRadius: CARD_RADIUS }}>
      <Text
        style={{
          fontFamily: fonts.sansMedium,
          fontSize: 11,
          lineHeight: 14,
          letterSpacing: 0.5,
          color: colors.slate,
        }}>
        OPTIONAL DETAILS
      </Text>
      <Text
        style={{
          marginTop: 4,
          marginBottom: 12,
          fontFamily: fonts.sans,
          fontSize: 13,
          lineHeight: 18,
          color: colors.slate,
        }}>
        Weight and notes are optional — skip if you just want missions.
      </Text>
      <TextField
        label={weightLabel}
        value={weight}
        onChangeText={setWeight}
        onFocus={(e) => scrollFocusedIntoView(e)}
        keyboardType="decimal-pad"
        placeholder={weightPlaceholder}
        editable={!saving}
      />
      <TextField
        label="Notes"
        value={notes}
        onChangeText={setNotes}
        onFocus={(e) => scrollFocusedIntoView(e)}
        placeholder="How did today feel?"
        multiline
        numberOfLines={3}
        style={{ minHeight: 88, textAlignVertical: 'top' }}
        editable={!saving}
      />
    </GlassSurface>
  );
}

export function LogScreen() {
  const todayLog = useProgressStore((s) => s.todayLog);
  const stats = useProgressStore((s) => s.stats);
  const error = useProgressStore((s) => s.error);
  const fetchStats = useProgressStore((s) => s.fetchStats);
  const saveToday = useProgressStore((s) => s.saveToday);
  const { isOffline } = useNetworkStatus();

  const [workoutDone, setWorkoutDone] = useState(false);
  const [mealsFollowed, setMealsFollowed] = useState(false);
  const [weight, setWeight] = useState('');
  const [notes, setNotes] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const {
    isSaving,
    showSuccess,
    isInteractionLocked,
    buttonLabel,
    successMessage,
    runSave,
  } = useSaveFeedback('Save today');
  const {
    weightUnit,
    weightLabel,
    weightPlaceholder,
    parseWeightToKg,
  } = useUnitSettings();
  const allowFocusFetch = useRef(createFocusFetchGate()).current;
  const didEnter = useRef(false);
  const rise = useSharedValue(8);
  const opacity = useSharedValue(0);

  const headerStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: rise.value }],
  }));

  useFocusEffect(
    useCallback(() => {
      if (!didEnter.current) {
        didEnter.current = true;
        opacity.value = withTiming(1, { duration: 280 });
        rise.value = withTiming(0, { duration: 280 });
      } else {
        opacity.value = 1;
        rise.value = 0;
      }
      if (allowFocusFetch.tryAcquire()) {
        void fetchStats();
      }
    }, [allowFocusFetch, fetchStats, opacity, rise]),
  );

  useEffect(() => {
    setWorkoutDone(todayLog?.workoutDone ?? false);
    setMealsFollowed(todayLog?.mealsFollowed ?? false);
    setWeight(
      todayLog?.weightKg != null
        ? formatWeightFromKg(todayLog.weightKg, weightUnit)
        : '',
    );
    setNotes(todayLog?.notes ?? '');
  }, [todayLog, weightUnit]);

  const onSave = async () => {
    if (!requireOnline('Connect to save today’s check-in.')) {
      return;
    }
    setLocalError(null);
    let weightKg: number | null | undefined = undefined;
    if (weight.trim() === '') {
      weightKg = null;
    } else {
      const parsed = parseWeightToKg(weight);
      if (parsed == null) {
        setLocalError(
          `Enter a valid weight in ${weightUnit}, or leave it blank.`,
        );
        return;
      }
      weightKg = parsed;
    }

    try {
      await runSave(async () => {
        await saveToday({
          date: localDateOnly(),
          workoutDone,
          mealsFollowed,
          weightKg,
          notes: notes.trim() || null,
        });
        await fetchStats();
      });
    } catch (err) {
      setLocalError(err instanceof ApiError ? err.message : 'Could not save');
    }
  };

  const displayError = localError ?? error;
  const saving = isSaving;
  const togglesLocked = isInteractionLocked;
  const today = localDateOnly();
  const missionsDone = Number(workoutDone) + Number(mealsFollowed);

  const serverWeight =
    todayLog?.weightKg != null
      ? formatWeightFromKg(todayLog.weightKg, weightUnit)
      : '';
  const serverNotes = todayLog?.notes ?? '';

  const isDirty = useMemo(() => {
    if ((todayLog?.workoutDone ?? false) !== workoutDone) {
      return true;
    }
    if ((todayLog?.mealsFollowed ?? false) !== mealsFollowed) {
      return true;
    }
    if (weight.trim() !== serverWeight.trim()) {
      return true;
    }
    if (notes.trim() !== serverNotes.trim()) {
      return true;
    }
    return false;
  }, [
    todayLog,
    workoutDone,
    mealsFollowed,
    weight,
    notes,
    serverWeight,
    serverNotes,
  ]);

  const saveHint = useMemo(() => {
    if (isOffline) {
      return 'You’re offline — reconnect to save your check-in.';
    }
    if (isDirty) {
      return 'Unsaved changes — tap save to update Progress.';
    }
    if (missionsDone === 0 && !weight.trim() && !notes.trim()) {
      return 'Toggle a mission or add optional details, then save.';
    }
    return "You're caught up — change something to save again.";
  }, [isDirty, isOffline, missionsDone, weight, notes]);

  const statusTone =
    missionsDone === 2
      ? { label: 'Complete', bg: `${colors.mint}44` }
      : missionsDone === 1
        ? { label: 'Halfway', bg: `${colors.sage}66` }
        : { label: 'Not started', bg: `${colors.sage}44` };

  const missionPct = (missionsDone / 2) * 100;

  return (
    <Screen>
      <KeyboardForm bottomExtra={TAB_SCROLL_CONTENT_EXTRA + 48} focusLift={56}>
        <Animated.View style={headerStyle}>
          <TabScreenHeader
            title="Today"
            subtitle={`${today} · check in when you move or eat on plan.`}
          />
        </Animated.View>

        <GlassSurface
          className="mt-4 mb-4 px-5 py-4"
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
              DAILY MISSIONS
            </Text>
            <View
              style={{
                paddingHorizontal: 10,
                paddingVertical: 4,
                borderRadius: 999,
                backgroundColor: statusTone.bg,
              }}>
              <Text
                style={{
                  fontFamily: fonts.sansSemiBold,
                  fontSize: 11,
                  lineHeight: 14,
                  color: colors.ink,
                }}>
                {statusTone.label}
              </Text>
            </View>
          </View>

          <Text
            style={{
              marginTop: 8,
              fontFamily: fonts.display,
              fontSize: 28,
              lineHeight: 34,
              color: colors.ink,
            }}>
            {missionsDone}/2 complete
          </Text>

          <View
            style={{
              marginTop: 12,
              height: 8,
              borderRadius: 999,
              backgroundColor: `${colors.sage}55`,
              overflow: 'hidden',
            }}>
            <View
              style={{
                height: '100%',
                width: `${missionPct}%`,
                borderRadius: 999,
                backgroundColor: colors.mint,
              }}
            />
          </View>

          <View className="mt-3 flex-row flex-wrap gap-2">
            <View
              style={{
                paddingHorizontal: 10,
                paddingVertical: 5,
                borderRadius: 999,
                backgroundColor: workoutDone
                  ? `${colors.mint}33`
                  : colors.mist,
                borderWidth: 1,
                borderColor: colors.glassBorder,
              }}>
              <Text
                style={{
                  fontFamily: fonts.sansSemiBold,
                  fontSize: 11,
                  lineHeight: 14,
                  color: colors.ink,
                }}>
                Workout {workoutDone ? '✓' : '·'}
              </Text>
            </View>
            <View
              style={{
                paddingHorizontal: 10,
                paddingVertical: 5,
                borderRadius: 999,
                backgroundColor: mealsFollowed
                  ? `${colors.mint}33`
                  : colors.mist,
                borderWidth: 1,
                borderColor: colors.glassBorder,
              }}>
              <Text
                style={{
                  fontFamily: fonts.sansSemiBold,
                  fontSize: 11,
                  lineHeight: 14,
                  color: colors.ink,
                }}>
                Meals {mealsFollowed ? '✓' : '·'}
              </Text>
            </View>
            {stats ? (
              <View
                style={{
                  paddingHorizontal: 10,
                  paddingVertical: 5,
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
                  Streak {stats.currentStreak}
                </Text>
              </View>
            ) : null}
            {isDirty ? (
              <View
                style={{
                  paddingHorizontal: 10,
                  paddingVertical: 5,
                  borderRadius: 999,
                  backgroundColor: `${colors.coral}22`,
                }}>
                <Text
                  style={{
                    fontFamily: fonts.sansSemiBold,
                    fontSize: 11,
                    lineHeight: 14,
                    color: colors.coral,
                  }}>
                  Unsaved
                </Text>
              </View>
            ) : null}
          </View>
        </GlassSurface>

        {displayError ? (
          <ErrorBanner
            message={displayError}
            onRetry={() => {
              setLocalError(null);
              void fetchStats();
            }}
          />
        ) : null}

        <Text
          style={{
            marginBottom: 8,
            fontFamily: fonts.sansSemiBold,
            fontSize: 12,
            lineHeight: 16,
            letterSpacing: 0.5,
            color: colors.slate,
          }}>
          MISSIONS
        </Text>

        <MissionToggle
          label="Workout done"
          description="Mark if you completed today's session."
          value={workoutDone}
          disabled={togglesLocked}
          onToggle={() => setWorkoutDone((v) => !v)}
        />
        <MissionToggle
          label="Meals followed"
          description="Mark if you mostly stuck to the meal plan."
          value={mealsFollowed}
          disabled={togglesLocked}
          onToggle={() => setMealsFollowed((v) => !v)}
        />

        <OptionalFields
          weight={weight}
          setWeight={setWeight}
          notes={notes}
          setNotes={setNotes}
          weightLabel={weightLabel}
          weightPlaceholder={weightPlaceholder}
          saving={saving}
        />

        <PrimaryButton
          className="rounded-full"
          label={buttonLabel}
          onPress={() => void onSave()}
          disabled={saving || !isDirty || isOffline}
        />

        {saveHint && !saving && !showSuccess ? (
          <Text
            style={{
              marginTop: 10,
              textAlign: 'center',
              fontFamily: fonts.sans,
              fontSize: 13,
              lineHeight: 18,
              color: colors.slate,
            }}>
            {saveHint}
          </Text>
        ) : null}

        {saving ? (
          <ActivityIndicator className="mt-4" color={colors.mint} />
        ) : null}

        <View className="mt-3 min-h-[28px] justify-center">
          <SaveSuccessHint visible={showSuccess} message={successMessage} />
        </View>
      </KeyboardForm>
    </Screen>
  );
}
