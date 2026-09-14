import { Router } from 'express';
import { z } from 'zod';
import { createOrderSchema, razorpayVerifySchema } from '@gyan-chowk/shared';
import { env } from '../config/env.js';
import { authenticate, requirePermissions, requireRoles, type AuthedRequest } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/error.js';
import { validate } from '../middleware/validate.js';
import { audit } from '../middleware/audit.js';
import { OrderModel, PaymentModel, RefundModel, CouponModel, OfferModel } from '../models/index.js';
import {
  createOrder,
  enrollFree,
  handleWebhook,
  refundPayment,
  verifyCheckout,
  verifyWebhookSignature,
} from '../services/payment.service.js';
import { paginate, paginatedResult } from '../utils/helpers.js';

export const paymentRouter = Router();
export const webhookRouter = Router();

paymentRouter.post(
  '/orders',
  authenticate,
  requireRoles('student'),
  validate(createOrderSchema),
  asyncHandler(async (req: AuthedRequest, res) => {
    const result = await createOrder(req.user!.id, req.body);
    res.status(201).json(result);
  }),
);

paymentRouter.post(
  '/verify',
  authenticate,
  requireRoles('student'),
  validate(razorpayVerifySchema),
  asyncHandler(async (req: AuthedRequest, res) => {
    const result = await verifyCheckout(req.user!.id, req.body);
    res.json(result);
  }),
);

paymentRouter.post(
  '/enroll-free',
  authenticate,
  requireRoles('student'),
  validate(z.object({ productType: z.enum(['course', 'batch']), productId: z.string() })),
  asyncHandler(async (req: AuthedRequest, res) => {
    await enrollFree(req.user!.id, req.body.productType, req.body.productId);
    res.json({ ok: true });
  }),
);

paymentRouter.get(
  '/history',
  authenticate,
  asyncHandler(async (req: AuthedRequest, res) => {
    const { skip, limit, page } = paginate(Number(req.query.page ?? 1), Number(req.query.limit ?? 20));
    const filter = req.user!.role === 'admin' ? {} : { user: req.user!.id };
    const [items, total] = await Promise.all([
      OrderModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      OrderModel.countDocuments(filter),
    ]);
    res.json(paginatedResult(items, total, page, limit));
  }),
);

paymentRouter.get(
  '/invoices/:orderId',
  authenticate,
  asyncHandler(async (req: AuthedRequest, res) => {
    const order = await OrderModel.findById(req.params.orderId).lean();
    const payment = await PaymentModel.findOne({ order: req.params.orderId }).lean();
    res.json({ order, payment, merchant: 'Gyan Chowk' });
  }),
);

paymentRouter.post(
  '/refunds/:paymentId',
  authenticate,
  requireRoles('admin'),
  requirePermissions('refunds.manage'),
  validate(z.object({ reason: z.string().min(3) })),
  audit('payment.refunded', 'Payment'),
  asyncHandler(async (req: AuthedRequest, res) => {
    const refund = await refundPayment(req.user!.id, req.params.paymentId!, req.body.reason);
    res.json({ refund });
  }),
);

paymentRouter.get(
  '/refunds',
  authenticate,
  requireRoles('admin'),
  asyncHandler(async (_req, res) => {
    const items = await RefundModel.find().sort({ createdAt: -1 }).limit(100).lean();
    res.json({ items });
  }),
);

paymentRouter.get(
  '/coupons',
  authenticate,
  requireRoles('admin'),
  asyncHandler(async (_req, res) => {
    const items = await CouponModel.find().sort({ createdAt: -1 }).lean();
    res.json({ items });
  }),
);

paymentRouter.post(
  '/coupons',
  authenticate,
  requireRoles('admin'),
  asyncHandler(async (req, res) => {
    const coupon = await CouponModel.create({ ...req.body, code: String(req.body.code).toUpperCase() });
    res.status(201).json({ coupon });
  }),
);

paymentRouter.get('/offers/public', asyncHandler(async (_req, res) => {
  const items = await OfferModel.find({ active: true }).populate('coupon').lean();
  res.json({ items });
}));

webhookRouter.post(
  '/razorpay',
  asyncHandler(async (req, res) => {
    const raw = (req as typeof req & { rawBody?: string }).rawBody ?? JSON.stringify(req.body);
    verifyWebhookSignature(raw, req.header('x-razorpay-signature') ?? undefined);
    await handleWebhook(req.body);
    res.json({ ok: true });
    void env;
  }),
);
