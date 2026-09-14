import crypto from 'node:crypto';
import mongoose from 'mongoose';
import { createOrderSchema, razorpayVerifySchema } from '@gyan-chowk/shared';
import { env } from '../config/env.js';
import { getRazorpay, isRazorpayConfigured } from '../config/razorpay.js';
import {
  BatchModel,
  CouponModel,
  CourseModel,
  OrderModel,
  PaymentModel,
  ReferralModel,
  RefundModel,
  TeacherEarningModel,
} from '../models/index.js';
import { badRequest, conflict, forbidden, notFound } from '../utils/errors.js';
import { applyDiscount, rupeesToPaise } from '../utils/helpers.js';
import { createEnrollment, hasActiveEnrollment } from './enrollment.service.js';
import { applyWalletTx } from './wallet.service.js';
import { notify } from './notification.service.js';
import { writeAudit } from '../middleware/audit.js';

function productPrice(product: {
  price: number;
  discountPercent?: number;
  pricingType?: string;
}): { rupees: number; paise: number } {
  if (product.pricingType === 'free') return { rupees: 0, paise: 0 };
  const rupees = applyDiscount(product.price ?? 0, product.discountPercent ?? 0);
  return { rupees, paise: rupeesToPaise(rupees) };
}

async function applyCoupon(code: string | undefined, userId: string, amountPaise: number, productId: string, productType: string) {
  if (!code) return { discountPaise: 0, coupon: null as null | { _id: mongoose.Types.ObjectId; code: string } };
  const coupon = await CouponModel.findOne({ code: code.toUpperCase(), active: true });
  if (!coupon) throw badRequest('Invalid coupon');
  const now = new Date();
  if (coupon.startsAt && coupon.startsAt > now) throw badRequest('Coupon is not active yet');
  if (coupon.endsAt && coupon.endsAt < now) throw badRequest('Coupon has expired');
  if (coupon.minAmount && amountPaise < rupeesToPaise(coupon.minAmount)) {
    throw badRequest('Order does not meet coupon minimum');
  }
  if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) throw badRequest('Coupon usage limit reached');
  if (coupon.applicableTo !== 'all' && coupon.applicableTo !== productType) {
    throw badRequest('Coupon is not valid for this product');
  }
  if (coupon.productIds?.length && !coupon.productIds.some((id) => String(id) === productId)) {
    throw badRequest('Coupon is not valid for this product');
  }
  const usedByUser = await OrderModel.countDocuments({
    user: userId,
    coupon: coupon._id,
    status: { $in: ['captured', 'authorized'] },
  });
  if (coupon.perUserLimit && usedByUser >= coupon.perUserLimit) {
    throw badRequest('You have already used this coupon');
  }
  let discount =
    coupon.type === 'percent' ? Math.round((amountPaise * coupon.value) / 100) : rupeesToPaise(coupon.value);
  if (coupon.maxDiscount) discount = Math.min(discount, rupeesToPaise(coupon.maxDiscount));
  discount = Math.min(discount, amountPaise);
  return { discountPaise: discount, coupon };
}

