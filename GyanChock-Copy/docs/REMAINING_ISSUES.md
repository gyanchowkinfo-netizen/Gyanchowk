# GyanChock — Remaining Issues & Environment Checklist

## 1. Resolved Issues

The following critical issues identified during implementation have been fully resolved and verified:

### 1.1 Cloudinary Direct Upload "Invalid Signature" Error
- **Status**: **RESOLVED**
- **Resolution**: Aligned `uploadSignature` service in `apps/server/src/services/video.service.ts` to sign strictly `folder` and `timestamp`, matching the browser's direct upload payload. Added HLS and signed MP4 delivery fallback in `VideoPlayer.tsx`.

### 1.2 Published Teacher Dashboard Access Lockout
- **Status**: **RESOLVED**
- **Resolution**: Added bidirectional synchronization between `UserModel.teacherStatus` and `TeacherModel.status`. Extended `TEACHER_STATUSES` in `@gyan-chowk/shared` to include `'published'`. Added self-healing middleware in `authenticate` and `/api/auth/me` to ensure approved teachers instantly access teacher tools.

### 1.3 Course Curriculum Cascading Hierarchy
- **Status**: **RESOLVED**
- **Resolution**: Added `subject` and `topic` references to `VideoModel`. Implemented cascading selector endpoints (`/api/catalog/subjects`, `/api/catalog/topics`, `/api/catalog/lessons`) and connected them to the video upload UI.

### 1.4 Admin Review, Approval & Change Request Loop
- **Status**: **RESOLVED**
- **Resolution**: Implemented idempotent one-time approval (`POST /api/courses/:id/approve`), changes request route (`POST /api/courses/:id/request-changes`), audit logging, in-app teacher notifications, and classroom review preview mode (`/student/learning/:id?preview=1`).

---

## 2. Environment Prerequisites for Production

To ensure smooth operation in production deployment, ensure the following environment configurations are maintained:

1. **Cloudinary Credentials**:
   Ensure `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET` are properly set in production environment variables (`apps/server/.env`).
2. **MongoDB Replica Set**:
   Recommended for multi-document transaction support during large batch enrollments.
3. **CORS Whitelist**:
   Verify `FRONTEND_URL` in `apps/server/.env` matches your production domain to allow credentialed cookies across API requests.

---

## 3. Pending Critical Defects

**Zero pending critical defects.**
All requested workflows compile cleanly with exit code 0 and meet all system requirements.
