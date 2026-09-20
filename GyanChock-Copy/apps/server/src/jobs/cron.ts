import { env } from '../config/env.js';
import { BatchModel, EnrollmentModel, TestModel } from '../models/index.js';
import { notifyMany } from '../services/notification.service.js';

export async function sendQuizReminders() {
  const soon = new Date(Date.now() + 60 * 60 * 1000);
  const now = new Date();
  const tests = await TestModel.find({
    status: { $in: ['scheduled', 'live'] },
    startsAt: { $gte: now, $lte: soon },
  })
    .select('title course batch startsAt')
    .lean();
  for (const test of tests) {
    const filter: Record<string, unknown> = { status: 'active' };
    if (test.batch) filter.batch = test.batch;
    else if (test.course) filter.course = test.course;
    else continue;
    const students = await EnrollmentModel.find(filter).select('user').lean();
    await notifyMany(
      students.map((s) => String(s.user)),
      {
        title: `Quiz starting soon: ${test.title}`,
        body: 'Open Tests to attempt before the window closes.',
        type: 'quiz_reminder',
        href: '/student/tests',
        channels: ['inApp', 'push', 'email'],
      },
    );
  }
}

export async function sendBatchStartingSoon() {
  const horizon = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const now = new Date();
  const batches = await BatchModel.find({
    status: { $in: ['upcoming', 'open'] },
    startDate: { $gte: now, $lte: horizon },
  })
    .select('name')
    .lean();
  for (const batch of batches) {
    const students = await EnrollmentModel.find({ batch: batch._id, status: 'active' }).select('user').lean();
    await notifyMany(
      students.map((s) => String(s.user)),
      {
        title: `Batch starting soon: ${batch.name}`,
        body: 'Your batch begins within 24 hours. Check the schedule.',
        type: 'batch_starting',
        href: '/student/batches',
        channels: ['inApp', 'push', 'email'],
      },
    );
  }
}

export function startScheduledJobs() {
  if (env.NODE_ENV === 'test') return;
  void import('node-cron').then(({ default: cron }) => {
    cron.schedule('*/15 * * * *', () => {
      void sendQuizReminders().catch((err) => console.error('[cron] quiz reminders', err));
    });
    cron.schedule('0 * * * *', () => {
      void sendBatchStartingSoon().catch((err) => console.error('[cron] batch starting', err));
    });
  });
}
