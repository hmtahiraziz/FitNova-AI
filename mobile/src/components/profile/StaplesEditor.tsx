import React, { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { Chip } from '../ui';
import { STAPLES } from '../../constants/staples';
import { colors, fonts } from '../../theme/tokens';

function toggleValue(list: string[], value: string) {
  return list.includes(value)
    ? list.filter((v) => v !== value)
    : [...list, value];
}

type Props = {
  staples: string[];
  onChange: (next: string[]) => void;
  helperText?: string;
};

/**
 * Staples picker — sits near the top of Advanced settings.
 * Do not force KeyboardForm scroll-on-focus here (that jumped to the
 * bottom of the long screen). KeyboardAvoidingView is enough.
 */
export function StaplesEditor({ staples, onChange, helperText }: Props) {
  const [customStaple, setCustomStaple] = useState('');

  const addCustom = () => {
    const value = customStaple.trim();
    if (!value) {
      return;
    }
    onChange(staples.includes(value) ? staples : [...staples, value]);
    setCustomStaple('');
  };

  return (
    <View>
      {helperText ? (
        <Text className="mb-3 font-sans text-sm leading-5 text-slate">
          {helperText}
        </Text>
      ) : null}
      <View className="mb-4 flex-row flex-wrap gap-2">
        {STAPLES.map((item) => (
          <Chip
            key={item}
            label={item}
            selected={staples.includes(item)}
            onPress={() => onChange(toggleValue(staples, item))}
          />
        ))}
        {staples
          .filter((s) => !(STAPLES as readonly string[]).includes(s))
          .map((item) => (
            <Chip
              key={item}
              label={item}
              selected
              onPress={() => onChange(toggleValue(staples, item))}
            />
          ))}
      </View>
      <View className="flex-row items-center gap-2">
        <TextInput
          value={customStaple}
          onChangeText={setCustomStaple}
          placeholder="Add custom staple"
          placeholderTextColor={colors.sage}
          onSubmitEditing={addCustom}
          returnKeyType="done"
          blurOnSubmit
          style={{
            flex: 1,
            fontFamily: fonts.sans,
            borderWidth: 1,
            borderColor: 'rgba(11,31,26,0.15)',
            borderRadius: 12,
            paddingHorizontal: 14,
            paddingVertical: 12,
            color: colors.ink,
          }}
        />
        <Pressable
          onPress={addCustom}
          className="rounded-xl bg-ink px-4 py-3">
          <Text className="font-sans-semibold text-mist">Add</Text>
        </Pressable>
      </View>
      {staples.length === 0 ? (
        <Text className="mt-2 font-sans text-sm text-coral">
          Pick at least one staple for meal plans.
        </Text>
      ) : null}
    </View>
  );
}
