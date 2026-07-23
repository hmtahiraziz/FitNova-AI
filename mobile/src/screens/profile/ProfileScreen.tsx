import React, { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  Chip,
  PrimaryButton,
  ProfileStatCard,
  SecondaryButton,
  SaveSuccessHint,
  Screen,
} from '../../components/ui';
import { GlassSurface } from '../../components/ui/GlassSurface';
import { ProfileAvatar } from '../../components/profile/ProfileAvatar';
import { getDisplayName } from '../../lib/displayName';
import type { RootStackParamList } from '../../navigation/types';
import {
  ACTIVITY_LEVELS,
  DIET_PREFS,
  EQUIPMENT,
  EXPERIENCE_LEVELS,
  GOALS,
  RESTRICTIONS,
  SEX_OPTIONS,
} from '../../constants/profileOptions';
import { useAuthStore } from '../../store/authStore';
import { usePlanStore } from '../../store/planStore';
import { useProfileStore } from '../../store/profileStore';
import { ApiError } from '../../api/client';
import { useSaveFeedback } from '../../hooks/useSaveFeedback';
import { useUnitSettings } from '../../hooks/useUnitSettings';
import { useResponsive } from '../../hooks/useResponsive';
import { TAB_SCROLL_CONTENT_EXTRA } from '../../lib/tabBarLayout';
import {
  formatHeightFromCm,
  formatWeightFromKg,
  parseHeightToCm,
  parseWeightToKg,
} from '../../lib/units';
import { colors, fonts } from '../../theme/tokens';

function toggleValue(list: string[], value: string) {
  return list.includes(value)
    ? list.filter((v) => v !== value)
    : [...list, value];
}

function ProfileSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <GlassSurface className="mb-4 px-4 py-4" style={{ borderRadius: 24 }}>
      <Text className="mb-3 font-sans-semibold text-base text-ink">{title}</Text>
      {children}
    </GlassSurface>
  );
}

