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
  CourseModel,
  EnrollmentModel,
  ProgressModel,
  ResumeDraftModel,
  StudentDownloadModel,
  StudyMaterialModel,
  VideoModel,
  VideoProgressModel,
  UserModel,
} from '../models/index.js';
import { assertEnrollment } from '../services/enrollment.service.js';
import { publicVerify, studentAnalytics, studentBacklog, updateLessonProgress } from '../services/learning.service.js';
import { getCloudinary, isCloudinaryConfigured } from '../config/cloudinary.js';
import { paginate, paginatedResult } from '../utils/helpers.js';
import { forbidden, notFound } from '../utils/errors.js';
import { certificatePdf, PDF_CONTENT_TYPE, resumePdf, studyMaterialPdf } from '../services/pdf.service.js';
import { grantPlayback } from '../services/video.service.js';
import { resumeDraftSchema } from '@gyan-chowk/shared';
import crypto from 'node:crypto';

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
    const filter: Record<string, unknown> = {};
    if (req.user!.role === 'student') filter.status = 'published';
    else if (req.query.status) filter.status = req.query.status;
    if (req.user!.role === 'teacher') filter.teacher = req.user!.id;
    else if (req.query.teacher) filter.teacher = req.query.teacher;
    if (req.query.course) filter.course = req.query.course;
    if (req.query.subject) filter.subject = req.query.subject;
    if (req.query.topic) filter.topic = req.query.topic;
    if (req.query.type) filter.type = req.query.type;
    if (req.query.q) filter.$text = { $search: String(req.query.q) };
    const [items, total] = await Promise.all([
      StudyMaterialModel.find(filter)
        .populate('teacher', 'name email avatar')
        .populate('uploadedBy', 'name email role avatar')
        .populate('course', 'title slug thumbnail')
        .populate('subject', 'title')
        .populate('topic', 'title')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      StudyMaterialModel.countDocuments(filter),
    ]);
    res.json(paginatedResult(items, total, page, limit));
  }),
);

learningRouter.get(
  '/materials/:id/file',
  authenticate,
  asyncHandler(async (req: AuthedRequest, res) => {
    const material = await StudyMaterialModel.findById(req.params.id)
      .populate('course', 'title')
      .populate('teacher', 'name')
      .lean();
    if (!material) throw notFound('Material not found');
    if (material.course) {
      const courseId =
        typeof material.course === 'object' && material.course && '_id' in material.course
          ? String((material.course as any)._id)
          : String(material.course);
      await assertEnrollment(req.user!.id, req.user!.role, { courseId });
    }

    const cleanTitle = (material.title || 'study_material').replace(/[^a-zA-Z0-9_\-\s]/g, '').trim();
    const filename = cleanTitle.toLowerCase().endsWith('.pdf') ? cleanTitle : `${cleanTitle}.pdf`;

    let pdfBuffer: Buffer | null = null;
    let url = material.url ? String(material.url).trim().replace('/fl_attachment/', '/') : '';

    if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
      try {
        const upstream = await fetch(url, { signal: AbortSignal.timeout(10_000) });
        if (upstream.ok) {
          const arrayBuf = await upstream.arrayBuffer();
          const buf = Buffer.from(arrayBuf);
          if (buf.length > 20 && buf.slice(0, 4).toString('ascii') === '%PDF') {
            pdfBuffer = buf;
          }
        }
      } catch {
        // upstream fetch failed or returned non-PDF, fall through to verified generator
      }
    }

    if (!pdfBuffer) {
      pdfBuffer = await studyMaterialPdf({
        title: material.title,
        type: material.type,
        courseTitle: (material.course as any)?.title,
        teacherName: (material.teacher as any)?.name,
      });
    }

    res.setHeader('Content-Type', PDF_CONTENT_TYPE);
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"`);
    res.setHeader('Content-Length', pdfBuffer.length);
    res.send(pdfBuffer);
  }),
);

