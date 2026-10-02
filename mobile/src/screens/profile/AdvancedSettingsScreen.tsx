import React, { useEffect, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StaplesEditor } from '../../components/profile/StaplesEditor';
import {
  PrimaryButton,
  SaveSuccessHint,
  Screen,
  SecondaryButton,
  StackScreenHeader,
} from '../../components/ui';
import { GlassSurface } from '../../components/ui/GlassSurface';
import { brand, colors, fonts } from '../../theme/tokens';
import { useAppSettingsStore } from '../../store/appSettingsStore';
import { useAuthStore } from '../../store/authStore';
import { usePlanStore } from '../../store/planStore';
import { useProfileStore } from '../../store/profileStore';
import type { RootStackParamList } from '../../navigation/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { syncRemindersFromAppState } from '../../lib/syncReminders';
import { requestReminderPermission } from '../../services/reminderNotifications';
import { ApiError } from '../../api/client';
import { useSaveFeedback } from '../../hooks/useSaveFeedback';
import { profileToInput } from '../../lib/profileInput';

type Props = NativeStackScreenProps<RootStackParamList, 'AdvancedSettings'>;

function SettingRow({
  label,
  description,
  value,
  onValueChange,
}: {
  label: string;
  description: string;
  value: boolean;
  onValueChange: (next: boolean) => void;
}) {
  return (
    <GlassSurface className="mb-3 flex-row items-center justify-between gap-3 px-4 py-4">
      <View className="min-w-0 flex-1 shrink">
        <Text className="font-sans-semibold text-base leading-5 text-ink">
          {label}
        </Text>
        <Text className="mt-1 font-sans text-sm leading-5 text-slate">
          {description}
        </Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: colors.sage, true: colors.mint }}
        thumbColor={colors.mist}
      />
    </GlassSurface>
  );
}

