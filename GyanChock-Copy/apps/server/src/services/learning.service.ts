import { nanoid } from 'nanoid';
import mongoose from 'mongoose';
import {
  CertificateModel,
  CourseModel,
  EnrollmentModel,
  LessonModel,
  ProgressModel,
  UserModel,
  VideoProgressModel,
} from '../models/index.js';
import { env } from '../config/env.js';
import { badRequest, notFound } from '../utils/errors.js';
import { notify } from './notification.service.js';

export async function maybeIssueCertificate(userId: string, courseId: string) {
  const course = await CourseModel.findById(courseId);
  if (!course?.certificateEnabled) return null;
  const existing = await CertificateModel.findOne({ user: userId, course: courseId });
  if (existing) return existing;

  const lessons = await LessonModel.countDocuments({ course: courseId });
  const progress = await ProgressModel.findOne({ user: userId, course: courseId });
  const completed = progress?.completedLessons?.length ?? 0;
  if (lessons === 0 || completed / lessons < 0.9) return null;

  const cert = await CertificateModel.create({
    certificateId: `GC-${nanoid(10).toUpperCase()}`,
    user: userId,
    course: courseId,
    teacher: course.teachers?.[0],
    issuedAt: new Date(),
  });
  await notify({
    userId,
    title: 'Certificate issued',
    body: `Your certificate for ${course.title} is ready.`,
    type: 'certificate',
    href: `/verify/certificate/${cert.certificateId}`,
  });
  return cert;
}

export async function publicVerify(certificateId: string) {
  const cert = await CertificateModel.findOne({ certificateId })
    .populate('user', 'name')
    .populate('course', 'title')
    .populate('teacher', 'name')
    .lean();
  if (!cert) throw notFound('Certificate not found');
  return {
    ...cert,
    verifyUrl: `${env.NEXT_PUBLIC_APP_URL}/verify/certificate/${certificateId}`,
  };
}

export async function studentBacklog(userId: string) {
  const enrollments = await EnrollmentModel.find({ user: userId, status: 'active' }).lean();
  const courseIds = enrollments.map((e) => e.course).filter(Boolean);
  const lessons = await LessonModel.find({ course: { $in: courseIds } }).lean();
  const progress = await ProgressModel.find({ user: userId, course: { $in: courseIds } }).lean();
  const pMap = new Map(progress.map((p) => [String(p.course), p]));
  const byCourse: Record<string, { total: number; done: number }> = {};
  for (const l of lessons) {
    const cid = String(l.course);
    byCourse[cid] ??= { total: 0, done: 0 };
    byCourse[cid].total += 1;
    const completed = pMap.get(cid)?.completedLessons?.some((id) => String(id) === String(l._id));
    if (completed) byCourse[cid].done += 1;
  }
  const unwatched = lessons.filter((l) => {
    const p = pMap.get(String(l.course));
    return !p?.completedLessons?.some((id) => String(id) === String(l._id));
  });
  return { byCourse, unwatched: unwatched.slice(0, 50) };
}

export async function studentAnalytics(userId: string) {
  const [enrollments, videoAgg, progress] = await Promise.all([
    EnrollmentModel.countDocuments({ user: userId, status: 'active' }),
    VideoProgressModel.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: null,
          watched: { $sum: { $cond: ['$completed', 1, 0] } },
          seconds: { $sum: '$positionSec' },
        },
      },
    ]),
    ProgressModel.find({ user: userId }).lean(),
  ]);
  const avgCompletion =
    progress.length === 0 ? 0 : progress.reduce((s, p) => s + (p.percent ?? 0), 0) / progress.length;
  return {
    enrollments,
    videosWatched: videoAgg[0]?.watched ?? 0,
    studySeconds: videoAgg[0]?.seconds ?? 0,
    avgCompletion,
    streak: progress.reduce((m, p) => Math.max(m, p.streakDays ?? 0), 0),
  };
}

export async function updateLessonProgress(userId: string, courseId: string, lessonId: string) {
  const total = await LessonModel.countDocuments({ course: courseId });
  const progress = await ProgressModel.findOneAndUpdate(
    { user: userId, course: courseId },
    { $addToSet: { completedLessons: lessonId }, $set: { lastLesson: lessonId, lastStudiedAt: new Date() } },
    { upsert: true, new: true },
  );
  const percent = total ? Math.round((progress.completedLessons.length / total) * 100) : 0;
  progress.percent = percent;
  const last = progress.lastStudiedAt;
  const today = new Date();
  if (last) {
    const diff = Math.floor((today.getTime() - last.getTime()) / 86400000);
    if (diff === 1) progress.streakDays += 1;
    else if (diff > 1) progress.streakDays = 1;
  } else progress.streakDays = 1;
  await progress.save();
  if (percent >= 90) await maybeIssueCertificate(userId, courseId);
  return progress;
}

export async function requireUser(id: string) {
  const user = await UserModel.findById(id);
  if (!user) throw notFound('User not found');
  return user;
}

export function assertTeacherOwnsCourse(
  role: string,
  teacherId: string,
  course: { teachers?: unknown[]; createdBy?: unknown },
) {
  if (role === 'admin') return;
  const ids = new Set([...(course.teachers ?? []), course.createdBy].map((x) => String(x)));
  if (!ids.has(teacherId)) throw badRequest('You do not own this course');
}
