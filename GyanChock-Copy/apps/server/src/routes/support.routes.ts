import { Router } from 'express';
import { z } from 'zod';
import { doubtCreateSchema } from '@gyan-chowk/shared';
import { authenticate, requireRoles, teacherOrAdmin, type AuthedRequest } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/error.js';
import { validate } from '../middleware/validate.js';
import {
  AttendanceModel,
  AttendanceSessionModel,
  CalendarEventModel,
  DoubtMessageModel,
  DoubtModel,
  EnrollmentModel,
  MentorModel,
  MentorshipModel,
} from '../models/index.js';
import { notify } from '../services/notification.service.js';
import { forbidden, notFound } from '../utils/errors.js';
import { paginate, paginatedResult } from '../utils/helpers.js';

export const doubtRouter = Router();
export const mentorshipRouter = Router();
export const attendanceRouter = Router();

doubtRouter.post(
  '/',
  authenticate,
  requireRoles('student'),
  validate(doubtCreateSchema),
  asyncHandler(async (req: AuthedRequest, res) => {
    const doubt = await DoubtModel.create({
      title: req.body.title,
      body: req.body.body,
      student: req.user!.id,
      course: req.body.courseId,
      batch: req.body.batchId,
      subject: req.body.subjectId,
      chapter: req.body.chapterId,
      image: req.body.imagePublicId ? { publicId: req.body.imagePublicId } : undefined,
      status: 'pending',
    });
    await DoubtMessageModel.create({
      doubt: doubt._id,
      author: req.user!.id,
      role: 'student',
      body: req.body.body,
    });
    res.status(201).json({ doubt });
  }),
);

doubtRouter.get(
  '/',
  authenticate,
  asyncHandler(async (req: AuthedRequest, res) => {
    const { skip, limit, page } = paginate(Number(req.query.page ?? 1), Number(req.query.limit ?? 20));
    const filter: Record<string, unknown> = {};
    if (req.user!.role === 'student') filter.student = req.user!.id;
    if (req.user!.role === 'teacher') filter.assignedTo = req.user!.id;
    if (req.query.status) filter.status = req.query.status;
    const [items, total] = await Promise.all([
      DoubtModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      DoubtModel.countDocuments(filter),
    ]);
    res.json(paginatedResult(items, total, page, limit));
  }),
);

doubtRouter.get(
  '/:id',
  authenticate,
  asyncHandler(async (req: AuthedRequest, res) => {
    const doubt = await DoubtModel.findById(req.params.id).lean();
    if (!doubt) throw notFound('Doubt not found');
    if (req.user!.role === 'student' && String(doubt.student) !== req.user!.id) throw forbidden();
    const messages = await DoubtMessageModel.find({ doubt: doubt._id }).sort({ createdAt: 1 }).lean();
    res.json({ doubt, messages });
  }),
);

doubtRouter.post(
  '/:id/messages',
  authenticate,
  validate(z.object({ body: z.string().min(1), imagePublicId: z.string().optional() })),
  asyncHandler(async (req: AuthedRequest, res) => {
    const doubt = await DoubtModel.findById(req.params.id);
    if (!doubt) throw notFound('Doubt not found');
    const isOwner = String(doubt.student) === req.user!.id;
    const isAssignee = String(doubt.assignedTo ?? '') === req.user!.id;
    if (!isOwner && !isAssignee && req.user!.role !== 'admin') throw forbidden();
    const message = await DoubtMessageModel.create({
      doubt: doubt._id,
      author: req.user!.id,
      role: req.user!.role,
      body: req.body.body,
      image: req.body.imagePublicId ? { publicId: req.body.imagePublicId } : undefined,
    });
    if (req.user!.role === 'teacher') {
      if (!doubt.firstResponseAt) doubt.firstResponseAt = new Date();
      doubt.status = 'answered';
      await doubt.save();
      await notify({
        userId: String(doubt.student),
        title: 'Your doubt was answered',
        body: doubt.title,
        type: 'doubt_answered',
        href: '/student/doubts',
      });
    }
    res.status(201).json({ message });
  }),
);

