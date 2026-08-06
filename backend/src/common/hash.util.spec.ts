import { randomToken, sha256 } from './hash.util';

describe('hash utilities', () => {
  it('creates stable one-way digests', () => {
    expect(sha256('treenvite')).toBe(sha256('treenvite'));
    expect(sha256('treenvite')).not.toBe(sha256('otro'));
  });

  it('creates different URL-safe tokens', () => {
    const first = randomToken();
    const second = randomToken();
    expect(first).not.toBe(second);
    expect(first).toMatch(/^[\w-]+$/);
  });
});
