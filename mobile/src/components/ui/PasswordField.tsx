import React, { useState } from 'react';
import {
  Pressable,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from 'react-native';
import {
  measurePasswordStrength,
  type PasswordStrength,
} from '../../lib/passwordStrength';
import { colors, fonts } from '../../theme/tokens';

type PasswordFieldProps = TextInputProps & {
  label: string;
  error?: string;
  showStrength?: boolean;
};

const strengthColors = [
  colors.coral,
  colors.coral,
  '#C4A035',
  colors.mint,
  colors.mint,
];

export function PasswordField({
  label,
  error,
  showStrength = false,
  value,
  style,
  ...props
}: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);
  const text = typeof value === 'string' ? value : '';
  const strength: PasswordStrength | null = showStrength
    ? measurePasswordStrength(text)
    : null;

  return (
    <View className="mb-4">
      <Text className="mb-1.5 font-sans-medium text-sm text-slate">{label}</Text>
      <View className="relative">
        <TextInput
          placeholderTextColor={colors.sage}
          autoCapitalize="none"
          secureTextEntry={!visible}
          value={value}
          style={[
            {
              fontFamily: fonts.sans,
              fontSize: 16,
              color: colors.ink,
              borderWidth: 1,
              borderColor: error ? colors.coral : 'rgba(11, 31, 26, 0.15)',
              borderRadius: 12,
              paddingHorizontal: 16,
              paddingRight: 72,
              paddingVertical: 14,
              backgroundColor: 'rgba(244, 247, 245, 0.8)',
            },
            style,
          ]}
          {...props}
        />
        <Pressable
          onPress={() => setVisible((v) => !v)}
          hitSlop={8}
          className="absolute bottom-0 right-0 top-0 justify-center px-4">
          <Text className="font-sans-medium text-sm text-slate">
            {visible ? 'Hide' : 'Show'}
          </Text>
        </Pressable>
      </View>
      {showStrength && text.length > 0 && strength ? (
        <View className="mt-2">
          <View className="h-1.5 overflow-hidden rounded-full bg-sage/30">
            <View
              className="h-full rounded-full"
              style={{
                width: `${strength.percent}%`,
                backgroundColor: strengthColors[strength.score],
              }}
            />
          </View>
          <Text className="mt-1 font-sans text-xs text-slate">
            {strength.label}
          </Text>
        </View>
      ) : null}
      {error ? (
        <Text className="mt-1 font-sans text-xs text-coral">{error}</Text>
      ) : null}
    </View>
  );
}