doubtRouter.post(
  '/:id/assign',
  authenticate,
  teacherOrAdmin,
  validate(z.object({ teacherId: z.string() })),
  asyncHandler(async (req, res) => {
    const doubt = await DoubtModel.findByIdAndUpdate(
      req.params.id,
      { assignedTo: req.body.teacherId, status: 'assigned' },
      { new: true },
    );
    res.json({ doubt });
  }),
);

doubtRouter.post(
  '/:id/status',
  authenticate,
  validate(z.object({ status: z.enum(['pending', 'assigned', 'in_progress', 'answered', 'closed']) })),
  asyncHandler(async (req: AuthedRequest, res) => {
    const doubt = await DoubtModel.findById(req.params.id);
    if (!doubt) throw notFound('Doubt not found');
    if (req.user!.role === 'student' && String(doubt.student) !== req.user!.id) throw forbidden();
    doubt.status = req.body.status;
    if (req.body.status === 'closed') doubt.closedAt = new Date();
    await doubt.save();
    res.json({ doubt });
  }),
);

mentorshipRouter.get(
  '/mentors',
  authenticate,
  asyncHandler(async (_req, res) => {
    const items = await MentorModel.find({ active: true }).populate('user', 'name headline avatar bio').lean();
    res.json({ items });
  }),
);

mentorshipRouter.post(
  '/mentors',
  authenticate,
  teacherOrAdmin,
  validate(z.object({ specialties: z.array(z.string()).optional(), bio: z.string().optional(), capacity: z.number().optional() })),
  asyncHandler(async (req: AuthedRequest, res) => {
    const mentor = await MentorModel.findOneAndUpdate(
      { user: req.user!.id },
      { $set: { ...req.body, user: req.user!.id, active: true } },
      { upsert: true, new: true },
    );
    res.json({ mentor });
  }),
);

mentorshipRouter.post(
  '/assign',
  authenticate,
  teacherOrAdmin,
  validate(z.object({ mentorId: z.string(), studentId: z.string() })),
  asyncHandler(async (req, res) => {
    const m = await MentorshipModel.findOneAndUpdate(
      { mentor: req.body.mentorId, student: req.body.studentId },
      { $setOnInsert: { mentor: req.body.mentorId, student: req.body.studentId, status: 'active' } },
      { upsert: true, new: true },
    );
    res.json({ mentorship: m });
  }),
);

mentorshipRouter.get(
  '/mine',
  authenticate,
  asyncHandler(async (req: AuthedRequest, res) => {
    const filter = req.user!.role === 'student' ? { student: req.user!.id } : { mentor: req.user!.id };
    const items = await MentorshipModel.find(filter)
      .populate('mentor', 'name headline avatar')
      .populate('student', 'name email')
      .lean();
    res.json({ items });
  }),
);

mentorshipRouter.get(
  '/:id',
  authenticate,
  asyncHandler(async (req: AuthedRequest, res) => {
    const item = await MentorshipModel.findById(req.params.id)
      .populate('mentor', 'name headline avatar bio')
      .populate('student', 'name email')
      .lean();
    if (!item) throw notFound('Mentorship not found');
    const uid = req.user!.id;
    const mentorId = String((item.mentor as { _id?: unknown })?._id ?? item.mentor);
    const studentId = String((item.student as { _id?: unknown })?._id ?? item.student);
    if (![mentorId, studentId].includes(uid) && req.user!.role !== 'admin') throw forbidden();
    res.json({ mentorship: item });
  }),
);

mentorshipRouter.post(
  '/:id/message',
  authenticate,
  validate(z.object({ body: z.string().min(1) })),
  asyncHandler(async (req: AuthedRequest, res) => {
    const m = await MentorshipModel.findById(req.params.id);
    if (!m) throw notFound('Mentorship not found');
    if (![String(m.mentor), String(m.student)].includes(req.user!.id) && req.user!.role !== 'admin') throw forbidden();
    m.messages.push({ author: req.user!.id, body: req.body.body, createdAt: new Date() });
    await m.save();
    res.json({ mentorship: m });
  }),
);

