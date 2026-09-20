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
import {
  resolveHomeTestSubscription,
  sanitizeHomeTestSubscriptionInput,
} from '../services/homeTestSubscription.service.js';
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
      tests,
      materials,
    ] = await Promise.all([
      BannerModel.find(liveBannerQuery()).sort({ sortOrder: 1, order: 1 }).lean(),
      FAQModel.find({ published: true }).sort({ order: 1 }).lean(),
      CMSPageModel.find().lean(),
      CourseModel.find({ status: 'published' }).sort({ enrollmentCount: -1 }).limit(8).populate('teachers', 'name headline').lean(),
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
    res.json({
      banners: banners.map((b) => ({
        ...b,
        href: b.ctaUrl || b.href,
      })),
      faqs,
      pages,
      featuredCourses,
      featuredReviews,
      stats: { students, teachers, courses, batches },
      highlights,
      discovery,
      platform,
      faculty,
      sections,
      testSubscription,
    });
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

const adminCareer = Router();
adminCareer.use(authenticate, requireRoles('admin'));
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
