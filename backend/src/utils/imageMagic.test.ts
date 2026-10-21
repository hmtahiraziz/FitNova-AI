import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { detectImageType } from './imageMagic';

describe('detectImageType', () => {
  it('detects JPEG, PNG, and WebP magic bytes', () => {
    const jpeg = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10]);
    const png = Buffer.from([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00,
    ]);
    const webp = Buffer.alloc(12);
    webp.write('RIFF', 0);
    webp.write('WEBP', 8);

    assert.equal(detectImageType(jpeg), 'jpeg');
    assert.equal(detectImageType(png), 'png');
    assert.equal(detectImageType(webp), 'webp');
  });

  it('rejects unknown or empty buffers', () => {
    assert.equal(detectImageType(Buffer.from([])), null);
    assert.equal(detectImageType(Buffer.from([0x00, 0x01, 0x02])), null);
  });
});
