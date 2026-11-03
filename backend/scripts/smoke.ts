/**
 * End-to-end smoke path against a running API:
 * register → profile → generate → log → streak
 *
 * Usage:
 *   API_BASE_URL=http://localhost:4000 npm run smoke
 */
import assert from 'node:assert/strict';

const BASE = process.env.API_BASE_URL ?? 'http://localhost:4000';

type Json = Record<string, unknown>;

async function request(
  path: string,
  options: {
    method?: string;
    token?: string;
    body?: unknown;
  } = {},
): Promise<{ status: number; data: Json }> {
  const headers: Record<string, string> = {
    Accept: 'application/json',
  };
  if (options.body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }
  if (options.token) {
    headers.Authorization = `Bearer ${options.token}`;
  }

  const res = await fetch(`${BASE}${path}`, {
    method: options.method ?? 'GET',
    headers,
    body:
      options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });

  const text = await res.text();
  const data = text ? (JSON.parse(text) as Json) : {};
  return { status: res.status, data };
}

function todayLocal(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

async function main() {
  const email = `smoke_${Date.now()}@example.com`;
  const password = 'SmokeTest123!';

  const health = await request('/health');
  assert.equal(health.status, 200, 'health check failed');

  const register = await request('/auth/register', {
    method: 'POST',
    body: { email, password },
  });
  assert.equal(register.status, 201, `register failed: ${JSON.stringify(register.data)}`);
  const accessToken =
    (register.data.accessToken as string) ?? (register.data.token as string);
  const refreshToken = register.data.refreshToken as string;
  assert.ok(accessToken, 'missing accessToken');
  assert.ok(refreshToken, 'missing refreshToken');

  const refreshed = await request('/auth/refresh', {
    method: 'POST',
    body: { refreshToken },
  });
  assert.equal(refreshed.status, 200, `refresh failed: ${JSON.stringify(refreshed.data)}`);
  const token =
    (refreshed.data.accessToken as string) ?? (refreshed.data.token as string);
  assert.ok(token, 'missing token after refresh');

  const profile = await request('/profile', {
    method: 'PUT',
    token,
    body: {
      displayName: 'Smoke User',
      goal: 'maintain',
      dietaryPreferences: ['balanced'],
      restrictions: [],
      localStaples: ['eggs', 'rice', 'dal'],
      activityLevel: 'moderate',
      experienceLevel: 'beginner',
      daysPerWeek: 3,
      mealsPerDay: 3,
      equipment: ['bodyweight'],
      heightCm: 170,
      weightKg: 70,
      age: 28,
      sex: 'male',
    },
  });
  assert.equal(profile.status, 200, `profile failed: ${JSON.stringify(profile.data)}`);
  assert.equal((profile.data.profile as Json).complete, true);

  const generateStarted = Date.now();
  const plan = await request('/plans/generate', {
    method: 'POST',
    token,
    body: { acceptAiProcessing: true, focus: 'balanced' },
  });
  const generateMs = Date.now() - generateStarted;
  assert.ok(
    plan.status === 201 || plan.status === 200,
    `generate failed: ${JSON.stringify(plan.data)}`,
  );
  assert.ok(plan.data.plan, 'missing plan');
  console.log(`generate ok in ${(generateMs / 1000).toFixed(2)}s`);

  const today = todayLocal();
  const log = await request('/progress', {
    method: 'PUT',
    token,
    body: {
      date: today,
      workoutDone: true,
      mealsFollowed: true,
      notes: 'smoke test',
    },
  });
  assert.equal(log.status, 200, `progress upsert failed: ${JSON.stringify(log.data)}`);
  assert.equal((log.data.log as Json).active, true);

  const stats = await request(`/progress/stats?today=${today}`, { token });
  assert.equal(stats.status, 200, `stats failed: ${JSON.stringify(stats.data)}`);
  const streak = (stats.data.stats as Json).currentStreak as number;
  assert.ok(streak >= 1, `expected streak >= 1, got ${streak}`);

  console.log('Smoke OK:', {
    email,
    planId: (plan.data.plan as Json).id,
    streak,
  });
}

main().catch((err) => {
  console.error('Smoke FAILED:', err);
  process.exit(1);
});
