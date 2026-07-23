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
import { GoogleSignInBlock } from '../../components/auth/GoogleSignInBlock';
import {
  PasswordField,
  PrimaryButton,
  Screen,
  SectionTitle,
  TextField,
} from '../../components/ui';
import { useGoogleSignIn } from '../../hooks/useGoogleSignIn';
import { useAuthStore } from '../../store/authStore';
import { ApiError } from '../../api/client';
import { AppLogo } from '../../components/brand/AppLogo';
import { brand, colors } from '../../theme/tokens';
import type { AuthStackParamList } from '../../navigation/types';

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

type FormValues = z.infer<typeof schema>;

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export function LoginScreen({ navigation, route }: Props) {
  const login = useAuthStore((s) => s.login);
  const [formError, setFormError] = useState<string | null>(null);
  const prefilledEmail = route.params?.email?.trim().toLowerCase() ?? '';

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: prefilledEmail, password: '' },
  });

  useEffect(() => {
    if (prefilledEmail) {
      reset({ email: prefilledEmail, password: '' });
    }
  }, [prefilledEmail, reset]);

  const { signInWithGoogle, googleLoading } = useGoogleSignIn((message) =>
    setFormError(message),
  );

  const emailField = watch('email');

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      await login(values.email.trim().toLowerCase(), values.password);
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : 'Sign in failed');
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
          <View className="mt-2">
            <AppLogo variant="compact" />
          </View>
          <SectionTitle
            className="mt-6"
            title="Welcome back"
            subtitle={`Sign in to ${brand.fullName} to continue your plan.`}
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
                autoComplete="password"
                error={errors.password?.message}
              />
            )}
          />

          <Pressable
            onPress={() =>
              navigation.navigate('ForgotPassword', {
                email: emailField.trim().toLowerCase() || undefined,
              })
            }
            className="mb-4 self-end">
            <Text className="font-sans-medium text-sm text-slate">
              Forgot password?
            </Text>
          </Pressable>

          {formError ? (
            <Text className="mb-3 font-sans text-sm text-coral">{formError}</Text>
          ) : null}

          <PrimaryButton
            label={isSubmitting ? 'Signing in…' : 'Sign in'}
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
            onPress={() => navigation.navigate('Register')}
            className="mt-8 items-center">
            <Text className="font-sans text-slate">
              New here?{' '}
              <Text className="font-sans-semibold text-ink">Create account</Text>
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}
