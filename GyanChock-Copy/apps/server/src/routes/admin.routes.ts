import { Router } from 'express';
import { z } from 'zod';
import { PERMISSIONS } from '@gyan-chowk/shared';
import { authenticate, requireRoles, type AuthedRequest } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/error.js';
import { validate } from '../middleware/validate.js';
import { audit, writeAudit } from '../middleware/audit.js';
import {
  AuditLogModel,
  BannerModel,
  BatchModel,
  BlogModel,
  CareerArticleModel,
  CareerJobModel,
  CMSPageModel,
  CourseModel,
  DoubtModel,
  EnrollmentModel,
  FAQModel,
  OrderModel,
  PaymentModel,
  ReviewModel,
  RoadmapModel,
  ScholarshipModel,
  SettingModel,
  SessionModel,
  TeacherPayoutModel,
  UserModel,
  TestModel,
  StudyMaterialModel,
} from '../models/index.js';
import { hashPassword, randomToken, sha256 } from '../utils/crypto.js';
import { badRequest, conflict, notFound } from '../utils/errors.js';
import { paginate, paginatedResult } from '../utils/helpers.js';
import { notify } from '../services/notification.service.js';
import { liveBannerQuery } from '../services/banner.service.js';
import { resolveHomeDiscovery } from '../services/homeDiscovery.service.js';
import { resolveHomeHighlights } from '../services/homeHighlights.service.js';
import { resolveHomePlatform } from '../services/homePlatform.service.js';
import { resolveHomeFaculty } from '../services/homeFaculty.service.js';
import { resolveHomeSectionCopy } from '../services/homeSections.service.js';
import { resolveHomeWhy } from '../services/homeWhy.service.js';
import {
  resolveHomeTestSubscription,
  sanitizeHomeTestSubscriptionInput,
} from '../services/homeTestSubscription.service.js';
import { publicMediaUrl } from '../services/video.service.js';
import { sendPasswordResetEmail, sendTeacherDecisionEmail } from '../services/email.service.js';

export const adminRouter = Router();
export const cmsRouter = Router();
export const careerRouter = Router();

adminRouter.use(authenticate, requireRoles('admin'));