mentorshipRouter.post(
  '/:id/goals',
  authenticate,
  validate(z.object({ title: z.string() })),
  asyncHandler(async (req: AuthedRequest, res) => {
    const m = await MentorshipModel.findByIdAndUpdate(
      req.params.id,
      { $push: { goals: { title: req.body.title, done: false } } },
      { new: true },
    );
    res.json({ mentorship: m });
  }),
);

mentorshipRouter.post(
  '/:id/meetings',
  authenticate,
  validate(z.object({ startsAt: z.coerce.date(), endsAt: z.coerce.date().optional(), agenda: z.string().optional() })),
  asyncHandler(async (req: AuthedRequest, res) => {
    const m = await MentorshipModel.findByIdAndUpdate(
      req.params.id,
      { $push: { meetings: { ...req.body, status: 'scheduled' } } },
      { new: true },
    );
    if (m) {
      await CalendarEventModel.create({
        title: 'Mentorship meeting',
        type: 'mentorship',
        user: m.student,
        startsAt: req.body.startsAt,
        endsAt: req.body.endsAt,
        refId: m._id,
        refModel: 'Mentorship',
      });
    }
    res.json({ mentorship: m });
  }),
);

attendanceRouter.post(
  '/sessions',
  authenticate,
  teacherOrAdmin,
  validate(z.object({ batch: z.string(), title: z.string(), scheduledAt: z.coerce.date(), notes: z.string().optional() })),
  asyncHandler(async (req: AuthedRequest, res) => {
    const session = await AttendanceSessionModel.create({ ...req.body, teacher: req.user!.id });
    await CalendarEventModel.create({
      title: session.title,
      type: 'attendance',
      batch: session.batch,
      startsAt: session.scheduledAt,
      refId: session._id,
      refModel: 'AttendanceSession',
    });
    res.status(201).json({ session });
  }),
);

attendanceRouter.post(
  '/sessions/:id/mark',
  authenticate,
  teacherOrAdmin,
  validate(
    z.object({
      marks: z.array(z.object({ studentId: z.string(), mark: z.enum(['present', 'absent', 'late', 'excused']) })),
    }),
  ),
  asyncHandler(async (req: AuthedRequest, res) => {
    const session = await AttendanceSessionModel.findById(req.params.id);
    if (!session) throw notFound('Session not found');
    const ops = req.body.marks.map((m: { studentId: string; mark: string }) => ({
      updateOne: {
        filter: { session: session._id, student: m.studentId },
        update: {
          $set: { mark: m.mark, batch: session.batch, markedBy: req.user!.id },
        },
        upsert: true,
      },
    }));
    await AttendanceModel.bulkWrite(ops);
    res.json({ ok: true });
  }),
);

attendanceRouter.get(
  '/sessions',
  authenticate,
  teacherOrAdmin,
  asyncHandler(async (req, res) => {
    const filter: Record<string, unknown> = {};
    if (req.query.batch) filter.batch = req.query.batch;
    const items = await AttendanceSessionModel.find(filter).sort({ scheduledAt: -1 }).limit(50).lean();
    res.json({ items });
  }),
);

attendanceRouter.get(
  '/me',
  authenticate,
  requireRoles('student'),
  asyncHandler(async (req: AuthedRequest, res) => {
    const items = await AttendanceModel.find({ student: req.user!.id }).populate('session').sort({ createdAt: -1 }).lean();
    const present = items.filter((i) => i.mark === 'present' || i.mark === 'late').length;
    const percent = items.length ? Math.round((present / items.length) * 100) : 0;
    res.json({ items, percent, present, total: items.length });
  }),
);

attendanceRouter.get(
  '/reports',
  authenticate,
  teacherOrAdmin,
  asyncHandler(async (req, res) => {
    const batch = String(req.query.batch ?? '');
    const enrollments = await EnrollmentModel.find({ batch, status: 'active' }).select('user').lean();
    const stats = await AttendanceModel.aggregate([
      { $match: { batch: enrollments[0] ? enrollments[0].batch : undefined } },
      { $group: { _id: '$student', present: { $sum: { $cond: [{ $eq: ['$mark', 'present'] }, 1, 0] } }, total: { $sum: 1 } } },
    ]);
    res.json({ stats, enrolled: enrollments.length });
  }),
);
