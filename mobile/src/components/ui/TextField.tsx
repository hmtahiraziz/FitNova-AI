import React from 'react';
import {
  Text,
  TextInput,
  View,
  type TextInputProps,
} from 'react-native';
import { colors, fonts } from '../../theme/tokens';

type TextFieldProps = TextInputProps & {
  label: string;
  error?: string;
};

export function TextField({ label, error, style, ...props }: TextFieldProps) {
  return (
    <View className="mb-4">
      <Text className="mb-1.5 font-sans-medium text-sm text-slate">{label}</Text>
      <TextInput
        placeholderTextColor={colors.sage}
        autoCapitalize="none"
        style={[
          {
            fontFamily: fonts.sans,
            fontSize: 16,
            color: colors.ink,
            borderWidth: 1,
            borderColor: error ? colors.coral : 'rgba(11, 31, 26, 0.15)',
            borderRadius: 12,
            paddingHorizontal: 16,
            paddingVertical: 14,
            backgroundColor: 'rgba(244, 247, 245, 0.8)',
          },
          style,
        ]}
        {...props}
      />
      {error ? (
        <Text className="mt-1 font-sans text-xs text-coral">{error}</Text>
      ) : null}
    </View>
  );
}
