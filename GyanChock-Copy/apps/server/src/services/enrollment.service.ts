import mongoose from 'mongoose';
import { EnrollmentModel, ProgressModel } from '../models/index.js';
import { forbidden, notFound } from '../utils/errors.js';

export async function hasActiveEnrollment(
  userId: string,
  opts: { courseId?: string; batchId?: string },
): Promise<boolean> {
  const now = new Date();
  const query: Record<string, unknown> = {
    user: userId,
    status: 'active',
    $or: [{ expiresAt: { $exists: false } }, { expiresAt: { $gte: now } }],
  };
  if (opts.courseId) query.course = opts.courseId;
  if (opts.batchId) query.batch = opts.batchId;
  const found = await EnrollmentModel.findOne(query).select('_id').lean();
  return Boolean(found);
}

export async function assertEnrollment(
  userId: string,
  role: string,
  opts: { courseId?: string; batchId?: string },
) {
  if (role === 'admin') return;
  const ok = await hasActiveEnrollment(userId, opts);
  if (!ok) throw forbidden('You are not enrolled in this content');
}

export async function createEnrollment(input: {
  userId: string;
  courseId?: string;
  batchId?: string;
  productType: 'course' | 'batch';
  source: 'free' | 'purchase' | 'admin' | 'coupon';
  orderId?: string;
  validityDays: number;
  session?: mongoose.ClientSession;
}) {
  const expiresAt = new Date(Date.now() + input.validityDays * 24 * 60 * 60 * 1000);
  const doc = {
    user: input.userId,
    course: input.courseId,
    batch: input.batchId,
    productType: input.productType,
    status: 'active' as const,
    source: input.source,
    order: input.orderId,
    startsAt: new Date(),
    expiresAt,
  };
  const enrollment = input.session
    ? await EnrollmentModel.create([doc], { session: input.session }).then((d) => d[0])
    : await EnrollmentModel.create(doc);

  if (input.courseId) {
    await ProgressModel.updateOne(
      { user: input.userId, course: input.courseId },
      { $setOnInsert: { user: input.userId, course: input.courseId, percent: 0 } },
      { upsert: true, session: input.session },
    );
  }
  return enrollment;
}

export async function getEnrollmentOrThrow(userId: string, courseId: string) {
  const enrollment = await EnrollmentModel.findOne({
    user: userId,
    course: courseId,
    status: 'active',
  });
  if (!enrollment) throw notFound('Enrollment not found');
  return enrollment;
}
