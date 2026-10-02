export type AuthStackParamList = {
  Welcome: undefined;
  Login: { email?: string } | undefined;
  Register: undefined;
  ForgotPassword: { email?: string } | undefined;
  ResetPassword: { email: string; devCode?: string; resendLockedUntil?: number };
  LegalDocument: { doc: 'privacy' | 'terms' };
};

export type AppTabParamList = {
  Home: undefined;
  Plan: undefined;
  Log: undefined;
  Progress: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  Auth: undefined;
  Onboarding: undefined;
  App: undefined;
  GeneratePlan: undefined;
  PlanHistory: undefined;
  PlanDetail: { planId: string };
  WorkoutSession: { dayIndex: number; planId?: string };
  AdvancedSettings: undefined;
  LegalDocument: { doc: 'privacy' | 'terms' };
};
