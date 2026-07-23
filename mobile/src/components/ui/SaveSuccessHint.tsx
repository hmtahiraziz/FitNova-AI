import React from 'react';
import { Text } from 'react-native';
import { SAVE_FEEDBACK } from '../../lib/saveFeedback';

type SaveSuccessHintProps = {
  visible: boolean;
  message?: string;
};

export function SaveSuccessHint({
  visible,
  message = SAVE_FEEDBACK.successMessage,
}: SaveSuccessHintProps) {
  if (!visible) {
    return null;
  }
  return (
    <Text className="mt-3 text-center font-sans-semibold text-sm text-ink">
      {message}
    </Text>
  );
}
