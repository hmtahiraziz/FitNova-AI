import React, { useEffect, useState } from 'react';
import {
  Pressable,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StaplesEditor } from '../../components/profile/StaplesEditor';
import {
  KeyboardForm,
  PrimaryButton,
  SaveSuccessHint,
  Screen,
  SecondaryButton,
  StackScreenHeader,
  useKeyboardForm,
} from '../../components/ui';
import { GlassSurface } from '../../components/ui/GlassSurface';
import { brand, colors, fonts } from '../../theme/tokens';
import { useAppSettingsStore } from '../../store/appSettingsStore';
import { useAuthStore } from '../../store/authStore';
import { showDialog } from '../../store/dialogStore';
import { usePlanStore } from '../../store/planStore';
import { useProfileStore } from '../../store/profileStore';
import type { RootStackParamList } from '../../navigation/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { syncRemindersFromAppState } from '../../lib/syncReminders';
import { requestReminderPermission } from '../../services/reminderNotifications';
import { ApiError } from '../../api/client';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';
import { useSaveFeedback } from '../../hooks/useSaveFeedback';
import { requireOnline } from '../../lib/offline';
import { profileToInput } from '../../lib/profileInput';

type Props = NativeStackScreenProps<RootStackParamList, 'AdvancedSettings'>;

const CARD_RADIUS = 20;

function SectionLabel({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <View className="mb-2.5 mt-1">
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

function UnitChip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={{
        borderRadius: 999,
        paddingHorizontal: 14,
        paddingVertical: 10,
        backgroundColor: selected ? colors.ink : `${colors.sage}44`,
        borderWidth: selected ? 0 : 1,
        borderColor: colors.glassBorder,
      }}>
      <Text
        style={{
          fontFamily: fonts.sansSemiBold,
          fontSize: 13,
          lineHeight: 18,
          color: selected ? colors.mist : colors.ink,
        }}>
        {label}
      </Text>
    </Pressable>
  );
}

function LinkRow({
  label,
  onPress,
  isLast = false,
}: {
  label: string;
  onPress: () => void;
  isLast?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="link"
      onPress={onPress}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 14,
        borderBottomWidth: isLast ? 0 : 1,
        borderBottomColor: colors.glassBorder,
      }}>
      <Text
        style={{
          fontFamily: fonts.sansSemiBold,
          fontSize: 15,
          lineHeight: 20,
          color: colors.ink,
        }}>
        {label}
      </Text>
      <Text
        style={{
          fontFamily: fonts.sansSemiBold,
          fontSize: 16,
          color: colors.mint,
        }}>
        →
      </Text>
    </Pressable>
  );
}

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
    <GlassSurface
      className="mb-2.5 flex-row items-center justify-between gap-3 px-4 py-3.5"
      style={{ borderRadius: CARD_RADIUS }}>
      <View className="min-w-0 flex-1 shrink">
        <View className="flex-row items-center gap-2">
          <Text
            style={{
              flex: 1,
              minWidth: 0,
              fontFamily: fonts.sansSemiBold,
              fontSize: 15,
              lineHeight: 20,
              color: colors.ink,
            }}>
            {label}
          </Text>
          <View
            style={{
              paddingHorizontal: 8,
              paddingVertical: 2,
              borderRadius: 999,
              backgroundColor: value ? `${colors.mint}44` : `${colors.sage}44`,
            }}>
            <Text
              style={{
                fontFamily: fonts.sansSemiBold,
                fontSize: 10,
                lineHeight: 13,
                color: colors.ink,
              }}>
              {value ? 'On' : 'Off'}
            </Text>
          </View>
        </View>
        <Text
          style={{
            marginTop: 6,
            fontFamily: fonts.sans,
            fontSize: 13,
            lineHeight: 18,
            color: colors.slate,
          }}>
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

function DeleteAccountSection({
  email,
  requirePassword,
  deletePassword,
  setDeletePassword,
  deleteError,
  onDeletePress,
  disabled = false,
}: {
  email?: string | null;
  requirePassword: boolean;
  deletePassword: string;
  setDeletePassword: (v: string) => void;
  deleteError: string | null;
  onDeletePress: () => void;
  disabled?: boolean;
}) {
  const { scrollFocusedIntoView } = useKeyboardForm();

  return (
    <GlassSurface
      className="mt-2 px-4 py-4"
      style={{
        borderRadius: CARD_RADIUS,
        borderColor: `${colors.coral}55`,
      }}>
      <View className="mb-1 flex-row items-center justify-between gap-2">
        <Text
          style={{
            fontFamily: fonts.sansSemiBold,
            fontSize: 15,
            lineHeight: 20,
            color: colors.coral,
          }}>
          Delete account
        </Text>
        <View
          style={{
            paddingHorizontal: 8,
            paddingVertical: 3,
            borderRadius: 999,
            backgroundColor: `${colors.coral}22`,
          }}>
          <Text
            style={{
              fontFamily: fonts.sansSemiBold,
              fontSize: 10,
              lineHeight: 13,
              color: colors.coral,
            }}>
            Permanent
          </Text>
        </View>
      </View>
      <Text
        style={{
          fontFamily: fonts.sans,
          fontSize: 13,
          lineHeight: 18,
          color: colors.slate,
        }}>
        Removes {email ?? 'your account'}, profile, plans, and logs. Confirm in
        the next dialog.
      </Text>
      {requirePassword ? (
        <TextInput
          value={deletePassword}
          onChangeText={setDeletePassword}
          onFocus={() => scrollFocusedIntoView()}
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
            backgroundColor: colors.mistLight,
          }}
        />
      ) : null}
      {deleteError ? (
        <Text className="mt-2 font-sans text-sm text-coral">{deleteError}</Text>
      ) : null}
      <View className="mt-3">
        <SecondaryButton
          label="Delete account"
          onPress={onDeletePress}
          disabled={disabled}
        />
      </View>
    </GlassSurface>
  );
}

