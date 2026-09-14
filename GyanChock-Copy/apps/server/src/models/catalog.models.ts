import mongoose, { Schema } from 'mongoose';
import { BATCH_STATUSES, COURSE_STATUSES, PRICING_TYPES } from '@gyan-chowk/shared';

const mediaSchema = new Schema(
  {
    publicId: String,
    url: String,
    duration: Number,
    bytes: Number,
    format: String,
    resourceType: { type: String, enum: ['image', 'video', 'raw'] },
  },
  { _id: false },
);

const courseSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true },
    subtitle: String,
    description: { type: String, default: '' },
    thumbnail: mediaSchema,
    banner: mediaSchema,
    teachers: [{ type: Schema.Types.ObjectId, ref: 'User', index: true }],
    category: { type: String, index: true },
    subjects: [{ type: String, index: true }],
    examCategories: [{ type: String, index: true }],
    targetClass: { type: String, index: true },
    targetExam: { type: String, index: true },
    language: { type: String, default: 'en', index: true },
    pricingType: { type: String, enum: PRICING_TYPES, default: 'paid', index: true },
    price: { type: Number, default: 0, min: 0 },
    discountPercent: { type: Number, default: 0, min: 0, max: 100 },
    validityDays: { type: Number, default: 365 },
    status: { type: String, enum: COURSE_STATUSES, default: 'draft', index: true },
    ratingAvg: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
    enrollmentCount: { type: Number, default: 0 },
    certificateEnabled: { type: Boolean, default: true },
    demoVideo: mediaSchema,
    faqs: [{ question: String, answer: String }],
    outcomes: [String],
    seoTitle: String,
    seoDescription: String,
    publishedAt: Date,
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true },
);

courseSchema.index({ status: 1, pricingType: 1, ratingAvg: -1 });
courseSchema.index({ category: 1, status: 1 });
courseSchema.index({ title: 'text', subtitle: 'text', description: 'text' });

const batchSchema = new Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    description: String,
    course: { type: Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
    teachers: [{ type: Schema.Types.ObjectId, ref: 'User', index: true }],
    subjects: [{ type: Schema.Types.ObjectId, ref: 'Subject' }],
    startDate: Date,
    endDate: Date,
    enrollmentStart: Date,
    enrollmentEnd: Date,
    validityDays: { type: Number, default: 365 },
    language: { type: String, default: 'en' },
    examCategory: String,
    targetClass: String,
    targetExam: String,
    status: { type: String, enum: BATCH_STATUSES, default: 'upcoming', index: true },
    maxStudents: { type: Number, default: 500 },
    enrolledCount: { type: Number, default: 0 },
    price: { type: Number, default: 0 },
    discountPercent: { type: Number, default: 0 },
    thumbnail: mediaSchema,
    schedule: [
      {
        day: String,
        startTime: String,
        endTime: String,
        title: String,
      },
    ],
    announcements: [
      {
        title: String,
        body: String,
        createdAt: { type: Date, default: Date.now },
        createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
      },
    ],
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true },
);

batchSchema.index({ course: 1, status: 1 });
batchSchema.index({ name: 'text', description: 'text' });

const subjectSchema = new Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, index: true },
    course: { type: Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
    batch: { type: Schema.Types.ObjectId, ref: 'Batch', index: true },
    description: String,
    order: { type: Number, default: 0 },
  },
  { timestamps: true },
);
subjectSchema.index({ course: 1, slug: 1 }, { unique: true });

const chapterSchema = new Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true },
    subject: { type: Schema.Types.ObjectId, ref: 'Subject', required: true, index: true },
    course: { type: Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
    description: String,
    order: { type: Number, default: 0 },
  },
  { timestamps: true },
);
chapterSchema.index({ subject: 1, slug: 1 }, { unique: true });

const topicSchema = new Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true },
    chapter: { type: Schema.Types.ObjectId, ref: 'Chapter', required: true, index: true },
    course: { type: Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
    description: String,
    order: { type: Number, default: 0 },
  },
  { timestamps: true },
);
topicSchema.index({ chapter: 1, slug: 1 }, { unique: true });

const lessonSchema = new Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true },
    topic: { type: Schema.Types.ObjectId, ref: 'Topic', required: true, index: true },
    chapter: { type: Schema.Types.ObjectId, ref: 'Chapter', index: true },
    course: { type: Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
    video: { type: Schema.Types.ObjectId, ref: 'Video' },
    durationSec: { type: Number, default: 0 },
    isDemo: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
    description: String,
  },
  { timestamps: true },
);
lessonSchema.index({ topic: 1, slug: 1 }, { unique: true });
lessonSchema.index({ course: 1, order: 1 });

const videoSchema = new Schema(
  {
    title: { type: String, required: true },
    course: { type: Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
    lesson: { type: Schema.Types.ObjectId, ref: 'Lesson', index: true },
    teacher: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    publicId: { type: String, required: true, index: true },
    resourceType: { type: String, default: 'video' },
    duration: Number,
    bytes: Number,
    format: String,
    posterPublicId: String,
    hlsReady: { type: Boolean, default: false },
    subtitles: [{ label: String, srclang: String, publicId: String }],
    isDemo: { type: Boolean, default: false },
    status: { type: String, enum: ['processing', 'ready', 'failed'], default: 'processing' },
  },
  { timestamps: true },
);

videoSchema.index({ course: 1, status: 1 });

export const CourseModel = mongoose.model('Course', courseSchema);
export const BatchModel = mongoose.model('Batch', batchSchema);
export const SubjectModel = mongoose.model('Subject', subjectSchema);
export const ChapterModel = mongoose.model('Chapter', chapterSchema);
export const TopicModel = mongoose.model('Topic', topicSchema);
export const LessonModel = mongoose.model('Lesson', lessonSchema);
export const VideoModel = mongoose.model('Video', videoSchema);
