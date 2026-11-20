# GyanChock — Admin Course Approval & Review Workflow Report

## 1. Overview

This document specifies the admin course review, verification, approval, change request, and publishing mechanisms.

- **Admin Management Route**: `apps/web/src/app/admin/courses/page.tsx`
- **Backend Handlers**: `apps/server/src/routes/catalog.routes.ts`
- **Audit Logging**: `apps/server/src/middleware/audit.ts`
- **Notifications**: `apps/server/src/services/notification.service.ts`

---

## 2. Admin Review & Inspection

Administrators must verify curriculum completeness, video playback quality, and pricing structure before publishing courses to the public catalogue.

### 2.1 "Review Classroom" Action
In `apps/web/src/app/admin/courses/page.tsx`, every course row features a **"Review Classroom"** action button:
- Navigates to `/student/learning/:courseId?preview=1`.
- Renders the course curriculum in student classroom mode.
- Allows administrators to play uploaded video lectures, inspect study materials, and verify syllabus progression without requiring a paid enrollment record.

---

## 3. Approval Workflow Specifications

### 3.1 One-Time Approval (`POST /api/courses/:id/approve`)
- **Authorization**: Restrict to `admin` role via `authenticate` and `requireRoles('admin')`.
- **Idempotency Guard**:
  ```typescript
  if (course.status === 'published') {
    return res.json({ course: withPublicThumbnail(course.toObject()), message: 'Course is already approved and published' });
  }
  ```
- **State Mutations**:
  - `course.status` $\rightarrow$ `'published'`
  - `course.publishedAt` $\rightarrow$ `new Date()`
  - `course.approvedBy` $\rightarrow$ `req.user.id` (Admin user ID)
  - `course.approvedAt` $\rightarrow$ `new Date()`
  - `course.approvalNotes` $\rightarrow$ `undefined`
- **Notifications**:
  - In-app notification sent to all associated teachers:
    - Title: `"Course Approved: <Course Title>"`
    - Body: `"Your course has been approved by admin and is now published live on the store."`
- **Audit Logging**:
  - Writes audit record: `action: 'course.approve'`, `entity: 'course'`.

### 3.2 Request Changes (`POST /api/courses/:id/request-changes`)
- **Authorization**: Admin only.
- **Payload**: `{ feedback?: string, reason?: string }`
- **State Mutations**:
  - `course.status` $\rightarrow$ `'draft'`
  - `course.approvalNotes` $\rightarrow$ Captured feedback string.
- **Notifications**:
  - In-app notification sent to all course teachers:
    - Title: `"Changes Requested: <Course Title>"`
    - Body: `"Feedback from review: <Feedback Text>"`
- **Audit Logging**:
  - Records audit trail with previous and modified states.

### 3.3 Rejection (`POST /api/courses/:id/reject`)
- Reverts course to `draft` with rejection notes.
- Notifies teacher with rejection feedback.

---

## 4. Status Transition Matrix

```
┌─────────┐   Teacher Submits Review   ┌────────────────┐
│  draft  │ ─────────────────────────> │ pending_review │
└─────────┘                            └────────────────┘
     ▲                                          │
     │                                          │ Admin Approves
     │ Admin Requests Changes / Rejects         ▼
     └────────────────────────────────── ┌───────────┐
                                         │ published │
                                         └───────────┘
```

| Source State | Target State | Endpoint | Permitted Role |
| :--- | :--- | :--- | :--- |
| `draft` | `pending_review` | `POST /api/courses/:id/submit-review` | Teacher / Admin |
| `pending_review` | `published` | `POST /api/courses/:id/approve` | Admin |
| `pending_review` | `draft` | `POST /api/courses/:id/request-changes` | Admin |
| `pending_review` | `draft` | `POST /api/courses/:id/reject` | Admin |
| `published` | `archived` | `PATCH /api/courses/:id` (`status: 'archived'`) | Admin |

---

## 5. Security & Idempotency Guarantees
- Unprivileged users (students, unauthorized teachers) cannot execute approval or change-request routes (rejected with `403 Forbidden`).
- Double-clicking or repeated calls to the approval endpoint will not re-publish, generate duplicate notifications, or corrupt audit timestamps.