export async function createOrder(userId: string, body: unknown) {
  const data = createOrderSchema.parse(body);
  const enrolled = await hasActiveEnrollment(
    userId,
    data.productType === 'course' ? { courseId: data.productId } : { batchId: data.productId },
  );
  if (enrolled) throw conflict('Already enrolled');

  const product =
    data.productType === 'course'
      ? await CourseModel.findById(data.productId)
      : await BatchModel.findById(data.productId);
  if (!product) throw notFound('Product not found');

  const courseLike = product as { status?: string; pricingType?: string; price: number; discountPercent?: number; validityDays?: number };
  if ('status' in product && product.status && !['published', 'open', 'ongoing'].includes(String(product.status))) {
    throw badRequest('This item is not available for purchase');
  }

  const { paise } = productPrice(courseLike);
  if (paise === 0 || courseLike.pricingType === 'free') {
    throw badRequest('Use the free enroll endpoint for free products');
  }

  const couponResult = await applyCoupon(data.couponCode, userId, paise, data.productId, data.productType);
  let walletPaise = 0;
  if (data.walletAmount && data.walletAmount > 0) {
    walletPaise = Math.min(rupeesToPaise(data.walletAmount), paise - couponResult.discountPaise);
  }
  const payablePaise = Math.max(0, paise - couponResult.discountPaise - walletPaise);
  const receipt = `gc_${Date.now()}_${userId.slice(-6)}`;

  const order = await OrderModel.create({
    user: userId,
    productType: data.productType,
    productId: data.productId,
    amountPaise: paise,
    discountPaise: couponResult.discountPaise,
    walletPaise,
    payablePaise,
    coupon: couponResult.coupon?._id,
    couponCode: couponResult.coupon?.code,
    status: payablePaise === 0 ? 'captured' : 'created',
    receipt,
  });

  if (payablePaise === 0) {
    await fulfillOrder(String(order._id));
    return { order, razorpay: null, freeWithWallet: true };
  }

  if (!isRazorpayConfigured()) {
    throw badRequest('Payments are not configured on this server');
  }

  const rzp = await getRazorpay().orders.create({
    amount: payablePaise,
    currency: 'INR',
    receipt,
    notes: { orderId: String(order._id), userId, productType: data.productType, productId: data.productId },
  });
  order.razorpayOrderId = rzp.id;
  await order.save();

  return {
    order,
    razorpay: {
      orderId: rzp.id,
      amount: payablePaise,
      currency: 'INR',
      keyId: env.RAZORPAY_KEY_ID,
    },
  };
}

export async function verifyCheckout(userId: string, body: unknown) {
  const data = razorpayVerifySchema.parse(body);
  const expected = crypto
    .createHmac('sha256', env.RAZORPAY_KEY_SECRET)
    .update(`${data.razorpay_order_id}|${data.razorpay_payment_id}`)
    .digest('hex');
  if (expected !== data.razorpay_signature) {
    throw forbidden('Invalid payment signature');
  }
  const order = await OrderModel.findOne({ razorpayOrderId: data.razorpay_order_id, user: userId });
  if (!order) throw notFound('Order not found');
  if (order.status === 'captured') return { ok: true, alreadyProcessed: true };
  await capturePayment({
    orderId: String(order._id),
    razorpayPaymentId: data.razorpay_payment_id,
    razorpaySignature: data.razorpay_signature,
  });
  return { ok: true };
}

export function verifyWebhookSignature(rawBody: string, signature: string | undefined) {
  if (!env.RAZORPAY_WEBHOOK_SECRET) throw forbidden('Webhook secret missing');
  if (!signature) throw forbidden('Missing webhook signature');
  const expected = crypto
    .createHmac('sha256', env.RAZORPAY_WEBHOOK_SECRET)
    .update(rawBody)
    .digest('hex');
  if (expected !== signature) throw forbidden('Invalid webhook signature');
}

export async function handleWebhook(event: { event?: string; payload?: { payment?: { entity?: Record<string, unknown> } } }) {
  const payment = event.payload?.payment?.entity;
  if (!payment) return { ignored: true };
  const razorpayOrderId = String(payment.order_id ?? '');
  const order = await OrderModel.findOne({ razorpayOrderId });
  if (!order) return { ignored: true };

  if (event.event === 'payment.captured' && order.status !== 'captured') {
    await capturePayment({
      orderId: String(order._id),
      razorpayPaymentId: String(payment.id),
      raw: payment,
    });
  }
  if (event.event === 'payment.failed') {
    order.status = 'failed';
    await order.save();
    await notify({
      userId: String(order.user),
      title: 'Payment failed',
      body: 'Your Gyan Chowk payment could not be completed.',
      type: 'payment_failure',
    });
  }
  return { ok: true };
}

