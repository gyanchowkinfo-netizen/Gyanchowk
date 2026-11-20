# Database Changes & Schema Integrity Report

## 1. Zero Destructive Migrations
In strict adherence to **Rule 5 (Extend, Do Not Rebuild)** and **Part 12 (Database & API Rules)**:
- **No collections were dropped or renamed.**
- **No fields were deleted.**
- **No existing indexes or schema references were broken.**

All features leverage the existing Mongoose models already present in `apps/server/src/models/`.

---

## 2. Models Inspected and Utilized

### `CourseModel` (`catalog.models.ts`)
- **Statuses Utilized**: `'draft'`, `'pending_review'`, `'published'`, `'archived'` (all natively supported in `packages/shared/src/constants.ts`).
- **Fields Utilized**: `title`, `slug`, `subtitle`, `description`, `category`, `targetExam`, `pricingType`, `price`, `validityDays`, `certificateEnabled`, `publishedAt`, `createdBy`, `teachers`.

### `SubjectModel` (`catalog.models.ts`)
- Fields: `name`, `slug`, `course`, `batch`, `description`, `order`.
- Indexed: `{ course: 1, slug: 1 }`.

### `ChapterModel` (`catalog.models.ts`)
- Fields: `name`, `slug`, `subject`, `course`, `description`, `order`.
- Indexed: `{ subject: 1, slug: 1 }`.

### `TopicModel` (`catalog.models.ts`)
- Fields: `name`, `slug`, `chapter`, `course`, `description`, `order`.
- Indexed: `{ chapter: 1, slug: 1 }`.

### `LessonModel` (`catalog.models.ts`)
- Fields: `title`, `slug`, `topic`, `chapter`, `course`, `video`, `durationSec`, `isDemo`, `order`, `description`.
- Indexed: `{ topic: 1, slug: 1 }`, `{ course: 1, order: 1 }`.

### `VideoModel` (`catalog.models.ts`)
- Synchronized when assigned to a lesson via `lesson: lesson._id`.

### `FAQModel` (`content.models.ts`)
- Utilized: `question`, `answer`, `category`, `order`, `published`.

### `BlogModel` (`content.models.ts`)
- Utilized: `title`, `slug`, `excerpt`, `body`, `author`, `tags`, `featured`, `published`, `publishedAt`.

### `CMSPageModel` (`content.models.ts`)
- Utilized: `key`, `title`, `body`.

### `AuditLogModel` (`content.models.ts`)
- Records course review submissions, approvals, and rejections.

---

## 3. Backward Compatibility
All existing production records without `pending_review` or curriculum sub-elements function normally. Student progress tracking, enrollment records, and storefront searches continue operating seamlessly without required manual backfills.
