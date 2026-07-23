import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  PasswordField,
  PrimaryButton,
  Screen,
  SectionTitle,
  TextField,
} from '../../components/ui';
import { forgotPassword, resetPassword } from '../../api/auth';
import { ApiError } from '../../api/client';
import { useResendCooldown } from '../../hooks/useResendCooldown';
import { AppLogo } from '../../components/brand/AppLogo';
import { showToast } from '../../store/toastStore';
import type { AuthStackParamList } from '../../navigation/types';

const schema = z
  .object({
    code: z.string().regex(/^\d{6}$/, 'Enter the 6-digit code'),
    newPassword: z.string().min(8, 'At least 8 characters'),
    confirm: z.string().min(1, 'Confirm your password'),
  })
  .refine((v) => v.newPassword === v.confirm, {
    message: 'Passwords do not match',
    path: ['confirm'],
  });

type FormValues = z.infer<typeof schema>;

type Props = NativeStackScreenProps<AuthStackParamList, 'ResetPassword'>;

export function ResetPasswordScreen({ navigation, route }: Props) {
  const { email, devCode, resendLockedUntil } = route.params;
  const [formError, setFormError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [resending, setResending] = useState(false);
  const { secondsLeft, canResend, startCooldown } = useResendCooldown(
    resendLockedUntil,
  );

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      code: devCode ?? '',
      newPassword: '',
      confirm: '',
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      await resetPassword(email, values.code, values.newPassword);
      setDone(true);
      showToast('Password updated. You can sign in now.', 'success');
    } catch (err) {
      setFormError(
        err instanceof ApiError ? err.message : 'Could not reset password',
      );
    }
  });

  const onResend = async () => {
    if (!canResend || resending) {
      return;
    }
    setFormError(null);
    setResending(true);
    try {
      await forgotPassword(email);
      startCooldown();
      showToast('If that email exists, a new code has been sent.', 'info');
    } catch (err) {
      setFormError(
        err instanceof ApiError ? err.message : 'Could not resend code',
      );
    } finally {
      setResending(false);
    }
  };

  const resendLabel = !canResend
    ? `Resend code in 0:${String(secondsLeft).padStart(2, '0')}`
    : resending
      ? 'Sending…'
      : 'Resend code';

  return (
    <Screen>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1">
        <ScrollView keyboardShouldPersistTaps="handled">
          <View className="mt-2">
            <AppLogo variant="compact" />
          </View>
          <SectionTitle
            className="mt-6"
            title="Set a new password"
            subtitle={`Code sent to ${email}`}
          />

          {devCode ? (
            <Text className="mb-3 font-sans text-xs text-slate">
              Dev mode: code prefilled ({devCode})
            </Text>
          ) : null}

          <Controller
            control={control}
            name="code"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextField
                label="6-digit code"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                keyboardType="number-pad"
                maxLength={6}
                error={errors.code?.message}
              />
            )}
          />
          <Controller
            control={control}
            name="newPassword"
            render={({ field: { onChange, onBlur, value } }) => (
              <PasswordField
                label="New password"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                showStrength
                autoComplete="new-password"
                error={errors.newPassword?.message}
              />
            )}
          />
          <Controller
            control={control}
            name="confirm"
            render={({ field: { onChange, onBlur, value } }) => (
              <PasswordField
                label="Confirm password"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                autoComplete="new-password"
                error={errors.confirm?.message}
              />
            )}
          />

          {formError ? (
            <Text className="mb-3 font-sans text-sm text-coral">{formError}</Text>
          ) : null}

          {!done ? (
            <PrimaryButton
              label={isSubmitting ? 'Updating…' : 'Update password'}
              onPress={onSubmit}
              disabled={isSubmitting}
            />
          ) : (
            <PrimaryButton
              label="Back to sign in"
              onPress={() => navigation.navigate('Login', { email })}
            />
          )}

          {!done ? (
            <Pressable
              onPress={() => void onResend()}
              disabled={!canResend || resending}
              className="mt-8 items-center">
              <Text
                className={`font-sans-medium text-sm ${canResend && !resending ? 'text-ink' : 'text-slate'}`}>
                {resendLabel}
              </Text>
            </Pressable>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}
