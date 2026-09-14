import mongoose, { Schema } from 'mongoose';

const reviewSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    course: { type: Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
    rating: { type: Number, min: 1, max: 5, required: true },
    title: String,
    body: { type: String, required: true },
    verified: { type: Boolean, default: false },
    hidden: { type: Boolean, default: false, index: true },
    reported: { type: Boolean, default: false },
  },
  { timestamps: true },
);
reviewSchema.index({ user: 1, course: 1 }, { unique: true });

const notificationSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true },
    body: String,
    type: { type: String, index: true },
    href: String,
    readAt: Date,
    meta: Schema.Types.Mixed,
  },
  { timestamps: true },
);
notificationSchema.index({ user: 1, createdAt: -1 });
notificationSchema.index({ user: 1, readAt: 1 });

const notificationPreferenceSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    inApp: { type: Boolean, default: true },
    email: { type: Boolean, default: true },
    push: { type: Boolean, default: false },
    mutedTypes: [String],
  },
  { timestamps: true },
);

const careerArticleSchema = new Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    excerpt: String,
    body: String,
    cover: { publicId: String, url: String },
    category: { type: String, index: true },
    featured: { type: Boolean, default: false, index: true },
    published: { type: Boolean, default: false, index: true },
    seoTitle: String,
    seoDescription: String,
  },
  { timestamps: true },
);

const roadmapSchema = new Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: String,
    steps: [{ title: String, body: String, order: Number }],
    published: { type: Boolean, default: false },
  },
  { timestamps: true },
);

const blogSchema = new Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    excerpt: String,
    body: String,
    cover: { publicId: String, url: String },
    author: { type: Schema.Types.ObjectId, ref: 'User' },
    tags: [String],
    featured: { type: Boolean, default: false, index: true },
    published: { type: Boolean, default: false, index: true },
    publishedAt: Date,
    seoTitle: String,
    seoDescription: String,
  },
  { timestamps: true },
);
blogSchema.index({ title: 'text', excerpt: 'text' });

const faqSchema = new Schema(
  {
    question: { type: String, required: true },
    answer: { type: String, required: true },
    category: { type: String, default: 'general', index: true },
    order: { type: Number, default: 0 },
    published: { type: Boolean, default: true },
  },
  { timestamps: true },
);

const cmsPageSchema = new Schema(
  {
    key: { type: String, required: true, unique: true },
    title: String,
    body: String,
    seoTitle: String,
    seoDescription: String,
  },
  { timestamps: true },
);

const bannerSchema = new Schema(
  {
    title: String,
    subtitle: String,
    image: { publicId: String, url: String },
    href: String,
    placement: { type: String, enum: ['hero', 'home_mid', 'offer'], default: 'hero' },
    active: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true },
);

const settingSchema = new Schema(
  {
    key: { type: String, required: true, unique: true },
    value: Schema.Types.Mixed,
  },
  { timestamps: true },
);

const auditLogSchema = new Schema(
  {
    actor: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    role: String,
    action: { type: String, required: true, index: true },
    entity: { type: String, index: true },
    entityId: { type: String, index: true },
    ip: String,
    userAgent: String,
    before: Schema.Types.Mixed,
    after: Schema.Types.Mixed,
  },
  { timestamps: true },
);
auditLogSchema.index({ createdAt: -1 });

export const ReviewModel = mongoose.model('Review', reviewSchema);
export const NotificationModel = mongoose.model('Notification', notificationSchema);
export const NotificationPreferenceModel = mongoose.model(
  'NotificationPreference',
  notificationPreferenceSchema,
);
export const CareerArticleModel = mongoose.model('CareerArticle', careerArticleSchema);
export const RoadmapModel = mongoose.model('Roadmap', roadmapSchema);
export const BlogModel = mongoose.model('Blog', blogSchema);
export const FAQModel = mongoose.model('FAQ', faqSchema);
export const CMSPageModel = mongoose.model('CMSPage', cmsPageSchema);
export const BannerModel = mongoose.model('Banner', bannerSchema);
export const SettingModel = mongoose.model('Setting', settingSchema);
export const AuditLogModel = mongoose.model('AuditLog', auditLogSchema);
