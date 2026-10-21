# FitNova API — multi-stage production image for Railway / Docker
FROM node:22-bookworm-slim AS builder

WORKDIR /app

RUN apt-get update -y \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
COPY prisma ./prisma/
COPY prisma.config.ts ./

RUN npm ci

COPY tsconfig.json ./
COPY src ./src

# prisma.config.ts requires DATABASE_URL when it loads. Build-time generate does not
# connect to a database; a placeholder is enough. Railway injects the real URL at runtime.
ARG DATABASE_URL="postgresql://prisma:prisma@127.0.0.1:5432/prisma?sslmode=disable"
ENV DATABASE_URL=${DATABASE_URL}

RUN npx prisma generate && npm run build

# -----------------------------------------------------------------------------
FROM node:22-bookworm-slim

WORKDIR /app

RUN apt-get update -y \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/* \
  && groupadd --system --gid 1001 fitnova \
  && useradd --system --uid 1001 --gid fitnova --home-dir /app --shell /usr/sbin/nologin fitnova

ENV NODE_ENV=production

# Same placeholder for any Prisma CLI that loads prisma.config.ts during image build.
# At runtime Railway's DATABASE_URL variable overrides this.
ARG DATABASE_URL="postgresql://prisma:prisma@127.0.0.1:5432/prisma?sslmode=disable"
ENV DATABASE_URL=${DATABASE_URL}

COPY package.json package-lock.json ./
COPY prisma ./prisma/
COPY prisma.config.ts ./

RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src/generated ./src/generated

RUN mkdir -p /app/uploads \
  && chown -R fitnova:fitnova /app

USER fitnova

EXPOSE 4000

HEALTHCHECK --interval=30s --timeout=5s --start-period=45s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||4000)+'/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

# Real DATABASE_URL must be set in the host environment (Railway Variables).
CMD ["sh", "-c", "npx prisma migrate deploy && npm start"]
