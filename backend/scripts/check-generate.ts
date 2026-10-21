/**
 * Timed generate-plan check against a running API.
 * Usage: npx tsx scripts/check-generate.ts
 */
const BASE = process.env.API_BASE_URL ?? 'http://localhost:4000';

type Json = Record<string, unknown>;

async function request(
  path: string,
  options: { method?: string; token?: string; body?: unknown } = {},
): Promise<{ status: number; data: Json }> {
  const headers: Record<string, string> = { Accept: 'application/json' };
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

async function main() {
  const email = `gen_check_${Date.now()}@example.com`;
  const password = 'SmokeTest123!';

  const health = await request('/health');
  console.log('health', health.status, health.data);

  const register = await request('/auth/register', {
    method: 'POST',
    body: { email, password },
  });
  console.log('register', register.status);
  if (register.status !== 201) {
    throw new Error(`register failed: ${JSON.stringify(register.data)}`);
  }
  const token =
    (register.data.accessToken as string) ?? (register.data.token as string);

  const profile = await request('/profile', {
    method: 'PUT',
    token,
    body: {
      displayName: 'Gen Check',
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
  const profileObj = profile.data.profile as Json | undefined;
  console.log('profile', profile.status, 'complete=', profileObj?.complete);
  if (profile.status !== 200 || !profileObj?.complete) {
    throw new Error(`profile failed: ${JSON.stringify(profile.data)}`);
  }

  const t0 = Date.now();
  const plan = await request('/plans/generate', {
    method: 'POST',
    token,
    body: {
      intent: 'initial',
      focus: 'balanced',
      acceptAiProcessing: true,
    },
  });
  const ms = Date.now() - t0;
  console.log(
    'generate',
    plan.status,
    `${(ms / 1000).toFixed(2)}s`,
    `(${ms}ms)`,
  );

  if (plan.status !== 201 && plan.status !== 200) {
    throw new Error(`generate failed: ${JSON.stringify(plan.data)}`);
  }

  const p = plan.data.plan as Json;
  const content = p.content as Json;
  const workout = content.workoutPlan as Json;
  const meals = content.mealPlan as Json;
  console.log(
    JSON.stringify(
      {
        email,
        planId: p.id,
        model: p.openaiModel,
        promptVersion: p.promptVersion,
        workoutDays: (workout.days as unknown[])?.length,
        mealDays: (meals.days as unknown[])?.length,
        summaryPreview: String(content.summary ?? '').slice(0, 140),
        meta: plan.data.meta,
        timeSec: Number((ms / 1000).toFixed(2)),
      },
      null,
      2,
    ),
  );
}

main().catch((err) => {
  console.error('CHECK FAILED:', err);
  process.exit(1);
});
