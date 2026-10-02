import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
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
import { EmailAlreadyExistsCard } from '../../components/auth/EmailAlreadyExistsCard';
import { GoogleSignInBlock } from '../../components/auth/GoogleSignInBlock';
import {
  PrimaryButton,
  PasswordField,
  Screen,
  SectionTitle,
  TextField,
} from '../../components/ui';
import { useGoogleSignIn } from '../../hooks/useGoogleSignIn';
import {
  getRegisterErrorMessage,
  isEmailAlreadyRegistered,
} from '../../lib/authErrors';
import { useAuthStore } from '../../store/authStore';
import { AppLogo } from '../../components/brand/AppLogo';
import { brand, colors } from '../../theme/tokens';
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
  const [existingEmail, setExistingEmail] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '', confirm: '' },
  });

  const emailValue = watch('email');

  useEffect(() => {
    if (existingEmail && emailValue.trim().toLowerCase() !== existingEmail) {
      setExistingEmail(null);
    }
  }, [emailValue, existingEmail]);

  const { signInWithGoogle, googleLoading } = useGoogleSignIn((message) =>
    setFormError(message),
  );

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    setExistingEmail(null);
    const email = values.email.trim().toLowerCase();
    try {
      await register(email, values.password);
    } catch (err) {
      if (isEmailAlreadyRegistered(err)) {
        setExistingEmail(email);
        setFormError(null);
        return;
      }
      setFormError(getRegisterErrorMessage(err));
    }
  });

  const onGoogle = () => {
    setFormError(null);
    setExistingEmail(null);
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
          <View className="mt-2">
            <AppLogo variant="compact" />
          </View>
          <SectionTitle
            className="mt-6"
            title="Create your account"
            subtitle={`Join ${brand.fullName} for workouts, meals, and streaks.`}
          />

          {existingEmail ? (
            <EmailAlreadyExistsCard
              email={existingEmail}
              onSignIn={() =>
                navigation.navigate('Login', { email: existingEmail })
              }
              onResetPassword={() =>
                navigation.navigate('ForgotPassword', { email: existingEmail })
              }
            />
          ) : null}

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
