export const ROLES = ['student', 'teacher', 'admin'] as const;
export type Role = (typeof ROLES)[number];

export const USER_STATUSES = ['active', 'suspended', 'deactivated', 'pending_verification'] as const;
export type UserStatus = (typeof USER_STATUSES)[number];

export const TEACHER_STATUSES = ['pending', 'approved', 'rejected', 'suspended'] as const;
export type TeacherStatus = (typeof TEACHER_STATUSES)[number];

export const COURSE_STATUSES = ['draft', 'pending_review', 'published', 'archived'] as const;
export type CourseStatus = (typeof COURSE_STATUSES)[number];

export const PRICING_TYPES = ['free', 'paid'] as const;
export type PricingType = (typeof PRICING_TYPES)[number];

export const BATCH_STATUSES = ['upcoming', 'open', 'ongoing', 'closed', 'archived'] as const;
export type BatchStatus = (typeof BATCH_STATUSES)[number];

export const ENROLLMENT_STATUSES = ['active', 'expired', 'cancelled', 'pending_payment'] as const;
export type EnrollmentStatus = (typeof ENROLLMENT_STATUSES)[number];

export const DOUBT_STATUSES = ['pending', 'assigned', 'in_progress', 'answered', 'closed'] as const;
export type DoubtStatus = (typeof DOUBT_STATUSES)[number];

export const MATERIAL_TYPES = [
  'pdf_notes',
  'class_notes',
  'revision_notes',
  'formula_sheet',
  'question_bank',
  'assignment',
  'reference',
  'ebook',
  'pyq',
  'sample_paper',
] as const;
export type MaterialType = (typeof MATERIAL_TYPES)[number];

export const QUESTION_TYPES = [
  'single_mcq',
  'multi_mcq',
  'true_false',
  'numerical',
  'assertion_reason',
  'match',
  'subjective',
] as const;
export type QuestionType = (typeof QUESTION_TYPES)[number];

export const TEST_STATUSES = ['draft', 'scheduled', 'live', 'ended', 'archived'] as const;
export type TestStatus = (typeof TEST_STATUSES)[number];

export const ATTEMPT_STATUSES = ['in_progress', 'submitted', 'auto_submitted', 'evaluated'] as const;
export type AttemptStatus = (typeof ATTEMPT_STATUSES)[number];

export const ASSIGNMENT_STATUSES = ['draft', 'published', 'closed'] as const;
export type AssignmentStatus = (typeof ASSIGNMENT_STATUSES)[number];

export const SUBMISSION_STATUSES = ['submitted', 'late', 'evaluated', 'resubmitted'] as const;
export type SubmissionStatus = (typeof SUBMISSION_STATUSES)[number];

export const ATTENDANCE_MARKS = ['present', 'absent', 'late', 'excused'] as const;
export type AttendanceMark = (typeof ATTENDANCE_MARKS)[number];

export const PAYMENT_STATUSES = [
  'created',
  'pending',
  'authorized',
  'captured',
  'failed',
  'refunded',
  'partially_refunded',
] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export const ORDER_PRODUCT_TYPES = ['course', 'batch'] as const;
export type OrderProductType = (typeof ORDER_PRODUCT_TYPES)[number];

export const WALLET_TX_TYPES = [
  'credit_cashback',
  'credit_referral',
  'credit_promo',
  'credit_refund',
  'debit_purchase',
  'debit_adjustment',
] as const;
export type WalletTxType = (typeof WALLET_TX_TYPES)[number];

export const PAYOUT_STATUSES = ['requested', 'approved', 'rejected', 'processing', 'paid', 'failed'] as const;
export type PayoutStatus = (typeof PAYOUT_STATUSES)[number];

export const NOTIFICATION_CHANNELS = ['in_app', 'email', 'push'] as const;
export type NotificationChannel = (typeof NOTIFICATION_CHANNELS)[number];

export const LANGUAGES = ['en', 'hi', 'hinglish'] as const;
export type Language = (typeof LANGUAGES)[number];

export const RANK_SCOPES = ['all_india', 'state', 'batch', 'course', 'subject'] as const;
export type RankScope = (typeof RANK_SCOPES)[number];

export const PERMISSIONS = [
  'users.manage',
  'students.manage',
  'teachers.manage',
  'teachers.approve',
  'admins.manage',
  'courses.manage',
  'batches.manage',
  'videos.manage',
  'materials.manage',
  'assignments.manage',
  'tests.manage',
  'questions.manage',
  'doubts.manage',
  'mentorship.manage',
  'attendance.manage',
  'payments.manage',
  'refunds.manage',
  'coupons.manage',
  'wallets.manage',
  'referrals.manage',
  'reviews.manage',
  'payouts.manage',
  'cms.manage',
  'career.manage',
  'notifications.manage',
  'reports.view',
  'audit.view',
  'settings.manage',
  'security.manage',
  'rankings.manage',
] as const;
export type Permission = (typeof PERMISSIONS)[number];

export const PAGINATION = {
  defaultLimit: 20,
  maxLimit: 100,
} as const;

export const FILE_LIMITS = {
  imageMb: 8,
  videoMb: 2048,
  documentMb: 50,
} as const;

export const ALLOWED_IMAGE_MIME = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'] as const;
export const ALLOWED_VIDEO_MIME = ['video/mp4', 'video/webm', 'video/quicktime'] as const;
export const ALLOWED_DOC_MIME = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
] as const;
