import { apiRequest } from './client';

export type Profile = {
  id: string;
  userId: string;
  displayName: string | null;
  avatarUrl: string | null;
  goal: string;
  dietaryPreferences: string[];
  restrictions: string[];
  localStaples: string[];
  activityLevel: string | null;
  experienceLevel: string | null;
  daysPerWeek: number;
  mealsPerDay: number;
  equipment: string[];
  heightCm: number | null;
  weightKg: number | null;
  age: number | null;
  sex: string | null;
  updatedAt: string;
  complete: boolean;
};

export type ProfileInput = {
  displayName?: string | null;
  goal: string;
  dietaryPreferences: string[];
  restrictions: string[];
  localStaples: string[];
  activityLevel?: string | null;
  experienceLevel?: string | null;
  daysPerWeek: number;
  mealsPerDay: number;
  equipment: string[];
  heightCm?: number | null;
  weightKg?: number | null;
  age?: number | null;
  sex?: string | null;
};

export function fetchProfile(token: string) {
  return apiRequest<{ profile: Profile | null }>('/profile', { token });
}

export function saveProfile(token: string, body: ProfileInput) {
  return apiRequest<{ profile: Profile }>('/profile', {
    method: 'PUT',
    token,
    body,
  });
}
