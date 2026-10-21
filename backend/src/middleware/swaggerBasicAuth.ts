import { timingSafeEqual } from 'crypto';
import type { NextFunction, Request, Response } from 'express';
import { env } from '../config/env';

function safeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) {
    return false;
  }
  return timingSafeEqual(left, right);
}

/** HTTP Basic Auth for Swagger UI / OpenAPI JSON. */
export function swaggerBasicAuth(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Basic ')) {
    res.setHeader('WWW-Authenticate', 'Basic realm="FitNova API Docs"');
    res.status(401).send('Authentication required');
    return;
  }

  let decoded = '';
  try {
    decoded = Buffer.from(header.slice(6), 'base64').toString('utf8');
  } catch {
    res.setHeader('WWW-Authenticate', 'Basic realm="FitNova API Docs"');
    res.status(401).send('Invalid authorization header');
    return;
  }

  const colon = decoded.indexOf(':');
  const user = colon >= 0 ? decoded.slice(0, colon) : decoded;
  const pass = colon >= 0 ? decoded.slice(colon + 1) : '';

  if (
    safeEqual(user, env.SWAGGER_USER) &&
    safeEqual(pass, env.SWAGGER_PASSWORD)
  ) {
    next();
    return;
  }

  res.setHeader('WWW-Authenticate', 'Basic realm="FitNova API Docs"');
  res.status(401).send('Invalid username or password');
}
