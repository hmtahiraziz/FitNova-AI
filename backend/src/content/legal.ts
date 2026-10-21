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

const LAST_UPDATED = '20 October 2026';

export const PRIVACY_POLICY: LegalDocument = {
  id: 'privacy',
  title: 'Privacy Policy',
  lastUpdated: LAST_UPDATED,
  intro: `${APP_NAME} (“we”, “us”) provides AI-assisted workout and meal planning. This policy explains what we collect, how we use it, who processes it, and the choices you have.`,
  sections: [
    {
      heading: 'Information we collect',
      body: 'Account data: email address, password hash (we never store plain passwords), and optional Google account identifiers (Google “sub” / subject ID) when you use Google Sign-In. Profile data you provide: display name, age, sex, height, weight, fitness goals, diet preferences, restrictions, local food staples, equipment, schedule preferences, and optional profile photo. Usage data: workout and meal logs, generated plans, streaks, and app settings stored on your device. Technical data: device identifiers used for secure session refresh, and basic server logs needed to operate the API. We do not collect advertising IDs or run third-party ads.',
    },
    {
      heading: 'How we use information',
      body: 'We use your data to authenticate you, generate and personalize workout and meal plans, sync progress across sessions, send optional local reminders you enable, operate and secure the service, and provide customer support. We do not sell your personal information.',
    },
    {
      heading: 'AI processing (OpenAI)',
      body: 'When you generate or regenerate a plan, we send selected profile and preference fields (for example goal, age, sex, height, weight, activity level, experience, diet preferences, restrictions, staples, equipment, and schedule) to OpenAI as our AI service provider, solely to create your plan. We do not send your email address, password, Google tokens, or profile photo to OpenAI. Do not include sensitive medical diagnoses or unrelated personal data in free-text fields. Plans are general wellness guidance, not medical advice.',
    },
    {
      heading: 'Service providers and hosting',
      body: 'We use trusted processors to run the app: Railway (application hosting and optional upload volume for profile photos), Neon (PostgreSQL database), OpenAI (plan generation), Google (Sign-In identity verification), and an SMTP email provider you configure for password-reset messages (message content includes a short-lived reset code). These providers process data only to provide their services to us.',
    },
    {
      heading: 'Storage and security',
      body: 'Access tokens are kept in memory on your device. Refresh tokens are stored in the device secure keychain. Account and fitness data are stored in our hosted database. Profile photos are stored on our upload volume and are served only to the signed-in account owner (not as a public gallery). We use industry-standard transport encryption (HTTPS) in production. Database backups may retain deleted data for a short period required for reliability and abuse prevention (typically up to 30 days), after which they expire according to our hosting provider’s retention settings.',
    },
    {
      heading: 'Notifications',
      body: 'If you enable reminders, we schedule local notifications on your device. Reminder content is generic (for example check-in prompts) and does not include your weight or other health numbers. We do not send marketing push notifications.',
    },
    {
      heading: 'Retention and deletion',
      body: `You may delete your account in the app under Advanced settings → Delete account. You may also request deletion without the app via our public account-deletion page at /legal/delete-account (or by emailing ${env.SUPPORT_EMAIL} with the subject “Delete FitNova AI account” and the email address used for the account). When deletion is completed, we remove your account, profile, plans, progress logs, sessions, reset tokens, and associated profile photos from active systems, subject to short-lived backups described above. You can also clear cached plan data on device.`,
    },
    {
      heading: 'Children',
      body: `${APP_NAME} is not directed at children under 13 (or the minimum age required in your country). We do not knowingly collect data from children. If you believe a child has created an account, contact us and we will delete it.`,
    },
    {
      heading: 'Your choices',
      body: `You can update profile data, disable reminders, clear local cache, or delete your account (in-app or via /legal/delete-account). We do not currently run a usage-analytics SDK. Contact us at ${env.SUPPORT_EMAIL}.`,
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
      body: `${APP_NAME} provides general wellness, fitness, and nutrition suggestions. Plans are generated algorithmically (including with assistance from OpenAI) and may be imperfect. The app is not a medical device and does not provide medical, dietary, or clinical advice. We do not guarantee weight loss, muscle gain, or any specific health outcome.`,
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
      body: 'You may delete your account at any time in the app or by requesting deletion at /legal/delete-account. We may suspend or terminate access for abuse, security risk, or material breach of these Terms.',
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

function legalNavHtml(): string {
  return `<nav>
      <a href="/legal/privacy">Privacy Policy</a> ·
      <a href="/legal/terms">Terms of Service</a> ·
      <a href="/legal/delete-account">Delete account</a>
    </nav>`;
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
    .cta { display: inline-block; margin: 16px 0; padding: 12px 18px; background: #0B1F1A; color: #F4F7F5; text-decoration: none; border-radius: 8px; font-weight: 600; }
    ul { color: #4A5C56; padding-left: 1.25rem; }
    li { margin-bottom: 8px; }
  </style>
</head>
<body>
  <main>
    ${legalNavHtml()}
    <h1>${escapeHtml(doc.title)}</h1>
    <p class="meta">${APP_NAME} · Last updated ${escapeHtml(doc.lastUpdated)}</p>
    <p>${escapeHtml(doc.intro)}</p>
    ${sections}
    <p class="meta">Support: <a href="mailto:${escapeHtml(env.SUPPORT_EMAIL)}">${escapeHtml(env.SUPPORT_EMAIL)}</a></p>
  </main>
</body>
</html>`;
}

/** Public Play Console account-deletion resource (usable without installing the app). */
export function renderDeleteAccountHtml(): string {
  const support = env.SUPPORT_EMAIL;
  const subject = encodeURIComponent(`Delete ${APP_NAME} account`);
  const body = encodeURIComponent(
    [
      `Please delete my ${APP_NAME} account and associated data.`,
      '',
      'Account email:',
      '(type the email address you used to sign up)',
      '',
      'Optional notes:',
    ].join('\n'),
  );
  const mailto = `mailto:${encodeURIComponent(support)}?subject=${subject}&body=${body}`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Delete your account · ${APP_NAME}</title>
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
    .cta { display: inline-block; margin: 16px 0; padding: 12px 18px; background: #0B1F1A; color: #F4F7F5; text-decoration: none; border-radius: 8px; font-weight: 600; }
    ul { color: #4A5C56; padding-left: 1.25rem; }
    li { margin-bottom: 8px; }
  </style>
</head>
<body>
  <main>
    ${legalNavHtml()}
    <h1>Delete your ${escapeHtml(APP_NAME)} account</h1>
    <p class="meta">${escapeHtml(APP_NAME)} · Account &amp; data deletion</p>
    <p>
      This page lets you request deletion of your ${escapeHtml(APP_NAME)} account and associated data
      without reinstalling the app. Use it if you already uninstalled the app or cannot sign in.
    </p>

    <h2>How to request deletion</h2>
    <p>Choose one of the following:</p>
    <ul>
      <li>
        <strong>In the app:</strong> open Advanced settings → Delete account (requires sign-in;
        password confirmation if you use email/password).
      </li>
      <li>
        <strong>By email (no app required):</strong> send a message from (or clearly stating)
        the email address used for your account.
      </li>
    </ul>
    <p>
      <a class="cta" href="${mailto}">Email a deletion request</a>
    </p>
    <p class="meta">
      Or write to
      <a href="mailto:${escapeHtml(support)}">${escapeHtml(support)}</a>
      with subject “Delete ${escapeHtml(APP_NAME)} account” and your account email.
    </p>

    <h2>What we delete</h2>
    <p>When your request is completed, we remove from active systems:</p>
    <ul>
      <li>Account credentials and Google Sign-In link</li>
      <li>Profile (including height, weight, age, goals, preferences)</li>
      <li>Generated workout and meal plans</li>
      <li>Progress logs and streaks</li>
      <li>Sessions and password-reset tokens</li>
      <li>Profile photos stored for your account</li>
    </ul>

    <h2>Timing and backups</h2>
    <p>
      We aim to complete deletion requests within <strong>30 days</strong>. Short-lived encrypted
      backups required for reliability may retain residual copies for up to about 30 days, after
      which they expire. We may need to verify that the request comes from the account holder.
    </p>

    <h2>Privacy</h2>
    <p>
      See our full
      <a href="/legal/privacy">Privacy Policy</a>
      for how data is collected and processed (including OpenAI for plan generation).
    </p>
    <p class="meta">Support: <a href="mailto:${escapeHtml(support)}">${escapeHtml(support)}</a></p>
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