learningRouter.get(
  '/materials/:id/download',
  authenticate,
  asyncHandler(async (req: AuthedRequest, res) => {
    const material = await StudyMaterialModel.findById(req.params.id);
    if (!material) throw notFound('Material not found');
    if (material.course) await assertEnrollment(req.user!.id, req.user!.role, { courseId: String(material.course) });

    const cleanTitle = (material.title || 'study_material').replace(/[^a-zA-Z0-9_\-\s]/g, '').trim();
    const filename = cleanTitle.toLowerCase().endsWith('.pdf') ? cleanTitle : `${cleanTitle}.pdf`;

    if (req.query.stream === '1' || req.headers.accept?.includes('application/pdf')) {
      res.redirect(`/api/learning/materials/${material._id}/file`);
      return;
    }

    res.json({
      url: `/api/learning/materials/${material._id}/file`,
      directUrl: material.url ? String(material.url).trim().replace('/fl_attachment/', '/') : undefined,
      title: material.title,
      filename,
    });
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
      topic: z.string().optional(),
      publicId: z.string(),
      url: z.string().optional(),
      bytes: z.number().optional(),
      mime: z.string().optional(),
      teacher: z.string().optional(),
      status: z.enum(['draft', 'published', 'hidden']).optional(),
    }),
  ),
  asyncHandler(async (req: AuthedRequest, res) => {
    const { writeAudit } = await import('../middleware/audit.js');
    let teacherOwner = req.user!.id;
    if (req.user!.role === 'admin') {
      if (req.body.teacher) {
        teacherOwner = req.body.teacher;
      } else if (req.body.course) {
        const course = await CourseModel.findById(req.body.course).select('teacher teachers createdBy').lean();
        if (course) {
          if (Array.isArray((course as any).teachers) && (course as any).teachers.length > 0) {
            teacherOwner = String((course as any).teachers[0]);
          } else if ((course as any).teacher) {
            teacherOwner = String((course as any).teacher);
          } else if ((course as any).createdBy) {
            teacherOwner = String((course as any).createdBy);
          }
        }
      }
    }
    const material = await StudyMaterialModel.create({
      ...req.body,
      teacher: teacherOwner,
      uploadedBy: req.user!.id,
    });
    await writeAudit({
      actor: req.user!.id,
      role: req.user!.role,
      action: 'material.create',
      entity: 'StudyMaterial',
      entityId: String(material._id),
      after: { title: material.title, course: material.course, teacher: teacherOwner, uploadedBy: req.user!.id },
    });
    res.status(201).json({ material });
  }),
);

learningRouter.patch(
  '/materials/:id',
  authenticate,
  teacherOrAdmin,
  asyncHandler(async (req: AuthedRequest, res) => {
    const { writeAudit } = await import('../middleware/audit.js');
    const existing = await StudyMaterialModel.findById(req.params.id);
    if (!existing) throw notFound('Material not found');
    if (req.user!.role === 'teacher' && String(existing.teacher) !== req.user!.id) {
      throw forbidden('You do not have permission to modify this material');
    }
    const material = await StudyMaterialModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
    await writeAudit({
      actor: req.user!.id,
      role: req.user!.role,
      action: 'material.update',
      entity: 'StudyMaterial',
      entityId: String(req.params.id),
      after: { updates: Object.keys(req.body) },
    });
    res.json({ material });
  }),
);

