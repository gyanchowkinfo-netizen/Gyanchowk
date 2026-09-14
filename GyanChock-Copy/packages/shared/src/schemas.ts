import { z } from 'zod';
import { LANGUAGES, PAGINATION } from './constants.js';

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(PAGINATION.maxLimit).default(PAGINATION.defaultLimit),
  q: z.string().trim().max(200).optional(),
  sort: z.string().max(60).optional(),
});

export const objectIdSchema = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid id');

export const slugSchema = z
  .string()
  .min(2)
  .max(120)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Invalid slug');

export const registerSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email().toLowerCase(),
  password: z.string().min(8).max(128),
  role: z.enum(['student', 'teacher']),
  phone: z.string().trim().min(8).max(20).optional(),
  referralCode: z.string().trim().max(20).optional(),
  state: z.string().trim().max(80).optional(),
  headline: z.string().trim().max(160).optional(),
  bio: z.string().trim().max(2000).optional(),
});

export const loginSchema = z.object({
  email: z.string().trim().email().toLowerCase(),
  password: z.string().trim().min(1).max(128),
});

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email().toLowerCase(),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(20).max(200),
  password: z.string().min(8).max(128),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8).max(128),
});

export const verifyEmailSchema = z.object({
  token: z.string().min(20).max(200),
});

export const courseFilterSchema = paginationQuerySchema.extend({
  category: z.string().optional(),
  subject: z.string().optional(),
  exam: z.string().optional(),
  class: z.string().optional(),
  language: z.enum(LANGUAGES).optional(),
  pricing: z.enum(['free', 'paid']).optional(),
  teacher: objectIdSchema.optional(),
  minRating: z.coerce.number().min(0).max(5).optional(),
  type: z.string().optional(),
  mine: z.enum(['1', '0']).optional(),
});

export const batchFilterSchema = paginationQuerySchema.extend({
  category: z.string().optional(),
  subject: z.string().optional(),
  exam: z.string().optional(),
  class: z.string().optional(),
  language: z.string().optional(),
  pricing: z.enum(['free', 'paid']).optional(),
  teacher: z.string().optional(),
  status: z.string().optional(),
  duration: z.enum(['short', 'medium', 'long']).optional(),
  minRating: z.coerce.number().min(0).max(5).optional(),
  course: z.string().optional(),
});

export const createOrderSchema = z.object({
  productType: z.enum(['course', 'batch']),
  productId: objectIdSchema,
  couponCode: z.string().trim().max(40).optional(),
  walletAmount: z.coerce.number().min(0).optional(),
});

export const razorpayVerifySchema = z.object({
  razorpay_order_id: z.string().min(1),
  razorpay_payment_id: z.string().min(1),
  razorpay_signature: z.string().min(1),
});

export const doubtCreateSchema = z.object({
  title: z.string().trim().min(4).max(200),
  body: z.string().trim().min(8).max(8000),
  courseId: objectIdSchema.optional(),
  batchId: objectIdSchema.optional(),
  subjectId: objectIdSchema.optional(),
  chapterId: objectIdSchema.optional(),
  imagePublicId: z.string().optional(),
});

export const assignmentSubmitSchema = z.object({
  answers: z.string().max(20000).optional(),
  filePublicIds: z.array(z.string()).max(8).optional(),
});

export const testAnswerSchema = z.object({
  questionId: objectIdSchema,
  answer: z.unknown(),
  markedForReview: z.boolean().optional(),
});

export const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  title: z.string().trim().max(120).optional(),
  body: z.string().trim().min(8).max(4000),
});

export const couponSchema = z.object({
  code: z.string().trim().min(3).max(40).toUpperCase(),
  type: z.enum(['percent', 'flat']),
  value: z.number().positive(),
  minAmount: z.number().min(0).optional(),
  maxDiscount: z.number().positive().optional(),
  usageLimit: z.number().int().positive().optional(),
  perUserLimit: z.number().int().positive().optional(),
  startsAt: z.coerce.date().optional(),
  endsAt: z.coerce.date().optional(),
  applicableTo: z.enum(['all', 'course', 'batch']).optional(),
  productIds: z.array(objectIdSchema).optional(),
});
