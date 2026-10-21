import { create } from 'zustand';
import type {
  ProgressLog,
  ProgressStats,
  UpsertProgressBody,
} from '../api/progress';
import * as progressApi from '../api/progress';
import { localDateOnly } from '../api/progress';
import { useAuthStore } from './authStore';

type ProgressState = {
  stats: ProgressStats | null;
  logs: ProgressLog[];
  todayLog: ProgressLog | null;
  loading: boolean;
  saving: boolean;
  error: string | null;
  fetchStats: () => Promise<void>;
  fetchLogs: (days?: number) => Promise<void>;
  refresh: () => Promise<void>;
  saveToday: (patch: UpsertProgressBody) => Promise<ProgressLog>;
  clear: () => void;
};

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return localDateOnly(d);
}

export const useProgressStore = create<ProgressState>((set, get) => ({
  stats: null,
  logs: [],
  todayLog: null,
  loading: false,
  saving: false,
  error: null,

  clear: () => {
    set({
      stats: null,
      logs: [],
      todayLog: null,
      error: null,
      loading: false,
      saving: false,
    });
  },

  fetchStats: async () => {
    const token = useAuthStore.getState().token;
    if (!token) {
      set({ stats: null, todayLog: null });
      return;
    }
    const silent = get().stats != null;
    set(silent ? { error: null } : { loading: true, error: null });
    try {
      const { stats } = await progressApi.fetchProgressStats(token);
      set({
        stats,
        todayLog: stats.todayLog,
        loading: false,
      });
    } catch (err) {
      set({
        loading: false,
        error: err instanceof Error ? err.message : 'Failed to load stats',
      });
    }
  },

  fetchLogs: async (days = 30) => {
    const token = useAuthStore.getState().token;
    if (!token) {
      set({ logs: [] });
      return;
    }
    const silent = get().logs.length > 0;
    set(silent ? { error: null } : { loading: true, error: null });
    try {
      const today = localDateOnly();
      const { logs } = await progressApi.fetchProgress(token, {
        from: daysAgo(days - 1),
        to: today,
        today,
      });
      set({
        logs,
        todayLog: logs.find((log) => log.date === today) ?? get().todayLog,
        loading: false,
      });
    } catch (err) {
      set({
        loading: false,
        error: err instanceof Error ? err.message : 'Failed to load logs',
      });
    }
  },

  refresh: async () => {
    await Promise.all([get().fetchStats(), get().fetchLogs()]);
  },

  saveToday: async (patch) => {
    const token = useAuthStore.getState().token;
    if (!token) {
      throw new Error('Not signed in');
    }
    set({ saving: true, error: null });
    try {
      const date = patch.date ?? localDateOnly();
      const { log } = await progressApi.upsertProgress(token, {
        ...patch,
        date,
      });
      const { stats } = await progressApi.fetchProgressStats(token, date);
      set((state) => {
        const others = state.logs.filter((item) => item.date !== log.date);
        return {
          saving: false,
          todayLog: log.date === localDateOnly() ? log : state.todayLog,
          logs: [log, ...others].sort((a, b) => (a.date < b.date ? 1 : -1)),
          stats,
        };
      });
      return log;
    } catch (err) {
      set({
        saving: false,
        error: err instanceof Error ? err.message : 'Failed to save log',
      });
      throw err;
    }
  },
}));
