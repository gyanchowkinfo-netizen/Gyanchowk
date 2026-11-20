# CMS & Course Management API Changes

This document details all API endpoints reused, extended, or added to support the full CMS workflows, course lifecycle, and curriculum hierarchy.

---

## 1. Newly Added & Extended Endpoints

### A. Course Lifecycle & Governance

#### `POST /api/courses/:id/submit-review`
- **Access**: Authenticated Teacher (must own course) or Admin.
- **Validation**:
  - Course title must be at least 3 characters.
  - Course must have at least 1 Subject created in curriculum.
  - Course must have at least 1 Lesson added in curriculum.
- **Action**: Transitions status from `draft` to `pending_review`. Creates an audit log entry in `AuditLogModel`.
- **Response**: `{ course, message }`.

#### `POST /api/courses/:id/approve`
- **Access**: Authenticated Admin only.
- **Action**: Transitions status from `pending_review` or `draft` to `published`, setting `publishedAt = new Date()`.
- **Response**: `{ course, message }`.

#### `POST /api/courses/:id/reject`
- **Access**: Authenticated Admin only.
- **Action**: Transitions status to `draft` with an optional review reason. Creates an audit log entry.
- **Response**: `{ course, message }`.

---

### B. Curriculum Management Hierarchy

#### `GET /api/catalog/curriculum/:courseId`
- **Access**: Authenticated Teacher (must own course) or Admin.
- **Action**: Returns full relational curriculum structure:
  - Course document.
  - All Subjects sorted by `order`.
  - All Chapters sorted by `order`.
  - All Topics sorted by `order`.
  - All Lessons with populated `Video` documents sorted by `order`.
  - Associated Study Materials, Tests, and Assignments.
  - Teacher's library of available uploaded videos for assignment to lessons.
- **Response**: `{ course, subjects, chapters, topics, lessons, materials, tests, assignments, availableVideos }`.

#### `PATCH /api/catalog/subjects/:id`
- **Access**: Teacher (owner) or Admin.
- **Payload**: `{ name?: string, description?: string, order?: number }`.
- **Action**: Updates subject details and updates `slug` if name changes.

#### `DELETE /api/catalog/subjects/:id`
- **Access**: Teacher (owner) or Admin.
- **Action**: Deletes subject and safely cascades deletion of associated chapters, topics, and lessons.

#### `PATCH /api/catalog/chapters/:id` & `DELETE /api/catalog/chapters/:id`
- **Access**: Teacher (owner) or Admin.
- **Action**: Updates or deletes chapter and cascades to child topics and lessons.

#### `PATCH /api/catalog/topics/:id` & `DELETE /api/catalog/topics/:id`
- **Access**: Teacher (owner) or Admin.
- **Action**: Updates or deletes topic and cascades to child lessons.

#### `PATCH /api/catalog/lessons/:id`
- **Access**: Teacher (owner) or Admin.
- **Payload**: `{ title?: string, description?: string, isDemo?: boolean, durationSec?: number, order?: number, video?: string }`.
- **Action**: Updates lesson fields. If a `video` ObjectId is provided, synchronizes `VideoModel.updateOne({ _id: video }, { lesson: lesson._id })`.

#### `DELETE /api/catalog/lessons/:id`
- **Access**: Teacher (owner) or Admin.
- **Action**: Deletes lesson and unlinks associated video (`$unset: { lesson: 1 }`).

---

### C. CMS Editorial Operations (`/api/cms/admin/*`)

#### `GET /api/cms/admin/faqs`
- **Access**: Admin.
- **Action**: Returns all FAQs sorted by `order: 1, createdAt: -1`.

#### `PATCH /api/cms/admin/faqs/:id`
- **Access**: Admin.
- **Payload**: `{ question?: string, answer?: string, category?: string, order?: number, published?: boolean }`.

#### `DELETE /api/cms/admin/faqs/:id`
- **Access**: Admin.
- **Action**: Deletes FAQ document.

#### `GET /api/cms/admin/blogs`
- **Access**: Admin.
- **Action**: Returns paginated list of blog articles with author details.

#### `PATCH /api/cms/admin/blogs/:id`
- **Access**: Admin.
- **Payload**: `{ title?: string, slug?: string, excerpt?: string, body?: string, tags?: string[], featured?: boolean, published?: boolean }`.

#### `DELETE /api/cms/admin/blogs/:id`
- **Access**: Admin.
- **Action**: Deletes blog document.

#### `GET /api/cms/admin/pages` & `GET /api/cms/admin/pages/:key`
- **Access**: Admin.
- **Action**: Retrieves custom page content by key (e.g. `privacy-policy`, `about`, `about-mission`).

#### `DELETE /api/cms/admin/pages/:key`
- **Access**: Admin.
- **Action**: Deletes custom override for a legal page key.

---

## 2. Reused Unchanged Endpoints
- `GET /api/courses` & `GET /api/courses/meta`
- `POST /api/courses` & `PATCH /api/courses/:id` & `DELETE /api/courses/:id`
- `GET /api/banners` & `POST /api/banners` & `PUT /api/banners/:id` & `DELETE /api/banners/:id`
- `POST /api/uploads/signature`
- `GET /api/videos` & `POST /api/videos`
- `GET /api/learning/materials` & `POST /api/learning/materials`
- `GET /api/admin/dashboard` & `GET /api/admin/reports` & `GET /api/admin/audit-logs`
