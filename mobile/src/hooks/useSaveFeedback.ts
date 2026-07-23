import { useCallback, useEffect, useRef, useState } from 'react';
import {
  SAVE_FEEDBACK,
  saveButtonLabel,
  type SavePhase,
} from '../lib/saveFeedback';

const SUCCESS_MS = 1600;

export function useSaveFeedback(idleLabel: string) {
  const [phase, setPhase] = useState<SavePhase>('idle');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const runSave = useCallback(async (action: () => Promise<void>) => {
    setPhase('saving');
    try {
      await action();
      setPhase('saved');
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      timerRef.current = setTimeout(() => setPhase('idle'), SUCCESS_MS);
    } catch (err) {
      setPhase('idle');
      throw err;
    }
  }, []);

  return {
    phase,
    isSaving: phase === 'saving',
    showSuccess: phase === 'saved',
    isInteractionLocked: phase !== 'idle',
    buttonLabel: saveButtonLabel(idleLabel, phase),
    successMessage: SAVE_FEEDBACK.successMessage,
    runSave,
  };
}
