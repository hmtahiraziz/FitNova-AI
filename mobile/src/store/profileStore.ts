import { create } from 'zustand';
import type { Profile, ProfileInput } from '../api/profile';
import * as profileApi from '../api/profile';
import * as profileAvatarApi from '../api/profileAvatar';
import { clearProfileAvatarUriCache } from '../hooks/useProfileAvatarUri';
import { useAuthStore } from './authStore';

type ProfileState = {
  profile: Profile | null;
  loading: boolean;
  loaded: boolean;
  error: string | null;
  fetchProfile: () => Promise<void>;
  saveProfile: (input: ProfileInput) => Promise<Profile>;
  uploadAvatar: (asset: {
    uri: string;
    type?: string | null;
    fileName?: string | null;
  }) => Promise<Profile>;
  removeAvatar: () => Promise<Profile>;
  clear: () => void;
};

export const useProfileStore = create<ProfileState>((set) => ({
  profile: null,
  loading: false,
  loaded: false,
  error: null,
  clear: () => set({ profile: null, loaded: false, error: null }),
  fetchProfile: async () => {
    const token = useAuthStore.getState().token;
    if (!token) {
      set({ profile: null, loaded: true });
      return;
    }
    set({ loading: true, error: null });
    try {
      const { profile } = await profileApi.fetchProfile(token);
      set({ profile, loaded: true, loading: false });
    } catch (err) {
      set({
        loading: false,
        loaded: true,
        error: err instanceof Error ? err.message : 'Failed to load profile',
      });
    }
  },
  saveProfile: async (input) => {
    const token = useAuthStore.getState().token;
    if (!token) {
      throw new Error('Not signed in');
    }
    set({ loading: true, error: null });
    try {
      const { profile } = await profileApi.saveProfile(token, input);
      set({ profile, loading: false, loaded: true });
      return profile;
    } catch (err) {
      set({
        loading: false,
        error: err instanceof Error ? err.message : 'Failed to save profile',
      });
      throw err;
    }
  },
  uploadAvatar: async (asset) => {
    const token = useAuthStore.getState().token;
    if (!token) {
      throw new Error('Not signed in');
    }
    set({ loading: true, error: null });
    try {
      const { profile } = await profileAvatarApi.uploadProfileAvatar(token, asset);
      clearProfileAvatarUriCache();
      set({ profile, loading: false, loaded: true });
      return profile;
    } catch (err) {
      set({
        loading: false,
        error: err instanceof Error ? err.message : 'Failed to upload photo',
      });
      throw err;
    }
  },
  removeAvatar: async () => {
    const token = useAuthStore.getState().token;
    if (!token) {
      throw new Error('Not signed in');
    }
    set({ loading: true, error: null });
    try {
      const { profile } = await profileAvatarApi.deleteProfileAvatar(token);
      clearProfileAvatarUriCache();
      set({ profile, loading: false, loaded: true });
      return profile;
    } catch (err) {
      set({
        loading: false,
        error: err instanceof Error ? err.message : 'Failed to remove photo',
      });
      throw err;
    }
  },
}));
