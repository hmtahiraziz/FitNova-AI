import React, { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  PrimaryButton,
  Screen,
  SoftCardHeader,
  TextField,
} from '../../components/ui';
import { forgotPassword } from '../../api/auth';
import { ApiError } from '../../api/client';
import { resendLockedUntilNow } from '../../hooks/useResendCooldown';
import { showToast } from '../../store/toastStore';
import type { AuthStackParamList } from '../../navigation/types';

const schema = z.object({
  email: z.string().email('Enter a valid email'),
});

type FormValues = z.infer<typeof schema>;

type Props = NativeStackScreenProps<AuthStackParamList, 'ForgotPassword'>;

export function ForgotPasswordScreen({ navigation, route }: Props) {
  const [formError, setFormError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const prefilledEmail = route.params?.email?.trim().toLowerCase() ?? '';

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: prefilledEmail },
  });

  useEffect(() => {
    if (prefilledEmail) {
      reset({ email: prefilledEmail });
    }
  }, [prefilledEmail, reset]);

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    setInfo(null);
    const email = values.email.trim().toLowerCase();
    try {
      const result = await forgotPassword(email);
      setInfo(result.message);
      showToast(result.message, 'info');
      navigation.navigate('ResetPassword', {
        email,
        devCode: result.devCode,
        resendLockedUntil: resendLockedUntilNow(),
      });
    } catch (err) {
      setFormError(
        err instanceof ApiError ? err.message : 'Could not send reset code',
      );
    }
  });

  return (
    <Screen>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1">
        <ScrollView keyboardShouldPersistTaps="handled">
          <SoftCardHeader
            title="Reset password"
            subtitle="Enter your email for a 6-digit code."
            onBack={() => navigation.goBack()}
            backLabel="Back"
          />

          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextField
                label="Email"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                keyboardType="email-address"
                autoComplete="email"
                error={errors.email?.message}
              />
            )}
          />

          {formError ? (
            <Text className="mb-3 font-sans text-sm text-coral">{formError}</Text>
          ) : null}
          {info ? (
            <Text className="mb-3 font-sans text-sm text-slate">{info}</Text>
          ) : null}

          <PrimaryButton
            label={isSubmitting ? 'Sending…' : 'Send reset code'}
            onPress={onSubmit}
            disabled={isSubmitting}
          />

          <Pressable
            onPress={() => navigation.navigate('Login')}
            className="mt-8 items-center">
            <Text className="font-sans-semibold text-ink">Back to sign in</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}
