import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import type {
  Plan,
  PlanGenerateFocus,
  PlanGenerateMeta,
  PlanGenerateOptions,
} from '../api/plans';
import * as plansApi from '../api/plans';
import { useAuthStore } from './authStore';

const CACHE_KEY = 'b4-latest-plan';

type PlanState = {
  latest: Plan | null;
  stale: boolean;
  lastGenerateFocus: PlanGenerateFocus | null;
  generationsRemainingThisHour: number;
  generationsLimitPerHour: number;
  history: Plan[];
  historyLoading: boolean;
  loading: boolean;
  generating: boolean;
  error: string | null;
  fetchLatest: () => Promise<void>;
  fetchHistory: () => Promise<void>;
  generate: (options?: PlanGenerateOptions) => Promise<Plan>;
  getPlanById: (id: string) => Plan | null;
  clear: () => void;
};

async function cachePlan(plan: Plan | null) {
  if (!plan) {
    await AsyncStorage.removeItem(CACHE_KEY);
    return;
  }
  await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(plan));
}

export const usePlanStore = create<PlanState>((set, get) => ({
  latest: null,
  stale: false,
  lastGenerateFocus: null,
  generationsRemainingThisHour: 5,
  generationsLimitPerHour: 5,
  history: [],
  historyLoading: false,
  loading: false,
  generating: false,
  error: null,
  clear: () => {
    set({
      latest: null,
      stale: false,
      lastGenerateFocus: null,
      history: [],
      error: null,
      generationsRemainingThisHour: 5,
    });
    void AsyncStorage.removeItem(CACHE_KEY);
  },
  getPlanById: (id) => {
    const { latest, history } = get();
    if (latest?.id === id) {
      return latest;
    }
    return history.find((p) => p.id === id) ?? null;
  },
  fetchHistory: async () => {
    const token = useAuthStore.getState().token;
    if (!token) {
      set({ history: [] });
      return;
    }
    set({ historyLoading: true, error: null });
    try {
      const { plans } = await plansApi.fetchPlans(token);
      set({ history: plans, historyLoading: false });
    } catch (err) {
      set({
        historyLoading: false,
        error: err instanceof Error ? err.message : 'Failed to load plan history',
      });
    }
  },
  fetchLatest: async () => {
    const token = useAuthStore.getState().token;
    if (!token) {
      set({ latest: null, stale: false });
      return;
    }
    // Keep existing content visible on tab return — only spin on first load.
    const silent = get().latest != null;
    set(silent ? { error: null } : { loading: true, error: null });
    try {
      if (!silent) {
        const cached = await AsyncStorage.getItem(CACHE_KEY);
        if (cached) {
          set({ latest: JSON.parse(cached) as Plan });
        }
      }
      const payload = await plansApi.fetchLatestPlan(token);
      set({
        latest: payload.plan,
        stale: payload.stale,
        generationsRemainingThisHour: payload.generationsRemainingThisHour,
        generationsLimitPerHour: payload.generationsLimitPerHour,
        loading: false,
      });
      await cachePlan(payload.plan);
    } catch (err) {
      set({
        loading: false,
        error: err instanceof Error ? err.message : 'Failed to load plan',
      });
    }
  },
  generate: async (options: PlanGenerateOptions = {}) => {
    const token = useAuthStore.getState().token;
    if (!token) {
      throw new Error('Not signed in');
    }
    const latest = get().latest;
    const body: PlanGenerateOptions = {
      intent: latest ? 'regenerate' : 'initial',
      focus: options.focus ?? 'balanced',
      acceptAiProcessing: options.acceptAiProcessing,
      ...options,
    };
    set({ generating: true, error: null });
    try {
      const { plan, meta } = await plansApi.generatePlan(token, body);
      set({
        latest: plan,
        generating: false,
        stale: false,
        lastGenerateFocus: meta.generateFocus ?? body.focus ?? 'balanced',
        generationsRemainingThisHour: meta.generationsRemainingThisHour,
        generationsLimitPerHour: meta.generationsLimitPerHour,
      });
      await cachePlan(plan);
      void get().fetchHistory();
      return plan;
    } catch (err) {
      set({
        generating: false,
        error: err instanceof Error ? err.message : 'Failed to generate plan',
      });
      throw err;
    }
  },
}));

export type { PlanGenerateFocus, PlanGenerateMeta };
