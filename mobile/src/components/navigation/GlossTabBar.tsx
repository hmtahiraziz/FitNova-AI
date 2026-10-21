import React, { useEffect, useState } from 'react';
import {
  LayoutChangeEvent,
  Pressable,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts, layout } from '../../theme/tokens';
import {
  TAB_BAR_BOTTOM_GAP,
  TAB_BAR_SIDE_GAP,
} from '../../lib/tabBarLayout';
import { TabIcon, type TabIconName } from './TabIcon';
import type { AppTabName } from '../../navigation/AppTabContext';

const TABS: Array<{
  name: AppTabName;
  label: string;
  shortLabel: string;
  icon: TabIconName;
}> = [
  { name: 'Home', label: 'Home', shortLabel: 'Home', icon: 'home' },
  { name: 'Plan', label: 'Plan', shortLabel: 'Plan', icon: 'plan' },
  { name: 'Log', label: 'Log', shortLabel: 'Log', icon: 'log' },
  {
    name: 'Progress',
    label: 'Progress',
    shortLabel: 'Stats',
    icon: 'progress',
  },
  { name: 'Profile', label: 'Profile', shortLabel: 'You', icon: 'profile' },
];

const BAR_PAD_H = 6;
const PILL_INSET = 5;
/** Soft rounded shell — professional float, not a full capsule. */
const BAR_RADIUS = 28;
const PILL_RADIUS = 20;

type GlossTabBarProps = {
  active: AppTabName;
  onChange: (name: AppTabName) => void;
};

function TabButton({
  label,
  icon,
  focused,
  compact,
  onPress,
}: {
  label: string;
  icon: TabIconName;
  focused: boolean;
  compact: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityState={{ selected: focused }}
      accessibilityLabel={label}
      onPress={onPress}
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: compact ? 6 : 8,
        zIndex: 1,
      }}>
      <View style={{ alignItems: 'center' }}>
        <TabIcon
          name={icon}
          focused={focused}
          size={compact ? 18 : 20}
          color={focused ? colors.ink : 'rgba(232, 242, 238, 0.55)'}
        />
        <Text
          numberOfLines={1}
          style={{
            marginTop: 3,
            // Fixed weight avoids label metric jitter when the pill moves.
            fontFamily: fonts.sansSemiBold,
            fontSize: compact ? 10 : 11,
            letterSpacing: 0.15,
            color: focused ? colors.ink : 'rgba(232, 242, 238, 0.55)',
          }}>
          {label}
        </Text>
      </View>
    </Pressable>
  );
}

export function GlossTabBar({ active, onChange }: GlossTabBarProps) {
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();
  const compact = windowWidth < 400;
  const barMaxWidth = windowWidth >= 768 ? 520 : undefined;

  const sideGap =
    windowWidth < 360
      ? Math.max(TAB_BAR_SIDE_GAP - 2, 8)
      : windowWidth >= 768
        ? TAB_BAR_SIDE_GAP + 4
        : TAB_BAR_SIDE_GAP;

  const bottomPad = insets.bottom + TAB_BAR_BOTTOM_GAP;

  const [barInnerWidth, setBarInnerWidth] = useState(0);
  const slotWidth =
    barInnerWidth > 0 ? (barInnerWidth - BAR_PAD_H * 2) / TABS.length : 0;
  const activeIndex = Math.max(
    0,
    TABS.findIndex((t) => t.name === active),
  );

  const pillX = useSharedValue(0);
  const pillReady = useSharedValue(0);

  useEffect(() => {
    if (slotWidth <= 0) {
      return;
    }
    const target = activeIndex * slotWidth + PILL_INSET;
    if (pillReady.value === 0) {
      // First layout — snap, no slide-in from 0.
      pillX.value = target;
      pillReady.value = 1;
      return;
    }
    pillX.value = withTiming(target, {
      duration: 220,
      easing: Easing.out(Easing.cubic),
    });
  }, [activeIndex, slotWidth, pillX, pillReady]);

  const pillStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: pillX.value }],
  }));

  const onBarLayout = (e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    if (w > 0 && Math.abs(w - barInnerWidth) > 0.5) {
      setBarInnerWidth(w);
    }
  };

  return (
    <View
      pointerEvents="box-none"
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        alignItems: 'center',
        paddingHorizontal: sideGap,
        paddingBottom: bottomPad,
      }}>
      <View
        onLayout={onBarLayout}
        style={{
          width: '100%',
          maxWidth: barMaxWidth,
          height: layout.tabBarHeight,
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: BAR_PAD_H,
          borderRadius: BAR_RADIUS,
          backgroundColor: colors.ink,
          overflow: 'hidden',
        }}>
        {slotWidth > 0 ? (
          <Animated.View
            pointerEvents="none"
            style={[
              {
                position: 'absolute',
                left: BAR_PAD_H,
                top: PILL_INSET,
                bottom: PILL_INSET,
                width: Math.max(slotWidth - PILL_INSET * 2, 0),
                borderRadius: PILL_RADIUS,
                backgroundColor: colors.mist,
              },
              pillStyle,
            ]}
          />
        ) : null}
        {TABS.map((tab) => (
          <TabButton
            key={tab.name}
            label={compact ? tab.shortLabel : tab.label}
            icon={tab.icon}
            focused={active === tab.name}
            compact={compact}
            onPress={() => onChange(tab.name)}
          />
        ))}
      </View>
    </View>
  );
}

export const APP_TAB_ORDER = TABS.map((t) => t.name);