adminRouter.get(
  '/dashboard',
  asyncHandler(async (_req, res) => {
    const [
      students,
      teachers,
      courses,
      batches,
      enrollments,
      payments,
      pendingPayouts,
      pendingTeachers,
      openDoubts,
    ] = await Promise.all([
      UserModel.countDocuments({ role: 'student' }),
      UserModel.countDocuments({ role: 'teacher', teacherStatus: 'approved' }),
      CourseModel.countDocuments(),
      (await import('../models/index.js')).BatchModel.countDocuments(),
      EnrollmentModel.countDocuments({ status: 'active' }),
      PaymentModel.aggregate([{ $match: { status: 'captured' } }, { $group: { _id: null, total: { $sum: '$amountPaise' } } }]),
      TeacherPayoutModel.countDocuments({ status: 'requested' }),
      UserModel.countDocuments({ role: 'teacher', teacherStatus: 'pending' }),
      DoubtModel.countDocuments({ status: { $in: ['pending', 'assigned', 'in_progress'] } }),
    ]);
    const revenue = payments[0]?.total ?? 0;
    const commission = Number(process.env.PLATFORM_COMMISSION_PERCENT ?? 20);
    const since = new Date();
    since.setMonth(since.getMonth() - 11);
    since.setDate(1);
    since.setHours(0, 0, 0, 0);
    const [revenueSeries, enrollmentSeries, topCourses] = await Promise.all([
      PaymentModel.aggregate([
        { $match: { status: 'captured', createdAt: { $gte: since } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
            total: { $sum: '$amountPaise' },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      EnrollmentModel.aggregate([
        { $match: { createdAt: { $gte: since } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
            total: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      CourseModel.find({ status: 'published' }).sort({ enrollmentCount: -1 }).select('title enrollmentCount').limit(6).lean(),
    ]);
    res.json({
      students,
      teachers,
      courses,
      batches,
      enrollments,
      totalRevenuePaise: revenue,
      platformRevenuePaise: Math.round((revenue * commission) / 100),
      teacherRevenuePaise: revenue - Math.round((revenue * commission) / 100),
      pendingPayouts,
      pendingTeachers,
      openDoubts,
      revenueSeries,
      enrollmentSeries,
      topCourses,
    });
  }),
);

adminRouter.get(
  '/users',
  asyncHandler(async (req, res) => {
    const { skip, limit, page } = paginate(Number(req.query.page ?? 1), Number(req.query.limit ?? 20));
    const filter: Record<string, unknown> = {};
    if (req.query.role) filter.role = req.query.role;
    if (req.query.status) filter.status = req.query.status;
    if (req.query.teacherStatus) filter.teacherStatus = req.query.teacherStatus;
    if (req.query.q) filter.$text = { $search: String(req.query.q) };
    const [items, total] = await Promise.all([
      UserModel.find(filter).select('-passwordHash').sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      UserModel.countDocuments(filter),
    ]);
    res.json(paginatedResult(items, total, page, limit));
  }),
);

adminRouter.get(
  '/users/:id',
  asyncHandler(async (req, res) => {
    const user = await UserModel.findById(req.params.id).select('-passwordHash').lean();
    if (!user) throw notFound('User not found');
    const enrollments = await EnrollmentModel.find({ user: user._id }).populate('course', 'title').limit(50).lean();
    const orders = await OrderModel.find({ user: user._id }).sort({ createdAt: -1 }).limit(50).lean();
    res.json({ user, enrollments, orders });
  }),
);

adminRouter.post(
  '/users/:id/status',
  validate(z.object({ status: z.enum(['active', 'suspended', 'deactivated']) })),
  audit('user.status', 'User'),
  asyncHandler(async (req: AuthedRequest, res) => {
    const user = await UserModel.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true }).select(
      '-passwordHash',
    );
    await writeAudit({
      actor: req.user!.id,
      role: 'admin',
      action: 'user.suspended',
      entity: 'User',
      entityId: req.params.id,
      after: { status: req.body.status },
    });
    res.json({ user });
  }),
);

adminRouter.post(
  '/users/:id/revoke-sessions',
  audit('user.force_logout', 'User'),
  asyncHandler(async (req: AuthedRequest, res) => {
    const result = await SessionModel.updateMany(
      { user: req.params.id, revokedAt: { $exists: false } },
      { revokedAt: new Date() },
    );
    res.json({ revoked: result.modifiedCount });
  }),
);

adminRouter.post(
  '/users/:id/send-reset',
  audit('user.reset_email', 'User'),
  asyncHandler(async (req, res) => {
    const user = await UserModel.findById(req.params.id);
    if (!user) throw notFound('User not found');
    const token = randomToken();
    user.passwordResetTokenHash = sha256(token);
    user.passwordResetExpires = new Date(Date.now() + 1000 * 60 * 30);
    await user.save();
    await sendPasswordResetEmail(user.email, user.name, token);
    res.json({ ok: true });
  }),
);

adminRouter.post(
  '/teachers/:id/decision',
  validate(z.object({ teacherStatus: z.enum(['approved', 'rejected', 'suspended']) })),
  asyncHandler(async (req: AuthedRequest, res) => {
    const user = await UserModel.findById(req.params.id);
    if (!user || user.role !== 'teacher') throw notFound('Teacher not found');
    user.teacherStatus = req.body.teacherStatus;
    if (req.body.teacherStatus === 'approved') user.status = 'active';
    await user.save();
    await writeAudit({
      actor: req.user!.id,
      role: 'admin',
      action: 'teacher.approved',
      entity: 'User',
      entityId: String(user._id),
      after: { teacherStatus: user.teacherStatus },
    });
    await notify({
      userId: String(user._id),
      title: `Teacher application ${user.teacherStatus}`,
      type: 'teacher_status',
      channels: ['inApp', 'push'],
    });
    await sendTeacherDecisionEmail(user.email, user.name, user.teacherStatus ?? req.body.teacherStatus);
    res.json({ user });
  }),
);

// Admin: Teacher Management
adminRouter.get(
  '/teachers',
  asyncHandler(async (req, res) => {
    const { getAdminTeachers } = await import('../services/teacher.service.js');
    const q = req.query.q ? String(req.query.q) : undefined;
    const status = req.query.status ? String(req.query.status) : undefined;
    const subject = req.query.subject ? String(req.query.subject) : undefined;
    const sort = req.query.sort ? String(req.query.sort) : undefined;
    const featured = req.query.featured === 'true' ? true : req.query.featured === 'false' ? false : undefined;
    const page = req.query.page ? Number(req.query.page) : 1;
    const limit = req.query.limit ? Number(req.query.limit) : 20;

    const result = await getAdminTeachers({ q, status, subject, sort, featured, page, limit });
    res.json(result);
  }),
);

adminRouter.post(
  '/teachers',
  asyncHandler(async (req: AuthedRequest, res) => {
    const { createTeacher } = await import('../services/teacher.service.js');
    const teacher = await createTeacher(req.body);
    await writeAudit({
      actor: req.user!.id,
      role: 'admin',
      action: 'teacher.created',
      entity: 'Teacher',
      entityId: String(teacher._id),
      after: req.body,
    });
    res.status(201).json({ teacher });
  }),
);

adminRouter.get(
  '/teachers/:id',
  asyncHandler(async (req, res) => {
    const id = String(req.params.id);
    const { TeacherModel } = await import('../models/teacher.models.js');
    const teacher = await TeacherModel.findById(id).lean();
    if (!teacher) throw notFound('Teacher not found');
    res.json({ teacher });
  }),
);

adminRouter.put(
  '/teachers/:id',
  asyncHandler(async (req: AuthedRequest, res) => {
    const id = String(req.params.id);
    const { updateTeacher } = await import('../services/teacher.service.js');
    const teacher = await updateTeacher(id, req.body);
    await writeAudit({
      actor: req.user!.id,
      role: 'admin',
      action: 'teacher.updated',
      entity: 'Teacher',
      entityId: String(teacher._id),
      after: req.body,
    });
    res.json({ teacher });
  }),
);

adminRouter.delete(
  '/teachers/:id',
  asyncHandler(async (req: AuthedRequest, res) => {
    const id = String(req.params.id);
    const { deleteTeacher } = await import('../services/teacher.service.js');
    const permanent = req.query.permanent === 'true';
    const teacher = await deleteTeacher(id, !permanent);
    await writeAudit({
      actor: req.user!.id,
      role: 'admin',
      action: permanent ? 'teacher.deleted' : 'teacher.archived',
      entity: 'Teacher',
      entityId: id,
    });
    res.json({ success: true, teacher });
  }),
);

adminRouter.patch(
  '/teachers/:id/status',
  validate(z.object({ status: z.enum(['draft', 'pending', 'approved', 'published', 'archived']) })),
  asyncHandler(async (req: AuthedRequest, res) => {
    const id = String(req.params.id);
    const { updateTeacher } = await import('../services/teacher.service.js');
    const teacher = await updateTeacher(id, { status: req.body.status });
    res.json({ teacher });
  }),
);

adminRouter.patch(
  '/teachers/:id/featured',
  validate(z.object({ featured: z.boolean() })),
  asyncHandler(async (req: AuthedRequest, res) => {
    const id = String(req.params.id);
    const { updateTeacher } = await import('../services/teacher.service.js');
    const teacher = await updateTeacher(id, { featured: req.body.featured });
    res.json({ teacher });
  }),
);

adminRouter.patch(
  '/teachers/reorder',
  validate(z.object({ orderedIds: z.array(z.string()) })),
  asyncHandler(async (req, res) => {
    const { reorderTeachers } = await import('../services/teacher.service.js');
    await reorderTeachers(req.body.orderedIds);
    res.json({ success: true });
  }),
);

adminRouter.get(
  '/teacher-subjects',
  asyncHandler(async (_req, res) => {
    const { TeacherModel } = await import('../models/teacher.models.js');
    const teachers = await TeacherModel.find().select('subject subjects').lean();
    const set = new Set<string>();
    teachers.forEach((t) => {
      if (t.subject) set.add(t.subject);
      if (Array.isArray(t.subjects)) t.subjects.forEach((s) => set.add(s));
    });
    res.json({ subjects: Array.from(set).filter(Boolean) });
  }),
);

adminRouter.post(
  '/teachers/:id/courses',
  validate(z.object({ courseId: z.string() })),
  asyncHandler(async (req, res) => {
    const id = String(req.params.id);
    const { TeacherModel } = await import('../models/teacher.models.js');
    const teacher = await TeacherModel.findById(id);
    if (!teacher) throw notFound('Teacher not found');
    const cid = req.body.courseId as any;
    if (!teacher.courses) teacher.courses = [];
    if (!teacher.stats) teacher.stats = { courseCount: 0, enrollmentCount: 0, reviewCount: 0, rating: 5 };
    if (!teacher.courses.some((c: any) => String(c) === String(cid))) {
      teacher.courses.push(cid);
      teacher.stats.courseCount = teacher.courses.length;
      await teacher.save();
    }
    res.json({ teacher });
  }),
);

adminRouter.delete(
  '/teachers/:id/courses/:courseId',
  asyncHandler(async (req, res) => {
    const id = String(req.params.id);
    const { TeacherModel } = await import('../models/teacher.models.js');
    const teacher = await TeacherModel.findById(id);
    if (!teacher) throw notFound('Teacher not found');
    if (!teacher.courses) teacher.courses = [];
    if (!teacher.stats) teacher.stats = { courseCount: 0, enrollmentCount: 0, reviewCount: 0, rating: 5 };
    teacher.courses = (teacher.courses as any[]).filter((c: any) => String(c) !== String(req.params.courseId));
    teacher.stats.courseCount = teacher.courses.length;
    await teacher.save();
    res.json({ teacher });
  }),
);

// Admin: Reviews Management for Teacher
adminRouter.post(
  '/teachers/:id/reviews',
  asyncHandler(async (req, res) => {
    const id = String(req.params.id);
    const { TeacherModel } = await import('../models/teacher.models.js');
    const teacher = await TeacherModel.findById(id);
    if (!teacher) throw notFound('Teacher not found');

    const {
      studentName,
      studentAvatar,
      roleOrExam,
      targetExam,
      rating,
      comment,
      reviewText,
      date,
      approved,
      featured,
    } = req.body;

    const ratingVal = Math.max(1, Math.min(5, Number(rating) || 5));
    const reviewBody = (comment || reviewText || '').trim();

    const review = {
      studentName: (studentName || 'Student').trim(),
      studentAvatar: studentAvatar?.trim() || '',
      roleOrExam: (roleOrExam || targetExam || 'Student').trim(),
      targetExam: (roleOrExam || targetExam || 'Student').trim(),
      rating: ratingVal,
      comment: reviewBody,
      reviewText: reviewBody,
      date: date || new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
      approved: approved !== false,
      featured: featured !== false,
    };

    if (!teacher.reviews) teacher.reviews = [];
    teacher.reviews.unshift(review as any);

    // Recalculate stats
    const approvedReviews = teacher.reviews.filter((r) => r.approved !== false);
    const avgRating =
      approvedReviews.reduce((sum, r) => sum + (r.rating || 5), 0) / (approvedReviews.length || 1);
    if (!teacher.stats) teacher.stats = { courseCount: 0, enrollmentCount: 0, reviewCount: 0, rating: 5 };
    teacher.stats.rating = Number(avgRating.toFixed(1));
    teacher.stats.reviewCount = approvedReviews.length;

    await teacher.save();
    res.status(201).json({ teacher, review });
  }),
);

adminRouter.put(
  '/teachers/:id/reviews/:reviewId',
  asyncHandler(async (req, res) => {
    const id = String(req.params.id);
    const reviewId = String(req.params.reviewId);
    const { TeacherModel } = await import('../models/teacher.models.js');
    const teacher = await TeacherModel.findById(id);
    if (!teacher) throw notFound('Teacher not found');

    const revIndex = (teacher.reviews || []).findIndex(
      (r: any) => String(r._id) === reviewId || String(r.id) === reviewId,
    );
    if (revIndex === -1 || !teacher.reviews || !teacher.reviews[revIndex]) throw notFound('Review not found');

    const rev = teacher.reviews[revIndex]!;
    if (req.body.studentName !== undefined) rev.studentName = req.body.studentName;
    if (req.body.studentAvatar !== undefined) rev.studentAvatar = req.body.studentAvatar;
    if (req.body.roleOrExam !== undefined) {
      rev.roleOrExam = req.body.roleOrExam;
      rev.targetExam = req.body.roleOrExam;
    }
    if (req.body.rating !== undefined) rev.rating = Number(req.body.rating) || 5;
    if (req.body.comment !== undefined || req.body.reviewText !== undefined) {
      rev.comment = req.body.comment || req.body.reviewText;
      rev.reviewText = req.body.comment || req.body.reviewText;
    }
    if (req.body.date !== undefined) rev.date = req.body.date;
    if (req.body.approved !== undefined) rev.approved = Boolean(req.body.approved);
    if (req.body.featured !== undefined) rev.featured = Boolean(req.body.featured);

    // Recalculate stats
    const approvedReviews = teacher.reviews!.filter((r) => r.approved !== false);
    const avgRating =
      approvedReviews.reduce((sum, r) => sum + (r.rating || 5), 0) / (approvedReviews.length || 1);
    if (!teacher.stats) teacher.stats = { courseCount: 0, enrollmentCount: 0, reviewCount: 0, rating: 5 };
    teacher.stats.rating = Number(avgRating.toFixed(1));
    teacher.stats.reviewCount = approvedReviews.length;

    await teacher.save();
    res.json({ teacher, review: rev });
  }),
);

adminRouter.delete(
  '/teachers/:id/reviews/:reviewId',
  asyncHandler(async (req, res) => {
    const id = String(req.params.id);
    const reviewId = String(req.params.reviewId);
    const { TeacherModel } = await import('../models/teacher.models.js');
    const teacher = await TeacherModel.findById(id);
    if (!teacher) throw notFound('Teacher not found');

    teacher.reviews = (teacher.reviews || []).filter(
      (r: any) => String(r._id) !== reviewId && String(r.id) !== reviewId,
    );

    // Recalculate stats
    const approvedReviews = teacher.reviews.filter((r) => r.approved !== false);
    const avgRating =
      approvedReviews.reduce((sum, r) => sum + (r.rating || 5), 0) / (approvedReviews.length || 1);
    if (!teacher.stats) teacher.stats = { courseCount: 0, enrollmentCount: 0, reviewCount: 0, rating: 5 };
    teacher.stats.rating = approvedReviews.length > 0 ? Number(avgRating.toFixed(1)) : 5.0;
    teacher.stats.reviewCount = approvedReviews.length;

    await teacher.save();
    res.json({ success: true, teacher });
  }),
);

adminRouter.patch(
  '/teachers/:id/reviews/:reviewId/moderate',
  asyncHandler(async (req, res) => {
    const id = String(req.params.id);
    const reviewId = String(req.params.reviewId);
    const { TeacherModel } = await import('../models/teacher.models.js');
    const teacher = await TeacherModel.findById(id);
    if (!teacher) throw notFound('Teacher not found');

    const rev = (teacher.reviews || []).find(
      (r: any) => String(r._id) === reviewId || String(r.id) === reviewId,
    );
    if (!rev) throw notFound('Review not found');

    if (req.body.approved !== undefined) rev.approved = Boolean(req.body.approved);
    if (req.body.featured !== undefined) rev.featured = Boolean(req.body.featured);

    // Recalculate stats
    const approvedReviews = teacher.reviews!.filter((r) => r.approved !== false);
    const avgRating =
      approvedReviews.reduce((sum, r) => sum + (r.rating || 5), 0) / (approvedReviews.length || 1);
    if (!teacher.stats) teacher.stats = { courseCount: 0, enrollmentCount: 0, reviewCount: 0, rating: 5 };
    teacher.stats.rating = approvedReviews.length > 0 ? Number(avgRating.toFixed(1)) : 5.0;
    teacher.stats.reviewCount = approvedReviews.length;

    await teacher.save();
    res.json({ teacher, review: rev });
  }),
);

adminRouter.patch(
  '/teachers/:id/stats',
  asyncHandler(async (req, res) => {
    const id = String(req.params.id);
    const { TeacherModel } = await import('../models/teacher.models.js');
    const teacher = await TeacherModel.findById(id);
    if (!teacher) throw notFound('Teacher not found');
    if (!teacher.stats) teacher.stats = { courseCount: 0, enrollmentCount: 0, reviewCount: 0, rating: 5 };

    if (req.body.rating !== undefined) teacher.stats.rating = Number(req.body.rating) || 5;
    if (req.body.reviewCount !== undefined) teacher.stats.reviewCount = Number(req.body.reviewCount) || 0;
    if (req.body.enrollmentCount !== undefined) teacher.stats.enrollmentCount = Number(req.body.enrollmentCount) || 0;
    if (req.body.courseCount !== undefined) teacher.stats.courseCount = Number(req.body.courseCount) || 0;

    await teacher.save();
    res.json({ teacher, stats: teacher.stats });
  }),
);

adminRouter.post(
  '/admins',
  validate(
    z.object({
      name: z.string(),
      email: z.string().email(),
      password: z.string().min(8),
      permissions: z.array(z.enum(PERMISSIONS)).optional(),
    }),
  ),
  asyncHandler(async (req: AuthedRequest, res) => {
    const exists = await UserModel.findOne({ email: req.body.email.toLowerCase() });
    if (exists) throw conflict('Email already in use');
    const admin = await UserModel.create({
      name: req.body.name,
      email: req.body.email.toLowerCase(),
      passwordHash: await hashPassword(req.body.password),
      role: 'admin',
      status: 'active',
      emailVerifiedAt: new Date(),
      permissions: req.body.permissions ?? [],
      mustChangePassword: true,
    });
    await writeAudit({
      actor: req.user!.id,
      role: 'admin',
      action: 'admin.created',
      entity: 'User',
      entityId: String(admin._id),
    });
    res.status(201).json({ user: { id: admin._id, email: admin.email, name: admin.name } });
  }),
);

adminRouter.get(
  '/audit-logs',
  asyncHandler(async (req, res) => {
    const { skip, limit, page } = paginate(Number(req.query.page ?? 1), 30);
    const filter: Record<string, unknown> = {};
    if (req.query.action) filter.action = req.query.action;
    const [items, total] = await Promise.all([
      AuditLogModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).populate('actor', 'name email role').lean(),
      AuditLogModel.countDocuments(filter),
    ]);
    res.json(paginatedResult(items, total, page, limit));
  }),
);

adminRouter.get(
  '/settings',
  asyncHandler(async (_req, res) => {
    const items = await SettingModel.find().lean();
    res.json({ items });
  }),
);

adminRouter.post(
  '/settings',
  validate(z.object({ key: z.string(), value: z.unknown() })),
  asyncHandler(async (req, res) => {
    const value =
      req.body.key === 'home.testSubscription'
        ? sanitizeHomeTestSubscriptionInput(req.body.value)
        : req.body.value;
    const item = await SettingModel.findOneAndUpdate(
      { key: req.body.key },
      { $set: { value } },
      { upsert: true, new: true },
    );
    res.json({ item });
  }),
);

adminRouter.post(
  '/notifications/broadcast',
  validate(
    z.object({
      title: z.string(),
      body: z.string().optional(),
      audience: z.enum(['all', 'role', 'batch', 'course']).optional(),
      role: z.enum(['student', 'teacher']).optional(),
      batchId: z.string().optional(),
      courseId: z.string().optional(),
      channels: z.array(z.enum(['inApp', 'email', 'push'])).optional(),
    }),
  ),
  asyncHandler(async (req, res) => {
    const filter: Record<string, unknown> = { status: 'active' };
    if (req.body.audience === 'role' && req.body.role) filter.role = req.body.role;
    else if (req.body.role) filter.role = req.body.role;
    let userIds: string[] = [];
    if (req.body.audience === 'batch' && req.body.batchId) {
      const enrolled = await EnrollmentModel.find({ batch: req.body.batchId, status: 'active' }).select('user').lean();
      userIds = enrolled.map((e) => String(e.user));
    } else if (req.body.audience === 'course' && req.body.courseId) {
      const enrolled = await EnrollmentModel.find({ course: req.body.courseId, status: 'active' }).select('user').lean();
      userIds = enrolled.map((e) => String(e.user));
    } else {
      const users = await UserModel.find(filter).select('_id').limit(5000).lean();
      userIds = users.map((u) => String(u._id));
    }
    const { notifyMany } = await import('../services/notification.service.js');
    await notifyMany(userIds, {
      title: req.body.title,
      body: req.body.body,
      type: 'promotional',
      channels: req.body.channels,
    });
    res.json({ sent: userIds.length });
  }),
);

adminRouter.get(
  '/sessions',
  asyncHandler(async (req, res) => {
    const { skip, limit, page } = paginate(Number(req.query.page ?? 1), Number(req.query.limit ?? 20));
    const filter: Record<string, unknown> = {};
    if (req.query.userId) filter.user = req.query.userId;
    if (req.query.active === '1') filter.revokedAt = { $exists: false };
    const [items, total] = await Promise.all([
      SessionModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).populate('user', 'name email role').lean(),
      SessionModel.countDocuments(filter),
    ]);
    res.json(paginatedResult(items, total, page, limit));
  }),
);

adminRouter.post(
  '/sessions/:id/revoke',
  audit('session.revoke', 'Session'),
  asyncHandler(async (req, res) => {
    const session = await SessionModel.findByIdAndUpdate(req.params.id, { revokedAt: new Date() }, { new: true });
    if (!session) throw notFound('Session not found');
    res.json({ session });
  }),
);

adminRouter.get(
  '/reports',
  asyncHandler(async (req, res) => {
    const view = String(req.query.view ?? 'revenue');
    const from = req.query.from ? new Date(String(req.query.from)) : new Date(Date.now() - 30 * 86400000);
    const to = req.query.to ? new Date(String(req.query.to)) : new Date();
    const csv = String(req.query.csv ?? '') === '1';
    if (view === 'student') {
      const items = await UserModel.find({ role: 'student', createdAt: { $gte: from, $lte: to } })
        .select('name email status createdAt lastLoginAt')
        .sort({ createdAt: -1 })
        .limit(500)
        .lean();
      if (csv) {
        res.setHeader('Content-Type', 'text/csv');
        res.send(['name,email,status,createdAt', ...items.map((i) => `${i.name},${i.email},${i.status},${i.createdAt}`)].join('\n'));
        return;
      }
      res.json({ items, view });
      return;
    }
    if (view === 'teacher') {
      const items = await UserModel.find({ role: 'teacher', createdAt: { $gte: from, $lte: to } })
        .select('name email teacherStatus createdAt')
        .sort({ createdAt: -1 })
        .limit(500)
        .lean();
      if (csv) {
        res.setHeader('Content-Type', 'text/csv');
        res.send(
          ['name,email,teacherStatus,createdAt', ...items.map((i) => `${i.name},${i.email},${i.teacherStatus},${i.createdAt}`)].join('\n'),
        );
        return;
      }
      res.json({ items, view });
      return;
    }
    const items = await PaymentModel.find({ status: 'captured', createdAt: { $gte: from, $lte: to } })
      .select('amountPaise createdAt invoiceNumber gateway user')
      .sort({ createdAt: -1 })
      .limit(500)
      .lean();
    if (csv) {
      res.setHeader('Content-Type', 'text/csv');
      res.send(
        [
          'invoice,amountPaise,gateway,createdAt',
          ...items.map((i) => `${i.invoiceNumber},${i.amountPaise},${i.gateway},${i.createdAt}`),
        ].join('\n'),
      );
      return;
    }
    res.json({ items, view });
  }),
);

cmsRouter.post(
  '/contact',
  validate(z.object({ name: z.string().min(2), email: z.string().email(), message: z.string().min(8) })),
  asyncHandler(async (req, res) => {
    const admins = await UserModel.find({ role: 'admin', status: 'active' }).select('_id').lean();
    const { notifyMany } = await import('../services/notification.service.js');
    await notifyMany(
      admins.map((a) => String(a._id)),
      {
        title: `Contact from ${req.body.name}`,
        body: `${req.body.email}: ${req.body.message}`,
        type: 'contact',
      },
    );
    res.json({ ok: true });
  }),
);

cmsRouter.get(
  '/public',
  asyncHandler(async (_req, res) => {
    const [
      banners,
      faqs,
      pages,
      featuredCourses,
      students,
      teachers,
      courses,
      batches,
      featuredReviews,
      highlightSetting,
      discoverySetting,
      platformSetting,
      facultySetting,
      sectionsSetting,
      testSubscriptionSetting,
      whySetting,
      coursesPageSetting,
      aboutPageSetting,
      tests,
      materials,
    ] = await Promise.all([
      BannerModel.find(liveBannerQuery()).sort({ sortOrder: 1, order: 1 }).lean(),
      FAQModel.find({ published: true }).sort({ order: 1 }).lean(),
      CMSPageModel.find().lean(),
      CourseModel.find({ status: 'published' })
        .sort({ featured: -1, enrollmentCount: -1, createdAt: -1 })
        .limit(8)
        .populate('teachers', 'name headline')
        .lean(),
      UserModel.countDocuments({ role: 'student', status: 'active' }),
      UserModel.countDocuments({ role: 'teacher', teacherStatus: 'approved' }),
      CourseModel.countDocuments({ status: 'published' }),
      BatchModel.countDocuments({ status: { $in: ['upcoming', 'open', 'ongoing'] } }),
      ReviewModel.find({ hidden: { $ne: true } })
        .sort({ createdAt: -1 })
        .limit(6)
        .populate('user', 'name')
        .populate('course', 'title category')
        .lean(),
      SettingModel.findOne({ key: 'home.highlights' }).lean(),
      SettingModel.findOne({ key: 'home.discovery' }).lean(),
      SettingModel.findOne({ key: 'home.platform' }).lean(),
      SettingModel.findOne({ key: 'home.faculty' }).lean(),
      SettingModel.findOne({ key: 'home.sections' }).lean(),
      SettingModel.findOne({ key: 'home.testSubscription' }).lean(),
      SettingModel.findOne({ key: 'home.why' }).lean(),
      SettingModel.findOne({ key: 'courses.page' }).lean(),
      SettingModel.findOne({ key: 'about.page' }).lean(),
      TestModel.countDocuments({ status: { $in: ['scheduled', 'live', 'ended'] } }),
      StudyMaterialModel.countDocuments({ status: 'published' }),
    ]);
    const highlights = resolveHomeHighlights(highlightSetting?.value, {
      students,
      teachers,
      courses,
      batches,
      tests,
      materials,
    });
    const discovery = resolveHomeDiscovery(discoverySetting?.value);
    const platform = resolveHomePlatform(platformSetting?.value);
    const faculty = resolveHomeFaculty(facultySetting?.value);
    const sections = resolveHomeSectionCopy(sectionsSetting?.value);
    const testSubscription = resolveHomeTestSubscription(testSubscriptionSetting?.value);
    const why = resolveHomeWhy(whySetting?.value);

    const finalFeaturedReviews = [...(featuredReviews || [])];
    if (finalFeaturedReviews.length < 6) {
      const { TeacherModel } = await import('../models/teacher.models.js');
      const teachersWithReviews = await TeacherModel.find({
        status: 'published',
        'reviews.0': { $exists: true },
      })
        .select('name reviews')
        .lean();

      for (const t of teachersWithReviews) {
        for (const rev of t.reviews || []) {
          if ((rev as any).approved !== false && (rev.comment || rev.reviewText)) {
            finalFeaturedReviews.push({
              _id: String((rev as any)._id || Math.random()),
              body: rev.comment || rev.reviewText || '',
              rating: rev.rating || 5,
              verified: true,
              user: { name: rev.studentName, avatar: rev.studentAvatar },
              course: {
                title: `${t.name} (Faculty)`,
                category: rev.roleOrExam || (rev as any).targetExam || 'Student',
              },
              studentAvatar: rev.studentAvatar,
              date: rev.date,
            } as any);
          }
        }
      }
    }

    res.json({
      banners: banners.map((b) => ({
        ...b,
        href: b.ctaUrl || b.href,
      })),
      faqs,
      pages,
      featuredCourses: featuredCourses.map((course) => {
        const thumb = course.thumbnail as { publicId?: string; url?: string } | undefined;
        const url = publicMediaUrl(thumb);
        if (!thumb || !url || url === thumb.url) return course;
        return { ...course, thumbnail: { ...thumb, url } };
      }),
      featuredReviews: finalFeaturedReviews,
      stats: { students, teachers, courses, batches },
      highlights,
      discovery,
      platform,
      faculty,
      sections,
      testSubscription,
      why,
      coursesPage: coursesPageSetting?.value ?? null,
      aboutPage: aboutPageSetting?.value ?? null,
    });
  }),
);

cmsRouter.get(
  '/courses-page',
  asyncHandler(async (_req, res) => {
    const setting = await SettingModel.findOne({ key: 'courses.page' }).lean();
    res.json({ coursesPage: setting?.value ?? null });
  }),
);

cmsRouter.get(
  '/teachers-page',
  asyncHandler(async (_req, res) => {
    const setting = await SettingModel.findOne({ key: 'teachers.page' }).lean();
    res.json({ teachersPage: setting?.value ?? null });
  }),
);

cmsRouter.get(
  '/about-page',
  asyncHandler(async (_req, res) => {
    const setting = await SettingModel.findOne({ key: 'about.page' }).lean();
    res.json({ aboutPage: setting?.value ?? null });
  }),
);

cmsRouter.get(
  '/pages/:key',
  asyncHandler(async (req, res) => {
    const page = await CMSPageModel.findOne({ key: req.params.key }).lean();
    if (!page) throw notFound('Page not found');
    res.json({ page });
  }),
);

cmsRouter.get(
  '/blogs',
  asyncHandler(async (req, res) => {
    const published = req.query.all === '1' ? {} : { published: true };
    const filter: Record<string, unknown> = { ...published };
    const q = String(req.query.q ?? '').trim();
    const tag = String(req.query.tag ?? '').trim();
    if (tag) filter.tags = tag;
    if (q) {
      const rx = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      const authors = await UserModel.find({ name: rx }).select('_id').limit(20).lean();
      filter.$or = [
        { title: rx },
        { excerpt: rx },
        { body: rx },
        { tags: rx },
        { author: { $in: authors.map((a) => a._id) } },
      ];
    }
    const items = await BlogModel.find(filter)
      .sort({ featured: -1, publishedAt: -1, createdAt: -1 })
      .limit(50)
      .populate('author', 'name')
      .lean();
    const publishedDocs = await BlogModel.find({ published: true }).select('tags featured cover').lean();
    const tagMap = new Map<string, number>();
    for (const post of publishedDocs) {
      for (const t of post.tags ?? []) {
        const name = String(t).trim();
        if (name) tagMap.set(name, (tagMap.get(name) ?? 0) + 1);
      }
    }
    const tags = [...tagMap.entries()].map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);
    const featured =
      (await BlogModel.findOne({ published: true, featured: true })
        .sort({ publishedAt: -1 })
        .populate('author', 'name')
        .lean()) ||
      (await BlogModel.findOne({ published: true, 'cover.url': { $exists: true, $ne: '' } })
        .sort({ publishedAt: -1 })
        .populate('author', 'name')
        .lean()) ||
      (await BlogModel.findOne({ published: true }).sort({ publishedAt: -1 }).populate('author', 'name').lean());
    const featuredReads = await BlogModel.find({ published: true, featured: true })
      .sort({ publishedAt: -1 })
      .limit(4)
      .populate('author', 'name')
      .lean();
    res.json({ items, total: items.length, tags, featured, featuredReads });
  }),
);

cmsRouter.get(
  '/blogs/:slug',
  asyncHandler(async (req, res) => {
    const post = await BlogModel.findOne({ slug: req.params.slug, published: true }).populate('author', 'name').lean();
    if (!post) throw notFound('Article not found');
    const tags = (post.tags ?? []).filter(Boolean);
    const related = tags.length
      ? await BlogModel.find({ published: true, slug: { $ne: post.slug }, tags: { $in: tags } })
          .sort({ publishedAt: -1 })
          .limit(3)
          .populate('author', 'name')
          .lean()
      : await BlogModel.find({ published: true, slug: { $ne: post.slug } })
          .sort({ publishedAt: -1 })
          .limit(3)
          .populate('author', 'name')
          .lean();
    res.json({ post, related });
  }),
);

const adminCms = Router();
adminCms.use(authenticate, requireRoles('admin'));

adminCms.post(
  '/banners',
  asyncHandler(async (req, res) => {
    const banner = await BannerModel.create({
      ...req.body,
      ctaUrl: req.body.ctaUrl || req.body.href,
      href: req.body.href || req.body.ctaUrl,
      sortOrder: req.body.sortOrder ?? req.body.order ?? 0,
      order: req.body.order ?? req.body.sortOrder ?? 0,
    });
    res.status(201).json({ banner });
  }),
);
adminCms.patch(
  '/banners/:id',
  asyncHandler(async (req, res) => {
    const banner = await BannerModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ banner });
  }),
);
adminCms.post(
  '/faqs',
  asyncHandler(async (req, res) => {
    res.status(201).json({ faq: await FAQModel.create(req.body) });
  }),
);
adminCms.post(
  '/pages',
  asyncHandler(async (req, res) => {
    const page = await CMSPageModel.findOneAndUpdate({ key: req.body.key }, req.body, { upsert: true, new: true });
    res.json({ page });
  }),
);
adminCms.post(
  '/blogs',
  asyncHandler(async (req: AuthedRequest, res) => {
    const post = await BlogModel.create({ ...req.body, author: req.user!.id, publishedAt: req.body.published ? new Date() : undefined });
    res.status(201).json({ post });
  }),
);

adminCms.get(
  '/teachers-page',
  asyncHandler(async (_req, res) => {
    const setting = await SettingModel.findOne({ key: 'teachers.page' }).lean();
    res.json({ teachersPage: setting?.value ?? null });
  }),
);

adminCms.post(
  '/teachers-page',
  asyncHandler(async (req, res) => {
    const item = await SettingModel.findOneAndUpdate(
      { key: 'teachers.page' },
      { $set: { value: req.body } },
      { upsert: true, new: true },
    );
    res.json({ teachersPage: item?.value });
  }),
);

adminCms.post(
  '/teachers-page/reset',
  asyncHandler(async (_req, res) => {
    await SettingModel.deleteOne({ key: 'teachers.page' });
    res.json({ success: true, message: 'Reset to default configuration' });
  }),
);

adminCms.get(
  '/about-page',
  asyncHandler(async (_req, res) => {
    const setting = await SettingModel.findOne({ key: 'about.page' }).lean();
    res.json({ aboutPage: setting?.value ?? null });
  }),
);

adminCms.post(
  '/about-page',
  asyncHandler(async (req, res) => {
    const item = await SettingModel.findOneAndUpdate(
      { key: 'about.page' },
      { $set: { value: req.body } },
      { upsert: true, new: true },
    );
    res.json({ aboutPage: item?.value });
  }),
);

adminCms.post(
  '/about-page/reset',
  asyncHandler(async (_req, res) => {
    await SettingModel.deleteOne({ key: 'about.page' });
    res.json({ success: true, message: 'Reset to default configuration' });
  }),
);

cmsRouter.use('/admin', adminCms);

careerRouter.get(
  '/articles',
  asyncHandler(async (req, res) => {
    const filter: Record<string, unknown> = { published: true };
    const q = String(req.query.q ?? '').trim();
    const category = String(req.query.category ?? '').trim();
    if (category) filter.category = category;
    if (q) {
      const rx = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      filter.$or = [{ title: rx }, { excerpt: rx }, { body: rx }, { category: rx }];
    }
    const items = await CareerArticleModel.find(filter).sort({ featured: -1, createdAt: -1 }).limit(50).lean();
    const published = await CareerArticleModel.find({ published: true }).select('category featured').lean();
    const catMap = new Map<string, number>();
    for (const article of published) {
      const name = String(article.category ?? '').trim();
      if (name) catMap.set(name, (catMap.get(name) ?? 0) + 1);
    }
    const categories = [...catMap.entries()].map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);
    const featured = await CareerArticleModel.find({ published: true, featured: true }).sort({ createdAt: -1 }).limit(3).lean();
    res.json({ items, categories, featured, total: items.length });
  }),
);
careerRouter.get(
  '/articles/:slug',
  asyncHandler(async (req, res) => {
    const item = await CareerArticleModel.findOne({ slug: req.params.slug, published: true }).lean();
    if (!item) throw notFound('Not found');
    const related = item.category
      ? await CareerArticleModel.find({ published: true, slug: { $ne: item.slug }, category: item.category })
          .sort({ createdAt: -1 })
          .limit(3)
          .lean()
      : await CareerArticleModel.find({ published: true, slug: { $ne: item.slug } }).sort({ createdAt: -1 }).limit(3).lean();
    res.json({ item, related });
  }),
);
careerRouter.get(
  '/roadmaps',
  asyncHandler(async (_req, res) => {
    res.json({ items: await RoadmapModel.find({ published: true }).lean() });
  }),
);
careerRouter.get(
  '/roadmaps/:slug',
  asyncHandler(async (req, res) => {
    const item = await RoadmapModel.findOne({ slug: req.params.slug, published: true }).lean();
    if (!item) throw notFound('Not found');
    res.json({ item });
  }),
);

