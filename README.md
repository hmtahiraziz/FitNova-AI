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

After changing mobile env vars, restart Metro: `npm start -- --reset-cache`.

## Configuration

See `backend/.env.example` and `mobile/.env.example` for all variables. Do not commit `.env` files; they are listed in `.gitignore`.

## Deploy backend (Railway)

1. Create a Railway project from this GitHub repo.
2. Set the service **Root Directory** to `backend`.
3. Railway will use `backend/Dockerfile` (preferred) or `backend/railway.toml` build/start settings.
4. Add environment variables from `backend/.env.example` (`DATABASE_URL`, `JWT_SECRET`, `OPENAI_API_KEY`, Google/SMTP vars, `NODE_ENV=production`, etc.). Do **not** set `PORT` — Railway provides it.
5. Generate a public domain, then set mobile `API_BASE_URL` to that HTTPS URL.

Health check: `GET /health`

## Development

```bash
cd backend
npm test
npm run smoke    # end-to-end API smoke test (server must be running)
```
