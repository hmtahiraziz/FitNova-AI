import React, { useState } from 'react';
import {
  ActivityIndicator,
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
import { GoogleSignInBlock } from '../../components/auth/GoogleSignInBlock';
import {
  PrimaryButton,
  PasswordField,
  Screen,
  SoftCardHeader,
  TextField,
} from '../../components/ui';
import { useGoogleSignIn } from '../../hooks/useGoogleSignIn';
import { getRegisterErrorMessage } from '../../lib/authErrors';
import { useAuthStore } from '../../store/authStore';
import { colors } from '../../theme/tokens';
import type { AuthStackParamList } from '../../navigation/types';

const schema = z
  .object({
    email: z.string().email('Enter a valid email'),
    password: z.string().min(8, 'At least 8 characters'),
    confirm: z.string().min(1, 'Confirm your password'),
  })
  .refine((v) => v.password === v.confirm, {
    message: 'Passwords do not match',
    path: ['confirm'],
  });

type FormValues = z.infer<typeof schema>;

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;

export function RegisterScreen({ navigation }: Props) {
  const register = useAuthStore((s) => s.register);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '', confirm: '' },
  });

  const { signInWithGoogle, googleLoading } = useGoogleSignIn((message) =>
    setFormError(message),
  );

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      await register(values.email.trim().toLowerCase(), values.password);
    } catch (err) {
      setFormError(getRegisterErrorMessage(err));
    }
  });

  const onGoogle = () => {
    setFormError(null);
    void signInWithGoogle();
  };

  return (
    <Screen>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1">
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 24 }}>
          <SoftCardHeader
            title="Create account"
            subtitle="Workouts, meals, and streaks in one place."
            onBack={() => navigation.navigate('Welcome')}
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
          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, onBlur, value } }) => (
              <PasswordField
                label="Password"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                showStrength
                autoComplete="new-password"
                error={errors.password?.message}
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

          <Text className="mb-4 font-sans text-xs leading-5 text-slate">
            By creating an account you agree to our{' '}
            <Text
              className="font-sans-semibold text-ink"
              onPress={() =>
                navigation.navigate('LegalDocument', { doc: 'terms' })
              }>
              Terms of Service
            </Text>
            {' '}and{' '}
            <Text
              className="font-sans-semibold text-ink"
              onPress={() =>
                navigation.navigate('LegalDocument', { doc: 'privacy' })
              }>
              Privacy Policy
            </Text>
            .
          </Text>

          <PrimaryButton
            label={isSubmitting ? 'Creating…' : 'Create account'}
            onPress={onSubmit}
            disabled={isSubmitting || googleLoading}
          />

          <GoogleSignInBlock
            loading={googleLoading}
            onPress={onGoogle}
            disabled={isSubmitting}
          />

          {isSubmitting && !googleLoading ? (
            <ActivityIndicator className="mt-4" color={colors.mint} />
          ) : null}

          <Pressable
            onPress={() => navigation.navigate('Login')}
            className="mt-8 items-center">
            <Text className="font-sans text-slate">
              Already have an account?{' '}
              <Text className="font-sans-semibold text-ink">Sign in</Text>
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}
