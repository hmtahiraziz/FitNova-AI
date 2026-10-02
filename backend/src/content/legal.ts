import { env } from '../config/env';

export const APP_NAME = 'FitNova AI';
export const SERVICE_NAME = 'fitnova-api';

export type LegalDocId = 'privacy' | 'terms';

type LegalSection = { heading: string; body: string };

type LegalDocument = {
  id: LegalDocId;
  title: string;
  lastUpdated: string;
  intro: string;
  sections: LegalSection[];
};

const LAST_UPDATED = '2 October 2026';

export const PRIVACY_POLICY: LegalDocument = {
  id: 'privacy',
  title: 'Privacy Policy',
  lastUpdated: LAST_UPDATED,
  intro: `${APP_NAME} (“we”, “us”) provides AI-assisted workout and meal planning. This policy explains what we collect, how we use it, and the choices you have.`,
  sections: [
    {
      heading: 'Information we collect',
      body: 'Account data: email address, password hash (we never store plain passwords), and optional Google account identifiers when you use Google Sign-In. Profile data you provide: name, age, sex, height, weight, fitness goals, diet preferences, local food staples, and optional profile photo. Usage data: workout and meal logs, generated plans, streaks, and app settings stored on your device. Technical data: device identifiers used for secure session refresh, and basic server logs needed to operate the API.',
    },
    {
      heading: 'How we use information',
      body: 'We use your data to authenticate you, generate and personalize workout and meal plans (including via third-party AI providers), sync progress across sessions, send optional local reminders you enable, and provide customer support. We do not sell your personal information.',
    },
    {
      heading: 'AI processing',
      body: 'Plan generation may send profile and preference details to our AI provider solely to create your plan. Do not include sensitive medical diagnoses or unrelated personal data in free-text fields.',
    },
    {
      heading: 'Storage and security',
      body: 'Access tokens are kept in memory on your device. Refresh tokens are stored in the device secure keychain. Account and fitness data are stored on our hosted database and servers. Profile photos are stored on our upload volume. We use industry-standard transport encryption (HTTPS) in production.',
    },
    {
      heading: 'Notifications',
      body: 'If you enable reminders, we schedule local notifications on your device. We do not send marketing push notifications.',
    },
    {
      heading: 'Retention and deletion',
      body: 'You may delete your account in Advanced settings. Deletion removes your account, profile, plans, and logs from our systems, subject to short-lived backups required for reliability. You can also clear cached plan data on device.',
    },
    {
      heading: 'Children',
      body: `${APP_NAME} is not directed at children under 13 (or the minimum age required in your country). We do not knowingly collect data from children.`,
    },
    {
      heading: 'Your choices',
      body: `You can update profile data, disable reminders, clear local cache, opt out of optional usage analytics preferences, or delete your account. Contact us at ${env.SUPPORT_EMAIL}.`,
    },
    {
      heading: 'Changes',
      body: 'We may update this policy. The “Last updated” date at the top will change when we do. Continued use after updates means you accept the revised policy.',
    },
  ],
};

export const TERMS_OF_SERVICE: LegalDocument = {
  id: 'terms',
  title: 'Terms of Service',
  lastUpdated: LAST_UPDATED,
  intro: `By creating an account or using ${APP_NAME}, you agree to these Terms.`,
  sections: [
    {
      heading: 'Service',
      body: `${APP_NAME} provides general wellness, fitness, and nutrition suggestions. Plans are generated algorithmically and may be imperfect. The app is not a medical device and does not provide medical, dietary, or clinical advice.`,
    },
    {
      heading: 'Eligibility',
      body: 'You must be at least 13 years old (or the minimum legal age in your country) and able to form a binding contract. You are responsible for keeping your login credentials secure.',
    },
    {
      heading: 'Your content and conduct',
      body: 'You retain rights to the profile and log data you submit. You grant us a limited license to host and process that data to operate the service. Do not misuse the API, attempt unauthorized access, or upload unlawful content.',
    },
    {
      heading: 'Health disclaimer',
      body: 'Always consult a qualified professional before starting a new exercise or nutrition program, especially if you have injuries, medical conditions, or dietary restrictions. You use suggestions at your own risk.',
    },
    {
      heading: 'Availability',
      body: 'We strive for reliable uptime but do not guarantee uninterrupted access. Features that depend on third parties (AI, email, Google Sign-In) may be unavailable if those services fail or are not configured.',
    },
    {
      heading: 'Termination',
      body: 'You may delete your account at any time. We may suspend or terminate access for abuse, security risk, or material breach of these Terms.',
    },
    {
      heading: 'Limitation of liability',
      body: 'To the fullest extent permitted by law, we are not liable for indirect, incidental, or consequential damages arising from use of the app, including injuries or outcomes from following workout or meal suggestions.',
    },
    {
      heading: 'Changes',
      body: 'We may update these Terms. Continued use after the “Last updated” date constitutes acceptance of the revised Terms.',
    },
  ],
};

export function getLegalDocument(id: LegalDocId): LegalDocument {
  return id === 'privacy' ? PRIVACY_POLICY : TERMS_OF_SERVICE;
}

export function renderLegalHtml(doc: LegalDocument): string {
  const sections = doc.sections
    .map(
      (s) =>
        `<h2>${escapeHtml(s.heading)}</h2><p>${escapeHtml(s.body)}</p>`,
    )
    .join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(doc.title)} · ${APP_NAME}</title>
  <style>
    :root { color-scheme: light; }
    body { font-family: system-ui, -apple-system, Segoe UI, sans-serif; margin: 0; background: #F4F7F5; color: #0B1F1A; }
    main { max-width: 720px; margin: 0 auto; padding: 32px 20px 64px; line-height: 1.6; }
    h1 { font-size: 1.75rem; margin: 0 0 8px; }
    .meta { color: #4A5C56; font-size: 0.9rem; margin-bottom: 24px; }
    h2 { font-size: 1.1rem; margin: 28px 0 8px; }
    p { margin: 0 0 12px; color: #4A5C56; }
    a { color: #0B1F1A; }
    nav { margin-bottom: 24px; font-size: 0.9rem; }
  </style>
</head>
<body>
  <main>
    <nav>
      <a href="/legal/privacy">Privacy Policy</a> ·
      <a href="/legal/terms">Terms of Service</a> ·
      <a href="/health">API health</a>
    </nav>
    <h1>${escapeHtml(doc.title)}</h1>
    <p class="meta">${APP_NAME} · Last updated ${escapeHtml(doc.lastUpdated)}</p>
    <p>${escapeHtml(doc.intro)}</p>
    ${sections}
    <p class="meta">Support: <a href="mailto:${escapeHtml(env.SUPPORT_EMAIL)}">${escapeHtml(env.SUPPORT_EMAIL)}</a></p>
  </main>
</body>
</html>`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