export function AdvancedSettingsScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { isOffline } = useNetworkStatus();
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
  const setWeightUnit = useAppSettingsStore((s) => s.setWeightUnit);
  const setHeightUnit = useAppSettingsStore((s) => s.setHeightUnit);
  const setDailyReminders = useAppSettingsStore((s) => s.setDailyReminders);
  const setWorkoutReminders = useAppSettingsStore((s) => s.setWorkoutReminders);
  const clearPlanCache = usePlanStore((s) => s.clear);

  const [localStaples, setLocalStaples] = useState<string[]>(
    profile?.localStaples ?? [],
  );
  const [deletePassword, setDeletePassword] = useState('');
  const [staplesError, setStaplesError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [cacheCleared, setCacheCleared] = useState(false);

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
    setCacheCleared(true);
    setTimeout(() => setCacheCleared(false), 2000);
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
    if (!requireOnline('Connect to save your staples.')) {
      return;
    }
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
    if (!requireOnline('Connect to delete your account.')) {
      return;
    }
    setDeleteError(null);
    const needsPassword = user?.hasGoogle === false;
    if (needsPassword && deletePassword.trim().length < 8) {
      setDeleteError('Enter your account password to delete.');
      return;
    }
    try {
      await deleteAccount({
        confirmation: 'DELETE',
        password: needsPassword ? deletePassword.trim() : undefined,
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
    setDeleteError(null);
    const needsPassword = user?.hasGoogle === false;
    if (needsPassword && deletePassword.trim().length < 8) {
      setDeleteError('Enter your account password first.');
      return;
    }
    showDialog({
      title: 'Delete account?',
      message:
        'This permanently removes your profile, plans, and progress. This cannot be undone.',
      actions: [
        {
          label: 'Delete',
          variant: 'destructive',
          onPress: () => void performDeleteAccount(),
        },
        { label: 'Cancel', variant: 'secondary' },
      ],
    });
  };

  const footerPad = Math.max(insets.bottom, 16) + 12;

  return (
    <Screen tabBarInset={false} edges={['top', 'left', 'right']}>
      <View className="min-h-0 flex-1">
        <KeyboardForm bottomExtra={24} focusLift={40}>
          <StackScreenHeader
            title="Settings"
            subtitle="Preferences, reminders, and account controls."
            onBack={() => navigation.goBack()}
          />

          {user?.email ? (
            <GlassSurface
              className="mb-4 px-4 py-3.5"
              style={{ borderRadius: CARD_RADIUS }}>
              <Text
                style={{
                  fontFamily: fonts.sansMedium,
                  fontSize: 11,
                  lineHeight: 14,
                  letterSpacing: 0.5,
                  color: colors.slate,
                }}>
                SIGNED IN AS
              </Text>
              <Text
                numberOfLines={1}
                style={{
                  marginTop: 4,
                  fontFamily: fonts.sansSemiBold,
                  fontSize: 15,
                  lineHeight: 20,
                  color: colors.ink,
                }}>
                {user.email}
              </Text>
              <View className="mt-2 flex-row flex-wrap gap-2">
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
                    {user.hasGoogle ? 'Google' : 'Email'}
                  </Text>
                </View>
              </View>
            </GlassSurface>
          ) : null}

          <SectionLabel
            title="Local staples"
            subtitle="Foods your meal plans should prioritize."
          />
          <GlassSurface
            className="mb-5 px-4 py-4"
            style={{ borderRadius: CARD_RADIUS }}>
            <StaplesEditor
              staples={localStaples}
              onChange={setLocalStaples}
              helperText="After changing staples, regenerate your plan for updated meals."
            />
            {latestPlan ? (
              <Pressable
                onPress={() => navigation.navigate('GeneratePlan')}
                style={{
                  marginTop: 12,
                  alignSelf: 'flex-start',
                  borderRadius: 999,
                  borderWidth: 1,
                  borderColor: colors.glassBorder,
                  backgroundColor: colors.mist,
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                }}>
                <Text
                  style={{
                    fontFamily: fonts.sansSemiBold,
                    fontSize: 13,
                    lineHeight: 18,
                    color: colors.ink,
                  }}>
                  Regenerate plan →
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
              disabled={
                savingStaples || localStaples.length === 0 || isOffline
              }
            />
          </GlassSurface>

          <SectionLabel
            title="Units"
            subtitle="Display only — stored values stay metric on the server."
          />
          <GlassSurface
            className="mb-5 px-4 py-4"
            style={{ borderRadius: CARD_RADIUS }}>
            <Text
              style={{
                fontFamily: fonts.sansMedium,
                fontSize: 12,
                lineHeight: 16,
                color: colors.slate,
              }}>
              Weight
            </Text>
            <View className="mt-2 flex-row flex-wrap gap-2">
              <UnitChip
                label="kg"
                selected={weightUnit === 'kg'}
                onPress={() => setWeightUnit('kg')}
              />
              <UnitChip
                label="lb"
                selected={weightUnit === 'lb'}
                onPress={() => setWeightUnit('lb')}
              />
            </View>
            <Text
              style={{
                marginTop: 14,
                fontFamily: fonts.sansMedium,
                fontSize: 12,
                lineHeight: 16,
                color: colors.slate,
              }}>
              Height
            </Text>
            <View className="mt-2 flex-row flex-wrap gap-2">
              <UnitChip
                label="cm"
                selected={heightUnit === 'cm'}
                onPress={() => setHeightUnit('cm')}
              />
              <UnitChip
                label="ft / in"
                selected={heightUnit === 'ft'}
                onPress={() => setHeightUnit('ft')}
              />
            </View>
          </GlassSurface>

          <SectionLabel
            title="Reminders"
            subtitle="Scheduled on this device — not marketing push."
          />
          <SettingRow
            label="Daily log reminder"
            description="Evening nudge to log workouts and meals."
            value={dailyReminders}
            onValueChange={(v) => void onDailyRemindersChange(v)}
          />
          <SettingRow
            label="Workout day reminder"
            description="Morning reminder on planned training days."
            value={workoutReminders}
            onValueChange={(v) => void onWorkoutRemindersChange(v)}
          />

          <SectionLabel
            title="Privacy & data"
            subtitle="Legal documents and local cache on this device."
          />

          <GlassSurface
            className="mb-2.5 px-4 py-2"
            style={{ borderRadius: CARD_RADIUS }}>
            <Text
              style={{
                marginTop: 8,
                fontFamily: fonts.sansSemiBold,
                fontSize: 15,
                lineHeight: 20,
                color: colors.ink,
              }}>
              Legal
            </Text>
            <Text
              style={{
                marginTop: 4,
                marginBottom: 4,
                fontFamily: fonts.sans,
                fontSize: 13,
                lineHeight: 18,
                color: colors.slate,
              }}>
              How {brand.fullName} handles your account and health profile.
            </Text>
            <LinkRow
              label="Privacy Policy"
              onPress={() =>
                navigation.navigate('LegalDocument', { doc: 'privacy' })
              }
            />
            <LinkRow
              label="Terms of Service"
              onPress={() =>
                navigation.navigate('LegalDocument', { doc: 'terms' })
              }
              isLast
            />
          </GlassSurface>

          <GlassSurface
            className="mb-2.5 px-4 py-4"
            style={{ borderRadius: CARD_RADIUS }}>
            <Text
              style={{
                fontFamily: fonts.sansSemiBold,
                fontSize: 15,
                lineHeight: 20,
                color: colors.ink,
              }}>
              Clear cached plan
            </Text>
            <Text
              style={{
                marginTop: 4,
                fontFamily: fonts.sans,
                fontSize: 13,
                lineHeight: 18,
                color: colors.slate,
              }}>
              Removes the offline plan copy. Latest plan reloads from the
              server.
            </Text>
            <View className="mt-3">
              <SecondaryButton
                label={cacheCleared ? 'Cache cleared' : 'Clear cache'}
                onPress={() => void onClearCache()}
                disabled={cacheCleared}
              />
            </View>
          </GlassSurface>

          <SectionLabel title="Danger zone" />
          <DeleteAccountSection
            email={user?.email}
            requirePassword={user?.hasGoogle === false}
            deletePassword={deletePassword}
            setDeletePassword={setDeletePassword}
            deleteError={deleteError}
            onDeletePress={onDeletePress}
            disabled={isOffline}
          />

          <Text
            style={{
              marginTop: 20,
              marginBottom: 8,
              textAlign: 'center',
              fontFamily: fonts.sans,
              fontSize: 12,
              lineHeight: 18,
              color: colors.slate,
            }}>
            {brand.fullName} · General wellness guidance, not medical advice.
          </Text>
        </KeyboardForm>

        <View
          style={{
            borderTopWidth: 1,
            borderTopColor: colors.glassBorder,
            backgroundColor: colors.mistLight,
            paddingTop: 14,
            paddingBottom: footerPad,
            paddingHorizontal: 4,
          }}>
          <PrimaryButton
            className="rounded-full"
            label="Done"
            onPress={() => navigation.goBack()}
          />
        </View>
      </View>
    </Screen>
  );
}
