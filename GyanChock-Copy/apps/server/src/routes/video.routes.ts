import { Router } from 'express';
import { z } from 'zod';
import { authenticate, requireRoles, teacherOrAdmin, type AuthedRequest } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/error.js';
import { validate } from '../middleware/validate.js';
import { VideoModel } from '../models/index.js';
import { grantPlayback, saveProgress, uploadSignature } from '../services/video.service.js';
import { notFound } from '../utils/errors.js';

export const videoRouter = Router();
export const uploadRouter = Router();

uploadRouter.post(
  '/signature',
  authenticate,
  validate(
    z.object({
      folder: z.enum([
        'avatars',
        'courses',
        'banners',
        'materials',
        'assignments',
        'doubts',
        'videos',
        'cms',
        'blogs',
        'teacher-docs',
      ]),
      resourceType: z.enum(['image', 'video', 'raw']),
    }),
  ),
  asyncHandler(async (req: AuthedRequest, res) => {
    const role = req.user!.role;
    const { folder, resourceType } = req.body as { folder: string; resourceType: 'image' | 'video' | 'raw' };
    if (resourceType === 'video' && role === 'student') {
      throw notFound('Not allowed');
    }
    if (['cms', 'banners', 'blogs'].includes(folder) && role !== 'admin') {
      throw notFound('Not allowed');
    }
    res.json(uploadSignature(folder, resourceType));
  }),
);

videoRouter.post(
  '/',
  authenticate,
  teacherOrAdmin,
  validate(
    z.object({
      title: z.string(),
      course: z.string(),
      publicId: z.string(),
      duration: z.number().optional(),
      bytes: z.number().optional(),
      format: z.string().optional(),
      posterPublicId: z.string().optional(),
      isDemo: z.boolean().optional(),
      lesson: z.string().optional(),
    }),
  ),
  asyncHandler(async (req: AuthedRequest, res) => {
    const video = await VideoModel.create({
      ...req.body,
      teacher: req.user!.id,
      hlsReady: true,
      status: 'ready',
    });
    res.status(201).json({ video });
  }),
);

videoRouter.get(
  '/:id/playback',
  authenticate,
  asyncHandler(async (req: AuthedRequest, res) => {
    const grant = await grantPlayback({
      userId: req.user!.id,
      role: req.user!.role,
      videoId: req.params.id!,
    });
    res.json(grant);
  }),
);

videoRouter.post(
  '/:id/progress',
  authenticate,
  requireRoles('student', 'admin'),
  validate(z.object({ positionSec: z.number().min(0), durationSec: z.number().min(0) })),
  asyncHandler(async (req: AuthedRequest, res) => {
    const result = await saveProgress({
      userId: req.user!.id,
      videoId: req.params.id!,
      positionSec: req.body.positionSec,
      durationSec: req.body.durationSec,
    });
    res.json(result);
  }),
);

videoRouter.get(
  '/',
  authenticate,
  teacherOrAdmin,
  asyncHandler(async (req: AuthedRequest, res) => {
    const filter = req.user!.role === 'admin' ? {} : { teacher: req.user!.id };
    const items = await VideoModel.find(filter).sort({ createdAt: -1 }).limit(100).lean();
    res.json({ items });
  }),
);
