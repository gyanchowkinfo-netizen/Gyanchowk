# API and Database Changes Report

## 1. Database Schema Enhancements (Non-Destructive & Backward-Compatible)

### 1.1 `videoSchema` (`apps/server/src/models/catalog.models.ts`)
- Added `uploadedBy: { type: Schema.Types.ObjectId, ref: 'User', index: true }`.
- Purpose: Explicitly distinguishes between the pedagogical content owner (`teacher`) and the administrative operator who executed the upload (`uploadedBy`).

### 1.2 `studyMaterialSchema` (`apps/server/src/models/learning.models.ts`)
- Added `topic: { type: Schema.Types.ObjectId, ref: 'Topic', index: true }`.
- Added `uploadedBy: { type: Schema.Types.ObjectId, ref: 'User', index: true }`.
- Purpose: Supports fine-grained topic-level linking for notes/materials and tracks upload operator identity.

### 1.3 `attendanceSessionSchema` & `attendanceSchema` (`apps/server/src/models/support.models.ts`)
- Added `course: { type: Schema.Types.ObjectId, ref: 'Course', index: true }`.
- Made `batch` optional (removed strict `required: true`).
- Purpose: Allows scheduling classroom attendance sessions linked directly to Courses, eliminating the mandatory batch ID requirement.

### 1.4 `enrollmentSchema` (`apps/server/src/models/learning.models.ts`)
- Replaced `{ unique: true, sparse: true }` compound indexes `{ user: 1, course: 1 }` and `{ user: 1, batch: 1 }` with `partialFilterExpression`:
  - `user_1_course_1`: `{ unique: true, partialFilterExpression: { course: { $exists: true, $type: 'objectId' } } }`
  - `user_1_batch_1`: `{ unique: true, partialFilterExpression: { batch: { $exists: true, $type: 'objectId' } } }`
- Purpose: Resolves MongoDB `E11000 duplicate key error` on `user_1_batch_1 dup key: { user: ..., batch: null }` during free and paid course enrollments. Compound sparse indexes in MongoDB do not omit documents when only one key is missing.
- Added automated DB index migration in `repairEnrollmentIndexes()` (`apps/server/src/config/db.ts`) to drop legacy sparse indexes on startup and ensure partial indexes are created.
- Enhanced `createEnrollment` (`apps/server/src/services/enrollment.service.ts`) with existing enrollment reactivation, clean document field construction, and runtime index self-repair.

---

## 2. API Endpoints Created and Enhanced

### 2.1 Course Review & Approval Endpoints (`apps/server/src/routes/catalog.routes.ts`)

| Method | Endpoint | Allowed Roles | Description |
|---|---|---|---|
| `POST` | `/api/courses/:id/submit-review` | `teacher`, `admin` | Submits a draft course for review; sets `status = 'pending_review'`, creates admin notifications, logs audit event. |
| `POST` | `/api/courses/:id/approve` | `admin` | Approves and publishes course once; sets `status = 'published'`, `publishedAt = now()`, notifies teacher, logs audit event. Idempotent if already published. |
| `POST` | `/api/courses/:id/reject` | `admin` | Rejects course back to draft status; sets `status = 'draft'`, notifies teacher, logs audit event. |
| `POST` | `/api/courses/:id/request-changes` | `admin` | Requests revisions from teacher; sets `status = 'draft'`, notifies teacher, logs audit event. |

### 2.2 Video Management Endpoints (`apps/server/src/routes/video.routes.ts`)

| Method | Endpoint | Allowed Roles | Description |
|---|---|---|---|
| `GET` | `/api/videos` | `teacher`, `admin` | Retrieves videos list. Supports query filters `?teacher=`, `?course=`, `?subject=`, `?topic=`, `?q=`. Populates `teacher`, `uploadedBy`, `course`, `subject`, `topic`, `lesson`. |
| `POST` | `/api/videos` | `teacher`, `admin` | Creates video metadata. Supports admin uploading on behalf of teacher (`teacher` vs `uploadedBy`), auto-updates linked lesson, writes audit log. |
| `PATCH` | `/api/videos/:id` | `teacher`, `admin` | Updates video metadata (title, isDemo, subject, topic, lesson). Teacher can only edit their own videos; admin can edit all. Writes audit log. |
| `DELETE` | `/api/videos/:id` | `teacher`, `admin` | Unlinks video from lessons and safely deletes video, bookmarks, and notes. Writes audit log. |

### 2.3 Study Material Endpoints (`apps/server/src/routes/learning.routes.ts`)

| Method | Endpoint | Allowed Roles | Description |
|---|---|---|---|
| `GET` | `/api/learning/materials` | `student`, `teacher`, `admin` | Retrieves materials with pagination. Populates `teacher`, `uploadedBy`, `course`, `subject`, `topic`. Filters by status, course, subject, topic, teacher, type, query. |
| `POST` | `/api/learning/materials` | `teacher`, `admin` | Creates material. Supports admin assignment of teacher owner, tracks `uploadedBy`, logs audit event. |
| `PATCH` | `/api/learning/materials/:id` | `teacher`, `admin` | Updates material title, type, status (`published`/`hidden`/`draft`). Owner check enforced for teachers. Writes audit log. |
| `DELETE` | `/api/learning/materials/:id` | `teacher`, `admin` | Safely removes study material record. Owner check enforced for teachers. Writes audit log. |

---

## 3. Preservation Verification
- No existing endpoints, route signatures, or parameters were altered or removed.
- All additions accept existing optional payload patterns and degrade gracefully when legacy data is encountered.
