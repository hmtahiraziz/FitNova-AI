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

const LAST_UPDATED = '20 October 2026';

export const PRIVACY_POLICY: LegalDocument = {
  id: 'privacy',
  title: 'Privacy Policy',
  lastUpdated: LAST_UPDATED,
  intro: `${brand.fullName} (“we”, “us”) provides AI-assisted workout and meal planning. This policy explains what we collect, how we use it, who processes it, and the choices you have.`,
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
      body: 'We use trusted processors to run the app: Railway (application hosting and optional upload volume for profile photos), Neon (PostgreSQL database), OpenAI (plan generation), Google (Sign-In identity verification), and an SMTP email provider for password-reset messages (message content includes a short-lived reset code). These providers process data only to provide their services to us.',
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
      body: 'You may delete your account in Advanced settings → Delete account. You may also request deletion without the app via our public account-deletion web page (linked from the Play Store listing as “Delete account data”, served at /legal/delete-account on our API host) or by emailing the support address published with our Privacy Policy. When deletion is completed, we remove your account, profile, plans, progress logs, sessions, reset tokens, and associated profile photos from active systems, subject to short-lived backups described above. You can also clear cached plan data on device.',
    },
    {
      heading: 'Children',
      body: `${brand.fullName} is not directed at children under 13 (or the minimum age required in your country). We do not knowingly collect data from children. If you believe a child has created an account, contact us and we will delete it.`,
    },
    {
      heading: 'Your choices',
      body: 'You can update profile data, disable reminders, clear local cache, or delete your account (in-app or via the public deletion page). We do not currently run a usage-analytics SDK. Contact us using the support email listed in the app store listing or on our hosted Privacy Policy page.',
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
      body: `${brand.fullName} provides general wellness, fitness, and nutrition suggestions. Plans are generated algorithmically (including with assistance from OpenAI) and may be imperfect. The app is not a medical device and does not provide medical, dietary, or clinical advice. We do not guarantee weight loss, muscle gain, or any specific health outcome.`,
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
      body: 'You may delete your account at any time in the app (Advanced settings) or by requesting deletion on our public account-deletion web page. We may suspend or terminate access for abuse, security risk, or material breach of these Terms.',
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