careerRouter.get(
  '/scholarships',
  asyncHandler(async (_req, res) => {
    const items = await ScholarshipModel.find({ published: true }).sort({ deadline: 1, createdAt: -1 }).lean();
    res.json({ items });
  }),
);

export const DEFAULT_CAREER_PAGE_CONFIG = {
  hero: {
    badge: 'JOIN OUR TEAM',
    heading: 'Build Your\nFuture With Us',
    description: "At Gyan Chowk, we're not just building an ed-tech platform — we're building a team of passionate learners, creators and innovators.",
    imageUrl: '/career-hero.jpg',
    imageAlt: 'Build your future with Gyan Chowk',
    ctaText: 'Explore Open Positions',
    ctaLink: '#open-positions',
    benefits: [
      { id: 'b1', text: 'Meaningful Work', icon: 'graduation-cap', active: true },
      { id: 'b2', text: 'Growth Opportunities', icon: 'users', active: true },
      { id: 'b3', text: 'Supportive Culture', icon: 'heart', active: true },
    ],
    active: true,
  },
  whyWorkWithUs: {
    eyebrow: 'WHY WORK WITH US',
    heading: 'More Than Just a Job',
    description: "We believe in people, purpose, and progress. Here's why you'll love being a part of Gyan Chowk.",
    cards: [
      { id: 'w1', icon: 'rocket', title: 'Meaningful Work', description: 'Help millions of students achieve their dreams.', order: 1, active: true },
      { id: 'w2', icon: 'trending-up', title: 'Growth Opportunities', description: 'Learn, upskill and advance your career.', order: 2, active: true },
      { id: 'w3', icon: 'users', title: 'Supportive Culture', description: 'Work with a passionate and collaborative team.', order: 3, active: true },
      { id: 'w4', icon: 'lightbulb', title: 'Innovative Environment', description: 'Be part of a learning company that builds the future.', order: 4, active: true },
      { id: 'w5', icon: 'star', title: 'Competitive Benefits', description: 'Attractive compensation, flexible work and more.', order: 5, active: true },
    ],
    active: true,
  },
  openPositionsHeader: {
    eyebrow: 'OPEN POSITIONS',
    heading: 'Find Your Next Opportunity',
    description: 'We are always looking for talented and passionate individuals to join our growing team.',
    active: true,
  },
  lifeAtGyanChowk: {
    eyebrow: 'LIFE AT GYAN CHOWK',
    heading: 'Learn. Grow. Belong.',
    description: 'From flexible work culture to continuous learning, we make sure you have everything you need to do your best work.',
    cards: [
      { id: 'l1', icon: 'users', title: 'Collaborative Teams', description: 'Work with passionate and supportive colleagues.', imageUrl: '/career-life-1.jpg', order: 1, active: true },
      { id: 'l2', icon: 'book-open', title: 'Learning & Development', description: 'Access to courses, workshops and growth resources.', imageUrl: '/career-life-2.jpg', order: 2, active: true },
      { id: 'l3', icon: 'heart', title: 'Flexible Work Culture', description: 'Work from anywhere, be your best self.', imageUrl: '/career-life-3.jpg', order: 3, active: true },
      { id: 'l4', icon: 'send', title: 'Make an Impact', description: 'Help shape the future of education in India.', imageUrl: '/career-life-4.jpg', order: 4, active: true },
    ],
    active: true,
  },
  testimonials: {
    eyebrow: 'WHAT OUR TEAM SAYS',
    heading: 'Real People. Real Stories.',
    items: [
      { id: 't1', name: 'Riya Sharma', designation: 'Content Creator', quote: 'Gyan Chowk gave me the platform to do what I love. The team is incredibly supportive, and the work here truly makes a difference.', photoUrl: '/career-testimonial-1.jpg', order: 1, active: true },
      { id: 't2', name: 'Aman Verma', designation: 'Full Stack Engineer', quote: 'Working at Gyan Chowk allows me to solve real educational challenges that impact students nationwide every single day.', photoUrl: '/career-testimonial-1.jpg', order: 2, active: true },
    ],
    active: true,
  },
  cta: {
    heading: 'Ready to Build Your Future With Us?',
    description: 'Join Gyan Chowk and be a part of our mission to make quality education accessible to everyone.',
    buttonText: 'View Open Positions',
    buttonLink: '#open-positions',
    active: true,
  },
};

