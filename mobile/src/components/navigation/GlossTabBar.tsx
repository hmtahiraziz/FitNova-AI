import React from 'react';
import { Pressable, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts, layout } from '../../theme/tokens';
import { TabIcon, type TabIconName } from './TabIcon';
import type { AppTabName } from '../../navigation/AppTabContext';

const TABS: Array<{ name: AppTabName; label: string; icon: TabIconName }> = [
  { name: 'Home', label: 'Home', icon: 'home' },
  { name: 'Plan', label: 'Plan', icon: 'plan' },
  { name: 'Log', label: 'Log', icon: 'log' },
  { name: 'Progress', label: 'Prog', icon: 'progress' },
  { name: 'Profile', label: 'You', icon: 'profile' },
];

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
      accessibilityRole="button"
      accessibilityState={{ selected: focused }}
      onPress={onPress}
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: compact ? 6 : 8,
        borderRadius: 999,
        backgroundColor: focused ? colors.mist : 'transparent',
      }}>
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
          fontFamily: focused ? fonts.sansSemiBold : fonts.sansMedium,
          fontSize: compact ? 10 : 11,
          color: focused ? colors.ink : 'rgba(232, 242, 238, 0.55)',
        }}>
        {label}
      </Text>
    </Pressable>
  );
}

export function GlossTabBar({ active, onChange }: GlossTabBarProps) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const compact = width < 400;
  const barMaxWidth = width >= 768 ? 520 : undefined;

  return (
    <View
      pointerEvents="box-none"
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        alignItems: 'center',
        paddingHorizontal: layout.tabBarFloatOffset,
        paddingBottom: Math.max(insets.bottom, 10),
      }}>
      <View
        style={{
          width: '100%',
          maxWidth: barMaxWidth,
          height: layout.tabBarHeight,
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 6,
          borderRadius: 999,
          backgroundColor: colors.ink,
          borderWidth: 1,
          borderColor: 'rgba(46, 230, 166, 0.18)',
          shadowColor: colors.ink,
          shadowOpacity: 0.22,
          shadowRadius: 14,
          shadowOffset: { width: 0, height: 8 },
          elevation: 8,
        }}>
        {TABS.map((tab) => (
          <TabButton
            key={tab.name}
            label={tab.label}
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
