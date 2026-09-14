import { Router } from 'express';
import { z } from 'zod';
import { MATERIAL_TYPES, paginationQuerySchema } from '@gyan-chowk/shared';
import { authenticate, requireRoles, teacherOrAdmin, type AuthedRequest } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/error.js';
import { validate } from '../middleware/validate.js';
import {
  AssignmentModel,
  AssignmentSubmissionModel,
  CalendarEventModel,
  CertificateModel,
  EnrollmentModel,
  ProgressModel,
  StudyMaterialModel,
  VideoProgressModel,
  UserModel,
} from '../models/index.js';
import { assertEnrollment } from '../services/enrollment.service.js';
import { publicVerify, studentAnalytics, studentBacklog, updateLessonProgress } from '../services/learning.service.js';
import { getCloudinary } from '../config/cloudinary.js';
import { paginate, paginatedResult } from '../utils/helpers.js';
import { forbidden, notFound } from '../utils/errors.js';

export const learningRouter = Router();
export const publicCertRouter = Router();

learningRouter.get(
  '/enrollments',
  authenticate,
  asyncHandler(async (req: AuthedRequest, res) => {
    const items = await EnrollmentModel.find({ user: req.user!.id, status: 'active' })
      .populate('course', 'title slug thumbnail pricingType')
      .populate('batch', 'name slug thumbnail')
      .sort({ createdAt: -1 })
      .lean();
    res.json({ items });
  }),
);

learningRouter.get(
  '/wishlist',
  authenticate,
  requireRoles('student'),
  asyncHandler(async (req: AuthedRequest, res) => {
    const user = await UserModel.findById(req.user!.id).populate('wishlist', 'title slug price pricingType discountPercent ratingAvg subtitle').lean();
    res.json({ items: user?.wishlist ?? [] });
  }),
);

learningRouter.post(
  '/wishlist/:courseId',
  authenticate,
  requireRoles('student'),
  asyncHandler(async (req: AuthedRequest, res) => {
    await UserModel.updateOne({ _id: req.user!.id }, { $addToSet: { wishlist: req.params.courseId } });
    res.json({ ok: true });
  }),
);

learningRouter.delete(
  '/wishlist/:courseId',
  authenticate,
  requireRoles('student'),
  asyncHandler(async (req: AuthedRequest, res) => {
    await UserModel.updateOne({ _id: req.user!.id }, { $pull: { wishlist: req.params.courseId } });
    res.json({ ok: true });
  }),
);

learningRouter.get(
  '/progress',
  authenticate,
  asyncHandler(async (req: AuthedRequest, res) => {
    const items = await ProgressModel.find({ user: req.user!.id }).lean();
    const continueWatching = await VideoProgressModel.find({ user: req.user!.id, completed: false })
      .sort({ lastWatchedAt: -1 })
      .limit(8)
      .populate('video')
      .lean();
    res.json({ items, continueWatching });
  }),
);

learningRouter.post(
  '/progress/lesson',
  authenticate,
  validate(z.object({ courseId: z.string(), lessonId: z.string() })),
  asyncHandler(async (req: AuthedRequest, res) => {
    await assertEnrollment(req.user!.id, req.user!.role, { courseId: req.body.courseId });
    const progress = await updateLessonProgress(req.user!.id, req.body.courseId, req.body.lessonId);
    res.json({ progress });
  }),
);

learningRouter.get(
  '/analytics',
  authenticate,
  asyncHandler(async (req: AuthedRequest, res) => {
    res.json(await studentAnalytics(req.user!.id));
  }),
);

learningRouter.get(
  '/backlog',
  authenticate,
  asyncHandler(async (req: AuthedRequest, res) => {
    res.json(await studentBacklog(req.user!.id));
  }),
);

learningRouter.get(
  '/calendar',
  authenticate,
  asyncHandler(async (req: AuthedRequest, res) => {
    const from = req.query.from ? new Date(String(req.query.from)) : new Date();
    const to = req.query.to ? new Date(String(req.query.to)) : new Date(from.getTime() + 31 * 86400000);
    const items = await CalendarEventModel.find({
      $or: [{ user: req.user!.id }, { user: { $exists: false } }],
      startsAt: { $gte: from, $lte: to },
    })
      .sort({ startsAt: 1 })
      .lean();
    res.json({ items });
  }),
);

learningRouter.get(
  '/materials',
  authenticate,
  validate(paginationQuerySchema, 'query'),
  asyncHandler(async (req: AuthedRequest, res) => {
    const { skip, limit, page } = paginate(Number(req.query.page ?? 1), Number(req.query.limit ?? 20));
    const filter: Record<string, unknown> = { status: 'published' };
    if (req.query.course) filter.course = req.query.course;
    if (req.query.type) filter.type = req.query.type;
    if (req.query.q) filter.$text = { $search: String(req.query.q) };
    const [items, total] = await Promise.all([
      StudyMaterialModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      StudyMaterialModel.countDocuments(filter),
    ]);
    res.json(paginatedResult(items, total, page, limit));
  }),
);

learningRouter.get(
  '/materials/:id/download',
  authenticate,
  asyncHandler(async (req: AuthedRequest, res) => {
    const material = await StudyMaterialModel.findById(req.params.id);
    if (!material) throw notFound('Material not found');
    if (material.course) await assertEnrollment(req.user!.id, req.user!.role, { courseId: String(material.course) });
    const url = getCloudinary().utils.private_download_url(material.publicId, '', {
      resource_type: 'raw',
      type: 'authenticated',
      expires_at: Math.floor(Date.now() / 1000) + 120,
      attachment: true,
    });
    res.json({ url });
  }),
);