const INITIAL_CAREER_JOBS = [
  {
    title: 'Content Creator (Video)',
    department: 'Content & Production',
    location: 'Remote / Delhi',
    workMode: 'Hybrid',
    employmentType: 'Full-time',
    experience: '1-3 years',
    salaryRange: '₹4.5 - 7.5 LPA',
    description: 'Create engaging high-yield recorded lesson videos, concept breakdowns, and visual educational animations for our core course curriculum.',
    responsibilities: [
      'Script and record high-quality concept videos and solution walk-throughs',
      'Collaborate with subject matter experts to turn complex topics into clear visuals',
      'Ensure high video clarity, crisp audio, and educational engagement',
    ],
    requirements: [
      'Proven experience in video production or digital educational content',
      'Strong camera presence and clear spoken articulation',
      'Familiarity with screen recording and basic video editing tools',
    ],
    qualifications: ['Bachelor degree in any discipline or equivalent experience'],
    skills: ['Video Production', 'Script Writing', 'Presentation', 'Audio Quality'],
    icon: 'video',
    status: 'published',
    displayOrder: 1,
  },
  {
    title: 'Subject Matter Expert (Physics)',
    department: 'Academic',
    location: 'Remote / Pan India',
    workMode: 'Remote',
    employmentType: 'Full-time',
    experience: '2-5 years',
    salaryRange: '₹6.0 - 10.0 LPA',
    description: 'Design curriculum maps, test question banks, and recorded conceptual modules for competitive examination batches.',
    responsibilities: [
      'Develop rigorous question papers, answer keys, and in-depth video explanations',
      'Review curriculum modules for factual and pedagogical accuracy',
      'Mentor teaching assistants and guide doubt-solving teams',
    ],
    requirements: [
      'Master degree or B.Tech in Physics/related discipline with strong academic track record',
      'In-depth knowledge of competitive exam patterns (JEE, NEET, Board exams)',
      'Passion for student pedagogy and conceptual clarity',
    ],
    qualifications: ['M.Sc / B.Tech / M.Tech in Physics or allied sciences'],
    skills: ['Physics Curriculum', 'Problem Solving', 'Content Review', 'Pedagogy'],
    icon: 'academic',
    status: 'published',
    displayOrder: 2,
  },
  {
    title: 'UI/UX Designer',
    department: 'Design',
    location: 'Remote / Delhi',
    workMode: 'Hybrid',
    employmentType: 'Full-time',
    experience: '2-4 years',
    salaryRange: '₹7.0 - 12.0 LPA',
    description: 'Craft intuitive, accessible, and delightful web and mobile interfaces for students, teachers, and administrators across the Gyan Chowk platform.',
    responsibilities: [
      'Design clean UI layouts, components, design tokens, and prototypes',
      'Conduct user interviews with students and teachers to optimize user journeys',
      'Work closely with frontend engineers to ensure pixel-perfect implementation',
    ],
    requirements: [
      'Portfolio showcasing clean responsive web and mobile application designs',
      'Proficiency with Figma, modern design systems, and wireframing',
      'Understanding of accessibility standards and user-centered design',
    ],
    qualifications: ['Degree in Design, HCI, or relevant design portfolio experience'],
    skills: ['Figma', 'UI/UX Design', 'Design Systems', 'Prototyping', 'Accessibility'],
    icon: 'design',
    status: 'published',
    displayOrder: 3,
  },
  {
    title: 'Full Stack Developer',
    department: 'Engineering',
    location: 'Remote / Delhi',
    workMode: 'Hybrid',
    employmentType: 'Full-time',
    experience: '2-5 years',
    salaryRange: '₹10.0 - 16.0 LPA',
    description: 'Architect and scale full-stack Next.js and Node.js microservices powering video streaming, test evaluations, and student analytics.',
    responsibilities: [
      'Build robust, typed APIs and interactive React/Next.js frontend experiences',
      'Optimize database queries and caching layers for sub-100ms response times',
      'Maintain automated testing suites and CI/CD deployment pipelines',
    ],
    requirements: [
      'Deep proficiency in TypeScript, React, Next.js, Node.js, and MongoDB / PostgreSQL',
      'Experience with HLS video streaming, web sockets, or high-throughput systems',
      'Strong grasp of clean architecture, security, and performance optimization',
    ],
    qualifications: ['B.Tech / B.E. / MCA in Computer Science or equivalent hands-on experience'],
    skills: ['React', 'Next.js', 'Node.js', 'TypeScript', 'MongoDB', 'REST APIs'],
    icon: 'code',
    status: 'published',
    displayOrder: 4,
  },
  {
    title: 'Marketing Executive',
    department: 'Marketing',
    location: 'Remote / Pan India',
    workMode: 'Remote',
    employmentType: 'Full-time',
    experience: '1-3 years',
    salaryRange: '₹4.0 - 6.5 LPA',
    description: 'Drive organic student acquisition, social media outreach, community engagement, and digital campaign execution.',
    responsibilities: [
      'Plan and execute organic social media campaigns across YouTube, Instagram, and LinkedIn',
      'Coordinate student success stories and promotional campaign launches',
      'Analyze conversion funnels, CAC, and traffic analytics',
    ],
    requirements: [
      'Experience in digital marketing or growth for an education or consumer tech brand',
      'Strong copywriting and visual aesthetic understanding',
      'Familiarity with Google Analytics, Meta Ads Manager, and SEO fundamentals',
    ],
    qualifications: ['Bachelor degree in Marketing, Business, Communications, or related field'],
    skills: ['Digital Marketing', 'Social Media', 'Content Strategy', 'Campaign Analytics'],
    icon: 'marketing',
    status: 'published',
    displayOrder: 5,
  },
  {
    title: 'Customer Support Executive',
    department: 'Operations',
    location: 'Remote / Pan India',
    workMode: 'Remote',
    employmentType: 'Full-time',
    experience: '0-2 years',
    salaryRange: '₹3.5 - 5.0 LPA',
    description: 'Be the first point of contact for students and parents, delivering empathetic, timely, and solutions-oriented customer assistance.',
    responsibilities: [
      'Resolve student queries across live chat, ticketing, and phone channels',
      'Troubleshoot account access, batch enrollment, and video playback questions',
      'Collect student feedback to report issues directly to the product team',
    ],
    requirements: [
      'Excellent verbal and written communication in English and Hindi',
      'Empathetic, calm, and patient problem-solving approach',
      'Comfortable with ticketing software and spreadsheets',
    ],
    qualifications: ['Graduate in any discipline'],
    skills: ['Customer Support', 'Query Resolution', 'Communication', 'Student Care'],
    icon: 'support',
    status: 'published',
    displayOrder: 6,
  },
  {
    title: 'Business Development Associate',
    department: 'Sales',
    location: 'Remote / Pan India',
    workMode: 'Remote',
    employmentType: 'Full-time',
    experience: '1-3 years',
    salaryRange: '₹5.0 - 8.0 LPA + Incentives',
    description: 'Guide aspiring students and parents toward the right learning path, explaining course advantages and driving student enrollments.',
    responsibilities: [
      'Engage with inbound leads from trial classes and scholarship tests',
      'Conduct consultative academic counseling sessions with parents and students',
      'Achieve weekly and monthly enrollment targets while upholding ethical standards',
    ],
    requirements: [
      'Prior experience in inside sales or academic counseling in ed-tech',
      'Exceptional persuasion, active listening, and relationship-building skills',
      'Target-driven mindset with high integrity',
    ],
    qualifications: ['Bachelor degree in any field'],
    skills: ['Counseling', 'Sales Negotiation', 'Lead Conversion', 'CRM'],
    icon: 'sales',
    status: 'published',
    displayOrder: 7,
  },
  {
    title: 'HR Executive',
    department: 'Human Resources',
    location: 'Remote / Delhi',
    workMode: 'Hybrid',
    employmentType: 'Full-time',
    experience: '1-3 years',
    salaryRange: '₹4.5 - 7.0 LPA',
    description: 'Coordinate talent acquisition, team onboarding, and people culture initiatives as Gyan Chowk scales its educator and tech teams.',
    responsibilities: [
      'Source, screen, and interview candidates for technical, academic, and creative roles',
      'Streamline smooth onboarding, documentation, and employee engagement',
      'Coordinate team learning workshops, performance reviews, and wellness initiatives',
    ],
    requirements: [
      'Experience in end-to-end recruitment and HR operations',
      'Strong interpersonal and organizational abilities',
      'Familiarity with modern HRMS platforms and talent sourcing channels',
    ],
    qualifications: ['MBA or Bachelor degree in HR, Psychology, or Management'],
    skills: ['Talent Acquisition', 'HR Operations', 'Employee Engagement', 'Interviewing'],
    icon: 'hr',
    status: 'published',
    displayOrder: 8,
  },
];