async function capturePayment(input: {
  orderId: string;
  razorpayPaymentId: string;
  razorpaySignature?: string;
  raw?: unknown;
}) {
  const existing = await PaymentModel.findOne({ razorpayPaymentId: input.razorpayPaymentId });
  if (existing) return existing;

  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const order = await OrderModel.findById(input.orderId).session(session);
    if (!order) throw notFound('Order not found');
    if (order.status === 'captured') {
      await session.abortTransaction();
      return existing;
    }
    const invoiceNumber = `INV-${Date.now()}`;
    const [payment] = await PaymentModel.create(
      [
        {
          order: order._id,
          user: order.user,
          razorpayPaymentId: input.razorpayPaymentId,
          razorpaySignature: input.razorpaySignature,
          amountPaise: order.payablePaise,
          status: 'captured',
          invoiceNumber,
          raw: input.raw,
        },
      ],
      { session },
    );
    order.status = 'captured';
    await order.save({ session });
    if (order.coupon) {
      await CouponModel.updateOne({ _id: order.coupon }, { $inc: { usedCount: 1 } }).session(session);
    }
    if (order.walletPaise > 0) {
      await applyWalletTx({
        userId: String(order.user),
        type: 'debit_purchase',
        amountPaise: order.walletPaise,
        reference: String(order._id),
        idempotencyKey: `order-wallet-${order._id}`,
        session,
      });
    }
    await session.commitTransaction();
    await fulfillOrder(String(order._id), String(payment?._id));
    return payment;
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
}

export async function fulfillOrder(orderId: string, paymentId?: string) {
  const order = await OrderModel.findById(orderId);
  if (!order) throw notFound('Order not found');

  const enrolled = await hasActiveEnrollment(
    String(order.user),
    order.productType === 'course' ? { courseId: String(order.productId) } : { batchId: String(order.productId) },
  );
  if (enrolled) return;

  let validityDays = 365;
  let teacherIds: string[] = [];
  let courseId: string | undefined;
  let batchId: string | undefined;

  if (order.productType === 'course') {
    const course = await CourseModel.findById(order.productId);
    if (!course) throw notFound('Course not found');
    validityDays = course.validityDays ?? 365;
    teacherIds = (course.teachers ?? []).map((t) => String(t));
    courseId = String(course._id);
    await CourseModel.updateOne({ _id: course._id }, { $inc: { enrollmentCount: 1 } });
  } else {
    const batch = await BatchModel.findById(order.productId);
    if (!batch) throw notFound('Batch not found');
    validityDays = batch.validityDays ?? 365;
    teacherIds = (batch.teachers ?? []).map((t) => String(t));
    batchId = String(batch._id);
    courseId = String(batch.course);
    await BatchModel.updateOne({ _id: batch._id }, { $inc: { enrolledCount: 1 } });
  }

  await createEnrollment({
    userId: String(order.user),
    courseId,
    batchId,
    productType: order.productType,
    source: 'purchase',
    orderId: String(order._id),
    validityDays,
  });

  const commission = env.PLATFORM_COMMISSION_PERCENT;
  const share = teacherIds.length || 1;
  const netPool = Math.round((order.amountPaise * (100 - commission)) / 100);
  const perTeacher = Math.floor(netPool / share);
  for (const teacher of teacherIds) {
    await TeacherEarningModel.updateOne(
      { teacher, order: order._id },
      {
        $setOnInsert: {
          teacher,
          order: order._id,
          payment: paymentId,
          productType: order.productType,
          productId: order.productId,
          grossPaise: order.amountPaise,
          commissionPaise: order.amountPaise - netPool,
          netPaise: perTeacher,
          status: 'available',
        },
      },
      { upsert: true },
    );
  }

  const referral = await ReferralModel.findOne({ referee: order.user, status: 'registered' });
  if (referral) {
    const reward = Math.min(50000, Math.round(order.amountPaise * 0.05));
    await applyWalletTx({
      userId: String(referral.referrer),
      type: 'credit_referral',
      amountPaise: reward,
      reference: String(order._id),
      idempotencyKey: `referral-${referral._id}`,
    });
    referral.status = 'rewarded';
    referral.rewardPaise = reward;
    referral.rewardedAt = new Date();
    await referral.save();
    await notify({
      userId: String(referral.referrer),
      title: 'Referral reward credited',
      body: 'Your wallet has been credited for a successful referral.',
      type: 'referral_reward',
    });
  }

  await notify({
    userId: String(order.user),
    title: 'Payment successful',
    body: 'You are enrolled. Start learning on Gyan Chowk.',
    type: 'payment_success',
    href: '/student/courses',
  });
}

