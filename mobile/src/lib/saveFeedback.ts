export const SAVE_FEEDBACK = {
  saving: 'Saving…',
  savedButton: 'Saved',
  successMessage: 'Saved successfully',
} as const;

export type SavePhase = 'idle' | 'saving' | 'saved';

export function saveButtonLabel(idleLabel: string, phase: SavePhase): string {
  if (phase === 'saving') {
    return SAVE_FEEDBACK.saving;
  }
  if (phase === 'saved') {
    return SAVE_FEEDBACK.savedButton;
  }
  return idleLabel;
}
