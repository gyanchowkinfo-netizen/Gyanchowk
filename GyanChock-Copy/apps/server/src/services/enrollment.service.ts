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

  // If user already has an enrollment for this course or batch, reactivate/renew it
  const existingQuery: Record<string, unknown> = { user: input.userId };
  if (input.productType === 'course' && input.courseId) {
    existingQuery.course = input.courseId;
  } else if (input.productType === 'batch' && input.batchId) {
    existingQuery.batch = input.batchId;
  }

  if (existingQuery.course || existingQuery.batch) {
    const existing = await EnrollmentModel.findOne(existingQuery).session(input.session || null);
    if (existing) {
      existing.status = 'active';
      existing.expiresAt = expiresAt;
      if (input.source) existing.source = input.source;
      if (input.orderId) existing.order = input.orderId as any;
      await existing.save({ session: input.session });

      if (input.courseId) {
        await ProgressModel.updateOne(
          { user: input.userId, course: input.courseId },
          { $setOnInsert: { user: input.userId, course: input.courseId, percent: 0 } },
          { upsert: true, session: input.session },
        );
      }
      return existing;
    }
  }

  const doc: Record<string, unknown> = {
    user: input.userId,
    productType: input.productType,
    status: 'active',
    source: input.source,
    startsAt: new Date(),
    expiresAt,
  };
  if (input.courseId) doc.course = input.courseId;
  if (input.batchId) doc.batch = input.batchId;
  if (input.orderId) doc.order = input.orderId;

  const insert = async () => {
    return input.session
      ? await EnrollmentModel.create([doc], { session: input.session }).then((d) => d[0])
      : await EnrollmentModel.create(doc);
  };

  let enrollment;
  try {
    enrollment = await insert();
  } catch (err: any) {
    // If a legacy sparse compound index user_1_batch_1 caused E11000 dup key on batch: null,
    // drop it and replace with partialFilterExpression, then retry
    if (err?.code === 11000 && String(err?.message || '').includes('user_1_batch_1')) {
      try {
        await EnrollmentModel.collection.dropIndex('user_1_batch_1').catch(() => {});
        await EnrollmentModel.collection.createIndex(
          { user: 1, batch: 1 },
          {
            name: 'user_1_batch_1',
            unique: true,
            partialFilterExpression: { batch: { $exists: true, $type: 'objectId' } },
          },
        ).catch(() => {});
        enrollment = await insert();
      } catch (retryErr: any) {
        if (retryErr?.code === 11000) {
          const found = await EnrollmentModel.findOne(existingQuery).session(input.session || null);
          if (found) {
            found.status = 'active';
            found.expiresAt = expiresAt;
            await found.save({ session: input.session });
            enrollment = found;
          } else {
            throw retryErr;
          }
        } else {
          throw retryErr;
        }
      }
    } else if (err?.code === 11000) {
      const found = await EnrollmentModel.findOne(existingQuery).session(input.session || null);
      if (found) {
        found.status = 'active';
        found.expiresAt = expiresAt;
        await found.save({ session: input.session });
        enrollment = found;
      } else {
        throw err;
      }
    } else {
      throw err;
    }
  }

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
