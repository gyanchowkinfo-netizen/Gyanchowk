# GyanChock — Complete Course Workflow Implementation Report

## 1. Executive Summary

This report documents the architectural design, implementation, and verification of the end-to-end Course Lifecycle Workflow in GyanChock:

```
[Teacher Creates Course]
          │
          ▼
[Curriculum Builder: Add Subjects ➔ Chapters ➔ Topics ➔ Lessons]
          │
          ▼
[Video Upload & Cascading Association (Course, Subject, Topic, Lesson)]
          │
          ▼
[Submit for Review (Validation Checklist Enforced)]
          │
          ▼
[Admin Review & Idempotent Approval / Request Changes]
          │
          ▼
[Course Published ➔ Instant Live Availability in Storefront & Student Classroom]
```

All implementations were executed strictly within the existing monorepo architecture (`apps/web`, `apps/server`, `packages/shared`), preserving all existing UI styling, design tokens, responsive layouts, authentication/authorization pipelines, and student progress/enrollment features.

---

## 2. End-to-End Workflow Architecture

### 2.1 Course Creation & Metadata Management
- **Teacher View**: Located at `/teacher/courses`.
- **Wizard**: A multi-step flow capturing core metadata:
  - Title, Subtitle, Category, Target Exam, Level, Language, Duration, Detailed Description.
  - Pricing model (Paid / Free), Price in INR, Validity period in days, and Certificate enablement toggle.
- **Persistence**: Saved via `POST /api/courses` as `draft` with `teachers: [req.user.id]` and `createdBy: req.user.id`.
- **In-Place Editing**: Teachers can update course metadata at any time from both the catalogue card and the curriculum manager via `PATCH /api/courses/:id`.

### 2.2 Hierarchical Curriculum Construction
- **Hierarchy Structure**: `Course → Subject → Chapter → Topic → Lesson → Video`.
- **Relational Integrity**:
  - `SubjectModel`: Belongs to `CourseModel`.
  - `ChapterModel`: Belongs to `CourseModel` and `SubjectModel`.
  - `TopicModel`: Belongs to `CourseModel` and `ChapterModel`.
  - `LessonModel`: Belongs to `CourseModel`, `TopicModel`, and optional `ChapterModel`. Attaches a `VideoModel` reference.
- **Dynamic Curriculum Manager**: Located at `apps/web/src/components/teachers/CourseCurriculumManager.tsx`. Allows teachers to add, edit, reorder, and remove subjects, chapters, topics, and lessons dynamically with optimistic and reactive cache invalidation.

### 2.3 Video Management & Cascading Dynamic Selectors
- **Location**: `/teacher/videos`.
- **Dynamic Cascading Flow**:
  - Selection of Course triggers asynchronous fetching of its associated Subjects via `GET /api/catalog/subjects?course=:id`.
  - Selection of Subject triggers fetching of associated Topics via `GET /api/catalog/topics?subject=:id&course=:id`.
  - Selection of Topic triggers fetching of associated Lessons via `GET /api/catalog/lessons?topic=:id&course=:id`.
- **Direct Cloudinary Upload**: Secure direct uploads using signed timestamp and folder parameters without transmitting binary chunks through the Node server.
- **Automatic Metadata Ingestion**: Duration, resolution, thumbnail, and public ID are recorded in `VideoModel` and optionally mapped directly onto the target `LessonModel`.

### 2.4 Pre-Submission Validation Checklist
Before submitting a course for admin review, the system validates the curriculum:
1. Title length $\ge 3$ characters.
2. Subject count $\ge 1$.
3. Lesson count $\ge 1$.
Teachers cannot submit incomplete or empty courses. The UI presents a visual readiness checklist with checkmark indicators.

### 2.5 Admin Approval & Feedback Loop
- **Admin View**: Located at `/admin/courses`.
- **Review Classroom**: Admin can preview the course using the student learning classroom (`/student/learning/:id?preview=1`) to inspect video playback, curriculum order, and materials prior to approval.
- **One-Time Approval (`POST /api/courses/:id/approve`)**:
  - Status transitions to `published`.
  - Sets `approvedBy` to the admin user's ObjectId.
  - Sets `approvedAt` timestamp.
  - Clears `approvalNotes`.
  - Dispatches in-app notification to course teachers.
  - Idempotent: Subsequent calls return success without redundant DB modifications.
- **Request Changes (`POST /api/courses/:id/request-changes`)**:
  - Reverts course status back to `draft`.
  - Records feedback notes in `approvalNotes`.
  - Dispatches in-app notification to course teachers with review feedback.
  - Teacher view immediately displays an amber banner highlighting the reviewer's feedback.

---

## 3. Workflow Verification & Status Matrix

| Stage | Trigger / Actor | Backend Route | Database Mutations | Status |
| :--- | :--- | :--- | :--- | :--- |
| **Course Draft** | Teacher | `POST /api/courses` | `CourseModel` created (`status: 'draft'`) | Verified |
| **Curriculum Build** | Teacher | `/api/catalog/*` | `SubjectModel`, `ChapterModel`, `TopicModel`, `LessonModel` | Verified |
| **Video Link** | Teacher | `POST /api/videos` | `VideoModel` created with course, subject, topic, lesson | Verified |
| **Submit Review** | Teacher | `POST /api/courses/:id/submit-review` | `CourseModel.status = 'pending_review'` | Verified |
| **Admin Changes** | Admin | `POST /api/courses/:id/request-changes` | `CourseModel.status = 'draft'`, `approvalNotes = feedback` | Verified |
| **Admin Approve** | Admin | `POST /api/courses/:id/approve` | `CourseModel.status = 'published'`, `approvedBy`, `approvedAt` | Verified |
| **Student Access** | Enrolled / Visitor | `GET /api/courses/:id`, `/api/catalog/curriculum/:id` | Read-only delivery, progress tracking | Verified |

---

## 4. Architectural Summary

All parts of the course workflow are now active, fully unified across database collections, and guarded with strict role-based ownership checks.
