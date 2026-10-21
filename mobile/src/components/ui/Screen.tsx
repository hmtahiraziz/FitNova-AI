import React, { type ReactNode } from 'react';
import { View, type ViewProps } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, layout, mistGradient } from '../../theme/tokens';
import { getTabBarOverlayHeight } from '../../lib/tabBarLayout';
import { useResponsive } from '../../hooks/useResponsive';
import { useAppTabsOptional } from '../../navigation/AppTabContext';

type ScreenProps = ViewProps & {
  children: ReactNode;
  className?: string;
  edges?: Array<'top' | 'bottom' | 'left' | 'right'>;
  /** Leave room for floating gloss tab bar. Auto-on inside app tabs. */
  tabBarInset?: boolean;
};

export function Screen({
  children,
  className = '',
  edges = ['top', 'bottom'],
  tabBarInset,
  style,
  ...props
}: ScreenProps) {
  const insets = useSafeAreaInsets();
  const { isTablet, contentPad } = useResponsive();
  const inAppTabs = Boolean(useAppTabsOptional());
  const withTabInset = tabBarInset ?? inAppTabs;

  const paddingTop = edges.includes('top') ? Math.max(insets.top, 16) : 0;
  const paddingBottom = withTabInset
    ? getTabBarOverlayHeight(insets.bottom)
    : edges.includes('bottom')
      ? Math.max(insets.bottom, 24)
      : 0;

  return (
    <View className="flex-1" {...props}>
      <LinearGradient
        colors={[...mistGradient.colors]}
        start={mistGradient.start}
        end={mistGradient.end}
        style={{ flex: 1, backgroundColor: colors.mist }}>
        <View
          className={`flex-1 ${className}`}
          style={[
            {
              paddingTop,
              paddingBottom,
              paddingHorizontal: contentPad,
              maxWidth: isTablet ? layout.maxContentWidth : undefined,
              width: '100%',
              alignSelf: 'center',
              // Let card borders/shadows draw fully inside the padded frame.
              overflow: 'visible',
            },
            style,
          ]}>
          {children}
        </View>
      </LinearGradient>
    </View>
  );
}