export function AdvancedSettingsScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const user = useAuthStore((s) => s.user);
  const deleteAccount = useAuthStore((s) => s.deleteAccount);
  const profile = useProfileStore((s) => s.profile);
  const saveProfile = useProfileStore((s) => s.saveProfile);
  const clearProfile = useProfileStore((s) => s.clear);
  const clearPlan = usePlanStore((s) => s.clear);
  const latestPlan = usePlanStore((s) => s.latest);

  const weightUnit = useAppSettingsStore((s) => s.weightUnit);
  const heightUnit = useAppSettingsStore((s) => s.heightUnit);
  const dailyReminders = useAppSettingsStore((s) => s.dailyReminders);
  const workoutReminders = useAppSettingsStore((s) => s.workoutReminders);
  const analyticsEnabled = useAppSettingsStore((s) => s.analyticsEnabled);
  const setWeightUnit = useAppSettingsStore((s) => s.setWeightUnit);
  const setHeightUnit = useAppSettingsStore((s) => s.setHeightUnit);
  const setDailyReminders = useAppSettingsStore((s) => s.setDailyReminders);
  const setWorkoutReminders = useAppSettingsStore((s) => s.setWorkoutReminders);
  const setAnalyticsEnabled = useAppSettingsStore((s) => s.setAnalyticsEnabled);
  const clearPlanCache = usePlanStore((s) => s.clear);

  const [localStaples, setLocalStaples] = useState<string[]>(
    profile?.localStaples ?? [],
  );
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [deletePassword, setDeletePassword] = useState('');
  const [staplesError, setStaplesError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const {
    isSaving: savingStaples,
    showSuccess: staplesSaved,
    buttonLabel: staplesButtonLabel,
    successMessage: staplesSuccessMessage,
    runSave: runStaplesSave,
  } = useSaveFeedback('Save staples');

  useEffect(() => {
    setLocalStaples(profile?.localStaples ?? []);
  }, [profile?.localStaples]);

  const onClearCache = async () => {
    clearPlanCache();
    await AsyncStorage.removeItem('b4-latest-plan');
  };

  const onDailyRemindersChange = async (next: boolean) => {
    if (next) {
      const allowed = await requestReminderPermission();
      if (!allowed) {
        return;
      }
    }
    setDailyReminders(next);
    await syncRemindersFromAppState();
  };

  const onWorkoutRemindersChange = async (next: boolean) => {
    if (next) {
      const allowed = await requestReminderPermission();
      if (!allowed) {
        return;
      }
    }
    setWorkoutReminders(next);
    await syncRemindersFromAppState();
  };

  const onSaveStaples = async () => {
    setStaplesError(null);
    if (!profile) {
      setStaplesError('Complete your profile first.');
      return;
    }
    if (localStaples.length === 0) {
      setStaplesError('Pick at least one staple.');
      return;
    }
    try {
      await runStaplesSave(async () => {
        await saveProfile({
          ...profileToInput(profile),
          localStaples,
        });
      });
    } catch (err) {
      setStaplesError(
        err instanceof ApiError ? err.message : 'Could not save staples',
      );
    }
  };

  const performDeleteAccount = async () => {
    setDeleteError(null);
    if (deleteConfirm.trim() !== 'DELETE') {
      setDeleteError('Type DELETE to confirm.');
      return;
    }
    try {
      await deleteAccount({
        confirmation: 'DELETE',
        password: deletePassword.trim() || undefined,
      });
      clearProfile();
      clearPlan();
    } catch (err) {
      setDeleteError(
        err instanceof ApiError ? err.message : 'Could not delete account',
      );
    }
  };

  const onDeletePress = () => {
    Alert.alert(
      'Delete account?',
      'This permanently removes your profile, plans, and progress. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => void performDeleteAccount(),
        },
      ],
    );
  };

  return (
    <Screen tabBarInset={false} edges={['top', 'left', 'right']}>
      <View className="min-h-0 flex-1">
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: 16 }}>
          <StackScreenHeader
            title="Advanced settings"
            subtitle="Units, local staples, reminders, and account data."
            onBack={() => navigation.goBack()}
          />

          <Text className="mb-2 font-sans-semibold text-sm uppercase tracking-wide text-slate">
            Local staples
          </Text>
          <GlassSurface className="mb-4 px-4 py-4" style={{ borderRadius: 20 }}>
            <StaplesEditor
              staples={localStaples}
              onChange={setLocalStaples}
              helperText="Meal plans prioritize these foods. After changing staples, regenerate your plan from Home or Plan forge."
            />
            {latestPlan ? (
              <Pressable
                onPress={() => navigation.navigate('GeneratePlan')}
                className="mt-3">
                <Text className="font-sans-semibold text-sm text-mint">
                  Regenerate plan for new meals →
                </Text>
              </Pressable>
            ) : null}
            {staplesError ? (
              <Text className="mt-2 font-sans text-sm text-coral">
                {staplesError}
              </Text>
            ) : null}
            <View className="mt-3 min-h-[28px] justify-center">
              <SaveSuccessHint
                visible={staplesSaved}
                message={staplesSuccessMessage}
              />
            </View>
            <PrimaryButton
              label={staplesButtonLabel}
              onPress={() => void onSaveStaples()}
              disabled={savingStaples || localStaples.length === 0}
            />
          </GlassSurface>

          <Text className="mb-2 font-sans-semibold text-sm uppercase tracking-wide text-slate">
            Units
          </Text>
          <View className="mb-4 flex-row flex-wrap gap-2">
            <Pressable
              onPress={() => setWeightUnit('kg')}
              className={`rounded-full px-4 py-2 ${weightUnit === 'kg' ? 'bg-ink' : 'bg-sage/30'}`}>
              <Text
                className={`font-sans-semibold ${weightUnit === 'kg' ? 'text-mist' : 'text-ink'}`}>
                Weight: kg
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setWeightUnit('lb')}
              className={`rounded-full px-4 py-2 ${weightUnit === 'lb' ? 'bg-ink' : 'bg-sage/30'}`}>
              <Text
                className={`font-sans-semibold ${weightUnit === 'lb' ? 'text-mist' : 'text-ink'}`}>
                Weight: lb
              </Text>
            </Pressable>
          </View>
          <View className="mb-6 flex-row flex-wrap gap-2">
            <Pressable
              onPress={() => setHeightUnit('cm')}
              className={`rounded-full px-4 py-2 ${heightUnit === 'cm' ? 'bg-ink' : 'bg-sage/30'}`}>
              <Text
                className={`font-sans-semibold ${heightUnit === 'cm' ? 'text-mist' : 'text-ink'}`}>
                Height: cm
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setHeightUnit('ft')}
              className={`rounded-full px-4 py-2 ${heightUnit === 'ft' ? 'bg-ink' : 'bg-sage/30'}`}>
              <Text
                className={`font-sans-semibold ${heightUnit === 'ft' ? 'text-mist' : 'text-ink'}`}>
                Height: ft/in (display)
              </Text>
            </Pressable>
          </View>

          <Text className="mb-2 font-sans-semibold text-sm uppercase tracking-wide text-slate">
            Reminders
          </Text>
          <SettingRow
            label="Daily log reminder"
            description="Evening nudge to log workouts and meals (scheduled on this device)."
            value={dailyReminders}
            onValueChange={(v) => void onDailyRemindersChange(v)}
          />
          <SettingRow
            label="Workout day reminder"
            description="Morning reminder on your planned training days."
            value={workoutReminders}
            onValueChange={(v) => void onWorkoutRemindersChange(v)}
          />

          <Text className="mb-2 mt-2 font-sans-semibold text-sm uppercase tracking-wide text-slate">
            Privacy & data
          </Text>
          <SettingRow
            label="Usage analytics"
            description="Optional preference stored on this device only. No analytics SDK is active yet."
            value={analyticsEnabled}
            onValueChange={setAnalyticsEnabled}
          />
          <GlassSurface className="mb-3 px-4 py-4">
            <Text className="font-sans-semibold text-base text-ink">
              Legal
            </Text>
            <Text className="mt-1 font-sans text-sm leading-5 text-slate">
              How {brand.fullName} handles your account, health profile, and photos.
            </Text>
            <Pressable
              accessibilityRole="link"
              onPress={() =>
                navigation.navigate('LegalDocument', { doc: 'privacy' })
              }
              className="mt-3">
              <Text className="font-sans-semibold text-sm text-mint">
                Privacy Policy →
              </Text>
            </Pressable>
            <Pressable
              accessibilityRole="link"
              onPress={() =>
                navigation.navigate('LegalDocument', { doc: 'terms' })
              }
              className="mt-2">
              <Text className="font-sans-semibold text-sm text-mint">
                Terms of Service →
              </Text>
            </Pressable>
          </GlassSurface>

          <GlassSurface className="mt-2 px-4 py-4">
            <Text className="font-sans-semibold text-base text-ink">
              Clear cached plan
            </Text>
            <Text className="mt-1 font-sans text-sm leading-5 text-slate">
              Removes offline plan copy; latest plan reloads from the server.
            </Text>
            <View className="mt-3">
              <SecondaryButton label="Clear cache" onPress={() => void onClearCache()} />
            </View>
          </GlassSurface>

          <GlassSurface className="mt-4 px-4 py-4">
            <Text className="font-sans-semibold text-base text-coral">
              Delete account
            </Text>
            <Text className="mt-1 font-sans text-sm leading-5 text-slate">
              Permanently delete {user?.email ?? 'your account'}, profile,
              plans, and logs.
            </Text>
            {user?.hasGoogle === false ? (
              <TextInput
                value={deletePassword}
                onChangeText={setDeletePassword}
                placeholder="Account password"
                placeholderTextColor={colors.sage}
                secureTextEntry
                style={{
                  marginTop: 12,
                  fontFamily: fonts.sans,
                  borderWidth: 1,
                  borderColor: 'rgba(11,31,26,0.15)',
                  borderRadius: 12,
                  paddingHorizontal: 14,
                  paddingVertical: 12,
                  color: colors.ink,
                }}
              />
            ) : null}
            <TextInput
              value={deleteConfirm}
              onChangeText={setDeleteConfirm}
              placeholder='Type DELETE to confirm'
              placeholderTextColor={colors.sage}
              autoCapitalize="characters"
              style={{
                marginTop: 12,
                fontFamily: fonts.sans,
                borderWidth: 1,
                borderColor: 'rgba(11,31,26,0.15)',
                borderRadius: 12,
                paddingHorizontal: 14,
                paddingVertical: 12,
                color: colors.ink,
              }}
            />
            {deleteError ? (
              <Text className="mt-2 font-sans text-sm text-coral">
                {deleteError}
              </Text>
            ) : null}
            <View className="mt-3">
              <SecondaryButton label="Delete account" onPress={onDeletePress} />
            </View>
          </GlassSurface>

          <Text className="mt-6 text-center font-sans text-xs leading-5 text-slate">
            {brand.fullName} · General wellness guidance, not medical advice.
          </Text>
        </ScrollView>

        <View
          className="border-t border-ink/10 pt-4"
          style={{
            backgroundColor: colors.mistLight,
            paddingBottom: Math.max(insets.bottom, 16),
          }}>
          <PrimaryButton label="Done" onPress={() => navigation.goBack()} />
        </View>
      </View>
    </Screen>
  );
}
