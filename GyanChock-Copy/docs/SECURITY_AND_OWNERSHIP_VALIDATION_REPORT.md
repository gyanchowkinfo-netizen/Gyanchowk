# GyanChock — Security & Ownership Validation Report

## 1. Overview

This report details the security safeguards, access control barriers, ownership verification mechanisms, and credential protection protocols enforced throughout the course and video workflows.

---

## 2. Authentication & Authorization Middleware

### 2.1 Role-Based Access Control (RBAC)
All administrative and instructor routes require authenticated JWT sessions via `authenticate` middleware, followed by explicit role barriers:
- `requireRoles('admin')`: Strictly limits execution to users with `role: 'admin'`. Applied to:
  - Course Approval: `POST /api/courses/:id/approve`
  - Change Requests: `POST /api/courses/:id/request-changes`
  - Rejection: `POST /api/courses/:id/reject`
  - Course Deletion: `DELETE /api/courses/:id`
- `teacherOrAdmin`: Allows either active teachers or system administrators. Applied to:
  - Course Creation: `POST /api/courses`
  - Curriculum Management: `/api/catalog/*`
  - Video Operations: `/api/videos/*`

---

## 3. Resource Ownership Verification

### 3.1 Course Ownership (`assertTeacherOwnsCourse`)
Defined in `apps/server/src/services/learning.service.ts`:
```typescript
export function assertTeacherOwnsCourse(role: string, userId: string, course: CourseDoc | null | undefined): void {
  if (role === 'admin') return; // Admins bypass teacher ownership checks
  if (!course) throw notFound('Course not found');
  const teacherIds = Array.isArray(course.teachers)
    ? course.teachers.map((t) => String((t as any)?._id ?? t))
    : [];
  const createdBy = course.createdBy ? String((course.createdBy as any)?._id ?? course.createdBy) : null;
  const isOwner = teacherIds.includes(String(userId)) || createdBy === String(userId);
  if (!isOwner) {
    throw forbidden('You do not have permission to manage this course');
  }
}
```
Enforced across:
- `PATCH /api/courses/:id`
- `POST /api/courses/:id/submit-review`
- `GET /api/catalog/curriculum/:courseId`
- All nested curriculum mutations (subjects, chapters, topics, lessons).

### 3.2 Video Ownership Verification
In `apps/server/src/routes/video.routes.ts`:
- **Upload (`POST /api/videos`)**:
  - Validates that the teacher owns the specified `course` before permitting a video to be linked to it.
  - Automatically tags the video with `teacher: req.user.id`.
- **Edit / Delete (`PATCH /api/videos/:id`, `DELETE /api/videos/:id`)**:
  - Inspects `video.teacher` or `video.course`.
  - Rejects foreign modifications with `403 Forbidden` if the calling user is neither the creator teacher nor an admin.

---

## 4. Media & Cloudinary Security

### 4.1 Server Secret Isolation
- The Cloudinary API secret is never sent to the browser or embedded in client bundles.
- The client requests a signed upload token via `POST /api/videos/signature`.
- The signature is calculated server-side using HMAC-SHA1:
  ```typescript
  const signature = cloudinary.utils.api_sign_request(
    { folder, timestamp },
    process.env.CLOUDINARY_API_SECRET!
  );
  ```
- **Replay Attack Protection**: Signatures include a short-lived Unix timestamp that expires rapidly, preventing re-use of upload authorizations.

---

## 5. Defense Against Insecure Direct Object References (IDOR)

1. **Course Modification IDOR**: An instructor cannot modify another instructor's course by guessing or enumerating course ObjectIds; `assertTeacherOwnsCourse` halts execution and throws `403 Forbidden`.
2. **Video Deletion IDOR**: An instructor cannot delete videos uploaded by peer instructors; ownership is validated prior to deletion.
3. **Privilege Escalation IDOR**: Non-admin users attempting to invoke approval endpoints receive `403 Forbidden` immediately before any database query executes.

---

## 6. Audit Logging

Every critical state transition is permanently recorded in the `audit_logs` collection:
- `course.create`
- `course.submit_review`
- `course.approve`
- `course.request_changes`
- `course.reject`
- `course.delete`
- `video.delete`

Each audit entry captures the actor ID, actor role, timestamp, entity type, entity ID, and mutation snapshot.
