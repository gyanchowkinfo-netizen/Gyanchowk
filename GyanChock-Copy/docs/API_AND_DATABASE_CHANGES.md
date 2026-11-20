# GyanChock — API and Database Changes Report

## 1. Overview

This document provides a comprehensive technical log of all MongoDB schema modifications, index creations, API route additions, and shared type definitions introduced during the course lifecycle implementation.

---

## 2. Database Schema Modifications

### 2.1 Course Model (`apps/server/src/models/catalog.models.ts`)
Three new fields were added to `courseSchema` to support the one-time admin approval lifecycle and feedback mechanism:

```typescript
// Added to courseSchema:
approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
approvedAt: Date,
approvalNotes: String,
```

- `approvedBy`: Stores the MongoDB ObjectId of the Admin user who verified and approved the course.
- `approvedAt`: UTC timestamp of the approval event.
- `approvalNotes`: Stores reviewer feedback when changes are requested by an administrator.

### 2.2 Video Model (`apps/server/src/models/catalog.models.ts`)
Two relational references and a compound query index were added to `videoSchema`:

```typescript
// Added to videoSchema:
subject: { type: Schema.Types.ObjectId, ref: 'Subject', index: true },
topic: { type: Schema.Types.ObjectId, ref: 'Topic', index: true },

// Compound index for cascading curriculum queries:
videoSchema.index({ course: 1, subject: 1, topic: 1 });
```

- Direct `subject` and `topic` references enable instant cascading filtering without having to perform expensive multi-level lookups through the `LessonModel` collection.
- Fully backward compatible: Existing videos with only `course` or `lesson` remain valid.

---

## 3. Shared Library Modifications (`packages/shared`)

### 3.1 Teacher Status Alignment (`packages/shared/src/types/index.ts`)
Updated `TEACHER_STATUSES` constant to include `'published'`:
```typescript
export const TEACHER_STATUSES = ['pending', 'active', 'suspended', 'rejected', 'published'] as const;
```
Ensures seamless bidirectional status synchronization between `UserModel.teacherStatus` and `TeacherModel.status`.

---

## 4. API Endpoints Catalog

### 4.1 Curriculum Cascading Endpoints (`apps/server/src/routes/catalog.routes.ts`)

| Method | Route | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/catalog/subjects?course=:courseId` | Fetch subjects for a specific course | Authenticated |
| `GET` | `/api/catalog/topics?subject=:subjectId&course=:courseId` | Fetch topics for a specific subject | Authenticated |
| `GET` | `/api/catalog/lessons?topic=:topicId&course=:courseId` | Fetch lessons for a specific topic | Authenticated |

### 4.2 Course Lifecycle Endpoints (`apps/server/src/routes/catalog.routes.ts`)

| Method | Route | Description | Permitted Roles |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/courses` | Create draft course with metadata | Teacher, Admin |
| `PATCH` | `/api/courses/:id` | Update course details | Owner Teacher, Admin |
| `POST` | `/api/courses/:id/submit-review` | Submit course for admin review | Owner Teacher, Admin |
| `POST` | `/api/courses/:id/approve` | One-time approval and publication | Admin |
| `POST` | `/api/courses/:id/request-changes` | Return to draft with feedback | Admin |
| `POST` | `/api/courses/:id/reject` | Reject to draft with feedback | Admin |

### 4.3 Video Management Endpoints (`apps/server/src/routes/video.routes.ts`)

| Method | Route | Description | Permitted Roles |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/videos` | Record uploaded video with course, subject, topic, lesson | Teacher, Admin |
| `GET` | `/api/videos` | List videos with filters (`course`, `subject`, `topic`, `q`) | Teacher, Admin |
| `PATCH` | `/api/videos/:id` | Update video title or description | Owner Teacher, Admin |
| `DELETE` | `/api/videos/:id` | Delete video and unlink from associated lessons | Owner Teacher, Admin |
| `POST` | `/api/videos/signature` | Generate signed Cloudinary upload params (`folder`, `timestamp`) | Teacher, Admin |

---

## 5. Backward Compatibility Guarantee
- All database field additions are optional or carry defaults (`approvedBy`, `approvedAt`, `approvalNotes`, `subject`, `topic`).
- Zero data migrations or collection drops are required.
- All existing courses, batches, lessons, and videos continue to function identically.
