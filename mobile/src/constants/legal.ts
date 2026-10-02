import { brand } from '../theme/tokens';

export type LegalDocId = 'privacy' | 'terms';

export type LegalSection = {
  heading: string;
  body: string;
};

export type LegalDocument = {
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
  intro: `${brand.fullName} (“we”, “us”) provides AI-assisted workout and meal planning. This policy explains what we collect, how we use it, and the choices you have.`,
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
      body: `You may delete your account in Advanced settings. Deletion removes your account, profile, plans, and logs from our systems, subject to short-lived backups required for reliability. You can also clear cached plan data on device.`,
    },
    {
      heading: 'Children',
      body: `${brand.fullName} is not directed at children under 13 (or the minimum age required in your country). We do not knowingly collect data from children.`,
    },
    {
      heading: 'Your choices',
      body: 'You can update profile data, disable reminders, clear local cache, opt out of optional usage analytics preferences, or delete your account. Contact us using the support email listed in the app store listing or at the address published with this policy on our API legal pages.',
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
  intro: `By creating an account or using ${brand.fullName}, you agree to these Terms.`,
  sections: [
    {
      heading: 'Service',
      body: `${brand.fullName} provides general wellness, fitness, and nutrition suggestions. Plans are generated algorithmically and may be imperfect. The app is not a medical device and does not provide medical, dietary, or clinical advice.`,
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
