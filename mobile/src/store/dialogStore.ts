import { create } from 'zustand';

export type DialogActionVariant =
  | 'primary'
  | 'secondary'
  | 'destructive'
  | 'option';

export type DialogAction = {
  label: string;
  variant?: DialogActionVariant;
  onPress?: () => void;
};

export type DialogConfig = {
  title: string;
  message?: string;
  actions: DialogAction[];
};

type DialogState = {
  visible: boolean;
  config: DialogConfig | null;
  show: (config: DialogConfig) => void;
  hide: () => void;
};

export const useDialogStore = create<DialogState>((set) => ({
  visible: false,
  config: null,
  show: (config) => set({ visible: true, config }),
  hide: () => set({ visible: false, config: null }),
}));

/** FitNova in-app dialog — use instead of Alert.alert. */
export function showDialog(config: DialogConfig) {
  useDialogStore.getState().show(config);
}

export function hideDialog() {
  useDialogStore.getState().hide();
}
