import { apiRequest } from './client';

export type ProgressLog = {
  id: string;
  userId: string;
  date: string;
  workoutDone: boolean;
  mealsFollowed: boolean;
  weightKg: number | null;
  notes: string | null;
  createdAt: string;
  active: boolean;
};

export type DayStripItem = {
  date: string;
  active: boolean;
};

export type ProgressStats = {
  today: string;
  currentStreak: number;
  longestStreak: number;
  rate7: number;
  rate30: number;
  activeDays7: number;
  activeDays30: number;
  dayStrip7: DayStripItem[];
  todayLog: ProgressLog | null;
};

export type UpsertProgressBody = {
  date?: string;
  workoutDone?: boolean;
  mealsFollowed?: boolean;
  weightKg?: number | null;
  notes?: string | null;
};

/** Local calendar date as YYYY-MM-DD (device timezone). */
export function localDateOnly(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function upsertProgress(token: string, body: UpsertProgressBody) {
  return apiRequest<{ log: ProgressLog }>('/progress', {
    method: 'PUT',
    token,
    body: {
      date: body.date ?? localDateOnly(),
      ...body,
    },
  });
}

export function fetchProgress(
  token: string,
  params?: { from?: string; to?: string; today?: string },
) {
  const search = new URLSearchParams();
  const today = params?.today ?? localDateOnly();
  search.set('today', today);
  if (params?.from) {
    search.set('from', params.from);
  }
  if (params?.to) {
    search.set('to', params.to);
  }
  return apiRequest<{ from: string; to: string; logs: ProgressLog[] }>(
    `/progress?${search.toString()}`,
    { token },
  );
}

export function fetchProgressStats(token: string, today = localDateOnly()) {
  const search = new URLSearchParams({ today });
  return apiRequest<{ stats: ProgressStats }>(
    `/progress/stats?${search.toString()}`,
    { token },
  );
}
