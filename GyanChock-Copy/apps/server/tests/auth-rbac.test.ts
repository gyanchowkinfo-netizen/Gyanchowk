import { describe, expect, it } from 'vitest';
import { registerSchema } from '@gyan-chowk/shared';
import { sha256, timingSafeEqual } from '../src/utils/crypto.js';

describe('auth constraints', () => {
  it('rejects admin self-registration', () => {
    const parsed = registerSchema.safeParse({
      name: 'Hack',
      email: 'a@b.com',
      password: 'password1',
      role: 'admin',
    });
    expect(parsed.success).toBe(false);
  });

  it('hashes tokens so raw reset tokens are not comparable in logs', () => {
    const token = 'abc123';
    expect(sha256(token)).not.toBe(token);
    expect(sha256(token)).toHaveLength(64);
  });

  it('compares hashes in a length-safe way', () => {
    const a = sha256('same');
    expect(timingSafeEqual(a, sha256('same'))).toBe(true);
    expect(timingSafeEqual(a, sha256('other'))).toBe(false);
  });
});
