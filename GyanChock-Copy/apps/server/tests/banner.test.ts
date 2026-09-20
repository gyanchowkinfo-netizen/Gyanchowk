import { describe, expect, it } from 'vitest';
import { isBannerScheduledLive, safeCtaUrl, sortKey, toPublicBanner } from '../src/services/banner.service.js';

describe('banner scheduling', () => {
  const now = new Date('2026-09-16T12:00:00.000Z');

  it('hides inactive banners', () => {
    expect(isBannerScheduledLive({ active: false }, now)).toBe(false);
  });

  it('respects start and end dates when present', () => {
    expect(isBannerScheduledLive({ active: true, startAt: '2026-09-17T00:00:00.000Z' }, now)).toBe(false);
    expect(isBannerScheduledLive({ active: true, endAt: '2026-09-15T00:00:00.000Z' }, now)).toBe(false);
    expect(
      isBannerScheduledLive(
        { active: true, startAt: '2026-09-01T00:00:00.000Z', endAt: '2026-10-01T00:00:00.000Z' },
        now,
      ),
    ).toBe(true);
  });

  it('treats missing dates as always-on when active', () => {
    expect(isBannerScheduledLive({ active: true }, now)).toBe(true);
  });
});

describe('banner public payload', () => {
  it('rejects unsafe CTA urls', () => {
    expect(safeCtaUrl('javascript:alert(1)')).toBeUndefined();
    expect(safeCtaUrl('//evil.example')).toBeUndefined();
    expect(safeCtaUrl('/courses')).toBe('/courses');
    expect(safeCtaUrl('https://gyanchowk.in/jee')).toBe('https://gyanchowk.in/jee');
  });

  it('does not expose admin-only fields publicly', () => {
    const pub = toPublicBanner({
      _id: 'abc',
      title: 'JEE',
      href: '/courses?category=JEE',
      active: true,
      startAt: now(),
    });
    expect(pub).not.toHaveProperty('active');
    expect(pub).not.toHaveProperty('startAt');
    expect(pub.ctaUrl).toBe('/courses?category=JEE');
    expect(sortKey({ order: 2, sortOrder: 4 })).toBe(4);
  });
});

function now() {
  return new Date();
}
