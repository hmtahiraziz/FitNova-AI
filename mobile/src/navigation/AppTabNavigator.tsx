import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { HomeScreen } from '../screens/home/HomeScreen';
import { PlanScreen } from '../screens/plan/PlanScreen';
import { LogScreen } from '../screens/log/LogScreen';
import { ProgressScreen } from '../screens/progress/ProgressScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';
import { GlossTabBar } from '../components/navigation/GlossTabBar';
import { AppTabProvider, type AppTabName } from './AppTabContext';
import { getTabBarOverlayHeight } from '../lib/tabBarLayout';
import { colors } from '../theme/tokens';
import type { AppTabParamList } from './types';

const Tab = createBottomTabNavigator<AppTabParamList>();

function SyncActiveTab({
  active,
  onChange,
}: {
  active: AppTabName;
  onChange: (name: AppTabName) => void;
}) {
  useEffect(() => {
    onChange(active);
  }, [active, onChange]);
  return null;
}

function ProfessionalTabBar({
  state,
  navigation,
  onActiveChange,
  navigateRef,
}: BottomTabBarProps & {
  onActiveChange: (name: AppTabName) => void;
  navigateRef: React.MutableRefObject<(name: AppTabName) => void>;
}) {
  const active = state.routes[state.index]?.name as AppTabName;

  navigateRef.current = (name: AppTabName) => {
    navigation.navigate(name);
  };

  return (
    <>
      <SyncActiveTab active={active} onChange={onActiveChange} />
      <GlossTabBar
        active={active}
        onChange={(name) => {
          const route = state.routes.find((r) => r.name === name);
          if (!route) {
            return;
          }
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!event.defaultPrevented) {
            navigation.navigate(name);
          }
        }}
      />
    </>
  );
}

/**
 * Main app chrome: GlossTabBar + smooth directional tab transitions (no swipe).
 */
export function AppTabNavigator() {
  const [active, setActive] = useState<AppTabName>('Home');
  const navigateRef = useRef<(name: AppTabName) => void>(() => {});

  const navigateTo = useCallback((name: AppTabName) => {
    navigateRef.current(name);
  }, []);

  const onActiveChange = useCallback((name: AppTabName) => {
    setActive(name);
  }, []);

  return (
    <AppTabProvider value={{ active, navigateTo }}>
      <Tab.Navigator
        tabBar={(props) => (
          <ProfessionalTabBar
            {...props}
            onActiveChange={onActiveChange}
            navigateRef={navigateRef}
          />
        )}
        screenOptions={{
          headerShown: false,
          // 'shift'/'fade' can leave the first tab at opacity 0 after login → white screen.
          animation: 'none',
          // Mount tabs once so return visits are instant; freeze idle screens.
          lazy: false,
          freezeOnBlur: true,
          sceneStyle: { backgroundColor: colors.mist, flex: 1 },
        }}>
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Plan" component={PlanScreen} />
        <Tab.Screen name="Log" component={LogScreen} />
        <Tab.Screen name="Progress" component={ProgressScreen} />
        <Tab.Screen name="Profile" component={ProfileScreen} />
      </Tab.Navigator>
    </AppTabProvider>
  );
}

/** @deprecated Use getTabBarOverlayHeight(safeAreaBottom) from lib/tabBarLayout */
export const TAB_BAR_SCROLL_INSET = getTabBarOverlayHeight(0);
