import { createApp } from './app';
import { env, uploadsRoot } from './config/env';
import { APP_NAME } from './content/legal';
import { ensureUploadDirs } from './services/avatar.service';

const app = createApp();

void ensureUploadDirs().then(() => {
  app.listen(env.PORT, () => {
    console.log(`${APP_NAME} API listening on port ${env.PORT}`);
    console.log(`Health: GET /health`);
    console.log(`Legal:  GET /legal/privacy  GET /legal/terms`);
    console.log(`Uploads directory: ${uploadsRoot()}`);
  });
});
