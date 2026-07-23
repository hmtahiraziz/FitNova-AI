import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  generateRefreshToken,
  hashRefreshToken,
} from '../utils/refreshToken';

describe('refreshToken utils', () => {
  it('hashes deterministically and tokens differ', () => {
    const a = generateRefreshToken();
    const b = generateRefreshToken();
    assert.notEqual(a, b);
    assert.equal(hashRefreshToken(a), hashRefreshToken(a));
    assert.notEqual(hashRefreshToken(a), hashRefreshToken(b));
  });
});
