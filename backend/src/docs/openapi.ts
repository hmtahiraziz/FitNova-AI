import './openapi-setup';

import {
  OpenAPIRegistry,
  OpenApiGeneratorV3,
} from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';
import { env } from '../config/env';
import { APP_NAME, SERVICE_NAME } from '../content/legal';
import {
  deleteAccountSchema,
  forgotPasswordSchema,
  googleAuthSchema,
  loginSchema,
  logoutSchema,
  refreshSchema,
  registerSchema,
  resetPasswordSchema,
} from '../schemas/auth.schemas';
import {
  planGenerateBodySchema,
  planReportBodySchema,
} from '../schemas/plans.generate.schemas';
import { upsertProfileSchema } from '../schemas/profile.schemas';
import {
  progressRangeQuerySchema,
  progressStatsQuerySchema,
  upsertProgressSchema,
} from '../schemas/progress.schemas';

const registry = new OpenAPIRegistry();

registry.registerComponent('securitySchemes', 'bearerAuth', {
  type: 'http',
  scheme: 'bearer',
  bearerFormat: 'JWT',
  description: 'Access token from `/auth/login`, `/auth/register`, or `/auth/refresh`.',
});

const ErrorBody = registry.register(
  'Error',
  z.object({
    error: z.string(),
  }),
);

const MessageBody = registry.register(
  'Message',
  z.object({
    message: z.string(),
  }),
);

const HealthBody = registry.register(
  'Health',
  z.object({
    status: z.enum(['ok', 'degraded']),
    service: z.string(),
    database: z.enum(['up', 'down']),
    timestamp: z.string(),
  }),
);

const jsonBody = <T extends z.ZodType>(schema: T) => ({
  content: {
    'application/json': { schema },
  },
});

const errorResponses = {
  400: {
    description: 'Validation or bad request',
    ...jsonBody(ErrorBody),
  },
  401: {
    description: 'Unauthorized',
    ...jsonBody(ErrorBody),
  },
  404: {
    description: 'Not found',
    ...jsonBody(ErrorBody),
  },
  429: {
    description: 'Rate limited',
    ...jsonBody(ErrorBody),
  },
} as const;

