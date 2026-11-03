import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import jwt from 'jsonwebtoken';
import {
  JWT_AUDIENCE,
  JWT_ISSUER,
  signAccessToken,
} from './auth';
import { env } from '../config/env';

describe('signAccessToken', () => {
  it('signs HS256 tokens with issuer and audience', () => {
    const token = signAccessToken({
      userId: 'user_1',
      email: 'a@example.com',
      sessionId: 'sess_1',
    });

    const decoded = jwt.verify(token, env.JWT_SECRET, {
      algorithms: ['HS256'],
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
    }) as jwt.JwtPayload;

    assert.equal(decoded.userId, 'user_1');
    assert.equal(decoded.sessionId, 'sess_1');
    assert.equal(decoded.iss, JWT_ISSUER);
    assert.equal(decoded.aud, JWT_AUDIENCE);
  });

  it('rejects tokens signed with alg none when verifying with pinned algorithms', () => {
    const forged = jwt.sign(
      { userId: 'x', email: 'x@example.com', sessionId: 's' },
      '',
      { algorithm: 'none' as jwt.Algorithm },
    );

    assert.throws(
      () =>
        jwt.verify(forged, env.JWT_SECRET, {
          algorithms: ['HS256'],
          issuer: JWT_ISSUER,
          audience: JWT_AUDIENCE,
        }),
    );
  });
});