learningRouter.delete(
  '/materials/:id',
  authenticate,
  teacherOrAdmin,
  asyncHandler(async (req: AuthedRequest, res) => {
    const { writeAudit } = await import('../middleware/audit.js');
    const existing = await StudyMaterialModel.findById(req.params.id);
    if (!existing) throw notFound('Material not found');
    if (req.user!.role === 'teacher' && String(existing.teacher) !== req.user!.id) {
      throw forbidden('You do not have permission to delete this material');
    }
    await StudyMaterialModel.findByIdAndDelete(req.params.id);
    await writeAudit({
      actor: req.user!.id,
      role: req.user!.role,
      action: 'material.delete',
      entity: 'StudyMaterial',
      entityId: String(req.params.id),
      after: { title: existing.title, course: existing.course, teacher: existing.teacher },
    });
    res.json({ ok: true });
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
    const filter: Record<string, unknown> = {};
    if (req.user!.role === 'student') filter.status = 'published';
    if (req.query.course) filter.course = req.query.course;
    if (req.user!.role === 'teacher') filter.createdBy = req.user!.id;
    const items = await AssignmentModel.find(filter)
      .populate('course', 'title slug')
      .populate('createdBy', 'name email')
      .sort({ deadline: 1 })
      .lean();
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

learningRouter.get(
  '/certificates/:certificateId/pdf',
  authenticate,
  asyncHandler(async (req: AuthedRequest, res) => {
    const cert = await CertificateModel.findOne({
      $or: [{ _id: req.params.certificateId }, { certificateId: req.params.certificateId }],
      user: req.user!.id,
    })
      .populate('course', 'title')
      .populate('user', 'name')
      .lean();
    if (!cert) throw notFound('Certificate not found');
    const buf = await certificatePdf({
      certificateId: cert.certificateId,
      studentName: (cert.user as { name?: string })?.name ?? 'Student',
      courseTitle: (cert.course as { title?: string })?.title ?? 'Course',
      issuedAt: cert.issuedAt ?? new Date(),
    });
    res.setHeader('Content-Type', PDF_CONTENT_TYPE);
    res.setHeader('Content-Disposition', `attachment; filename="${cert.certificateId}.pdf"`);
    res.send(buf);
  }),
);

learningRouter.get(
  '/recommended',
  authenticate,
  asyncHandler(async (req: AuthedRequest, res) => {
    const enrolled = await EnrollmentModel.find({ user: req.user!.id, status: 'active' }).select('course').lean();
    const courseIds = enrolled.map((e) => e.course).filter(Boolean);
    const enrolledCourses = await CourseModel.find({ _id: { $in: courseIds } }).select('category subjects').lean();
    const categories = [...new Set(enrolledCourses.map((c) => c.category).filter(Boolean))];
    const items = await CourseModel.find({
      status: 'published',
      _id: { $nin: courseIds },
      ...(categories.length ? { category: { $in: categories } } : {}),
    })
      .sort({ ratingAvg: -1, enrollmentCount: -1 })
      .limit(8)
      .select('title slug price pricingType discountPercent ratingAvg thumbnail category')
      .lean();
    res.json({ items });
  }),
);

learningRouter.get(
  '/roster',
  authenticate,
  teacherOrAdmin,
  asyncHandler(async (req: AuthedRequest, res) => {
    const filter: Record<string, unknown> = { status: 'active' };
    if (req.user!.role === 'teacher') {
      const courses = await CourseModel.find({ teachers: req.user!.id }).select('_id').lean();
      const teacherCourseIds = courses.map((c) => String(c._id));
      if (req.query.course && teacherCourseIds.includes(String(req.query.course))) {
        filter.course = req.query.course;
      } else {
        filter.course = { $in: courses.map((c) => c._id) };
      }
    } else if (req.query.course) {
      filter.course = req.query.course;
    }
    const items = await EnrollmentModel.find(filter)
      .populate('user', 'name email lastLoginAt status')
      .populate('course', 'title')
      .populate('batch', 'name')
      .sort({ createdAt: -1 })
      .limit(200)
      .lean();
    const userIds = items.map((i) => i.user && (i.user as { _id: unknown })._id).filter(Boolean);
    const progress = await ProgressModel.find({ user: { $in: userIds } }).select('user course percent lastStudiedAt').lean();
    res.json({ items, progress });
  }),
);

learningRouter.get(
  '/resume',
  authenticate,
  requireRoles('student'),
  asyncHandler(async (req: AuthedRequest, res) => {
    const draft =
      (await ResumeDraftModel.findOne({ user: req.user!.id }).lean()) ??
      { contact: { name: req.user!.email }, education: [], skills: [], experience: [], projects: [] };
    res.json({ draft });
  }),
);

learningRouter.put(
  '/resume',
  authenticate,
  requireRoles('student'),
  validate(resumeDraftSchema),
  asyncHandler(async (req: AuthedRequest, res) => {
    const draft = await ResumeDraftModel.findOneAndUpdate(
      { user: req.user!.id },
      { $set: { ...req.body, user: req.user!.id } },
      { upsert: true, new: true },
    );
    res.json({ draft });
  }),
);

learningRouter.get(
  '/resume/pdf',
  authenticate,
  requireRoles('student'),
  asyncHandler(async (req: AuthedRequest, res) => {
    const draft = await ResumeDraftModel.findOne({ user: req.user!.id }).lean();
    const buf = await resumePdf({
      name: draft?.contact?.name ?? 'Resume',
      contact: {
        email: draft?.contact?.email ?? undefined,
        phone: draft?.contact?.phone ?? undefined,
        location: draft?.contact?.location ?? undefined,
      },
      education: (draft?.education ?? [])
        .filter((e) => e.school)
        .map((e) => ({ school: e.school ?? '', detail: e.detail ?? undefined, year: e.year ?? undefined })),
      skills: draft?.skills ?? [],
      experience: (draft?.experience ?? [])
        .filter((e) => e.title)
        .map((e) => ({ title: e.title ?? '', org: e.org ?? undefined, detail: e.detail ?? undefined })),
      projects: (draft?.projects ?? [])
        .filter((p) => p.name)
        .map((p) => ({ name: p.name ?? '', detail: p.detail ?? undefined })),
    });
    res.setHeader('Content-Type', PDF_CONTENT_TYPE);
    res.setHeader('Content-Disposition', 'attachment; filename="resume.pdf"');
    res.send(buf);
  }),
);

learningRouter.get(
  '/downloads',
  authenticate,
  requireRoles('student'),
  asyncHandler(async (req: AuthedRequest, res) => {
    const items = await StudentDownloadModel.find({ user: req.user!.id }).sort({ createdAt: -1 }).lean();
    const usedBytes = items.reduce((sum, i) => sum + (i.bytes ?? 0), 0);
    res.json({ items, usedBytes });
  }),
);

learningRouter.post(
  '/downloads/:videoId',
  authenticate,
  requireRoles('student'),
  asyncHandler(async (req: AuthedRequest, res) => {
    const video = await VideoModel.findById(req.params.videoId);
    if (!video) throw notFound('Video not found');
    await grantPlayback({ userId: req.user!.id, role: req.user!.role, videoId: String(video._id) });
    const wrappedKey = crypto.randomBytes(32).toString('base64url');
    const item = await StudentDownloadModel.findOneAndUpdate(
      { user: req.user!.id, video: video._id },
      {
        $set: {
          course: video.course,
          title: video.title,
          bytes: video.bytes ?? 0,
          wrappedKey,
          expiresAt: new Date(Date.now() + 7 * 86400000),
        },
      },
      { upsert: true, new: true },
    );
    res.status(201).json({ item });
  }),
);

learningRouter.delete(
  '/downloads/:id',
  authenticate,
  requireRoles('student'),
  asyncHandler(async (req: AuthedRequest, res) => {
    await StudentDownloadModel.deleteOne({ _id: req.params.id, user: req.user!.id });
    res.json({ ok: true });
  }),
);

learningRouter.get(
  '/downloads/:id/grant',
  authenticate,
  requireRoles('student'),
  asyncHandler(async (req: AuthedRequest, res) => {
    const item = await StudentDownloadModel.findOne({ _id: req.params.id, user: req.user!.id });
    if (!item || item.expiresAt < new Date()) throw forbidden('Download grant expired');
    const grant = await grantPlayback({
      userId: req.user!.id,
      role: req.user!.role,
      videoId: String(item.video),
    });
    res.json({
      grant: {
        videoId: grant.videoId,
        expiresAt: item.expiresAt,
        wrappedKey: item.wrappedKey,
        title: item.title,
      },
    });
  }),
);

publicCertRouter.get(
  '/:certificateId',
  asyncHandler(async (req, res) => {
    res.json(await publicVerify(req.params.certificateId!));
  }),
);