function registerPaths() {
  // —— Health ——
  registry.registerPath({
    method: 'get',
    path: '/health',
    tags: ['Health'],
    summary: 'Liveness / health check',
    responses: {
      200: { description: 'Service healthy', ...jsonBody(HealthBody) },
      503: { description: 'Database down', ...jsonBody(HealthBody) },
    },
  });

  registry.registerPath({
    method: 'get',
    path: '/health/ready',
    tags: ['Health'],
    summary: 'Readiness probe',
    responses: {
      200: { description: 'Ready', ...jsonBody(HealthBody) },
      503: { description: 'Not ready', ...jsonBody(HealthBody) },
    },
  });

  // —— Legal ——
  registry.registerPath({
    method: 'get',
    path: '/legal',
    tags: ['Legal'],
    summary: 'Legal document links',
    responses: {
      200: {
        description: 'Links to privacy, terms, and delete-account pages',
        ...jsonBody(
          z.object({
            privacy: z.string(),
            terms: z.string(),
            deleteAccount: z.string(),
          }),
        ),
      },
    },
  });

  registry.registerPath({
    method: 'get',
    path: '/legal/privacy',
    tags: ['Legal'],
    summary: 'Privacy policy (HTML)',
    responses: {
      200: {
        description: 'HTML privacy policy',
        content: { 'text/html': { schema: z.string() } },
      },
    },
  });

  registry.registerPath({
    method: 'get',
    path: '/legal/terms',
    tags: ['Legal'],
    summary: 'Terms of use (HTML)',
    responses: {
      200: {
        description: 'HTML terms',
        content: { 'text/html': { schema: z.string() } },
      },
    },
  });

  registry.registerPath({
    method: 'get',
    path: '/legal/delete-account',
    tags: ['Legal'],
    summary: 'Account deletion instructions (HTML)',
    responses: {
      200: {
        description: 'HTML delete-account guide',
        content: { 'text/html': { schema: z.string() } },
      },
    },
  });

  // —— Auth ——
  registry.registerPath({
    method: 'post',
    path: '/auth/register',
    tags: ['Auth'],
    summary: 'Register with email and password',
    request: { body: { required: true, ...jsonBody(registerSchema) } },
    responses: {
      201: { description: 'Registered; returns tokens and user' },
      ...errorResponses,
    },
  });

  registry.registerPath({
    method: 'post',
    path: '/auth/login',
    tags: ['Auth'],
    summary: 'Sign in with email and password',
    request: { body: { required: true, ...jsonBody(loginSchema) } },
    responses: {
      200: { description: 'Signed in; returns tokens and user' },
      ...errorResponses,
    },
  });

  registry.registerPath({
    method: 'post',
    path: '/auth/google',
    tags: ['Auth'],
    summary: 'Sign in with Google ID token',
    request: { body: { required: true, ...jsonBody(googleAuthSchema) } },
    responses: {
      200: { description: 'Signed in; returns tokens and user' },
      ...errorResponses,
    },
  });

  registry.registerPath({
    method: 'post',
    path: '/auth/refresh',
    tags: ['Auth'],
    summary: 'Refresh access token',
    request: { body: { required: true, ...jsonBody(refreshSchema) } },
    responses: {
      200: { description: 'New access (and refresh) tokens' },
      ...errorResponses,
    },
  });

  registry.registerPath({
    method: 'post',
    path: '/auth/logout',
    tags: ['Auth'],
    summary: 'Revoke refresh session',
    request: { body: { required: true, ...jsonBody(logoutSchema) } },
    responses: {
      200: { description: 'Signed out', ...jsonBody(MessageBody) },
      ...errorResponses,
    },
  });

  registry.registerPath({
    method: 'post',
    path: '/auth/forgot-password',
    tags: ['Auth'],
    summary: 'Request password reset code',
    request: { body: { required: true, ...jsonBody(forgotPasswordSchema) } },
    responses: {
      200: { description: 'Reset email sent (or silently accepted)' },
      ...errorResponses,
    },
  });

  registry.registerPath({
    method: 'post',
    path: '/auth/reset-password',
    tags: ['Auth'],
    summary: 'Reset password with email code',
    request: { body: { required: true, ...jsonBody(resetPasswordSchema) } },
    responses: {
      200: { description: 'Password updated' },
      ...errorResponses,
    },
  });

  registry.registerPath({
    method: 'get',
    path: '/auth/me',
    tags: ['Auth'],
    summary: 'Current authenticated user',
    security: [{ bearerAuth: [] }],
    responses: {
      200: { description: 'User profile summary' },
      ...errorResponses,
    },
  });

  registry.registerPath({
    method: 'delete',
    path: '/auth/account',
    tags: ['Auth'],
    summary: 'Permanently delete account',
    security: [{ bearerAuth: [] }],
    request: { body: { required: true, ...jsonBody(deleteAccountSchema) } },
    responses: {
      200: { description: 'Account deleted' },
      ...errorResponses,
    },
  });

  // —— Profile ——
  registry.registerPath({
    method: 'get',
    path: '/profile',
    tags: ['Profile'],
    summary: 'Get fitness profile',
    security: [{ bearerAuth: [] }],
    responses: {
      200: { description: 'Profile (or null if not set)' },
      ...errorResponses,
    },
  });

  registry.registerPath({
    method: 'put',
    path: '/profile',
    tags: ['Profile'],
    summary: 'Create or update fitness profile',
    security: [{ bearerAuth: [] }],
    request: { body: { required: true, ...jsonBody(upsertProfileSchema) } },
    responses: {
      200: { description: 'Saved profile' },
      ...errorResponses,
    },
  });

  registry.registerPath({
    method: 'get',
    path: '/profile/avatar',
    tags: ['Profile'],
    summary: 'Download profile photo',
    security: [{ bearerAuth: [] }],
    responses: {
      200: {
        description: 'JPEG image bytes',
        content: {
          'image/jpeg': {
            schema: z.string().openapi({ type: 'string', format: 'binary' }),
          },
        },
      },
      ...errorResponses,
    },
  });

  registry.registerPath({
    method: 'post',
    path: '/profile/avatar',
    tags: ['Profile'],
    summary: 'Upload profile photo',
    security: [{ bearerAuth: [] }],
    request: {
      body: {
        required: true,
        content: {
          'multipart/form-data': {
            schema: z.object({
              avatar: z
                .string()
                .openapi({ type: 'string', format: 'binary' })
                .describe('Image file (max 5MB)'),
            }),
          },
        },
      },
    },
    responses: {
      200: { description: 'Updated profile with avatar URL' },
      ...errorResponses,
    },
  });

  registry.registerPath({
    method: 'delete',
    path: '/profile/avatar',
    tags: ['Profile'],
    summary: 'Remove profile photo',
    security: [{ bearerAuth: [] }],
    responses: {
      200: { description: 'Updated profile' },
      ...errorResponses,
    },
  });

  // —— Plans ——
  registry.registerPath({
    method: 'post',
    path: '/plans/generate',
    tags: ['Plans'],
    summary: 'Generate or regenerate AI plan',
    security: [{ bearerAuth: [] }],
    request: { body: { required: false, ...jsonBody(planGenerateBodySchema) } },
    responses: {
      201: { description: 'Generated plan payload' },
      ...errorResponses,
    },
  });

  registry.registerPath({
    method: 'post',
    path: '/plans/{planId}/report',
    tags: ['Plans'],
    summary: 'Report a plan issue',
    security: [{ bearerAuth: [] }],
    request: {
      params: z.object({
        planId: z.string().min(1).openapi({ example: 'clxxxxxxxx' }),
      }),
      body: { required: true, ...jsonBody(planReportBodySchema) },
    },
    responses: {
      201: { description: 'Report recorded' },
      ...errorResponses,
    },
  });

  registry.registerPath({
    method: 'get',
    path: '/plans/latest',
    tags: ['Plans'],
    summary: 'Latest plan for the user',
    security: [{ bearerAuth: [] }],
    responses: {
      200: { description: 'Latest plan payload (or empty)' },
      ...errorResponses,
    },
  });

  registry.registerPath({
    method: 'get',
    path: '/plans',
    tags: ['Plans'],
    summary: 'List plans',
    security: [{ bearerAuth: [] }],
    responses: {
      200: { description: 'Plan list' },
      ...errorResponses,
    },
  });

  // —— Progress ——
  registry.registerPath({
    method: 'put',
    path: '/progress',
    tags: ['Progress'],
    summary: 'Upsert daily progress log',
    security: [{ bearerAuth: [] }],
    request: { body: { required: true, ...jsonBody(upsertProgressSchema) } },
    responses: {
      200: { description: 'Saved log' },
      ...errorResponses,
    },
  });

  registry.registerPath({
    method: 'get',
    path: '/progress',
    tags: ['Progress'],
    summary: 'List progress logs in a date range',
    security: [{ bearerAuth: [] }],
    request: { query: progressRangeQuerySchema },
    responses: {
      200: { description: 'Logs and streak info' },
      ...errorResponses,
    },
  });

  registry.registerPath({
    method: 'get',
    path: '/progress/stats',
    tags: ['Progress'],
    summary: 'Aggregate progress stats',
    security: [{ bearerAuth: [] }],
    request: { query: progressStatsQuerySchema },
    responses: {
      200: { description: 'Stats summary' },
      ...errorResponses,
    },
  });
}

registerPaths();

let cachedDocument: ReturnType<OpenApiGeneratorV3['generateDocument']> | null =
  null;

export function buildOpenApiDocument() {
  if (!cachedDocument) {
    const generator = new OpenApiGeneratorV3(registry.definitions);
    cachedDocument = generator.generateDocument({
      openapi: '3.0.3',
      info: {
        title: `${APP_NAME} API`,
        version: '1.0.0',
        description: `${SERVICE_NAME} — AI fitness & nutrition coach. Use **Authorize** with a Bearer access token for protected routes.`,
      },
      servers: [{ url: env.APP_URL || `http://localhost:${env.PORT}` }],
    });
  }
  return cachedDocument;
}
