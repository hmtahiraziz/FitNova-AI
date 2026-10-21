import type { Server } from 'http';
import { createApp } from './app';
import { env, uploadsRoot } from './config/env';
import { APP_NAME } from './content/legal';
import { prisma } from './lib/prisma';
import { ensureUploadDirs } from './services/avatar.service';

const SHUTDOWN_TIMEOUT_MS = 15_000;

async function main() {
  await ensureUploadDirs();

  const app = createApp();
  const server: Server = app.listen(env.PORT, () => {
    console.log(`${APP_NAME} API listening on port ${env.PORT}`);
    console.log(`Health: GET /health`);
    console.log(`Legal:  GET /legal/privacy  GET /legal/terms`);
    if (env.NODE_ENV !== 'production') {
      console.log(
        `Docs:   GET /docs  (user: ${env.SWAGGER_USER})  OpenAPI: GET /openapi.json`,
      );
    }
    console.log(`Uploads directory: ${uploadsRoot()}`);
  });

  let shuttingDown = false;

  const shutdown = (signal: string) => {
    if (shuttingDown) {
      return;
    }
    shuttingDown = true;
    console.log(`[fitnova] ${signal} received — shutting down gracefully`);

    const forceTimer = setTimeout(() => {
      console.error('[fitnova] Forced exit after shutdown timeout');
      process.exit(1);
    }, SHUTDOWN_TIMEOUT_MS);
    forceTimer.unref();

    server.close(async (err) => {
      try {
        await prisma.$disconnect();
      } catch (disconnectErr) {
        console.error('[fitnova] prisma disconnect error', disconnectErr);
      }
      if (err) {
        console.error('[fitnova] HTTP server close error', err);
        process.exit(1);
      }
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

void main().catch((err) => {
  console.error('[fitnova] Failed to start', err);
  process.exit(1);
});
