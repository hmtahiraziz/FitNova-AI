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
4. Add environment variables from `backend/.env.example` (`DATABASE_URL`, `JWT_SECRET`, `OPENAI_API_KEY`, Google/SMTP vars, `NODE_ENV=production`, `APP_URL=https://<your-domain>`, `SUPPORT_EMAIL=...`). Do **not** set `PORT` — Railway provides it.
5. **Avatar persistence:** add a Railway volume (e.g. mount `/data/uploads`) and set `UPLOADS_DIR=/data/uploads`. Without this, profile photos are lost on redeploy.
6. Generate a public HTTPS domain, then set mobile `API_BASE_URL` to that URL.
7. Confirm:
   - `GET https://<domain>/health` → `{ "status": "ok", "database": "up", ... }`
   - `GET https://<domain>/legal/privacy` (use this URL in Play Console Data safety / Privacy policy)

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

### 2. Production mobile env

In `mobile/.env` for release builds:

```env
API_BASE_URL=https://YOUR-SERVICE.up.railway.app
GOOGLE_WEB_CLIENT_ID=your-web-client-id.apps.googleusercontent.com
```

Release builds **require HTTPS** for `API_BASE_URL`.

### 3. Google Sign-In (release)

In Google Cloud Console, add an Android OAuth client for package `com.b4fitness` using the **SHA-1** of your upload keystore:

```bash
keytool -list -v -keystore mobile/android/app/upload-keystore.jks -alias fitnova-upload
```

Use the same Web client ID on mobile and backend (`GOOGLE_WEB_CLIENT_ID`).

### 4. Build a signed AAB

```bash
cd mobile/android
./gradlew bundleRelease
# Output: app/build/outputs/bundle/release/app-release.aab
```

Upload the AAB to Play Console. Prefer Play App Signing.

### 5. Store listing checklist

| Item | Notes |
|------|--------|
| App name | FitNova AI (launcher already uses this; package id remains `com.b4fitness`) |
| Privacy policy URL | `https://<railway-domain>/legal/privacy` |
| Terms (optional) | `https://<railway-domain>/legal/terms` |
| Data safety | Account email, health metrics (height/weight/age), photos, local notifications |
| Account deletion | In-app: Advanced settings → Delete account |
| Support email | Match `SUPPORT_EMAIL` on the backend |

In-app Terms / Privacy screens are linked from Welcome, Register, and Advanced settings.

## Development

```bash
cd backend
npm test
npm run smoke    # end-to-end API smoke test (server must be running)
```
