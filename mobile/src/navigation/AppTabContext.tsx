import React, { createContext, useContext } from 'react';

export type AppTabName = 'Home' | 'Plan' | 'Log' | 'Progress' | 'Profile';

type AppTabContextValue = {
  active: AppTabName;
  navigateTo: (name: AppTabName) => void;
};

const AppTabContext = createContext<AppTabContextValue | null>(null);

export function AppTabProvider({
  value,
  children,
}: {
  value: AppTabContextValue;
  children: React.ReactNode;
}) {
  return (
    <AppTabContext.Provider value={value}>{children}</AppTabContext.Provider>
  );
}

export function useAppTabsOptional() {
  return useContext(AppTabContext);
}

export function useAppTabs() {
  const ctx = useContext(AppTabContext);
  if (!ctx) {
    throw new Error('useAppTabs must be used within AppTabProvider');
  }
  return ctx;
}
