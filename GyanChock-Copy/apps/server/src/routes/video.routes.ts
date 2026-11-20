import { Router } from 'express';
import { z } from 'zod';
import { authenticate, requireRoles, teacherOrAdmin, type AuthedRequest } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/error.js';
import { validate } from '../middleware/validate.js';
import { VideoModel, VideoBookmarkModel, VideoNoteModel } from '../models/index.js';
import { grantPlayback, saveProgress, uploadSignature } from '../services/video.service.js';
import { forbidden, notFound } from '../utils/errors.js';

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
      title: z.string().min(1, 'Video title is required'),
      course: z.string(),
      subject: z.string().optional(),
      topic: z.string().optional(),
      lesson: z.string().optional(),
      teacher: z.string().optional(),
      publicId: z.string(),
      duration: z.number().optional(),
      bytes: z.number().optional(),
      format: z.string().optional(),
      posterPublicId: z.string().optional(),
      isDemo: z.boolean().optional(),
    }),
  ),
  asyncHandler(async (req: AuthedRequest, res) => {
    const { CourseModel, LessonModel } = await import('../models/index.js');
    const { assertTeacherOwnsCourse } = await import('../services/learning.service.js');
    const { writeAudit } = await import('../middleware/audit.js');
    const course = await CourseModel.findById(req.body.course);
    if (!course) throw notFound('Course not found');
    assertTeacherOwnsCourse(req.user!.role, req.user!.id, course);

    let teacherOwner = req.user!.id;
    if (req.user!.role === 'admin') {
      if (req.body.teacher) {
        teacherOwner = req.body.teacher;
      } else if (Array.isArray(course.teachers) && course.teachers.length > 0) {
        teacherOwner = String(course.teachers[0]);
      } else if (course.createdBy) {
        teacherOwner = String(course.createdBy);
      }
    }

    const video = await VideoModel.create({
      ...req.body,
      teacher: teacherOwner,
      uploadedBy: req.user!.id,
      hlsReady: true,
      status: 'ready',
    });

    if (req.body.lesson) {
      await LessonModel.findByIdAndUpdate(req.body.lesson, { video: video._id });
    }

    await writeAudit({
      actor: req.user!.id,
      role: req.user!.role,
      action: 'video.create',
      entity: 'video',
      entityId: String(video._id),
      after: { title: video.title, course: req.body.course, teacher: teacherOwner, uploadedBy: req.user!.id },
    });

    const populated = await VideoModel.findById(video._id)
      .populate('course', 'title slug')
      .populate('subject', 'name slug')
      .populate('topic', 'name slug')
      .populate('lesson', 'title slug')
      .populate('teacher', 'name email avatar')
      .populate('uploadedBy', 'name email')
      .lean();

    res.status(201).json({ video: populated || video });
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
    const filter: Record<string, unknown> = req.user!.role === 'admin' ? {} : { teacher: req.user!.id };
    if (req.query.teacher && req.user!.role === 'admin') filter.teacher = req.query.teacher;
    if (req.query.course) filter.course = req.query.course;
    if (req.query.subject) filter.subject = req.query.subject;
    if (req.query.topic) filter.topic = req.query.topic;
    if (req.query.q) filter.title = new RegExp(String(req.query.q).trim(), 'i');

    const items = await VideoModel.find(filter)
      .populate('course', 'title slug')
      .populate('subject', 'name slug')
      .populate('topic', 'name slug')
      .populate('lesson', 'title slug')
      .populate('teacher', 'name email avatar')
      .populate('uploadedBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(200)
      .lean();

    res.json({ items, total: items.length });
  }),
);

