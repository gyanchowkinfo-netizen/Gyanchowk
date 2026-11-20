# Security and Audit Report

## 1. Authentication & Role-Based Access Control (RBAC)

### 1.1 Role Hierarchies
- **Admin (`admin`)**:
  - Global supervisory access across all courses, teachers, students, videos, and materials.
  - Can approve, reject, publish, archive, or edit any content entity.
  - Can upload videos and materials on behalf of teachers while preserving teacher pedagogical ownership.
- **Teacher (`teacher`)**:
  - Scoped to their own courses, curriculum elements, videos, and materials.
  - Verified via `assertTeacherOwnsCourse` middleware to guarantee isolation.
  - Cannot access other teachers' draft courses or unauthorized management controls.
- **Student (`student`)**:
  - Read-only access to published courses, enrolled lessons, and assigned study materials.
  - Direct video streaming access is gated via time-expiring signed playback grants (`GET /api/videos/:id/playback`).
  - Study material file downloads are secured via private signed Cloudinary URLs (`GET /api/learning/materials/:id/download`).

---

## 2. Audit Trail System (`AuditLogModel`)
Every administrative and content lifecycle event writes an immutable audit log entry into MongoDB (`AuditLog` collection):

### 2.1 Audit Schema
```ts
{
  actor: Schema.Types.ObjectId, // User performing the action
  role: 'admin' | 'teacher' | 'student',
  action: string, // e.g., 'course.approve', 'video.create', 'material.delete'
  entity: string, // 'Course' | 'Video' | 'StudyMaterial' | 'User'
  entityId: string,
  ip?: string,
  userAgent?: string,
  before?: unknown, // Snapshot before mutation
  after?: unknown,  // Snapshot after mutation
  createdAt: Date
}
```

### 2.2 Traceability Table

| Action | Actor Role | Entity | Traceability Metadata |
|---|---|---|---|
| `course.create` | Teacher / Admin | Course | Title, category, teachers assigned, createdBy |
| `course.submit_review` | Teacher | Course | Status change to `pending_review` |
| `course.approve` | Admin | Course | Transition to `published`, approving admin ID, timestamp |
| `course.request_changes`| Admin | Course | Transition to `draft`, approving admin ID, reason |
| `course.reject` | Admin | Course | Transition to `draft`, admin ID |
| `video.create` | Teacher / Admin | Video | Title, course ID, teacher owner, uploadedBy operator |
| `video.update` | Teacher / Admin | Video | Modified properties |
| `video.delete` | Teacher / Admin | Video | Target video ID, unlinked lessons |
| `material.create` | Teacher / Admin | StudyMaterial | Title, type, teacher owner, uploadedBy operator |
| `material.update` | Teacher / Admin | StudyMaterial | Changed fields, status transition |
| `material.delete` | Teacher / Admin | StudyMaterial | Deleted material ID |

---

## 3. Media Security & Safe Deletion
- **Unlinking Before Deletion**: When a video is deleted, the backend first unsets the `video` reference across all corresponding `Lesson` documents (`LessonModel.updateMany({ video: video._id }, { $unset: { video: 1 } })`), preventing broken references in the student classroom.
- **Bookmark & Note Cleanup**: Dependent student bookmarks and video notes are cleaned up concurrently upon video removal.
- **Signed Cloudinary Uploads**: Media is uploaded using temporary, HMAC-authenticated signatures. No server API keys or master credentials are exposed to the client.
