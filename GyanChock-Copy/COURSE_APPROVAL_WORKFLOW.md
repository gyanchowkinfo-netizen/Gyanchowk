# Course Approval Workflow

## 1. Executive Summary & Core Principle
The GyanChock course lifecycle follows a streamlined, robust workflow designed to empower teachers while providing administrators with complete oversight:

```
[Teacher Creates Course Draft]
             │
             ▼
[Teacher Builds Curriculum: Subjects ➔ Topics ➔ Lessons]
             │
             ▼
[Teacher Submits Course for Review]  ➔ (Status: pending_review)
             │
             ▼
[Admin Previews Classroom & Evaluates Curriculum]
             │
      ┌──────┴──────────────────────┐
      ▼                             ▼
[Admin Requests Changes / Rejects]   [Admin Approves & Publishes ONCE]
(Status returns to draft)            (Status: published)
      │                             │
      └──────► Teacher Revises       ▼
               & Resubmits       [Teacher Uploads Videos & Materials Continuously]
                                 (No whole-course re-approval required)
                                    │
                                    ▼
                                 [Enrolled Students Access Learning Content]
```

**Core Invariant**: The course approval is **one-time**. Once approved and published, the teacher has full autonomy to upload lecture videos, attach PDFs, and add lessons into the course structure without requiring the entire course to undergo re-approval each time.

---

## 2. Step-by-Step Lifecycle Specification

### Step 1: Teacher Creates Course Draft
- **Endpoint**: `POST /api/courses`
- **Role**: `teacher`
- **Initial Status**: `draft`
- **Data Saved**: Course title, subtitle, category, target exam, level, duration, language, pricing, and outcomes.
- **Creator & Owner**: Recorded as `createdBy: teacherId`, `teachers: [teacherId]`.

### Step 2: Curriculum Preparation
- **Endpoints**:
  - `POST /api/catalog/subjects` (creates Subject under Course)
  - `POST /api/catalog/topics` (creates Topic under Subject)
  - `POST /api/catalog/lessons` (creates Lesson under Topic)
- All curriculum entities store `course: courseId` and an integer `order` index for sequential sorting.
- The teacher can edit, reorder, or delete curriculum components while the course is in `draft`.

### Step 3: Teacher Submits Course for Review
- **Endpoint**: `POST /api/courses/:id/submit-review`
- **Role**: `teacher` (owner check enforced via `assertTeacherOwnsCourse`)
- **Action**:
  - Transitions `course.status` from `draft` to `pending_review`.
  - Dispatches notifications (`NotificationModel.create`) to all admin users (`role: 'admin'`).
  - Records an audit log entry (`course.submit_review`).
- **UI State**: The course is displayed with a `Pending Review` status badge. The teacher cannot submit again while in review.

### Step 4: Admin Review & One-Time Approval Decision
Admin inspects the course in `/admin/courses`:
- **Preview Classroom**: Admin clicks **Review Classroom** (`/student/learning/:id?preview=1`) to experience the course as a student.
- **Curriculum Inspection**: Admin clicks **Curriculum (Subjects & Topics)** (`/admin/courses/:id/curriculum`) to view or adjust subjects, topics, and lessons.

Admin has three potential decisions:
1. **Approve & Publish (`POST /api/courses/:id/approve`)**:
   - Transitions `status` to `published`.
   - Sets `publishedAt = new Date()`.
   - Sends notification to the course teacher: *"Your course has been approved and published!"*.
   - Writes audit log: `course.approve`.
2. **Request Changes (`POST /api/courses/:id/request-changes`)**:
   - Transitions `status` back to `draft`.
   - Sends notification to teacher: *"Admin has requested changes on your course. Please revise curriculum and resubmit."*.
   - Writes audit log: `course.request_changes`.
3. **Reject to Draft (`POST /api/courses/:id/reject`)**:
   - Transitions `status` back to `draft`.
   - Sends notification to teacher.
   - Writes audit log: `course.reject`.

### Step 5: Post-Approval Content Ingestion
- Once `status === 'published'`:
  - Course is live in the storefront catalog.
  - Teacher can upload videos (`POST /api/videos`) and materials (`POST /api/learning/materials`).
  - No subsequent admin review is needed for normal video or material additions.
  - Admin retains full overriding authority to edit, unpublish, archive, or replace content at any point.