// Public: Get Career page configuration
careerRouter.get(
  '/page-config',
  asyncHandler(async (_req, res) => {
    const setting = await SettingModel.findOne({ key: 'career.page' }).lean();
    res.json({ config: setting?.value ?? DEFAULT_CAREER_PAGE_CONFIG });
  }),
);

// Public: Get published job listings with search & filter
careerRouter.get(
  '/jobs',
  asyncHandler(async (req, res) => {
    const totalJobs = await CareerJobModel.countDocuments();
    if (totalJobs === 0) {
      await CareerJobModel.insertMany(INITIAL_CAREER_JOBS);
    }

    const filter: Record<string, unknown> = { status: 'published' };
    const q = String(req.query.q ?? '').trim();
    const department = String(req.query.department ?? '').trim();
    const location = String(req.query.location ?? '').trim();

    if (department && department !== 'All Departments') {
      filter.department = department;
    }
    if (location && location !== 'All Locations') {
      filter.location = new RegExp(location.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    }
    if (q) {
      const rx = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      filter.$or = [
        { title: rx },
        { department: rx },
        { location: rx },
        { description: rx },
        { skills: rx },
      ];
    }

    const jobs = await CareerJobModel.find(filter).sort({ displayOrder: 1, createdAt: -1 }).lean();

    const allPublished = await CareerJobModel.find({ status: 'published' }).select('department location').lean();
    const departments = Array.from(new Set(allPublished.map((j) => j.department).filter(Boolean))).sort();
    const locations = Array.from(new Set(allPublished.map((j) => j.location).filter(Boolean))).sort();

    res.json({ jobs, departments, locations, total: jobs.length });
  }),
);

// Public: Get single job details
careerRouter.get(
  '/jobs/:id',
  asyncHandler(async (req, res) => {
    const job = await CareerJobModel.findById(req.params.id).lean();
    if (!job) throw notFound('Job opening not found');
    res.json({ job });
  }),
);

const adminCareer = Router();
adminCareer.use(authenticate, requireRoles('admin'));

// Admin: Get Career Page configuration
adminCareer.get(
  '/page-config',
  asyncHandler(async (_req, res) => {
    const setting = await SettingModel.findOne({ key: 'career.page' }).lean();
    res.json({ config: setting?.value ?? DEFAULT_CAREER_PAGE_CONFIG });
  }),
);

// Admin: Save Career Page configuration
adminCareer.post(
  '/page-config',
  asyncHandler(async (req, res) => {
    const item = await SettingModel.findOneAndUpdate(
      { key: 'career.page' },
      { $set: { value: req.body } },
      { upsert: true, new: true },
    );
    res.json({ config: item?.value });
  }),
);

// Admin: Reset Career Page configuration to defaults
adminCareer.post(
  '/reset-page-config',
  asyncHandler(async (_req, res) => {
    await SettingModel.deleteOne({ key: 'career.page' });
    res.json({ success: true, message: 'Reset to default configuration' });
  }),
);

// Admin: List all jobs (all statuses) with filtering & search
adminCareer.get(
  '/jobs',
  asyncHandler(async (req, res) => {
    const totalJobs = await CareerJobModel.countDocuments();
    if (totalJobs === 0) {
      await CareerJobModel.insertMany(INITIAL_CAREER_JOBS);
    }

    const filter: Record<string, unknown> = {};
    const q = String(req.query.q ?? '').trim();
    const status = String(req.query.status ?? '').trim();
    const department = String(req.query.department ?? '').trim();

    if (status && status !== 'all') {
      filter.status = status;
    }
    if (department && department !== 'All Departments') {
      filter.department = department;
    }
    if (q) {
      const rx = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      filter.$or = [{ title: rx }, { department: rx }, { location: rx }];
    }

    const items = await CareerJobModel.find(filter).sort({ displayOrder: 1, createdAt: -1 }).lean();
    res.json({ items, total: items.length });
  }),
);

// Admin: Create job opening
adminCareer.post(
  '/jobs',
  asyncHandler(async (req, res) => {
    const job = await CareerJobModel.create(req.body);
    res.status(201).json({ job });
  }),
);

// Admin: Update job opening
adminCareer.put(
  '/jobs/:id',
  asyncHandler(async (req, res) => {
    const job = await CareerJobModel.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
    if (!job) throw notFound('Job not found');
    res.json({ job });
  }),
);

// Admin: Delete job opening
adminCareer.delete(
  '/jobs/:id',
  asyncHandler(async (req, res) => {
    const job = await CareerJobModel.findByIdAndDelete(req.params.id);
    if (!job) throw notFound('Job not found');
    res.json({ success: true, message: 'Job deleted successfully' });
  }),
);

adminCareer.get(
  '/scholarships',
  asyncHandler(async (_req, res) => {
    res.json({ items: await ScholarshipModel.find().sort({ createdAt: -1 }).lean() });
  }),
);
adminCareer.post(
  '/articles',
  asyncHandler(async (req, res) => {
    res.status(201).json({ item: await CareerArticleModel.create(req.body) });
  }),
);
adminCareer.post(
  '/roadmaps',
  asyncHandler(async (req, res) => {
    res.status(201).json({ item: await RoadmapModel.create(req.body) });
  }),
);
adminCareer.post(
  '/scholarships',
  asyncHandler(async (req, res) => {
    res.status(201).json({ item: await ScholarshipModel.create(req.body) });
  }),
);
adminCareer.patch(
  '/scholarships/:id',
  asyncHandler(async (req, res) => {
    const item = await ScholarshipModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!item) throw notFound('Not found');
    res.json({ item });
  }),
);
careerRouter.use('/admin', adminCareer);

void badRequest;
