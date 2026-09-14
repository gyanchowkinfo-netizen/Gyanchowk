import { Router } from 'express';
import { z } from 'zod';
import { batchFilterSchema, courseFilterSchema } from '@gyan-chowk/shared';
import { authenticate, optionalAuth, requireRoles, teacherOrAdmin, type AuthedRequest } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/error.js';
import { validate } from '../middleware/validate.js';
import { audit } from '../middleware/audit.js';
import {
  AssignmentModel,
  AttendanceSessionModel,
  BatchModel,
  ChapterModel,
  CourseModel,
  EnrollmentModel,
  LessonModel,
  ProgressModel,
  ReviewModel,
  StudyMaterialModel,
  SubjectModel,
  TestModel,
  TopicModel,
  VideoModel,
} from '../models/index.js';
import { paginate, paginatedResult, slugify } from '../utils/helpers.js';
import { notFound } from '../utils/errors.js';
import { assertTeacherOwnsCourse } from '../services/learning.service.js';

export const courseRouter = Router();
export const batchRouter = Router();
export const catalogRouter = Router();

courseRouter.get(
  '/',
  optionalAuth,
  validate(courseFilterSchema, 'query'),
  asyncHandler(async (req: AuthedRequest, res) => {
    const q = req.query as Record<string, string>;
    const { skip, limit, page } = paginate(Number(q.page ?? 1), Number(q.limit ?? 20));
    const filter: Record<string, unknown> = {};
    if (q.mine === '1' && req.user?.role === 'teacher') {
      filter.teachers = req.user.id;
    } else if (q.mine === '1' && req.user?.role === 'admin') {
      /* all courses */
    } else {
      filter.status = 'published';
    }
    if (q.q) filter.$text = { $search: q.q };
    if (q.category) filter.category = q.category;
    if (q.subject) filter.subjects = q.subject;
    if (q.exam) filter.targetExam = q.exam;
    if (q.class) filter.targetClass = q.class;
    if (q.language) filter.language = q.language;
    if (q.pricing) filter.pricingType = q.pricing;
    if (q.teacher) filter.teachers = q.teacher;
    if (q.minRating) filter.ratingAvg = { $gte: Number(q.minRating) };
    const sort: Record<string, 1 | -1> =
      q.sort === 'price' ? { price: 1 } : q.sort === 'rating' ? { ratingAvg: -1 } : { createdAt: -1 };
    const [items, total] = await Promise.all([
      CourseModel.find(filter)
        .populate('teachers', 'name headline avatar')
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      CourseModel.countDocuments(filter),
    ]);
    res.json(paginatedResult(items, total, page, limit));
  }),
);

courseRouter.get(
  '/meta',
  asyncHandler(async (_req, res) => {
    const [categories, subjects, exams, classes, languages] = await Promise.all([
      CourseModel.distinct('category', { status: 'published' }),
      CourseModel.distinct('subjects', { status: 'published' }),
      CourseModel.distinct('targetExam', { status: 'published' }),
      CourseModel.distinct('targetClass', { status: 'published' }),
      CourseModel.distinct('language', { status: 'published' }),
    ]);
    res.json({
      categories: categories.filter(Boolean),
      subjects: subjects.filter(Boolean),
      exams: exams.filter(Boolean),
      classes: classes.filter(Boolean),
      languages: languages.filter(Boolean),
    });
  }),
);

courseRouter.get(
  '/by-id/:id',
  asyncHandler(async (req, res) => {
    const course = await CourseModel.findById(req.params.id)
      .populate('teachers', 'name headline')
      .lean();
    if (!course) throw notFound('Course not found');
    res.json({ course });
  }),
);

courseRouter.get(
  '/:slug',
  optionalAuth,
  asyncHandler(async (req, res) => {
    const course = await CourseModel.findOne({ slug: req.params.slug, status: { $in: ['published', 'draft'] } })
      .populate('teachers', 'name headline avatar bio')
      .lean();
    if (!course) throw notFound('Course not found');
    const [subjects, reviews] = await Promise.all([
      SubjectModel.find({ course: course._id }).sort({ order: 1 }).lean(),
      ReviewModel.find({ course: course._id, hidden: false })
        .populate('user', 'name avatar')
        .sort({ createdAt: -1 })
        .limit(20)
        .lean(),
    ]);
    const chapters = await ChapterModel.find({ course: course._id }).sort({ order: 1 }).lean();
    const topics = await TopicModel.find({ course: course._id }).sort({ order: 1 }).lean();
    const lessons = await LessonModel.find({ course: course._id }).sort({ order: 1 }).select('-__v').lean();
    const related = await CourseModel.find({
      status: 'published',
      _id: { $ne: course._id },
      $or: [{ category: course.category }, { targetExam: course.targetExam }],
    })
      .select('title slug price pricingType discountPercent ratingAvg enrollmentCount subtitle')
      .limit(4)
      .lean();
    res.json({ course, subjects, chapters, topics, lessons, reviews, related });
  }),
);

