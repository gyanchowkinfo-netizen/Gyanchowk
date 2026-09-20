import { Router } from 'express';
import { z } from 'zod';
import { createOrderSchema, razorpayVerifySchema, stripeVerifySchema } from '@gyan-chowk/shared';
import { env } from '../config/env.js';
import { authenticate, requirePermissions, requireRoles, type AuthedRequest } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/error.js';
import { validate } from '../middleware/validate.js';
import { audit } from '../middleware/audit.js';
import { OrderModel, PaymentModel, RefundModel, CouponModel, OfferModel } from '../models/index.js';
import {
  createOrder,
  enrollFree,
  handleStripeWebhook,
  handleWebhook,
  refundPayment,
  verifyCheckout,
  verifyStripeCheckout,
  verifyStripeWebhookSignature,
  verifyWebhookSignature,
  fulfillStripeSession,
} from '../services/payment.service.js';
import { invoicePdf, PDF_CONTENT_TYPE } from '../services/pdf.service.js';
import { CourseModel, BatchModel, UserModel } from '../models/index.js';
import { forbidden, notFound } from '../utils/errors.js';
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
  '/verify-stripe',
  authenticate,
  requireRoles('student'),
  validate(stripeVerifySchema),
  asyncHandler(async (req: AuthedRequest, res) => {
    const result = await verifyStripeCheckout(req.user!.id, req.body);
    res.json(result);
  }),
);

paymentRouter.post(
  '/verify-stripe-session',
  authenticate,
  requireRoles('student'),
  validate(z.object({ sessionId: z.string().min(1) })),
  asyncHandler(async (req: AuthedRequest, res) => {
    const result = await fulfillStripeSession(req.body.sessionId);
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
    if (!order) throw notFound('Order not found');
    if (req.user!.role !== 'admin' && String(order.user) !== req.user!.id) throw forbidden('Not your invoice');
    const payment = await PaymentModel.findOne({ order: req.params.orderId }).lean();
    res.json({ order, payment, merchant: 'Gyan Chowk' });
  }),
);

paymentRouter.get(
  '/invoices/:orderId/pdf',
  authenticate,
  asyncHandler(async (req: AuthedRequest, res) => {
    const order = await OrderModel.findById(req.params.orderId).lean();
    if (!order) throw notFound('Order not found');
    if (req.user!.role !== 'admin' && String(order.user) !== req.user!.id) throw forbidden('Not your invoice');
    const payment = await PaymentModel.findOne({ order: order._id }).lean();
    const user = await UserModel.findById(order.user).select('name email').lean();
    const product =
      order.productType === 'course'
        ? await CourseModel.findById(order.productId).select('title').lean()
        : await BatchModel.findById(order.productId).select('name').lean();
    const buf = await invoicePdf({
      invoiceNumber: payment?.invoiceNumber ?? `ORD-${order._id}`,
      studentName: user?.name ?? 'Student',
      studentEmail: user?.email ?? '',
      productLabel:
        product && 'title' in product ? String(product.title) : product && 'name' in product ? String(product.name) : 'Enrollment',
      amountPaise: order.payablePaise,
      gateway: String(order.gateway ?? 'razorpay'),
      issuedAt: payment ? new Date(payment.createdAt as Date) : new Date(order.createdAt as Date),
    });
    res.setHeader('Content-Type', PDF_CONTENT_TYPE);
    res.setHeader('Content-Disposition', `attachment; filename="${payment?.invoiceNumber ?? order._id}.pdf"`);
    res.send(buf);
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

paymentRouter.patch(
  '/coupons/:id',
  authenticate,
  requireRoles('admin'),
  asyncHandler(async (req, res) => {
    const coupon = await CouponModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!coupon) throw notFound('Coupon not found');
    res.json({ coupon });
  }),
);

paymentRouter.post(
  '/coupons/:id/deactivate',
  authenticate,
  requireRoles('admin'),
  asyncHandler(async (req, res) => {
    const coupon = await CouponModel.findByIdAndUpdate(req.params.id, { active: false }, { new: true });
    if (!coupon) throw notFound('Coupon not found');
    res.json({ coupon });
  }),
);

paymentRouter.get(
  '/offers',
  authenticate,
  requireRoles('admin'),
  asyncHandler(async (_req, res) => {
    const items = await OfferModel.find().sort({ createdAt: -1 }).populate('coupon').lean();
    res.json({ items });
  }),
);

paymentRouter.post(
  '/offers',
  authenticate,
  requireRoles('admin'),
  asyncHandler(async (req, res) => {
    const offer = await OfferModel.create(req.body);
    res.status(201).json({ offer });
  }),
);

paymentRouter.patch(
  '/offers/:id',
  authenticate,
  requireRoles('admin'),
  asyncHandler(async (req, res) => {
    const offer = await OfferModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!offer) throw notFound('Offer not found');
    res.json({ offer });
  }),
);

paymentRouter.get(
  '/orders/:id',
  authenticate,
  requireRoles('admin'),
  asyncHandler(async (req, res) => {
    const order = await OrderModel.findById(req.params.id).lean();
    if (!order) throw notFound('Order not found');
    const payment = await PaymentModel.findOne({ order: order._id }).lean();
    const refunds = await RefundModel.find({ order: order._id }).lean();
    res.json({ order, payment, refunds });
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

webhookRouter.post(
  '/stripe',
  asyncHandler(async (req, res) => {
    const raw = (req as typeof req & { rawBody?: string }).rawBody ?? JSON.stringify(req.body);
    const event = verifyStripeWebhookSignature(raw, req.header('stripe-signature') ?? undefined);
    await handleStripeWebhook(event);
    res.json({ ok: true });
  }),
);