export function ProfileScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const profile = useProfileStore((s) => s.profile);
  const saveProfile = useProfileStore((s) => s.saveProfile);
  const clearProfile = useProfileStore((s) => s.clear);
  const clearPlan = usePlanStore((s) => s.clear);

  const [displayName, setDisplayName] = useState(profile?.displayName ?? '');
  const [goal, setGoal] = useState(profile?.goal ?? 'maintain');
  const [dietaryPreferences, setDietaryPreferences] = useState(
    profile?.dietaryPreferences ?? [],
  );
  const [restrictions, setRestrictions] = useState(profile?.restrictions ?? []);
  const [daysPerWeek, setDaysPerWeek] = useState(profile?.daysPerWeek ?? 3);
  const [mealsPerDay, setMealsPerDay] = useState(profile?.mealsPerDay ?? 3);
  const [equipment, setEquipment] = useState(
    profile?.equipment ?? ['Bodyweight only'],
  );
  const [activityLevel, setActivityLevel] = useState(
    profile?.activityLevel ?? 'moderate',
  );
  const [experienceLevel, setExperienceLevel] = useState(
    profile?.experienceLevel ?? 'beginner',
  );
  const [sex, setSex] = useState(profile?.sex ?? 'prefer_not_to_say');
  const [ageText, setAgeText] = useState(
    profile?.age != null ? String(profile.age) : '',
  );
  const [heightText, setHeightText] = useState(
    profile?.heightCm != null ? String(profile.heightCm) : '',
  );
  const [weightText, setWeightText] = useState(
    profile?.weightKg != null ? String(profile.weightKg) : '',
  );
  const [error, setError] = useState<string | null>(null);
  const {
    isSaving: saving,
    showSuccess,
    buttonLabel,
    successMessage,
    runSave,
  } = useSaveFeedback('Save changes');

  const {
    weightUnit,
    heightUnit,
    heightPlaceholder,
    weightPlaceholder,
  } = useUnitSettings();

  const { isCompact } = useResponsive();

  const opacity = useSharedValue(0);
  const rise = useSharedValue(8);
  const headerStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: rise.value }],
  }));

  useFocusEffect(
    useCallback(() => {
      opacity.value = withTiming(1, { duration: 380 });
      rise.value = withTiming(0, { duration: 380 });
    }, [opacity, rise]),
  );

  useEffect(() => {
    if (!profile) {
      return;
    }
    setDisplayName(profile.displayName ?? '');
    setGoal(profile.goal);
    setDietaryPreferences(profile.dietaryPreferences);
    setRestrictions(profile.restrictions);
    setDaysPerWeek(profile.daysPerWeek);
    setMealsPerDay(profile.mealsPerDay);
    setEquipment(profile.equipment);
    setActivityLevel(profile.activityLevel ?? 'moderate');
    setExperienceLevel(profile.experienceLevel ?? 'beginner');
    setSex(profile.sex ?? 'prefer_not_to_say');
    setAgeText(profile.age != null ? String(profile.age) : '');
    setHeightText(
      profile.heightCm != null
        ? formatHeightFromCm(profile.heightCm, heightUnit)
        : '',
    );
    setWeightText(
      profile.weightKg != null
        ? formatWeightFromKg(profile.weightKg, weightUnit)
        : '',
    );
  }, [profile, heightUnit, weightUnit]);

  const onSave = async () => {
    setError(null);
    try {
      const age = Number(ageText);
      const heightCm = parseHeightToCm(heightText, heightUnit);
      const weightKg = parseWeightToKg(weightText, weightUnit);
      await runSave(async () => {
        await saveProfile({
          displayName: displayName.trim() || null,
          goal,
          dietaryPreferences,
          restrictions,
          localStaples: profile?.localStaples ?? [],
          daysPerWeek,
          mealsPerDay,
          equipment,
          activityLevel,
          experienceLevel,
          sex,
          age: Number.isFinite(age) ? Math.round(age) : null,
          heightCm,
          weightKg,
        });
      });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Save failed');
    }
  };

  const onLogout = () => {
    clearProfile();
    clearPlan();
    void logout();
  };

  const headerName = getDisplayName(
    { displayName: displayName.trim() || profile?.displayName || null },
    user,
  );
  const goalLabel =
    GOALS.find((g) => g.value === goal)?.label ?? goal.replace('_', ' ');

  return (
    <Screen>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: TAB_SCROLL_CONTENT_EXTRA }}>
        <Animated.View style={headerStyle} className="mb-5 items-center">
          <ProfileAvatar
            displayName={headerName}
            avatarUrl={profile?.avatarUrl}
            cacheKey={profile?.updatedAt}
            size={88}
            layout="center"
          />
          <Text className="mt-4 font-display text-3xl text-ink">{headerName}</Text>
          <Text className="mt-1 font-sans text-sm text-slate">
            {user?.email ?? 'Your account'}
          </Text>
        </Animated.View>

        <ProfileSection title="Account">
          <ProfileAvatar
            displayName={headerName}
            avatarUrl={profile?.avatarUrl}
            cacheKey={profile?.updatedAt}
            size={64}
            layout="row"
            showEditBadge
          />
          <Text className="mb-2 mt-4 font-sans text-sm text-slate">Display name</Text>
          <TextInput
            value={displayName}
            onChangeText={setDisplayName}
            placeholder="How you appear in the app"
            placeholderTextColor={colors.sage}
            autoCapitalize="words"
            style={{
              fontFamily: fonts.sans,
              borderWidth: 1,
              borderColor: 'rgba(11,31,26,0.15)',
              borderRadius: 12,
              paddingHorizontal: 14,
              paddingVertical: 12,
              color: colors.ink,
              marginBottom: 12,
            }}
          />
          <Pressable
            onPress={() => navigation.navigate('AdvancedSettings')}
            className="rounded-2xl bg-mist px-4 py-3">
            <Text className="font-sans-semibold text-ink">Advanced settings</Text>
            <Text className="mt-1 font-sans text-sm text-slate">
              Local staples, units, reminders, delete account
            </Text>
          </Pressable>
        </ProfileSection>

        <View className={`mb-5 gap-3 ${isCompact ? 'flex-col' : 'flex-row'}`}>
          <ProfileStatCard label="Goal" value={goalLabel} tone="mint" />
          <ProfileStatCard
            label="Schedule"
            value={`${daysPerWeek}d · ${mealsPerDay}m`}
            tone="sage"
          />
        </View>

        <ProfileSection title="Goal">
          <View className="flex-row flex-wrap gap-2">
            {GOALS.map((g) => (
              <Chip
                key={g.value}
                label={g.label}
                selected={goal === g.value}
                onPress={() => setGoal(g.value)}
                className={
                  isCompact ? 'min-w-[47%] grow basis-[45%]' : undefined
                }
              />
            ))}
          </View>
        </ProfileSection>

        <ProfileSection title="Preferences">
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
        </ProfileSection>

        <ProfileSection title="Restrictions">
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
        </ProfileSection>

        <ProfileSection title="Activity">
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
        </ProfileSection>

        <ProfileSection title="Experience">
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
        </ProfileSection>

        <ProfileSection title="Body stats">
          <View className="mb-3 flex-row flex-wrap gap-2">
            {SEX_OPTIONS.map((item) => (
              <Chip
                key={item.value}
                label={item.label}
                selected={sex === item.value}
                onPress={() => setSex(item.value)}
              />
            ))}
          </View>
          <View className="gap-3">
            <TextInput
              value={ageText}
              onChangeText={setAgeText}
              keyboardType="number-pad"
              placeholder="Age"
              placeholderTextColor={colors.sage}
              style={{
                fontFamily: fonts.sans,
                borderWidth: 1,
                borderColor: 'rgba(11,31,26,0.15)',
                borderRadius: 12,
                paddingHorizontal: 14,
                paddingVertical: 12,
                color: colors.ink,
              }}
            />
            <View className="flex-row gap-3">
              <TextInput
                value={heightText}
                onChangeText={setHeightText}
                keyboardType="decimal-pad"
                placeholder={heightPlaceholder}
                placeholderTextColor={colors.sage}
                style={{
                  flex: 1,
                  fontFamily: fonts.sans,
                  borderWidth: 1,
                  borderColor: 'rgba(11,31,26,0.15)',
                  borderRadius: 12,
                  paddingHorizontal: 14,
                  paddingVertical: 12,
                  color: colors.ink,
                }}
              />
              <TextInput
                value={weightText}
                onChangeText={setWeightText}
                keyboardType="decimal-pad"
                placeholder={weightPlaceholder}
                placeholderTextColor={colors.sage}
                style={{
                  flex: 1,
                  fontFamily: fonts.sans,
                  borderWidth: 1,
                  borderColor: 'rgba(11,31,26,0.15)',
                  borderRadius: 12,
                  paddingHorizontal: 14,
                  paddingVertical: 12,
                  color: colors.ink,
                }}
              />
            </View>
          </View>
        </ProfileSection>

        <ProfileSection title={`Days / week: ${daysPerWeek}`}>
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
        </ProfileSection>

        <ProfileSection title={`Meals / day: ${mealsPerDay}`}>
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
        </ProfileSection>

        <ProfileSection title="Equipment">
          <View className="flex-row flex-wrap gap-2">
            {EQUIPMENT.map((item) => (
              <Chip
                key={item}
                label={item}
                selected={equipment.includes(item)}
                onPress={() => setEquipment((prev) => toggleValue(prev, item))}
              />
            ))}
          </View>
        </ProfileSection>

        {error ? (
          <Text className="mb-2 font-sans text-sm text-coral">{error}</Text>
        ) : null}
        <View className="mb-2 min-h-[28px] justify-center">
          <SaveSuccessHint visible={showSuccess} message={successMessage} />
        </View>

        <PrimaryButton
          label={buttonLabel}
          onPress={onSave}
          disabled={saving}
        />
        <View className="mt-3">
          <SecondaryButton label="Sign out" onPress={onLogout} />
        </View>
      </ScrollView>
    </Screen>
  );
}
