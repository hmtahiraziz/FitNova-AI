import { createApp } from './app';
import { env } from './config/env';
import { ensureUploadDirs } from './services/avatar.service';

const app = createApp();

void ensureUploadDirs().then(() => {
  app.listen(env.PORT, () => {
    console.log(`B4 Fitness API listening on http://localhost:${env.PORT}`);
    console.log(`Health check: GET http://localhost:${env.PORT}/health`);
  });
});
