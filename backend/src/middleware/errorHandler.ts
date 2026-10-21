import type { NextFunction, Request, Response } from 'express';
import multer from 'multer';
import { ZodError } from 'zod';
import { env } from '../config/env';

export class AppError extends Error {
  statusCode: number;
  details?: unknown;

  constructor(message: string, statusCode = 400, details?: unknown) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.details = details;
  }
}

const SAFE_DETAIL_KEYS = new Set([
  'retryAfterSeconds',
  'generationsUsedLastHour',
  'generationsLimitPerHour',
  'code',
]);

/** Only expose structured, non-sensitive details to clients. */
export function publicErrorDetails(details: unknown): unknown {
  if (details == null) {
    return undefined;
  }
  if (typeof details !== 'object' || details instanceof Error) {
    return undefined;
  }
  if (Array.isArray(details)) {
    return undefined;
  }
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(
    details as Record<string, unknown>,
  )) {
    if (!SAFE_DETAIL_KEYS.has(key)) {
      continue;
    }
    if (
      typeof value === 'string' ||
      typeof value === 'number' ||
      typeof value === 'boolean'
    ) {
      out[key] = value;
    }
  }
  return Object.keys(out).length > 0 ? out : undefined;
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof AppError) {
    const payload: { error: string; details?: unknown } = {
      error: err.message,
    };
    const details = publicErrorDetails(err.details);
    if (details !== undefined) {
      payload.details = details;
    }
    res.status(err.statusCode).json(payload);
    return;
  }

  if (err instanceof ZodError) {
    if (env.NODE_ENV === 'production') {
      res.status(400).json({ error: 'Validation failed' });
    } else {
      res.status(400).json({
        error: 'Validation failed',
        details: err.flatten(),
      });
    }
    return;
  }

  if (err instanceof multer.MulterError) {
    const message =
      err.code === 'LIMIT_FILE_SIZE'
        ? 'Image must be 5 MB or smaller'
        : err.message;
    res.status(400).json({ error: message });
    return;
  }

  console.error(err);
  res.status(500).json({
    error: 'Internal server error',
  });
}
