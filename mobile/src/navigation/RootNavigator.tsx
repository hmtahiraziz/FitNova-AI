import React, { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { WelcomeScreen } from '../screens/auth/WelcomeScreen';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { RegisterScreen } from '../screens/auth/RegisterScreen';
import { ForgotPasswordScreen } from '../screens/auth/ForgotPasswordScreen';
import { ResetPasswordScreen } from '../screens/auth/ResetPasswordScreen';
import { OnboardingScreen } from '../screens/onboarding/OnboardingScreen';
import { GeneratePlanScreen } from '../screens/plan/GeneratePlanScreen';
import { PlanDetailScreen } from '../screens/plan/PlanDetailScreen';
import { WorkoutSessionScreen } from '../screens/plan/WorkoutSessionScreen';
import { PlanHistoryScreen } from '../screens/plan/PlanHistoryScreen';
import { AdvancedSettingsScreen } from '../screens/profile/AdvancedSettingsScreen';
import { LegalDocumentScreen } from '../screens/legal/LegalDocumentScreen';
import { SwipeableAppShell } from './SwipeableAppShell';
import { useAuthStore } from '../store/authStore';
import { usePlanStore } from '../store/planStore';
import { useProfileStore } from '../store/profileStore';
import { useProgressStore } from '../store/progressStore';
import { colors } from '../theme/tokens';
import type { AuthStackParamList, RootStackParamList } from './types';

const RootStack = createNativeStackNavigator<RootStackParamList>();
const AuthStack = createNativeStackNavigator<AuthStackParamList>();

function AuthNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Welcome" component={WelcomeScreen} />
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
      <AuthStack.Screen
        name="ForgotPassword"
        component={ForgotPasswordScreen}
      />
      <AuthStack.Screen name="ResetPassword" component={ResetPasswordScreen} />
      <AuthStack.Screen
        name="LegalDocument"
        component={LegalDocumentScreen}
        options={{ animation: 'slide_from_right' }}
      />
    </AuthStack.Navigator>
  );
}

export function RootNavigator() {
  const token = useAuthStore((s) => s.token);
  const hydrated = useAuthStore((s) => s.hydrated);
  const profile = useProfileStore((s) => s.profile);
  const loaded = useProfileStore((s) => s.loaded);
  const fetchProfile = useProfileStore((s) => s.fetchProfile);
  const clearProfile = useProfileStore((s) => s.clear);
  const clearPlan = usePlanStore((s) => s.clear);
  const clearProgress = useProgressStore((s) => s.clear);

  useEffect(() => {
    if (!hydrated) {
      return;
    }
    if (token) {
      void fetchProfile();
    } else {
      clearProfile();
      clearPlan();
      clearProgress();
    }
  }, [
    token,
    hydrated,
    fetchProfile,
    clearProfile,
    clearPlan,
    clearProgress,
  ]);

  if (!hydrated || (token && !loaded)) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: colors.mist,
        }}>
        <ActivityIndicator color={colors.mint} />
      </View>
    );
  }

  const profileComplete = Boolean(profile?.complete);

  return (
    <RootStack.Navigator
      screenOptions={{ headerShown: false, animation: 'fade' }}>
      {!token ? (
        <RootStack.Screen name="Auth" component={AuthNavigator} />
      ) : !profileComplete ? (
        <>
          <RootStack.Screen name="Onboarding" component={OnboardingScreen} />
          <RootStack.Screen
            name="LegalDocument"
            component={LegalDocumentScreen}
            options={{ animation: 'slide_from_right' }}
          />
        </>
      ) : (
        <>
          <RootStack.Screen name="App" component={SwipeableAppShell} />
          <RootStack.Screen
            name="GeneratePlan"
            component={GeneratePlanScreen}
            options={{ animation: 'slide_from_right' }}
          />
          <RootStack.Screen
            name="PlanHistory"
            component={PlanHistoryScreen}
            options={{ animation: 'slide_from_right' }}
          />
          <RootStack.Screen
            name="PlanDetail"
            component={PlanDetailScreen}
            options={{ animation: 'slide_from_right' }}
          />
          <RootStack.Screen
            name="WorkoutSession"
            component={WorkoutSessionScreen}
            options={{ animation: 'slide_from_right' }}
          />
          <RootStack.Screen
            name="AdvancedSettings"
            component={AdvancedSettingsScreen}
            options={{ animation: 'slide_from_right' }}
          />
          <RootStack.Screen
            name="LegalDocument"
            component={LegalDocumentScreen}
            options={{ animation: 'slide_from_right' }}
          />
        </>
      )}
    </RootStack.Navigator>
  );
}
