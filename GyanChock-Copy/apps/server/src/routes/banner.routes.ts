import { Router } from 'express';
import { z } from 'zod';
import { objectIdSchema } from '@gyan-chowk/shared';
import { authenticate, requireRoles, type AuthedRequest } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/error.js';
import { validate } from '../middleware/validate.js';
import { audit } from '../middleware/audit.js';
import { BannerModel } from '../models/index.js';
import { badRequest, notFound } from '../utils/errors.js';
import {
  carouselPlacementFilter,
  cleanupBannerMedia,
  destroyMedia,
  liveBannerQuery,
  normalizeBannerInput,
  toAdminBanner,
  toPublicBanner,
} from '../services/banner.service.js';

export const bannerRouter = Router();

const mediaSchema = z
  .object({
    publicId: z.string().min(1).max(240).optional(),
    url: z.string().url().max(800).optional(),
  })
  .optional();

const placementSchema = z.enum(['hero', 'home', 'home_mid', 'offer', 'top', 'announcement']);
const typeSchema = z.enum(['promo', 'course', 'exam', 'announcement', 'general']);

const upsertSchema = z.object({
  title: z.string().trim().min(2).max(160),
  subtitle: z.string().trim().max(280).optional().or(z.literal('')),
  image: mediaSchema,
  mobileImage: mediaSchema,
  ctaText: z.string().trim().max(40).optional().or(z.literal('')),
  ctaUrl: z.string().trim().max(500).optional().or(z.literal('')),
  href: z.string().trim().max(500).optional().or(z.literal('')),
  placement: placementSchema.optional(),
  bannerType: typeSchema.optional(),
  active: z.boolean().optional(),
  sortOrder: z.coerce.number().int().min(0).max(999).optional(),
  order: z.coerce.number().int().min(0).max(999).optional(),
  startAt: z.union([z.string().max(40), z.null()]).optional(),
  endAt: z.union([z.string().max(40), z.null()]).optional(),
});

bannerRouter.get(
  '/active',
  asyncHandler(async (req, res) => {
    const requested = typeof req.query.placement === 'string' ? req.query.placement : '';
    const placementFilter = placementSchema.safeParse(requested).success
      ? { placement: requested }
      : carouselPlacementFilter();
    const items = await BannerModel.find({ ...liveBannerQuery(), ...placementFilter })
      .sort({ sortOrder: 1, order: 1, createdAt: -1 })
      .lean();
    res.json({ items: items.map(toPublicBanner) });
  }),
);

bannerRouter.use(authenticate, requireRoles('admin'));

bannerRouter.get(
  '/',
  asyncHandler(async (_req, res) => {
    const items = await BannerModel.find().sort({ sortOrder: 1, order: 1, createdAt: -1 }).lean();
    res.json({ items: items.map(toAdminBanner) });
  }),
);

bannerRouter.patch(
  '/reorder',
  validate(z.object({ ids: z.array(objectIdSchema).min(1).max(80) })),
  audit('banner.reorder', 'banner'),
  asyncHandler(async (req, res) => {
    const ids = req.body.ids as string[];
    await Promise.all(
      ids.map((id, index) => BannerModel.findByIdAndUpdate(id, { sortOrder: index, order: index })),
    );
    const items = await BannerModel.find().sort({ sortOrder: 1, order: 1 }).lean();
    res.json({ items: items.map(toAdminBanner) });
  }),
);

bannerRouter.get(
  '/:id',
  validate(z.object({ id: objectIdSchema }), 'params'),
  asyncHandler(async (req, res) => {
    const banner = await BannerModel.findById(req.params.id).lean();
    if (!banner) throw notFound('Banner not found');
    res.json({ banner: toAdminBanner(banner) });
  }),
);

bannerRouter.post(
  '/',
  validate(upsertSchema),
  audit('banner.create', 'banner'),
  asyncHandler(async (req: AuthedRequest, res) => {
    const payload = normalizeBannerInput(req.body);
    if (!payload.title) throw badRequest('Title is required');
    if (payload.startAt && payload.endAt && payload.startAt > payload.endAt) {
      throw badRequest('End date must be after start date');
    }
    const banner = await BannerModel.create(payload);
    res.status(201).json({ banner: toAdminBanner(banner.toObject()) });
  }),
);

bannerRouter.put(
  '/:id',
  validate(z.object({ id: objectIdSchema }), 'params'),
  validate(upsertSchema),
  audit('banner.update', 'banner'),
  asyncHandler(async (req, res) => {
    const existing = await BannerModel.findById(req.params.id);
    if (!existing) throw notFound('Banner not found');
    const payload = normalizeBannerInput(req.body);
    if (payload.startAt && payload.endAt && payload.startAt > payload.endAt) {
      throw badRequest('End date must be after start date');
    }
    const prevImage = existing.image?.publicId;
    const prevMobile = existing.mobileImage?.publicId;
    Object.assign(existing, payload);
    await existing.save();
    if (payload.image?.publicId && prevImage && prevImage !== payload.image.publicId) {
      await destroyMedia(prevImage);
    }
    if (payload.mobileImage?.publicId && prevMobile && prevMobile !== payload.mobileImage.publicId) {
      await destroyMedia(prevMobile);
    }
    res.json({ banner: toAdminBanner(existing.toObject()) });
  }),
);

bannerRouter.patch(
  '/:id/status',
  validate(z.object({ id: objectIdSchema }), 'params'),
  validate(z.object({ active: z.boolean() })),
  audit('banner.status', 'banner'),
  asyncHandler(async (req, res) => {
    const banner = await BannerModel.findByIdAndUpdate(
      req.params.id,
      { active: req.body.active },
      { new: true },
    );
    if (!banner) throw notFound('Banner not found');
    res.json({ banner: toAdminBanner(banner.toObject()) });
  }),
);

bannerRouter.delete(
  '/:id',
  validate(z.object({ id: objectIdSchema }), 'params'),
  audit('banner.delete', 'banner'),
  asyncHandler(async (req, res) => {
    const banner = await BannerModel.findByIdAndDelete(req.params.id);
    if (!banner) throw notFound('Banner not found');
    await cleanupBannerMedia(banner.toObject());
    res.json({ ok: true });
  }),
);
