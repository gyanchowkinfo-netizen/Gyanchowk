import { getCloudinary, isCloudinaryConfigured } from '../config/cloudinary.js';

export type BannerMedia = { publicId?: string | null; url?: string | null };

export type BannerLike = {
  _id?: unknown;
  title?: string | null;
  subtitle?: string | null;
  image?: BannerMedia | null;
  mobileImage?: BannerMedia | null;
  ctaText?: string | null;
  ctaUrl?: string | null;
  href?: string | null;
  placement?: string | null;
  bannerType?: string | null;
  active?: boolean | null;
  order?: number | null;
  sortOrder?: number | null;
  startAt?: Date | string | null;
  endAt?: Date | string | null;
  createdAt?: Date | string;
  updatedAt?: Date | string;
};

const CAROUSEL_PLACEMENTS = ['hero', 'home', 'home_mid', 'offer'];

function parseDate(value: unknown): Date | null {
  if (value == null || value === '') return null;
  const d = new Date(String(value));
  return Number.isNaN(d.getTime()) ? null : d;
}

export function liveBannerQuery(now = new Date()) {
  return {
    active: true,
    $and: [
      { $or: [{ startAt: { $exists: false } }, { startAt: null }, { startAt: { $lte: now } }] },
      { $or: [{ endAt: { $exists: false } }, { endAt: null }, { endAt: { $gte: now } }] },
    ],
  };
}

export function carouselPlacementFilter() {
  return { placement: { $in: CAROUSEL_PLACEMENTS } };
}

export function isBannerScheduledLive(
  banner: Pick<BannerLike, 'active' | 'startAt' | 'endAt'>,
  now = new Date(),
) {
  if (!banner.active) return false;
  if (banner.startAt && new Date(banner.startAt).getTime() > now.getTime()) return false;
  if (banner.endAt && new Date(banner.endAt).getTime() < now.getTime()) return false;
  return true;
}

export function safeCtaUrl(value?: string | null): string | undefined {
  if (!value) return undefined;
  const v = value.trim().slice(0, 500);
  if (!v) return undefined;
  if (v.startsWith('/') && !v.startsWith('//') && !v.toLowerCase().startsWith('/\\')) return v;
  try {
    const u = new URL(v);
    if (u.protocol === 'http:' || u.protocol === 'https:') return v;
  } catch {
    return undefined;
  }
  return undefined;
}

export function sortKey(banner: BannerLike) {
  return banner.sortOrder ?? banner.order ?? 0;
}

export function toPublicBanner(doc: BannerLike) {
  const ctaUrl = safeCtaUrl(doc.ctaUrl || doc.href);
  return {
    id: String(doc._id ?? ''),
    title: doc.title ?? '',
    subtitle: doc.subtitle ?? '',
    imageUrl: doc.image?.url || undefined,
    mobileImageUrl: doc.mobileImage?.url || undefined,
    ctaText: doc.ctaText || 'Learn more',
    ctaUrl,
    placement: doc.placement || 'hero',
    bannerType: doc.bannerType || 'promo',
    sortOrder: sortKey(doc),
  };
}

export function toAdminBanner(doc: BannerLike) {
  return {
    _id: String(doc._id ?? ''),
    title: doc.title ?? '',
    subtitle: doc.subtitle ?? '',
    image: doc.image?.url ? { publicId: doc.image.publicId ?? undefined, url: doc.image.url } : undefined,
    mobileImage: doc.mobileImage?.url
      ? { publicId: doc.mobileImage.publicId ?? undefined, url: doc.mobileImage.url }
      : undefined,
    ctaText: doc.ctaText ?? '',
    ctaUrl: doc.ctaUrl || doc.href || '',
    href: doc.href || doc.ctaUrl || '',
    placement: doc.placement || 'hero',
    bannerType: doc.bannerType || 'promo',
    active: Boolean(doc.active),
    sortOrder: sortKey(doc),
    startAt: doc.startAt ?? null,
    endAt: doc.endAt ?? null,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
    live: isBannerScheduledLive(doc),
  };
}

export function normalizeBannerInput(body: Record<string, unknown>) {
  const ctaUrl = safeCtaUrl(String(body.ctaUrl ?? body.href ?? '')) ?? '';
  const sortOrder = Number(body.sortOrder ?? body.order ?? 0);
  return {
    title: String(body.title ?? '').trim(),
    subtitle: String(body.subtitle ?? '').trim(),
    image: (body.image as BannerMedia | undefined) ?? undefined,
    mobileImage: (body.mobileImage as BannerMedia | undefined) ?? undefined,
    ctaText: String(body.ctaText ?? '').trim(),
    ctaUrl,
    href: ctaUrl,
    placement: String(body.placement ?? 'hero'),
    bannerType: String(body.bannerType ?? 'promo'),
    active: body.active !== false && body.active !== 'false',
    order: Number.isFinite(sortOrder) ? sortOrder : 0,
    sortOrder: Number.isFinite(sortOrder) ? sortOrder : 0,
    startAt: parseDate(body.startAt),
    endAt: parseDate(body.endAt),
  };
}

export async function destroyMedia(publicId?: string | null) {
  if (!publicId || !isCloudinaryConfigured()) return;
  try {
    await getCloudinary().uploader.destroy(publicId);
  } catch {
    /* best-effort cleanup */
  }
}

export async function cleanupBannerMedia(banner?: BannerLike | null) {
  if (!banner) return;
  await Promise.all([destroyMedia(banner.image?.publicId), destroyMedia(banner.mobileImage?.publicId)]);
}
