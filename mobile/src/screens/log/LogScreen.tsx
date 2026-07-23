import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
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
  PrimaryButton,
  SaveSuccessHint,
  Screen,
  TabScreenHeader,
  TextField,
} from '../../components/ui';
import { GlassSurface } from '../../components/ui/GlassSurface';
import { MissionToggle } from '../../components/log/MissionToggle';
import { useProgressStore } from '../../store/progressStore';
import { useSaveFeedback } from '../../hooks/useSaveFeedback';
import { useUnitSettings } from '../../hooks/useUnitSettings';
import { colors } from '../../theme/tokens';
import { TAB_SCROLL_CONTENT_EXTRA } from '../../lib/tabBarLayout';
import { formatWeightFromKg } from '../../lib/units';

export function LogScreen() {
  const todayLog = useProgressStore((s) => s.todayLog);
  const stats = useProgressStore((s) => s.stats);
  const error = useProgressStore((s) => s.error);
  const fetchStats = useProgressStore((s) => s.fetchStats);
  const saveToday = useProgressStore((s) => s.saveToday);

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
  const rise = useSharedValue(8);
  const opacity = useSharedValue(0);

  const headerStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: rise.value }],
  }));

  useFocusEffect(
    useCallback(() => {
      opacity.value = withTiming(1, { duration: 380 });
      rise.value = withTiming(0, { duration: 380 });
      void fetchStats();
    }, [fetchStats, opacity, rise]),
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
    if (isDirty) {
      return null;
    }
    if (missionsDone === 0 && !weight.trim() && !notes.trim()) {
      return 'Toggle a mission or add optional details, then save.';
    }
    return "You're caught up — change something to save again.";
  }, [isDirty, missionsDone, weight, notes]);

  return (
    <Screen>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: TAB_SCROLL_CONTENT_EXTRA }}>
        <Animated.View style={headerStyle}>
          <TabScreenHeader
            title="Today"
            subtitle={`${today} · check in when you move or eat on plan.`}
          />
        </Animated.View>

        <GlassSurface className="mt-5 mb-5 px-5 py-4" style={{ borderRadius: 24 }}>
          <Text className="font-sans-medium text-xs uppercase tracking-wide text-slate">
            Daily missions
          </Text>
          <Text className="mt-1 font-display text-2xl tabular-nums text-ink">
            {missionsDone}/2 complete
          </Text>
          <View className="mt-3 h-2 overflow-hidden rounded-full bg-sage/40">
            <View
              className="h-full rounded-full bg-mint"
              style={{ width: `${(missionsDone / 2) * 100}%` }}
            />
          </View>
          {stats ? (
            <Text className="mt-3 font-sans text-sm text-slate">
              Streak{' '}
              <Text className="font-sans-semibold tabular-nums text-ink">
                {stats.currentStreak}
              </Text>
            </Text>
          ) : null}
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

        <GlassSurface className="mt-2 mb-4 px-4 py-4" style={{ borderRadius: 24 }}>
          <Text className="mb-3 font-sans-semibold text-ink">Optional details</Text>
          <TextField
            label={weightLabel}
            value={weight}
            onChangeText={setWeight}
            keyboardType="decimal-pad"
            placeholder={weightPlaceholder}
            editable={!saving}
          />
          <TextField
            label="Notes"
            value={notes}
            onChangeText={setNotes}
            placeholder="How did today feel?"
            multiline
            numberOfLines={3}
            style={{ minHeight: 88, textAlignVertical: 'top' }}
            editable={!saving}
          />
        </GlassSurface>

        <PrimaryButton
          label={buttonLabel}
          onPress={() => void onSave()}
          disabled={saving || !isDirty}
        />

        {saveHint && !saving && !showSuccess ? (
          <Text className="mt-2 text-center font-sans text-sm text-slate">
            {saveHint}
          </Text>
        ) : null}

        {saving ? (
          <ActivityIndicator className="mt-4" color={colors.mint} />
        ) : null}

        <View className="mt-3 min-h-[28px] justify-center">
          <SaveSuccessHint visible={showSuccess} message={successMessage} />
        </View>
      </ScrollView>
    </Screen>
  );
}
