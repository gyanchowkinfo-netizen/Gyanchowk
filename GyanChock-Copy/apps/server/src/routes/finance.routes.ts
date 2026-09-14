import mongoose from 'mongoose';
import { Router } from 'express';
import { z } from 'zod';
import { authenticate, requireRoles, type AuthedRequest } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/error.js';
import { validate } from '../middleware/validate.js';
import {
  NotificationModel,
  NotificationPreferenceModel,
  ReferralModel,
  ReviewModel,
  TeacherEarningModel,
  TeacherPayoutModel,
  WalletModel,
  WalletTransactionModel,
  CourseModel,
} from '../models/index.js';
import { applyWalletTx, getOrCreateWallet } from '../services/wallet.service.js';
import { env } from '../config/env.js';
import { hasActiveEnrollment } from '../services/enrollment.service.js';
import { badRequest, forbidden } from '../utils/errors.js';
import { writeAudit } from '../middleware/audit.js';
import { notify } from '../services/notification.service.js';
import { paginate, paginatedResult } from '../utils/helpers.js';

export const walletRouter = Router();
export const referralRouter = Router();
export const reviewRouter = Router();
export const payoutRouter = Router();
export const notificationRouter = Router();

walletRouter.get(
  '/',
  authenticate,
  asyncHandler(async (req: AuthedRequest, res) => {
    const wallet = await getOrCreateWallet(req.user!.id);
    const { skip, limit, page } = paginate(Number(req.query.page ?? 1), 20);
    const [items, total] = await Promise.all([
      WalletTransactionModel.find({ user: req.user!.id }).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      WalletTransactionModel.countDocuments({ user: req.user!.id }),
    ]);
    res.json({ wallet, transactions: paginatedResult(items, total, page, limit) });
  }),
);

walletRouter.post(
  '/credit',
  authenticate,
  requireRoles('admin'),
  validate(z.object({ userId: z.string(), amountPaise: z.number().int().positive(), type: z.enum(['credit_promo', 'credit_cashback']), reference: z.string().optional() })),
  asyncHandler(async (req, res) => {
    const tx = await applyWalletTx(req.body);
    res.json({ tx });
  }),
);

referralRouter.get(
  '/',
  authenticate,
  asyncHandler(async (req: AuthedRequest, res) => {
    const items = await ReferralModel.find({ referrer: req.user!.id }).populate('referee', 'name email createdAt').lean();
    res.json({ items });
  }),
);

reviewRouter.get(
  '/course/:courseId',
  asyncHandler(async (req, res) => {
    const items = await ReviewModel.find({ course: req.params.courseId, hidden: false })
      .populate('user', 'name')
      .sort({ createdAt: -1 })
      .lean();
    res.json({ items });
  }),
);

reviewRouter.post(
  '/course/:courseId',
  authenticate,
  requireRoles('student'),
  validate(z.object({ rating: z.number().int().min(1).max(5), title: z.string().optional(), body: z.string().min(8) })),
  asyncHandler(async (req: AuthedRequest, res) => {
    const enrolled = await hasActiveEnrollment(req.user!.id, { courseId: req.params.courseId });
    if (!enrolled) throw forbidden('Only enrolled students can review');
    const review = await ReviewModel.findOneAndUpdate(
      { user: req.user!.id, course: req.params.courseId },
      { $set: { ...req.body, verified: true } },
      { upsert: true, new: true },
    );
    const agg = await ReviewModel.aggregate([
      { $match: { course: review.course, hidden: false } },
      { $group: { _id: '$course', avg: { $avg: '$rating' }, count: { $sum: 1 } } },
    ]);
    if (agg[0]) {
      await CourseModel.updateOne({ _id: req.params.courseId }, { ratingAvg: agg[0].avg, ratingCount: agg[0].count });
    }
    res.json({ review });
  }),
);

reviewRouter.delete(
  '/:id',
  authenticate,
  asyncHandler(async (req: AuthedRequest, res) => {
    const review = await ReviewModel.findById(req.params.id);
    if (!review) return res.json({ ok: true });
    if (req.user!.role !== 'admin' && String(review.user) !== req.user!.id) throw forbidden();
    if (req.user!.role === 'admin') {
      review.hidden = true;
      await review.save();
    } else {
      await review.deleteOne();
    }
    res.json({ ok: true });
  }),
);

