# Security & Authorization Fixes

This document details the security improvements, access controls, and validation rules implemented across the application in accordance with **Part 10 (Security and Authorization)**.

---

## 1. Unpublished Course Visibility Gating
- **Vulnerability Identified**: The public endpoint `GET /api/courses/:slug` previously allowed querying courses with `status: 'draft'`, potentially exposing unpublished course content and proprietary curriculum to unauthenticated visitors.
- **Fix Implemented**:
  - Restructured `courseRouter.get('/:slug')` to strictly evaluate caller authorization when `course.status !== 'published'`:
    1. If caller is an **Admin**, access is permitted.
    2. If caller is an authenticated **Teacher**, access is permitted ONLY if the teacher is listed in `course.teachers` or is `course.createdBy`.
    3. If caller is an authenticated **Student**, access is permitted ONLY if an active `Enrollment` record exists for this student and course.
    4. For any unauthorized caller (including anonymous public traffic), the endpoint throws a strict `404 Not Found`.

---

## 2. Strict Teacher Course Ownership Verification
- **Vulnerability Identified**: Curriculum mutation endpoints (`/subjects`, `/chapters`, `/topics`, `/lessons`) required `teacherOrAdmin` middleware but did not consistently verify that the authenticated teacher owned the parent course.
- **Fix Implemented**:
  - Every curriculum route (`/api/catalog/curriculum/:courseId`, `PATCH /subjects/:id`, `DELETE /subjects/:id`, `PATCH /chapters/:id`, `DELETE /chapters/:id`, `PATCH /topics/:id`, `DELETE /topics/:id`, `PATCH /lessons/:id`, `DELETE /lessons/:id`) now resolves the parent course and executes `assertTeacherOwnsCourse(req.user.role, req.user.id, course)`.
  - Teachers cannot view, modify, or delete subjects, chapters, topics, or lessons belonging to other teachers.

---

## 3. Separation of Approval and Publishing Privileges
- **Rule Enforced**: Only authorized Administrators can approve and publish courses.
- **Fix Implemented**:
  - `POST /api/courses/:id/approve` and `POST /api/courses/:id/reject` are guarded with `requireRoles('admin')`.
  - In `courseRouter.patch('/:id')`, if a teacher attempts to pass `status: 'published'`, the route prevents direct publishing and routes the status to `pending_review`.

---

## 4. Comprehensive Audit Trail
- High-impact governance actions trigger immutable records in `AuditLogModel` via `writeAudit`:
  - `course.submit_review`
  - `course.approve`
  - `course.reject`
  - `course.update` / `course.delete`
- Records store actor ObjectId, role, timestamp, action name, and state changes.

---

## 5. Input Validation & Safe Field Whitelisting
- All patch and create endpoints use strict field whitelists or Zod schemas to prevent prototype pollution and mass-assignment vulnerabilities.
- Safe slugification prevents special character injection in URLs.