const courseBody = z.object({
  title: z.string().min(3),
  subtitle: z.string().optional(),
  description: z.string().optional(),
  category: z.string().optional(),
  subjects: z.array(z.string()).optional(),
  examCategories: z.array(z.string()).optional(),
  targetClass: z.string().optional(),
  targetExam: z.string().optional(),
  language: z.string().optional(),
  pricingType: z.enum(['free', 'paid']).optional(),
  price: z.number().min(0).optional(),
  discountPercent: z.number().min(0).max(100).optional(),
  validityDays: z.number().int().positive().optional(),
  certificateEnabled: z.boolean().optional(),
  faqs: z.array(z.object({ question: z.string(), answer: z.string() })).optional(),
  outcomes: z.array(z.string()).optional(),
  thumbnail: z.object({ publicId: z.string(), url: z.string().optional() }).optional(),
});

courseRouter.post(
  '/',
  authenticate,
  teacherOrAdmin,
  validate(courseBody),
  audit('course.create', 'Course'),
  asyncHandler(async (req: AuthedRequest, res) => {
    const slug = slugify(req.body.title) + '-' + Date.now().toString(36);
    const course = await CourseModel.create({
      ...req.body,
      slug,
      teachers: req.user!.role === 'teacher' ? [req.user!.id] : req.body.teachers ?? [],
      createdBy: req.user!.id,
      status: req.user!.role === 'admin' ? 'published' : 'draft',
    });
    res.status(201).json({ course });
  }),
);

courseRouter.patch(
  '/:id',
  authenticate,
  teacherOrAdmin,
  asyncHandler(async (req: AuthedRequest, res) => {
    const course = await CourseModel.findById(req.params.id);
    if (!course) throw notFound('Course not found');
    assertTeacherOwnsCourse(req.user!.role, req.user!.id, course);
    Object.assign(course, req.body);
    await course.save();
    res.json({ course });
  }),
);

function batchDurationDays(b: { startDate?: Date | null; endDate?: Date | null; validityDays?: number | null }) {
  if (b.startDate && b.endDate) {
    const days = Math.round((new Date(b.endDate).getTime() - new Date(b.startDate).getTime()) / 86_400_000);
    return days > 0 ? days : null;
  }
  return typeof b.validityDays === 'number' ? b.validityDays : null;
}

function batchSalePrice(price = 0, discount = 0) {
  return Math.round(price * (1 - Math.min(100, discount) / 100));
}

function asCourse(course: unknown) {
  if (course && typeof course === 'object' && 'title' in course) {
    return course as {
      _id?: unknown;
      title?: string;
      slug?: string;
      category?: string;
      subjects?: string[];
      targetExam?: string;
      language?: string;
      ratingAvg?: number;
      ratingCount?: number;
      thumbnail?: { url?: string };
      certificateEnabled?: boolean;
      faqs?: Array<{ question: string; answer: string }>;
    };
  }
  return null;
}