payoutRouter.get(
  '/earnings',
  authenticate,
  requireRoles('teacher', 'admin'),
  asyncHandler(async (req: AuthedRequest, res) => {
    const teacher = req.user!.role === 'admin' && req.query.teacher ? String(req.query.teacher) : req.user!.id;
    const teacherOid = new mongoose.Types.ObjectId(teacher);
    const items = await TeacherEarningModel.find({ teacher: teacherOid }).sort({ createdAt: -1 }).limit(100).lean();
    const summary = await TeacherEarningModel.aggregate([
      { $match: { teacher: teacherOid } },
      {
        $group: {
          _id: '$status',
          total: { $sum: '$netPaise' },
        },
      },
    ]);
    res.json({ items, summary, commissionPercent: env.PLATFORM_COMMISSION_PERCENT });
  }),
);

payoutRouter.post(
  '/request',
  authenticate,
  requireRoles('teacher'),
  validate(z.object({ amountPaise: z.number().int().positive(), note: z.string().optional() })),
  asyncHandler(async (req: AuthedRequest, res) => {
    const available = await TeacherEarningModel.aggregate([
      { $match: { teacher: req.user!.id, status: 'available' } },
      { $group: { _id: null, total: { $sum: '$netPaise' } } },
    ]);
    const pending = await TeacherPayoutModel.aggregate([
      { $match: { teacher: req.user!.id, status: { $in: ['requested', 'approved', 'processing'] } } },
      { $group: { _id: null, total: { $sum: '$amountPaise' } } },
    ]);
    const avail = (available[0]?.total ?? 0) - (pending[0]?.total ?? 0);
    if (req.body.amountPaise > avail) throw badRequest('Insufficient available balance');
    const payout = await TeacherPayoutModel.create({
      teacher: req.user!.id,
      amountPaise: req.body.amountPaise,
      note: req.body.note,
    });
    res.status(201).json({ payout });
  }),
);

payoutRouter.post(
  '/:id/decision',
  authenticate,
  requireRoles('admin'),
  validate(z.object({ status: z.enum(['approved', 'rejected', 'processing', 'paid', 'failed']), adminNote: z.string().optional() })),
  asyncHandler(async (req: AuthedRequest, res) => {
    const payout = await TeacherPayoutModel.findById(req.params.id);
    if (!payout) throw badRequest('Payout not found');
    payout.status = req.body.status;
    payout.adminNote = req.body.adminNote;
    payout.processedBy = new mongoose.Types.ObjectId(req.user!.id);
    payout.processedAt = new Date();
    await payout.save();
    if (req.body.status === 'paid') {
      await TeacherEarningModel.updateMany(
        { teacher: payout.teacher, status: 'available' },
        { $set: { status: 'paid' } },
      );
    }
    await writeAudit({
      actor: req.user!.id,
      role: 'admin',
      action: `payout.${req.body.status}`,
      entity: 'TeacherPayout',
      entityId: String(payout._id),
    });
    await notify({
      userId: String(payout.teacher),
      title: `Payout ${req.body.status}`,
      type: 'payout_status',
    });
    res.json({ payout });
  }),
);

payoutRouter.get(
  '/',
  authenticate,
  requireRoles('teacher', 'admin'),
  asyncHandler(async (req: AuthedRequest, res) => {
    const filter = req.user!.role === 'admin' ? {} : { teacher: req.user!.id };
    const items = await TeacherPayoutModel.find(filter).sort({ createdAt: -1 }).lean();
    res.json({ items });
  }),
);

notificationRouter.get(
  '/',
  authenticate,
  asyncHandler(async (req: AuthedRequest, res) => {
    const items = await NotificationModel.find({ user: req.user!.id }).sort({ createdAt: -1 }).limit(50).lean();
    res.json({ items });
  }),
);

notificationRouter.post(
  '/read',
  authenticate,
  asyncHandler(async (req: AuthedRequest, res) => {
    await NotificationModel.updateMany({ user: req.user!.id, readAt: { $exists: false } }, { readAt: new Date() });
    res.json({ ok: true });
  }),
);

notificationRouter.get(
  '/preferences',
  authenticate,
  asyncHandler(async (req: AuthedRequest, res) => {
    const prefs =
      (await NotificationPreferenceModel.findOne({ user: req.user!.id })) ??
      (await NotificationPreferenceModel.create({ user: req.user!.id }));
    res.json({ prefs });
  }),
);

notificationRouter.patch(
  '/preferences',
  authenticate,
  asyncHandler(async (req: AuthedRequest, res) => {
    const prefs = await NotificationPreferenceModel.findOneAndUpdate(
      { user: req.user!.id },
      { $set: req.body },
      { upsert: true, new: true },
    );
    res.json({ prefs });
  }),
);
