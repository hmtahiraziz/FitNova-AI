import { API_BASE_URL as ENV_API_BASE_URL, GOOGLE_WEB_CLIENT_ID as ENV_GOOGLE_WEB_CLIENT_ID } from '@env';

/** Device/emulator API base URL — set in mobile/.env */
export const API_BASE_URL =
  ENV_API_BASE_URL?.trim() || 'http://10.0.2.2:4000';

/** Must match GOOGLE_WEB_CLIENT_ID on the backend (Web OAuth client). */
export const GOOGLE_WEB_CLIENT_ID =
  ENV_GOOGLE_WEB_CLIENT_ID?.trim() ||
  '62216832569-4uforkep949vj452fnv9jhodsqc2u59f.apps.googleusercontent.com';