batchRouter.get(
  '/',
  validate(batchFilterSchema, 'query'),
  asyncHandler(async (req, res) => {
    const q = req.query as Record<string, string>;
    const { skip, limit, page } = paginate(Number(q.page ?? 1), Number(q.limit ?? 12));
    const batches = await BatchModel.find({ status: { $in: ['upcoming', 'open', 'ongoing'] } })
      .populate('course', 'title slug category subjects targetExam language ratingAvg ratingCount thumbnail')
      .populate('teachers', 'name headline')
      .limit(100)
      .lean();

    const mapped = batches.map((b) => {
      const course = asCourse(b.course);
      const exam = b.targetExam || b.examCategory || course?.targetExam || '';
      const category = b.examCategory || course?.category || exam;
      const courseId = course?._id ? String(course._id) : typeof b.course === 'string' ? b.course : '';
      return {
        ...b,
        durationDays: batchDurationDays(b),
        salePrice: batchSalePrice(b.price, b.discountPercent),
        ratingAvg: course?.ratingAvg ?? 0,
        ratingCount: course?.ratingCount ?? 0,
        subjects: course?.subjects ?? [],
        exam,
        category,
        courseTitle: course?.title,
        courseSlug: course?.slug,
        courseId,
      };
    });
    const unfiltered = mapped;
    const facets = {
      exams: facetCount(unfiltered.map((b) => b.exam).filter(Boolean)),
      classes: facetCount(unfiltered.map((b) => b.targetClass).filter(Boolean) as string[]),
      languages: facetCount(unfiltered.map((b) => b.language).filter(Boolean) as string[]),
      categories: facetCount(unfiltered.map((b) => b.category).filter(Boolean)),
      teachers: facetCount(
        unfiltered.flatMap((b) => ((b.teachers ?? []) as Array<{ name?: string }>).map((t) => t.name).filter(Boolean) as string[]),
      ),
      statuses: facetCount(unfiltered.map((b) => b.status)),
    };
    const stats = {
      batches: unfiltered.length,
      enrollments: unfiltered.reduce((n, b) => n + (b.enrolledCount ?? 0), 0),
      exams: new Set(unfiltered.map((b) => b.exam).filter(Boolean)).size,
      open: unfiltered.filter((b) => b.status === 'open' || b.status === 'upcoming').length,
    };
    const featured = [...unfiltered]
      .sort(
        (a, b) =>
          (b.enrolledCount ?? 0) - (a.enrolledCount ?? 0) || (b.ratingAvg ?? 0) - (a.ratingAvg ?? 0) || a.name.localeCompare(b.name),
      )
      .slice(0, 6);

    let items = mapped;
    if (q.q) {
      const rx = new RegExp(q.q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      items = items.filter(
        (b) =>
          rx.test(b.name) ||
          rx.test(b.description ?? '') ||
          rx.test(b.exam) ||
          rx.test(b.category) ||
          rx.test(b.targetClass ?? '') ||
          rx.test(b.language ?? '') ||
          rx.test(b.courseTitle ?? '') ||
          (b.subjects ?? []).some((s) => rx.test(s)) ||
          ((b.teachers ?? []) as Array<{ name?: string }>).some((t) => rx.test(t.name ?? '')),
      );
    }
    if (q.course) {
      items = items.filter((b) => b.courseId === q.course || b.courseSlug === q.course);
    }
    if (q.exam) {
      const s = q.exam.toLowerCase();
      items = items.filter((b) => b.exam.toLowerCase() === s || b.category.toLowerCase() === s);
    }
    if (q.category) {
      const s = q.category.toLowerCase();
      items = items.filter((b) => b.category.toLowerCase() === s || b.exam.toLowerCase() === s);
    }
    if (q.class) {
      const s = q.class.toLowerCase();
      items = items.filter((b) => (b.targetClass ?? '').toLowerCase() === s);
    }
    if (q.language) {
      const s = q.language.toLowerCase();
      items = items.filter((b) => (b.language ?? '').toLowerCase() === s);
    }
    if (q.subject) {
      const s = q.subject.toLowerCase();
      items = items.filter((b) => (b.subjects ?? []).some((x) => x.toLowerCase() === s));
    }
    if (q.teacher) {
      const s = q.teacher.toLowerCase();
      items = items.filter((b) =>
        ((b.teachers ?? []) as Array<{ name?: string }>).some((t) => (t.name ?? '').toLowerCase() === s),
      );
    }
    if (q.status && ['upcoming', 'open', 'ongoing'].includes(q.status)) {
      items = items.filter((b) => b.status === q.status);
    }
    if (q.pricing === 'free') items = items.filter((b) => b.salePrice === 0);
    if (q.pricing === 'paid') items = items.filter((b) => b.salePrice > 0);
    if (q.duration === 'short') items = items.filter((b) => b.durationDays != null && b.durationDays < 90);
    if (q.duration === 'medium') items = items.filter((b) => b.durationDays != null && b.durationDays >= 90 && b.durationDays <= 180);
    if (q.duration === 'long') items = items.filter((b) => b.durationDays != null && b.durationDays > 180);
    if (q.minRating) items = items.filter((b) => (b.ratingCount ?? 0) > 0 && (b.ratingAvg ?? 0) >= Number(q.minRating));

    const sort = q.sort ?? 'popular';
    items.sort((a, b) => {
      if (sort === 'newest' || sort === 'new') return new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime();
      if (sort === 'price' || sort === 'price_asc') return a.salePrice - b.salePrice || a.name.localeCompare(b.name);
      if (sort === 'price_desc') return b.salePrice - a.salePrice || a.name.localeCompare(b.name);
      if (sort === 'rating') return (b.ratingAvg ?? 0) - (a.ratingAvg ?? 0) || (b.enrolledCount ?? 0) - (a.enrolledCount ?? 0);
      if (sort === 'students') return (b.enrolledCount ?? 0) - (a.enrolledCount ?? 0) || a.name.localeCompare(b.name);
      return (b.enrolledCount ?? 0) - (a.enrolledCount ?? 0) || (b.ratingAvg ?? 0) - (a.ratingAvg ?? 0) || a.name.localeCompare(b.name);
    });

    const total = items.length;
    res.json({ ...paginatedResult(items.slice(skip, skip + limit), total, page, limit), stats, facets, featured });
  }),
);

batchRouter.get(
  '/by-id/:id',
  asyncHandler(async (req, res) => {
    const batch = await BatchModel.findById(req.params.id)
      .populate('course', 'title slug')
      .populate('teachers', 'name headline')
      .lean();
    if (!batch) throw notFound('Batch not found');
    res.json({ batch });
  }),
);

batchRouter.get(
  '/:slug',
  optionalAuth,
  asyncHandler(async (req: AuthedRequest, res) => {
    const batch = await BatchModel.findOne({ slug: req.params.slug })
      .populate('course')
      .populate('teachers', 'name headline avatar')
      .lean();
    if (!batch) throw notFound('Batch not found');
    const course = asCourse(batch.course);
    const cid = course?._id;
    const byCourseOrBatch = cid ? [{ course: cid }, { batch: batch._id }] : [{ batch: batch._id }];
    const [subjects, chapters, topics, lessons, reviews, materials, assignments, tests, attendanceSessions] = await Promise.all([
      cid ? SubjectModel.find({ course: cid }).sort({ order: 1 }).select('name slug order').lean() : [],
      cid ? ChapterModel.find({ course: cid }).sort({ order: 1 }).select('name slug subject order').lean() : [],
      cid ? TopicModel.find({ course: cid }).sort({ order: 1 }).select('name slug chapter order').lean() : [],
      cid ? LessonModel.find({ course: cid }).sort({ order: 1 }).select('title slug chapter topic isDemo order').lean() : [],
      cid
        ? ReviewModel.find({ course: cid, hidden: false }).populate('user', 'name').sort({ createdAt: -1 }).limit(20).lean()
        : [],
      StudyMaterialModel.countDocuments({ status: 'published', $or: byCourseOrBatch }),
      AssignmentModel.countDocuments({ status: 'published', $or: byCourseOrBatch }),
      TestModel.countDocuments({ status: { $in: ['scheduled', 'live', 'ended'] }, $or: byCourseOrBatch }),
      AttendanceSessionModel.countDocuments({ batch: batch._id }),
    ]);

    let enrollment: { status?: string; expiresAt?: Date | null } | null = null;
    let progressPercent: number | null = null;
    if (req.user) {
      enrollment = await EnrollmentModel.findOne({ user: req.user.id, batch: batch._id }).select('status expiresAt').lean();
      if (enrollment?.status === 'active' && cid) {
        const progress = await ProgressModel.findOne({ user: req.user.id, course: cid }).select('percent').lean();
        progressPercent = typeof progress?.percent === 'number' ? progress.percent : null;
      }
    }

    res.json({
      batch: {
        ...batch,
        durationDays: batchDurationDays(batch),
        salePrice: batchSalePrice(batch.price, batch.discountPercent),
        ratingAvg: course?.ratingAvg ?? 0,
        ratingCount: course?.ratingCount ?? 0,
      },
      subjects,
      chapters,
      topics,
      lessons,
      reviews,
      counts: {
        materials,
        assignments,
        tests,
        attendanceSessions,
        lessons: lessons.length,
      },
      enrollment: enrollment
        ? {
            status: enrollment.status,
            expiresAt: enrollment.expiresAt,
            expired: enrollment.status === 'expired' || (enrollment.expiresAt ? new Date(enrollment.expiresAt) < new Date() : false),
          }
        : null,
      progressPercent,
    });
  }),
);

batchRouter.post(
  '/',
  authenticate,
  teacherOrAdmin,
  validate(
    z.object({
      name: z.string().min(3),
      course: z.string(),
      description: z.string().optional(),
      startDate: z.coerce.date().optional(),
      endDate: z.coerce.date().optional(),
      language: z.string().optional(),
      examCategory: z.string().optional(),
      targetClass: z.string().optional(),
      targetExam: z.string().optional(),
      maxStudents: z.number().optional(),
      price: z.number().min(0).optional(),
      discountPercent: z.number().min(0).max(100).optional(),
      validityDays: z.number().optional(),
      thumbnail: z.object({ publicId: z.string(), url: z.string().optional() }).optional(),
      schedule: z.array(z.object({ day: z.string(), startTime: z.string(), endTime: z.string(), title: z.string().optional() })).optional(),
    }),
  ),
  asyncHandler(async (req: AuthedRequest, res) => {
    const course = await CourseModel.findById(req.body.course);
    if (!course) throw notFound('Course not found');
    assertTeacherOwnsCourse(req.user!.role, req.user!.id, course);
    const batch = await BatchModel.create({
      ...req.body,
      slug: slugify(req.body.name) + '-' + Date.now().toString(36),
      teachers: req.user!.role === 'teacher' ? [req.user!.id] : course.teachers,
      createdBy: req.user!.id,
      status: 'upcoming',
    });
    res.status(201).json({ batch });
  }),
);

batchRouter.post(
  '/:id/announcements',
  authenticate,
  teacherOrAdmin,
  validate(z.object({ title: z.string(), body: z.string() })),
  asyncHandler(async (req: AuthedRequest, res) => {
    const batch = await BatchModel.findByIdAndUpdate(
      req.params.id,
      { $push: { announcements: { ...req.body, createdBy: req.user!.id } } },
      { new: true },
    );
    if (!batch) throw notFound('Batch not found');
    res.json({ batch });
  }),
);

catalogRouter.post(
  '/subjects',
  authenticate,
  teacherOrAdmin,
  validate(z.object({ name: z.string(), course: z.string(), batch: z.string().optional(), order: z.number().optional() })),
  asyncHandler(async (req, res) => {
    const subject = await SubjectModel.create({ ...req.body, slug: slugify(req.body.name) });
    res.status(201).json({ subject });
  }),
);

catalogRouter.post(
  '/chapters',
  authenticate,
  teacherOrAdmin,
  validate(z.object({ name: z.string(), subject: z.string(), course: z.string(), order: z.number().optional() })),
  asyncHandler(async (req, res) => {
    const chapter = await ChapterModel.create({ ...req.body, slug: slugify(req.body.name) });
    res.status(201).json({ chapter });
  }),
);

catalogRouter.post(
  '/topics',
  authenticate,
  teacherOrAdmin,
  validate(z.object({ name: z.string(), chapter: z.string(), course: z.string(), order: z.number().optional() })),
  asyncHandler(async (req, res) => {
    const topic = await TopicModel.create({ ...req.body, slug: slugify(req.body.name) });
    res.status(201).json({ topic });
  }),
);

catalogRouter.post(
  '/lessons',
  authenticate,
  teacherOrAdmin,
  validate(
    z.object({
      title: z.string(),
      topic: z.string(),
      chapter: z.string().optional(),
      course: z.string(),
      video: z.string().optional(),
      isDemo: z.boolean().optional(),
      order: z.number().optional(),
      durationSec: z.number().optional(),
    }),
  ),
  asyncHandler(async (req, res) => {
    const lesson = await LessonModel.create({ ...req.body, slug: slugify(req.body.title) });
    if (req.body.video) await VideoModel.updateOne({ _id: req.body.video }, { lesson: lesson._id });
    res.status(201).json({ lesson });
  }),
);

type CourseStat = {
  teachers?: unknown[];
  category?: string | null;
  subjects?: Array<string | null> | null;
  targetExam?: string | null;
  language?: string | null;
  ratingAvg?: number | null;
  ratingCount?: number | null;
  enrollmentCount?: number | null;
};

function facetCount(values: string[]) {
  const map = new Map<string, number>();
  for (const v of values) {
    const key = v.trim();
    if (!key) continue;
    map.set(key, (map.get(key) ?? 0) + 1);
  }
  return [...map.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

function enrichTeachers(
  teachers: Array<{ _id: unknown; name: string; headline?: string | null; bio?: string | null; avatar?: { url?: string | null } | null; createdAt?: Date | null }>,
  courses: CourseStat[],
) {
  const byTeacher = new Map<
    string,
    {
      courses: number;
      enroll: number;
      ratingSum: number;
      ratingWeight: number;
      subjects: Set<string>;
      exams: Set<string>;
      langs: Set<string>;
      cats: Set<string>;
    }
  >();
  for (const c of courses) {
    for (const tid of c.teachers ?? []) {
      const id = String(tid);
      const rec = byTeacher.get(id) ?? {
        courses: 0,
        enroll: 0,
        ratingSum: 0,
        ratingWeight: 0,
        subjects: new Set<string>(),
        exams: new Set<string>(),
        langs: new Set<string>(),
        cats: new Set<string>(),
      };
      rec.courses += 1;
      rec.enroll += c.enrollmentCount ?? 0;
      if ((c.ratingCount ?? 0) > 0) {
        rec.ratingSum += (c.ratingAvg ?? 0) * (c.ratingCount ?? 0);
        rec.ratingWeight += c.ratingCount ?? 0;
      }
      for (const s of c.subjects ?? []) if (s) rec.subjects.add(s);
      if (c.targetExam) rec.exams.add(c.targetExam);
      if (c.language) rec.langs.add(c.language);
      if (c.category) rec.cats.add(c.category);
      byTeacher.set(id, rec);
    }
  }
  return teachers.map((t) => {
    const rec = byTeacher.get(String(t._id));
    return {
      ...t,
      courseCount: rec?.courses ?? 0,
      enrollmentCount: rec?.enroll ?? 0,
      ratingAvg: rec && rec.ratingWeight ? rec.ratingSum / rec.ratingWeight : 0,
      ratingCount: rec?.ratingWeight ?? 0,
      subjects: rec ? [...rec.subjects] : [],
      exams: rec ? [...rec.exams] : [],
      languages: rec ? [...rec.langs] : [],
      categories: rec ? [...rec.cats] : [],
    };
  });
}

catalogRouter.get(
  '/teachers',
  asyncHandler(async (req, res) => {
    const { UserModel } = await import('../models/index.js');
    const q = String(req.query.q ?? '').trim();
    const subject = String(req.query.subject ?? '').trim().toLowerCase();
    const exam = String(req.query.exam ?? '').trim().toLowerCase();
    const language = String(req.query.language ?? '').trim().toLowerCase();
    const minRating = Number(req.query.minRating ?? 0);
    const sort = String(req.query.sort ?? 'featured');
    const { skip, limit, page } = paginate(Number(req.query.page ?? 1), Number(req.query.limit ?? 12));

    const teachers = await UserModel.find({ role: 'teacher', teacherStatus: 'approved', status: 'active' })
      .select('name headline bio avatar createdAt')
      .limit(100)
      .lean();
    const courses = await CourseModel.find({
      teachers: { $in: teachers.map((t) => t._id) },
      status: 'published',
    })
      .select('teachers category subjects targetExam language ratingAvg ratingCount enrollmentCount')
      .lean();

    let items = enrichTeachers(teachers, courses);
    const unfiltered = items;
    const facets = {
      subjects: facetCount(unfiltered.flatMap((t) => t.subjects)),
      exams: facetCount(unfiltered.flatMap((t) => t.exams)),
      languages: facetCount(unfiltered.flatMap((t) => t.languages)),
      categories: facetCount(unfiltered.flatMap((t) => t.categories)),
    };
    const ratedAll = unfiltered.filter((t) => t.ratingCount > 0);
    const stats = {
      teachers: unfiltered.length,
      enrollments: unfiltered.reduce((n, t) => n + t.enrollmentCount, 0),
      subjects: new Set(unfiltered.flatMap((t) => t.subjects)).size,
      ratingAvg: ratedAll.length ? ratedAll.reduce((n, t) => n + t.ratingAvg, 0) / ratedAll.length : 0,
      ratingCount: unfiltered.reduce((n, t) => n + t.ratingCount, 0),
      courses: unfiltered.reduce((n, t) => n + t.courseCount, 0),
    };

    if (q) {
      const rx = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      items = items.filter(
        (t) =>
          rx.test(t.name) ||
          rx.test(t.headline ?? '') ||
          rx.test(t.bio ?? '') ||
          t.subjects.some((s) => rx.test(s)) ||
          t.exams.some((s) => rx.test(s)),
      );
    }
    if (subject) {
      items = items.filter(
        (t) =>
          t.subjects.some((s) => s.toLowerCase() === subject) ||
          t.categories.some((s) => s.toLowerCase() === subject),
      );
    }
    if (exam) items = items.filter((t) => t.exams.some((s) => s.toLowerCase() === exam));
    if (language) items = items.filter((t) => t.languages.some((s) => s.toLowerCase() === language));
    if (minRating > 0) items = items.filter((t) => t.ratingAvg >= minRating);

    const featured = [...unfiltered]
      .sort((a, b) => b.ratingAvg - a.ratingAvg || b.enrollmentCount - a.enrollmentCount || a.name.localeCompare(b.name))
      .slice(0, 6);

    items.sort((a, b) => {
      if (sort === 'students') return b.enrollmentCount - a.enrollmentCount || a.name.localeCompare(b.name);
      if (sort === 'courses') return b.courseCount - a.courseCount || a.name.localeCompare(b.name);
      if (sort === 'name') return a.name.localeCompare(b.name);
      if (sort === 'new') return new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime();
      return b.ratingAvg - a.ratingAvg || b.enrollmentCount - a.enrollmentCount || a.name.localeCompare(b.name);
    });

    const total = items.length;
    const pageItems = items.slice(skip, skip + limit);
    res.json({ ...paginatedResult(pageItems, total, page, limit), stats, facets, featured });
  }),
);

catalogRouter.get(
  '/teachers/:id',
  asyncHandler(async (req, res) => {
    if (!/^[a-f\d]{24}$/i.test(String(req.params.id))) throw notFound('Teacher not found');
    const { UserModel, CourseModel, BatchModel, ReviewModel } = await import('../models/index.js');
    const teacher = await UserModel.findOne({
      _id: req.params.id,
      role: 'teacher',
      teacherStatus: 'approved',
      status: 'active',
    })
      .select('name headline bio avatar createdAt')
      .lean();
    if (!teacher) throw notFound('Teacher not found');
    const courses = await CourseModel.find({ teachers: teacher._id, status: 'published' })
      .select('teachers title slug price pricingType discountPercent ratingAvg ratingCount enrollmentCount subtitle category subjects targetExam language thumbnail')
      .lean();
    const batches = await BatchModel.find({ teachers: teacher._id, status: { $in: ['upcoming', 'open', 'ongoing'] } })
      .select('name slug price status startDate')
      .lean();
    const reviews = await ReviewModel.find({ course: { $in: courses.map((c) => c._id) }, hidden: false })
      .populate('user', 'name')
      .populate('course', 'title slug')
      .select('rating body title verified createdAt')
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();
    const [enriched] = enrichTeachers([teacher], courses);
    res.json({ teacher: { ...teacher, ...enriched }, courses, batches, reviews });
  }),
);

catalogRouter.get(
  '/search',
  asyncHandler(async (req, res) => {
    const q = String(req.query.q ?? '').trim();
    if (q.length < 2) return res.json({ courses: [], batches: [], teachers: [], blogs: [], career: [] });
    const rx = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    const { UserModel, BlogModel, CareerArticleModel } = await import('../models/index.js');
    const [courses, batches, teachers, blogs, career] = await Promise.all([
      CourseModel.find({ status: 'published', $or: [{ title: rx }, { subtitle: rx }, { category: rx }] })
        .select('title slug pricingType price')
        .limit(6)
        .lean(),
      BatchModel.find({ status: { $in: ['upcoming', 'open', 'ongoing'] }, name: rx })
        .select('name slug price status')
        .limit(5)
        .lean(),
      UserModel.find({ role: 'teacher', teacherStatus: 'approved', status: 'active', name: rx })
        .select('name headline')
        .limit(5)
        .lean(),
      BlogModel.find({ published: true, $or: [{ title: rx }, { excerpt: rx }] })
        .select('title slug')
        .limit(4)
        .lean(),
      CareerArticleModel.find({ published: true, $or: [{ title: rx }, { excerpt: rx }] })
        .select('title slug')
        .limit(4)
        .lean(),
    ]);
    res.json({ courses, batches, teachers, blogs, career });
  }),
);
