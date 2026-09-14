import mongoose, { Schema } from 'mongoose';
import {
  ORDER_PRODUCT_TYPES,
  PAYMENT_STATUSES,
  PAYOUT_STATUSES,
  WALLET_TX_TYPES,
} from '@gyan-chowk/shared';

const orderSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    productType: { type: String, enum: ORDER_PRODUCT_TYPES, required: true },
    productId: { type: Schema.Types.ObjectId, required: true, index: true },
    amountPaise: { type: Number, required: true },
    discountPaise: { type: Number, default: 0 },
    walletPaise: { type: Number, default: 0 },
    payablePaise: { type: Number, required: true },
    coupon: { type: Schema.Types.ObjectId, ref: 'Coupon' },
    couponCode: String,
    currency: { type: String, default: 'INR' },
    razorpayOrderId: { type: String, index: true, unique: true, sparse: true },
    status: { type: String, enum: PAYMENT_STATUSES, default: 'created', index: true },
    receipt: { type: String, unique: true },
  },
  { timestamps: true },
);
orderSchema.index({ user: 1, createdAt: -1 });

const paymentSchema = new Schema(
  {
    order: { type: Schema.Types.ObjectId, ref: 'Order', required: true, index: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    razorpayPaymentId: { type: String, unique: true, sparse: true, index: true },
    razorpaySignature: String,
    amountPaise: { type: Number, required: true },
    status: { type: String, enum: PAYMENT_STATUSES, default: 'pending', index: true },
    method: String,
    invoiceNumber: { type: String, unique: true, sparse: true },
    raw: Schema.Types.Mixed,
  },
  { timestamps: true },
);

const refundSchema = new Schema(
  {
    payment: { type: Schema.Types.ObjectId, ref: 'Payment', required: true, index: true },
    order: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    amountPaise: { type: Number, required: true },
    razorpayRefundId: String,
    reason: String,
    status: { type: String, enum: ['pending', 'processed', 'failed'], default: 'pending' },
    processedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true },
);

const couponSchema = new Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, index: true },
    type: { type: String, enum: ['percent', 'flat'], required: true },
    value: { type: Number, required: true },
    minAmount: { type: Number, default: 0 },
    maxDiscount: Number,
    usageLimit: Number,
    usedCount: { type: Number, default: 0 },
    perUserLimit: { type: Number, default: 1 },
    startsAt: Date,
    endsAt: Date,
    active: { type: Boolean, default: true },
    applicableTo: { type: String, enum: ['all', 'course', 'batch'], default: 'all' },
    productIds: [Schema.Types.ObjectId],
  },
  { timestamps: true },
);

const offerSchema = new Schema(
  {
    title: { type: String, required: true },
    description: String,
    banner: { publicId: String, url: String },
    startsAt: Date,
    endsAt: Date,
    active: { type: Boolean, default: true },
    coupon: { type: Schema.Types.ObjectId, ref: 'Coupon' },
  },
  { timestamps: true },
);

const walletSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    balancePaise: { type: Number, default: 0, min: 0 },
    cashbackPaise: { type: Number, default: 0 },
    referralPaise: { type: Number, default: 0 },
    promoPaise: { type: Number, default: 0 },
  },
  { timestamps: true },
);

const walletTransactionSchema = new Schema(
  {
    wallet: { type: Schema.Types.ObjectId, ref: 'Wallet', required: true, index: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, enum: WALLET_TX_TYPES, required: true },
    amountPaise: { type: Number, required: true },
    balanceAfterPaise: { type: Number, required: true },
    reference: String,
    meta: Schema.Types.Mixed,
    idempotencyKey: { type: String, unique: true, sparse: true },
  },
  { timestamps: true },
);
walletTransactionSchema.index({ user: 1, createdAt: -1 });

const referralSchema = new Schema(
  {
    referrer: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    referee: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    status: { type: String, enum: ['registered', 'rewarded', 'blocked'], default: 'registered' },
    rewardPaise: { type: Number, default: 0 },
    rewardedAt: Date,
  },
  { timestamps: true },
);

const teacherEarningSchema = new Schema(
  {
    teacher: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    order: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
    payment: { type: Schema.Types.ObjectId, ref: 'Payment' },
    productType: String,
    productId: Schema.Types.ObjectId,
    grossPaise: Number,
    commissionPaise: Number,
    netPaise: Number,
    status: { type: String, enum: ['pending', 'available', 'paid', 'reversed'], default: 'available' },
  },
  { timestamps: true },
);
teacherEarningSchema.index({ teacher: 1, createdAt: -1 });
teacherEarningSchema.index({ order: 1, teacher: 1 }, { unique: true });

const teacherPayoutSchema = new Schema(
  {
    teacher: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    amountPaise: { type: Number, required: true },
    status: { type: String, enum: PAYOUT_STATUSES, default: 'requested', index: true },
    note: String,
    adminNote: String,
    processedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    processedAt: Date,
  },
  { timestamps: true },
);

export const OrderModel = mongoose.model('Order', orderSchema);
export const PaymentModel = mongoose.model('Payment', paymentSchema);
export const RefundModel = mongoose.model('Refund', refundSchema);
export const CouponModel = mongoose.model('Coupon', couponSchema);
export const OfferModel = mongoose.model('Offer', offerSchema);
export const WalletModel = mongoose.model('Wallet', walletSchema);
export const WalletTransactionModel = mongoose.model('WalletTransaction', walletTransactionSchema);
export const ReferralModel = mongoose.model('Referral', referralSchema);
export const TeacherEarningModel = mongoose.model('TeacherEarning', teacherEarningSchema);
export const TeacherPayoutModel = mongoose.model('TeacherPayout', teacherPayoutSchema);
