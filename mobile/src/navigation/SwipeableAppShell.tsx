import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  View,
} from 'react-native';
import { HomeScreen } from '../screens/home/HomeScreen';
import { PlanScreen } from '../screens/plan/PlanScreen';
import { LogScreen } from '../screens/log/LogScreen';
import { ProgressScreen } from '../screens/progress/ProgressScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';
import { GlossTabBar, APP_TAB_ORDER } from '../components/navigation/GlossTabBar';
import { AppTabProvider, type AppTabName } from './AppTabContext';
import { getTabBarOverlayHeight } from '../lib/tabBarLayout';

const SCREENS: Record<AppTabName, React.ComponentType> = {
  Home: HomeScreen,
  Plan: PlanScreen,
  Log: LogScreen,
  Progress: ProgressScreen,
  Profile: ProfileScreen,
};

export function SwipeableAppShell() {
  const [width, setWidth] = useState(Dimensions.get('window').width);
  const [active, setActive] = useState<AppTabName>('Home');
  const [mountedTabs, setMountedTabs] = useState<Set<AppTabName>>(
    () => new Set(['Home']),
  );
  const pagerRef = useRef<ScrollView>(null);
  const indexRef = useRef(0);

  useEffect(() => {
    setMountedTabs((prev) => {
      if (prev.has(active)) {
        return prev;
      }
      const next = new Set(prev);
      next.add(active);
      return next;
    });
  }, [active]);

  const goToIndex = useCallback(
    (index: number, animated = false) => {
      const clamped = Math.max(0, Math.min(APP_TAB_ORDER.length - 1, index));
      indexRef.current = clamped;
      setActive(APP_TAB_ORDER[clamped]);
      pagerRef.current?.scrollTo({ x: clamped * width, animated });
    },
    [width],
  );

  const navigateTo = useCallback(
    (name: AppTabName) => {
      const index = APP_TAB_ORDER.indexOf(name);
      if (index >= 0) {
        goToIndex(index);
      }
    },
    [goToIndex],
  );

  const onMomentumEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const x = e.nativeEvent.contentOffset.x;
    const next = Math.round(x / width);
    if (next !== indexRef.current && next >= 0 && next < APP_TAB_ORDER.length) {
      indexRef.current = next;
      setActive(APP_TAB_ORDER[next]);
    }
  };

  return (
    <AppTabProvider value={{ active, navigateTo }}>
      <View
        className="flex-1"
        onLayout={(e) => {
          const w = e.nativeEvent.layout.width;
          if (w > 0 && Math.abs(w - width) > 1) {
            setWidth(w);
            requestAnimationFrame(() => {
              pagerRef.current?.scrollTo({
                x: indexRef.current * w,
                animated: false,
              });
            });
          }
        }}>
        <ScrollView
          ref={pagerRef}
          horizontal
          pagingEnabled
          bounces={false}
          decelerationRate="fast"
          directionalLockEnabled
          nestedScrollEnabled
          showsHorizontalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          onMomentumScrollEnd={onMomentumEnd}
          style={{ flex: 1 }}
          contentContainerStyle={{ flexGrow: 1 }}>
          {APP_TAB_ORDER.map((name) => {
            const Screen = SCREENS[name];
            const isActive = active === name;
            return (
              <View key={name} style={{ width, flex: 1 }}>
                {mountedTabs.has(name) ? (
                  <View
                    style={{ flex: 1 }}
                    pointerEvents={isActive ? 'auto' : 'none'}
                    accessibilityElementsHidden={!isActive}
                    importantForAccessibility={
                      isActive ? 'auto' : 'no-hide-descendants'
                    }>
                    <Screen />
                  </View>
                ) : null}
              </View>
            );
          })}
        </ScrollView>

        <GlossTabBar active={active} onChange={navigateTo} />

        <View style={{ height: 0 }} collapsable={false} />
      </View>
    </AppTabProvider>
  );
}

/** @deprecated Use getTabBarOverlayHeight(safeAreaBottom) from lib/tabBarLayout */
export const TAB_BAR_SCROLL_INSET = getTabBarOverlayHeight(0);