videoRouter.patch(
  '/:id',
  authenticate,
  teacherOrAdmin,
  asyncHandler(async (req: AuthedRequest, res) => {
    const video = await VideoModel.findById(req.params.id);
    if (!video) throw notFound('Video not found');
    if (req.user!.role !== 'admin' && String(video.teacher) !== req.user!.id) {
      throw forbidden('You do not own this video');
    }

    if (req.body.title !== undefined) video.title = req.body.title;
    if (req.body.isDemo !== undefined) video.isDemo = Boolean(req.body.isDemo);
    if (req.body.subject !== undefined) video.subject = req.body.subject ? (req.body.subject as any) : undefined;
    if (req.body.topic !== undefined) video.topic = req.body.topic ? (req.body.topic as any) : undefined;
    if (req.body.lesson !== undefined) {
      video.lesson = req.body.lesson ? (req.body.lesson as any) : undefined;
      const { LessonModel } = await import('../models/index.js');
      if (req.body.lesson) {
        await LessonModel.findByIdAndUpdate(req.body.lesson, { video: video._id });
      }
    }

    await video.save();

    const { writeAudit } = await import('../middleware/audit.js');
    await writeAudit({
      actor: req.user!.id,
      role: req.user!.role,
      action: 'video.update',
      entity: 'video',
      entityId: String(video._id),
      after: req.body,
    });

    const updated = await VideoModel.findById(video._id)
      .populate('course', 'title slug')
      .populate('subject', 'name slug')
      .populate('topic', 'name slug')
      .populate('lesson', 'title slug')
      .populate('teacher', 'name email avatar')
      .populate('uploadedBy', 'name email')
      .lean();

    res.json({ video: updated });
  }),
);

videoRouter.delete(
  '/:id',
  authenticate,
  teacherOrAdmin,
  asyncHandler(async (req: AuthedRequest, res) => {
    const video = await VideoModel.findById(req.params.id);
    if (!video) throw notFound('Video not found');
    if (req.user!.role !== 'admin' && String(video.teacher) !== req.user!.id) {
      throw forbidden('You do not own this video');
    }

    const { LessonModel } = await import('../models/index.js');
    await LessonModel.updateMany({ video: video._id }, { $unset: { video: 1 } });
    await Promise.all([
      VideoModel.findByIdAndDelete(video._id),
      VideoBookmarkModel.deleteMany({ video: video._id }),
      VideoNoteModel.deleteMany({ video: video._id }),
    ]);

    const { writeAudit } = await import('../middleware/audit.js');
    await writeAudit({
      actor: req.user!.id,
      role: req.user!.role,
      action: 'video.delete',
      entity: 'video',
      entityId: String(video._id),
    });

    res.json({ ok: true, message: 'Video deleted successfully' });
  }),
);

videoRouter.get(
  '/:id/bookmarks',
  authenticate,
  asyncHandler(async (req: AuthedRequest, res) => {
    const items = await VideoBookmarkModel.find({ user: req.user!.id, video: req.params.id }).sort({ timestampSec: 1 }).lean();
    res.json({ items });
  }),
);

videoRouter.post(
  '/:id/bookmarks',
  authenticate,
  validate(z.object({ timestampSec: z.number().min(0), label: z.string().max(120).optional() })),
  asyncHandler(async (req: AuthedRequest, res) => {
    const item = await VideoBookmarkModel.create({
      user: req.user!.id,
      video: req.params.id,
      timestampSec: req.body.timestampSec,
      label: req.body.label,
    });
    res.status(201).json({ item });
  }),
);

videoRouter.delete(
  '/bookmarks/:bookmarkId',
  authenticate,
  asyncHandler(async (req: AuthedRequest, res) => {
    await VideoBookmarkModel.deleteOne({ _id: req.params.bookmarkId, user: req.user!.id });
    res.json({ ok: true });
  }),
);

videoRouter.get(
  '/:id/notes',
  authenticate,
  asyncHandler(async (req: AuthedRequest, res) => {
    const items = await VideoNoteModel.find({ user: req.user!.id, video: req.params.id }).sort({ timestampSec: 1 }).lean();
    res.json({ items });
  }),
);

videoRouter.post(
  '/:id/notes',
  authenticate,
  validate(z.object({ timestampSec: z.number().min(0), body: z.string().min(1).max(4000) })),
  asyncHandler(async (req: AuthedRequest, res) => {
    const item = await VideoNoteModel.create({
      user: req.user!.id,
      video: req.params.id,
      timestampSec: req.body.timestampSec,
      body: req.body.body,
    });
    res.status(201).json({ item });
  }),
);
