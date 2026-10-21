import React from 'react';
import { Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../../theme/tokens';

type Props = {
  visible: boolean;
};

export function OfflineBanner({ visible }: Props) {
  const insets = useSafeAreaInsets();
  if (!visible) {
    return null;
  }

  return (
    <View
      style={{
        position: 'absolute',
        top: insets.top,
        left: 0,
        right: 0,
        zIndex: 9998,
        backgroundColor: colors.coral,
        paddingVertical: 8,
        paddingHorizontal: 16,
      }}>
      <Text className="text-center font-sans-medium text-sm text-mist">
        You&apos;re offline. Cached plans still work — generate, save, and
        uploads need a connection.
      </Text>
    </View>
  );
}
