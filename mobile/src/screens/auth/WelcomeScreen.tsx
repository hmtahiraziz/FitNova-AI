import React, { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  PrimaryButton,
  Screen,
  SecondaryButton,
  SectionTitle,
} from '../../components/ui';
import { GoogleSignInBlock } from '../../components/auth/GoogleSignInBlock';
import { AppLogo } from '../../components/brand/AppLogo';
import { useGoogleSignIn } from '../../hooks/useGoogleSignIn';
import { brand } from '../../theme/tokens';
import type { AuthStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<AuthStackParamList, 'Welcome'>;

export function WelcomeScreen({ navigation }: Props) {
  const [googleError, setGoogleError] = useState<string | null>(null);
  const { signInWithGoogle, googleLoading } = useGoogleSignIn((message) =>
    setGoogleError(message),
  );

  const opacity = useSharedValue(0);
  const translateY = useSharedValue(12);

  useEffect(() => {
    opacity.value = withDelay(80, withTiming(1, { duration: 520 }));
    translateY.value = withDelay(80, withTiming(0, { duration: 520 }));
  }, [opacity, translateY]);

  const brandStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  const onGoogle = () => {
    setGoogleError(null);
    void signInWithGoogle();
  };

  return (
    <Screen className="justify-between">
      <View className="absolute inset-0 opacity-30">
        <View className="absolute -left-16 top-24 h-64 w-64 rounded-full bg-sage/40" />
        <View className="absolute -right-10 bottom-40 h-48 w-48 rounded-full bg-mint/20" />
      </View>

      <Animated.View style={brandStyle} className="mt-10">
        <AppLogo variant="hero" />
        <SectionTitle
          className="mt-8"
          title="Train with calm confidence"
          subtitle={`${brand.fullName} — personalized workouts and meals shaped around your goals and local staples.`}
        />
      </Animated.View>

      <View className="gap-3 pb-2">
        <PrimaryButton
          label="Create account"
          onPress={() => navigation.navigate('Register')}
          disabled={googleLoading}
        />
        <SecondaryButton
          label="Sign in"
          onPress={() => navigation.navigate('Login')}
          disabled={googleLoading}
        />
        <GoogleSignInBlock
          loading={googleLoading}
          onPress={onGoogle}
          disabled={googleLoading}
        />
        {googleError ? (
          <Text className="text-center font-sans text-sm text-coral">
            {googleError}
          </Text>
        ) : null}
      </View>
    </Screen>
  );
}