learningRouter.post(
  '/materials',
  authenticate,
  teacherOrAdmin,
  validate(
    z.object({
      title: z.string(),
      type: z.enum(MATERIAL_TYPES),
      course: z.string().optional(),
      batch: z.string().optional(),
      subject: z.string().optional(),
      chapter: z.string().optional(),
      publicId: z.string(),
      url: z.string().optional(),
      bytes: z.number().optional(),
      mime: z.string().optional(),
    }),
  ),
  asyncHandler(async (req: AuthedRequest, res) => {
    const material = await StudyMaterialModel.create({ ...req.body, teacher: req.user!.id });
    res.status(201).json({ material });
  }),
);

learningRouter.post(
  '/materials/:id/bookmark',
  authenticate,
  asyncHandler(async (req: AuthedRequest, res) => {
    await StudyMaterialModel.updateOne({ _id: req.params.id }, { $addToSet: { bookmarks: req.user!.id } });
    res.json({ ok: true });
  }),
);

learningRouter.get(
  '/assignments/:id',
  authenticate,
  asyncHandler(async (req: AuthedRequest, res) => {
    const assignment = await AssignmentModel.findById(req.params.id).lean();
    if (!assignment) throw notFound('Assignment not found');
    if (req.user!.role === 'student') {
      if (assignment.course) await assertEnrollment(req.user!.id, 'student', { courseId: String(assignment.course) });
      const submission = await AssignmentSubmissionModel.findOne({
        assignment: assignment._id,
        user: req.user!.id,
      }).lean();
      res.json({ assignment, submission });
      return;
    }
    const submissions = await AssignmentSubmissionModel.find({ assignment: assignment._id })
      .populate('user', 'name email')
      .lean();
    res.json({ assignment, submissions });
  }),
);

learningRouter.get(
  '/assignments',
  authenticate,
  asyncHandler(async (req: AuthedRequest, res) => {
    const filter: Record<string, unknown> = { status: 'published' };
    if (req.query.course) filter.course = req.query.course;
    if (req.user!.role === 'teacher') filter.createdBy = req.user!.id;
    const items = await AssignmentModel.find(filter).sort({ deadline: 1 }).lean();
    res.json({ items });
  }),
);

learningRouter.post(
  '/assignments',
  authenticate,
  teacherOrAdmin,
  validate(
    z.object({
      title: z.string(),
      instructions: z.string().optional(),
      course: z.string().optional(),
      batch: z.string().optional(),
      questions: z.array(z.object({ prompt: z.string(), marks: z.number() })).optional(),
      attachment: z.object({ publicId: z.string(), url: z.string().optional() }).optional(),
      totalMarks: z.number().optional(),
      deadline: z.coerce.date().optional(),
      allowResubmit: z.boolean().optional(),
      status: z.enum(['draft', 'published', 'closed']).optional(),
    }),
  ),
  asyncHandler(async (req: AuthedRequest, res) => {
    const assignment = await AssignmentModel.create({ ...req.body, createdBy: req.user!.id });
    if (assignment.deadline && assignment.batch) {
      await CalendarEventModel.create({
        title: assignment.title,
        type: 'assignment',
        batch: assignment.batch,
        course: assignment.course,
        startsAt: assignment.deadline,
        refId: assignment._id,
        refModel: 'Assignment',
      });
    }
    res.status(201).json({ assignment });
  }),
);

learningRouter.post(
  '/assignments/:id/submit',
  authenticate,
  requireRoles('student'),
  validate(z.object({ answers: z.string().optional(), files: z.array(z.object({ publicId: z.string(), url: z.string().optional() })).optional() })),
  asyncHandler(async (req: AuthedRequest, res) => {
    const assignment = await AssignmentModel.findById(req.params.id);
    if (!assignment || assignment.status !== 'published') throw notFound('Assignment not found');
    if (assignment.deadline && assignment.deadline < new Date() && !assignment.allowResubmit) {
      throw forbidden('Deadline has passed');
    }
    if (assignment.course) await assertEnrollment(req.user!.id, 'student', { courseId: String(assignment.course) });
    const existing = await AssignmentSubmissionModel.findOne({ assignment: assignment._id, user: req.user!.id });
    if (existing && !assignment.allowResubmit && existing.status !== 'submitted') {
      throw forbidden('Resubmission is not allowed');
    }
    const late = Boolean(assignment.deadline && assignment.deadline < new Date());
    const submission = await AssignmentSubmissionModel.findOneAndUpdate(
      { assignment: assignment._id, user: req.user!.id },
      {
        $set: {
          answers: req.body.answers,
          files: req.body.files,
          status: late ? 'late' : existing ? 'resubmitted' : 'submitted',
          submittedAt: new Date(),
        },
      },
      { upsert: true, new: true },
    );
    res.json({ submission });
  }),
);

learningRouter.post(
  '/assignments/:id/evaluate/:submissionId',
  authenticate,
  teacherOrAdmin,
  validate(z.object({ marksAwarded: z.number(), feedback: z.string().optional() })),
  asyncHandler(async (req: AuthedRequest, res) => {
    const submission = await AssignmentSubmissionModel.findByIdAndUpdate(
      req.params.submissionId,
      {
        $set: {
          marksAwarded: req.body.marksAwarded,
          feedback: req.body.feedback,
          status: 'evaluated',
          evaluatedBy: req.user!.id,
          evaluatedAt: new Date(),
        },
      },
      { new: true },
    );
    res.json({ submission });
  }),
);

learningRouter.get(
  '/certificates',
  authenticate,
  asyncHandler(async (req: AuthedRequest, res) => {
    const items = await CertificateModel.find({ user: req.user!.id }).populate('course', 'title').lean();
    res.json({ items });
  }),
);

publicCertRouter.get(
  '/:certificateId',
  asyncHandler(async (req, res) => {
    res.json(await publicVerify(req.params.certificateId!));
  }),
);
