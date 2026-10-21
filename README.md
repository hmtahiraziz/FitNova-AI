# FitNova AI

AI-powered fitness and nutrition coaching: profile-based workout and meal plans, daily logging, and progress streaks.

| Package | Stack |
|---------|--------|
| `backend/` | Node.js, Express (TypeScript), Prisma, PostgreSQL (Neon) |
| `mobile/` | React Native (TypeScript), NativeWind |

## Prerequisites

- Node.js 22+
- PostgreSQL (e.g. [Neon](https://neon.tech))
- Android Studio and/or Xcode for native builds
- OpenAI API key (optional for local UI; required for live plan generation)

## Quick start

**Backend**

```bash
cd backend
cp .env.example .env   # edit DATABASE_URL, JWT_SECRET, and other values
npm install
npx prisma generate
npx prisma migrate deploy
npm run dev
```

API health: `http://localhost:4000/health`  
Privacy (hosted HTML for Play Console): `http://localhost:4000/legal/privacy`  
Terms: `http://localhost:4000/legal/terms`  


**Mobile**

```bash
cd mobile
cp .env.example .env   # set API_BASE_URL and GOOGLE_WEB_CLIENT_ID
npm install
npx react-native-asset
npm start
```

In a second terminal: `npm run android` or `npm run ios` (macOS: run `pod install` in `mobile/ios` first).

**API base URL (mobile `.env`)**

| Target | `API_BASE_URL` |
|--------|----------------|
| Android emulator | `http://10.0.2.2:4000` |
| iOS simulator | `http://localhost:4000` |
| Physical device | `http://<your-lan-ip>:4000` |
| Production / Play Store | `https://<your-railway-domain>` (**HTTPS required**) |

After changing mobile env vars, restart Metro: `npm start -- --reset-cache`.

## Configuration

See `backend/.env.example` and `mobile/.env.example` for all variables. Do not commit `.env` files; they are listed in `.gitignore`.

## Deploy backend (Railway)

1. Create a Railway project from this GitHub repo.
2. Set the service **Root Directory** to `backend`.
3. Railway will use `backend/Dockerfile` (preferred) or `backend/railway.toml` build/start settings.
4. Add environment variables from `backend/.env.example` (`DATABASE_URL`, `JWT_SECRET` ≥32 random chars, `OPENAI_API_KEY`, Google/SMTP vars, `NODE_ENV=production`, `APP_URL=https://<your-domain>`, `SUPPORT_EMAIL=...`). Do **not** set `PORT` — Railway provides it.
5. **Avatar persistence:** add a Railway volume (e.g. mount `/data/uploads`) and set `UPLOADS_DIR=/data/uploads`. Without this, profile photos are lost on redeploy. Photos are **not** publicly listed; clients load them via authenticated `GET /profile/avatar` only. The container runs as UID **1001** (`fitnova`) — ensure the volume is writable by that user.
6. Generate a public HTTPS domain, then set mobile `API_BASE_URL` to that URL.
7. Confirm:
   - `GET https://<domain>/health` → `{ "status": "ok", "database": "up", ... }`
   - `GET https://<domain>/legal/privacy` (Play Console → Privacy policy)
   - `GET https://<domain>/legal/delete-account` (Play Console → App content → Data deletion)
8. **Stable legal URLs:** Railway’s default `*.up.railway.app` hostname can change if you recreate the service. Prefer a **custom domain** (or static hosting that proxies these paths) so Privacy and Data deletion URLs in Play Console stay valid after redeploys.

Health check: `GET /health` (includes a Postgres ping; returns 503 if the DB is down).

## Play Store release (Android)

### 1. Upload signing keystore

```bash
cd mobile/android
keytool -genkeypair -v -storetype PKCS12 -keystore app/upload-keystore.jks \
  -alias fitnova-upload -keyalg RSA -keysize 2048 -validity 10000
cp keystore.properties.example keystore.properties
# Edit keystore.properties with store/key passwords and paths
```

`keystore.properties`, `*.jks`, and `*.keystore` (except `debug.keystore`) are gitignored.  
**Release builds fail** if `keystore.properties` (or the keystore file) is missing — there is no debug-keystore fallback.

### 2. Production mobile env

In `mobile/.env` for release builds:

```env
API_BASE_URL=https://YOUR-SERVICE.up.railway.app
GOOGLE_WEB_CLIENT_ID=your-web-client-id.apps.googleusercontent.com
```

Release builds **require HTTPS** for `API_BASE_URL`.

### 3. Google Sign-In (release)

In Google Cloud Console, create an **Android** OAuth client for package `com.b4fitness`. You must register **both** certificate fingerprints (Sign-In fails for Play-distributed builds if the App Signing SHA-1 is missing):

1. **Upload keystore SHA-1** (local signing key):

```bash
keytool -list -v -keystore mobile/android/app/upload-keystore.jks -alias fitnova-upload
```

2. **Play App Signing key SHA-1** (after the first AAB upload): Play Console → Your app → Setup → App signing → App signing key certificate → SHA-1. Add that fingerprint to the same Android OAuth client (or a second Android client for the same package).

Use the same **Web** client ID on mobile and backend (`GOOGLE_WEB_CLIENT_ID`).

### 4. Build a signed AAB

```bash
cd mobile/android
./gradlew bundleRelease
# Output: app/build/outputs/bundle/release/app-release.aab
```

Upload the AAB to Play Console. Prefer **Play App Signing**, then add the App Signing SHA-1 to Google Cloud as above.

### 5. Store listing checklist

| Item | Notes |
|------|--------|
| App name | FitNova AI (launcher already uses this; package id remains `com.b4fitness`) |
| Privacy policy URL | `https://<your-domain>/legal/privacy` |
| Terms (optional) | `https://<your-domain>/legal/terms` |
| Data deletion URL | `https://<your-domain>/legal/delete-account` — **required** by Play when the app creates accounts |
| Data safety | Email; health metrics (height/weight/age, workouts, nutrition); photos; device IDs for sessions; declare OpenAI as a service provider processing health/fitness data for plan generation |
| Account deletion (in-app) | Advanced settings → Delete account |
| Account deletion (web) | Public page above (mailto request; no app reinstall required) |
| Support email | Match `SUPPORT_EMAIL` on the backend |

In-app Terms / Privacy screens are linked from Welcome, Register, and Advanced settings.

## Development

```bash
cd backend
npm test
npm run smoke    # end-to-end API smoke test (server must be running)
```
