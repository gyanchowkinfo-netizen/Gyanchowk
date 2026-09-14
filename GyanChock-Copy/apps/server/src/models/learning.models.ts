import mongoose, { Schema } from 'mongoose';
import { ENROLLMENT_STATUSES, MATERIAL_TYPES } from '@gyan-chowk/shared';

const enrollmentSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    course: { type: Schema.Types.ObjectId, ref: 'Course', index: true },
    batch: { type: Schema.Types.ObjectId, ref: 'Batch', index: true },
    productType: { type: String, enum: ['course', 'batch'], required: true },
    status: { type: String, enum: ENROLLMENT_STATUSES, default: 'active', index: true },
    source: { type: String, enum: ['free', 'purchase', 'admin', 'coupon'], default: 'purchase' },
    order: { type: Schema.Types.ObjectId, ref: 'Order' },
    startsAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, index: true },
  },
  { timestamps: true },
);

enrollmentSchema.index({ user: 1, course: 1 }, { unique: true, sparse: true });
enrollmentSchema.index({ user: 1, batch: 1 }, { unique: true, sparse: true });
enrollmentSchema.index({ user: 1, status: 1, expiresAt: 1 });

const progressSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    course: { type: Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
    completedLessons: [{ type: Schema.Types.ObjectId, ref: 'Lesson' }],
    completedMaterials: [{ type: Schema.Types.ObjectId, ref: 'StudyMaterial' }],
    percent: { type: Number, default: 0 },
    lastLesson: { type: Schema.Types.ObjectId, ref: 'Lesson' },
    lastVideo: { type: Schema.Types.ObjectId, ref: 'Video' },
    studySeconds: { type: Number, default: 0 },
    streakDays: { type: Number, default: 0 },
    lastStudiedAt: Date,
  },
  { timestamps: true },
);
progressSchema.index({ user: 1, course: 1 }, { unique: true });

const videoProgressSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    video: { type: Schema.Types.ObjectId, ref: 'Video', required: true },
    course: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
    positionSec: { type: Number, default: 0 },
    durationSec: { type: Number, default: 0 },
    completed: { type: Boolean, default: false, index: true },
    lastWatchedAt: Date,
  },
  { timestamps: true },
);
videoProgressSchema.index({ user: 1, video: 1 }, { unique: true });
videoProgressSchema.index({ user: 1, course: 1, lastWatchedAt: -1 });

const studyMaterialSchema = new Schema(
  {
    title: { type: String, required: true },
    type: { type: String, enum: MATERIAL_TYPES, required: true, index: true },
    course: { type: Schema.Types.ObjectId, ref: 'Course', index: true },
    batch: { type: Schema.Types.ObjectId, ref: 'Batch', index: true },
    subject: { type: Schema.Types.ObjectId, ref: 'Subject' },
    chapter: { type: Schema.Types.ObjectId, ref: 'Chapter' },
    teacher: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    publicId: { type: String, required: true },
    url: String,
    bytes: Number,
    mime: String,
    featured: { type: Boolean, default: false },
    status: { type: String, enum: ['draft', 'published', 'hidden'], default: 'published', index: true },
    bookmarks: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true },
);
studyMaterialSchema.index({ title: 'text' });
studyMaterialSchema.index({ course: 1, type: 1, status: 1 });

const calendarEventSchema = new Schema(
  {
    title: { type: String, required: true },
    type: {
      type: String,
      enum: [
        'assignment',
        'test',
        'study_target',
        'mentorship',
        'course_expiry',
        'exam',
        'attendance',
        'custom',
      ],
      index: true,
    },
    user: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    batch: { type: Schema.Types.ObjectId, ref: 'Batch', index: true },
    course: { type: Schema.Types.ObjectId, ref: 'Course' },
    startsAt: { type: Date, required: true, index: true },
    endsAt: Date,
    refId: Schema.Types.ObjectId,
    refModel: String,
  },
  { timestamps: true },
);
calendarEventSchema.index({ user: 1, startsAt: 1 });
calendarEventSchema.index({ batch: 1, startsAt: 1 });

const certificateSchema = new Schema(
  {
    certificateId: { type: String, required: true, unique: true, index: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    course: { type: Schema.Types.ObjectId, ref: 'Course', index: true },
    batch: { type: Schema.Types.ObjectId, ref: 'Batch' },
    teacher: { type: Schema.Types.ObjectId, ref: 'User' },
    issuedAt: { type: Date, default: Date.now },
    pdfPublicId: String,
    pdfUrl: String,
  },
  { timestamps: true },
);
certificateSchema.index({ user: 1, course: 1 }, { unique: true, sparse: true });

export const EnrollmentModel = mongoose.model('Enrollment', enrollmentSchema);
export const ProgressModel = mongoose.model('Progress', progressSchema);
export const VideoProgressModel = mongoose.model('VideoProgress', videoProgressSchema);
export const StudyMaterialModel = mongoose.model('StudyMaterial', studyMaterialSchema);
export const CalendarEventModel = mongoose.model('CalendarEvent', calendarEventSchema);
export const CertificateModel = mongoose.model('Certificate', certificateSchema);
