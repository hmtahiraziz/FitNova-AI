import React, { useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import {
  Chip,
  PrimaryButton,
  Screen,
  SecondaryButton,
  SectionTitle,
} from '../../components/ui';
import {
  ACTIVITY_LEVELS,
  DIET_PREFS,
  EQUIPMENT,
  EXPERIENCE_LEVELS,
  GOALS,
  RESTRICTIONS,
  SEX_OPTIONS,
} from '../../constants/profileOptions';
import { STAPLES } from '../../constants/staples';
import { useProfileStore } from '../../store/profileStore';
import { colors, fonts } from '../../theme/tokens';
import { ApiError } from '../../api/client';
import { useSaveFeedback } from '../../hooks/useSaveFeedback';
import { useUnitSettings } from '../../hooks/useUnitSettings';

function ProgressBar({ step, total }: { step: number; total: number }) {
  const pct = ((step + 1) / total) * 100;
  return (
    <View className="mb-6 h-1 w-full overflow-hidden rounded-full bg-sage/40">
      <View className="h-full bg-mint" style={{ width: `${pct}%` }} />
    </View>
  );
}

function toggleValue(list: string[], value: string) {
  return list.includes(value)
    ? list.filter((v) => v !== value)
    : [...list, value];
}

function parsePositiveNumber(raw: string): number | null {
  const normalized = raw.replace(',', '.').trim();
  if (!normalized) {
    return null;
  }
  const value = Number(normalized);
  return Number.isFinite(value) && value > 0 ? value : null;
}

function parseAge(raw: string): number | null {
  const value = parsePositiveNumber(raw);
  if (value == null) {
    return null;
  }
  const age = Math.round(value);
  return age >= 13 && age <= 100 ? age : null;
}

const inputStyle = {
  fontFamily: fonts.sans,
  borderWidth: 1,
  borderColor: 'rgba(11,31,26,0.15)',
  borderRadius: 12,
  paddingHorizontal: 14,
  paddingVertical: 12,
  color: colors.ink,
} as const;

export function OnboardingScreen() {
  const saveProfile = useProfileStore((s) => s.saveProfile);
  const existing = useProfileStore((s) => s.profile);

  const [step, setStep] = useState(0);
  const [displayName, setDisplayName] = useState(existing?.displayName ?? '');
  const [goal, setGoal] = useState(existing?.goal ?? 'maintain');
  const [dietaryPreferences, setDietaryPreferences] = useState<string[]>(
    existing?.dietaryPreferences ?? [],
  );
  const [restrictions, setRestrictions] = useState<string[]>(
    existing?.restrictions ?? [],
  );
  const [localStaples, setLocalStaples] = useState<string[]>(
    existing?.localStaples ?? [],
  );
  const [customStaple, setCustomStaple] = useState('');
  const [activityLevel, setActivityLevel] = useState(
    existing?.activityLevel ?? '',
  );
  const [experienceLevel, setExperienceLevel] = useState(
    existing?.experienceLevel ?? '',
  );
  const [ageText, setAgeText] = useState(
    existing?.age != null ? String(existing.age) : '',
  );
  const [sex, setSex] = useState(existing?.sex ?? '');
  const [heightText, setHeightText] = useState(
    existing?.heightCm != null ? String(existing.heightCm) : '',
  );
  const [weightText, setWeightText] = useState(
    existing?.weightKg != null ? String(existing.weightKg) : '',
  );
  const [daysPerWeek, setDaysPerWeek] = useState(existing?.daysPerWeek ?? 3);
  const [mealsPerDay, setMealsPerDay] = useState(existing?.mealsPerDay ?? 3);
  const [equipment, setEquipment] = useState<string[]>(
    existing?.equipment?.length
      ? existing.equipment
      : ['Bodyweight only'],
  );
  const [error, setError] = useState<string | null>(null);
  const { isSaving: saving, buttonLabel, runSave } =
    useSaveFeedback('Save profile');
  const {
    heightLabel,
    weightLabel,
    heightPlaceholder,
    weightPlaceholder,
    parseHeightToCm: parseHeight,
    parseWeightToKg: parseWeight,
  } = useUnitSettings();

  const total = 6;
  const title = useMemo(
    () =>
      [
        'Your goal',
        'Food preferences',
        'Local staples',
        'Activity & experience',
        'About you',
        'Your schedule',
      ][step],
    [step],
  );
  const subtitle = useMemo(
    () =>
      [
        'Pick one focus so we can shape training and meals.',
        'Select what you like—and what to avoid.',
        'We’ll build meals around foods you already eat.',
        'Helps us calibrate intensity and recovery.',
        'Used for safe, personalized calorie and training guidance.',
        'How often do you want to train and eat?',
      ][step],
    [step],
  );

  const addCustomStaple = () => {
    const value = customStaple.trim();
    if (!value) {
      return;
    }
    setLocalStaples((prev) =>
      prev.includes(value) ? prev : [...prev, value],
    );
    setCustomStaple('');
  };

  const bodyStatsValid =
    displayName.trim().length >= 2 &&
    parseAge(ageText) != null &&
    parseHeight(heightText) != null &&
    parseWeight(weightText) != null &&
    Boolean(sex);

  const canContinue = () => {
    if (step === 0) {
      return Boolean(goal);
    }
    if (step === 2) {
      return localStaples.length > 0;
    }
    if (step === 3) {
      return Boolean(activityLevel && experienceLevel);
    }
    if (step === 4) {
      return bodyStatsValid;
    }
    return true;
  };

  const onFinish = async () => {
    setError(null);
    const age = parseAge(ageText);
    const heightCm = parseHeight(heightText);
    const weightKg = parseWeight(weightText);
    if (
      displayName.trim().length < 2 ||
      age == null ||
      heightCm == null ||
      weightKg == null ||
      !sex
    ) {
      setError('Please complete your name, age, sex, height, and weight.');
      return;
    }
    try {
      await runSave(async () => {
        await saveProfile({
          displayName: displayName.trim(),
          goal,
          dietaryPreferences,
          restrictions,
          localStaples,
          activityLevel,
          experienceLevel,
          daysPerWeek,
          mealsPerDay,
          equipment,
          age,
          sex,
          heightCm,
          weightKg,
        });
      });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not save profile');
    }
  };

  return (
    <Screen>
      <ProgressBar step={step} total={total} />
      <SectionTitle title={title} subtitle={subtitle} />

      <ScrollView
        className="flex-1"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: 24 }}>
        {step === 0 ? (
          <View className="flex-row flex-wrap gap-2">
            {GOALS.map((g) => (
              <Chip
                key={g.value}
                label={g.label}
                selected={goal === g.value}
                onPress={() => setGoal(g.value)}
              />
            ))}
          </View>
        ) : null}

        {step === 1 ? (
          <View className="gap-6">
            <View>
              <Text className="mb-2 font-sans-semibold text-ink">Preferences</Text>
              <View className="flex-row flex-wrap gap-2">
                {DIET_PREFS.map((item) => (
                  <Chip
                    key={item}
                    label={item}
                    selected={dietaryPreferences.includes(item)}
                    onPress={() =>
                      setDietaryPreferences((prev) => toggleValue(prev, item))
                    }
                  />
                ))}
              </View>
            </View>
            <View>
              <Text className="mb-2 font-sans-semibold text-ink">Restrictions</Text>
              <View className="flex-row flex-wrap gap-2">
                {RESTRICTIONS.map((item) => (
                  <Chip
                    key={item}
                    label={item}
                    selected={restrictions.includes(item)}
                    onPress={() =>
                      setRestrictions((prev) => toggleValue(prev, item))
                    }
                  />
                ))}
              </View>
            </View>
          </View>
        ) : null}

        {step === 2 ? (
          <View>
            <View className="mb-4 flex-row flex-wrap gap-2">
              {STAPLES.map((item) => (
                <Chip
                  key={item}
                  label={item}
                  selected={localStaples.includes(item)}
                  onPress={() =>
                    setLocalStaples((prev) => toggleValue(prev, item))
                  }
                />
              ))}
              {localStaples
                .filter((s) => !(STAPLES as readonly string[]).includes(s))
                .map((item) => (
                  <Chip
                    key={item}
                    label={item}
                    selected
                    onPress={() =>
                      setLocalStaples((prev) => toggleValue(prev, item))
                    }
                  />
                ))}
            </View>
            <View className="flex-row items-center gap-2">
              <TextInput
                value={customStaple}
                onChangeText={setCustomStaple}
                placeholder="Add custom staple"
                placeholderTextColor={colors.sage}
                style={{ ...inputStyle, flex: 1 }}
              />
              <Pressable
                onPress={addCustomStaple}
                className="rounded-xl bg-ink px-4 py-3">
                <Text className="font-sans-semibold text-mist">Add</Text>
              </Pressable>
            </View>
          </View>
        ) : null}

        {step === 3 ? (
          <View className="gap-6">
            <View>
              <Text className="mb-2 font-sans-semibold text-ink">
                Daily activity
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {ACTIVITY_LEVELS.map((item) => (
                  <Chip
                    key={item.value}
                    label={item.label}
                    selected={activityLevel === item.value}
                    onPress={() => setActivityLevel(item.value)}
                  />
                ))}
              </View>
            </View>
            <View>
              <Text className="mb-2 font-sans-semibold text-ink">
                Training experience
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {EXPERIENCE_LEVELS.map((item) => (
                  <Chip
                    key={item.value}
                    label={item.label}
                    selected={experienceLevel === item.value}
                    onPress={() => setExperienceLevel(item.value)}
                  />
                ))}
              </View>
            </View>
          </View>
        ) : null}

        {step === 4 ? (
          <View className="gap-5">
            <View>
              <Text className="mb-2 font-sans-semibold text-ink">
                What should we call you?
              </Text>
              <TextInput
                value={displayName}
                onChangeText={setDisplayName}
                placeholder="First name or nickname"
                placeholderTextColor={colors.sage}
                autoCapitalize="words"
                style={inputStyle}
              />
            </View>
            <View>
              <Text className="mb-2 font-sans-semibold text-ink">Sex</Text>
              <View className="flex-row flex-wrap gap-2">
                {SEX_OPTIONS.map((item) => (
                  <Chip
                    key={item.value}
                    label={item.label}
                    selected={sex === item.value}
                    onPress={() => setSex(item.value)}
                  />
                ))}
              </View>
            </View>
            <View>
              <Text className="mb-2 font-sans-semibold text-ink">Age</Text>
              <TextInput
                value={ageText}
                onChangeText={setAgeText}
                keyboardType="number-pad"
                placeholder="e.g. 28"
                placeholderTextColor={colors.sage}
                style={inputStyle}
              />
            </View>
            <View className="flex-row gap-3">
              <View className="flex-1">
                <Text className="mb-2 font-sans-semibold text-ink">{heightLabel}</Text>
                <TextInput
                  value={heightText}
                  onChangeText={setHeightText}
                  keyboardType="decimal-pad"
                  placeholder={heightPlaceholder}
                  placeholderTextColor={colors.sage}
                  style={inputStyle}
                />
              </View>
              <View className="flex-1">
                <Text className="mb-2 font-sans-semibold text-ink">{weightLabel}</Text>
                <TextInput
                  value={weightText}
                  onChangeText={setWeightText}
                  keyboardType="decimal-pad"
                  placeholder={weightPlaceholder}
                  placeholderTextColor={colors.sage}
                  style={inputStyle}
                />
              </View>
            </View>
            {!bodyStatsValid && (ageText || heightText || weightText) ? (
              <Text className="font-sans text-sm text-coral">
                Use age 13–100 and positive height/weight values.
              </Text>
            ) : null}
          </View>
        ) : null}

        {step === 5 ? (
          <View className="gap-6">
            <View>
              <Text className="mb-2 font-sans-semibold text-ink">
                Training days / week: {daysPerWeek}
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {[2, 3, 4, 5, 6].map((n) => (
                  <Chip
                    key={n}
                    label={`${n}`}
                    selected={daysPerWeek === n}
                    onPress={() => setDaysPerWeek(n)}
                  />
                ))}
              </View>
            </View>
            <View>
              <Text className="mb-2 font-sans-semibold text-ink">
                Meals / day: {mealsPerDay}
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {[2, 3, 4, 5].map((n) => (
                  <Chip
                    key={n}
                    label={`${n}`}
                    selected={mealsPerDay === n}
                    onPress={() => setMealsPerDay(n)}
                  />
                ))}
              </View>
            </View>
            <View>
              <Text className="mb-2 font-sans-semibold text-ink">Equipment</Text>
              <View className="flex-row flex-wrap gap-2">
                {EQUIPMENT.map((item) => (
                  <Chip
                    key={item}
                    label={item}
                    selected={equipment.includes(item)}
                    onPress={() =>
                      setEquipment((prev) => toggleValue(prev, item))
                    }
                  />
                ))}
              </View>
            </View>
          </View>
        ) : null}
      </ScrollView>

      {error ? (
        <Text className="mb-2 font-sans text-sm text-coral">{error}</Text>
      ) : null}

      <View className="gap-3 pb-1">
        {step < total - 1 ? (
          <PrimaryButton
            label="Continue"
            disabled={!canContinue()}
            onPress={() => setStep((s) => s + 1)}
          />
        ) : (
          <PrimaryButton
            label={buttonLabel}
            disabled={saving || !canContinue()}
            onPress={onFinish}
          />
        )}
        {step > 0 ? (
          <SecondaryButton label="Back" onPress={() => setStep((s) => s - 1)} />
        ) : null}
      </View>
    </Screen>
  );
}