export async function enrollFree(userId: string, productType: 'course' | 'batch', productId: string) {
  if (await hasActiveEnrollment(userId, productType === 'course' ? { courseId: productId } : { batchId: productId })) {
    throw conflict('Already enrolled');
  }
  if (productType === 'course') {
    const course = await CourseModel.findById(productId);
    if (!course) throw notFound('Course not found');
    if (course.pricingType !== 'free' && applyDiscount(course.price, course.discountPercent) > 0) {
      throw forbidden('This course is paid');
    }
    await createEnrollment({
      userId,
      courseId: productId,
      productType: 'course',
      source: 'free',
      validityDays: course.validityDays ?? 365,
    });
    await CourseModel.updateOne({ _id: course._id }, { $inc: { enrollmentCount: 1 } });
  } else {
    const batch = await BatchModel.findById(productId);
    if (!batch) throw notFound('Batch not found');
    if ((batch.price ?? 0) > 0) throw forbidden('This batch is paid');
    await createEnrollment({
      userId,
      courseId: String(batch.course),
      batchId: productId,
      productType: 'batch',
      source: 'free',
      validityDays: batch.validityDays ?? 365,
    });
    await BatchModel.updateOne({ _id: batch._id }, { $inc: { enrolledCount: 1 } });
  }
  await notify({
    userId,
    title: 'Enrollment confirmed',
    body: 'You have been enrolled successfully.',
    type: 'enrollment',
    href: '/student/courses',
  });
  return { ok: true };
}

export async function refundPayment(adminId: string, paymentId: string, reason: string) {
  const payment = await PaymentModel.findById(paymentId);
  if (!payment) throw notFound('Payment not found');
  if (payment.status === 'refunded') throw conflict('Already refunded');
  const order = await OrderModel.findById(payment.order);
  if (!order) throw notFound('Order not found');

  let razorpayRefundId: string | undefined;
  if (isRazorpayConfigured() && payment.razorpayPaymentId) {
    const rzp = await getRazorpay().payments.refund(payment.razorpayPaymentId, {
      amount: payment.amountPaise,
    });
    razorpayRefundId = rzp.id;
  }

  const refund = await RefundModel.create({
    payment: payment._id,
    order: order._id,
    user: order.user,
    amountPaise: payment.amountPaise,
    razorpayRefundId,
    reason,
    status: 'processed',
    processedBy: adminId,
  });
  payment.status = 'refunded';
  order.status = 'refunded';
  await payment.save();
  await order.save();

  await applyWalletTx({
    userId: String(order.user),
    type: 'credit_refund',
    amountPaise: payment.amountPaise,
    reference: String(refund._id),
    idempotencyKey: `refund-${payment._id}`,
  });

  await TeacherEarningModel.updateMany({ order: order._id }, { status: 'reversed' });

  await writeAudit({
    actor: adminId,
    role: 'admin',
    action: 'payment.refunded',
    entity: 'Payment',
    entityId: String(payment._id),
    after: { reason, amountPaise: payment.amountPaise },
  });
  await notify({
    userId: String(order.user),
    title: 'Refund processed',
    body: 'Your refund has been credited to your wallet.',
    type: 'refund',
  });
  return refund;
}

export { productPrice };
