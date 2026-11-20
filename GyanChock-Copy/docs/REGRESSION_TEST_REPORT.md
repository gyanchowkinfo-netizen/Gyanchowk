# Regression Test Report

## 1. Automated Verification Checks

### Typecheck Verification
- **Web App (`@gyan-chowk/web`)**:
  `tsc --noEmit` executed with **0 errors, 0 warnings**.
- **Server App (`@gyan-chowk/server`)**:
  `tsc -p tsconfig.json --noEmit` executed with **0 errors, 0 warnings**.
- **Shared Library (`@gyan-chowk/shared`)**:
  `tsc -p tsconfig.json --noEmit` executed with **0 errors, 0 warnings**.

---

## 2. Manual & Flow Regression Scenarios

### A. Student Experience & Learning (Rule 4 Compliance)
- **Classroom Learning (`/student/learning/[courseId]`)**:
  - Enrolled students continue to load syllabus, progress bar, video player, and doubt buttons without interruption.
  - Video playback, bookmarking, and progress tracking operate normally.
- **Student Dashboard (`/student`)**:
  - Statistics cards (Courses, Videos watched, Completion %, Streak) calculate accurately.
  - Upcoming tests and assignments render normally.
- **Student Profile (`/student/profile`)**:
  - Round pencil button operates for avatar upload/change/remove.
  - Inline name editor saves and updates session state cleanly.
  - Purchased courses and certificates counts render accurately.
- **Tests & Doubts (`/student/tests`, `/student/doubts`)**:
  - Floating round Doubt widget routes directly to `/student/doubts`.
  - Mock test attempts and timers remain unaffected.

### B. Teacher Workflows
- **Course Builder (`/teacher/courses`)**:
  - Initial 3-step course creation wizard creates draft courses.
  - Selecting a course opens the Curriculum Builder.
  - Subject, Chapter, Topic, and Lesson creation, editing, and deletion operate with database persistence.
  - Video attachment links to `VideoModel`.
  - "Submit for Review" validates curriculum presence before changing status.
  - "Preview Classroom" opens student learning view in preview mode.
- **Videos (`/teacher/videos`)**:
  - Cloudinary signature generation and upload remain active.
- **Materials (`/teacher/materials`)**:
  - Raw resource upload and document listing remain active.

### C. Admin Operations & CMS
- **Dashboard Navigation (`PanelShell.tsx`)**:
  - Categorized navigation into 7 logical groups (`Overview`, `Content & CMS`, `Course Management`, `People Management`, `Learning & Assessment`, `Finance & Payments`, `System & Settings`).
  - Active route highlighting operates across all nested paths.
  - Mobile drawer opens and closes without layout shifts.
- **Course Approvals (`/admin/courses`)**:
  - Courses in `pending_review` appear in the status filter.
  - Administrators can approve and publish courses or reject them back to draft.
- **CMS Manager (`/admin/cms`)**:
  - Switching between tabs (`Homepage Sections`, `Page Layouts`, `FAQ Management`, `Blog Articles`, `Legal & Custom Pages`, `Banners & Career`) operates without re-rendering issues.
  - Full CRUD verified for FAQs and Blog articles.
  - Selecting legal keys retrieves stored markdown content for editing.

### D. Storefront & Public Website
- Hero banner carousel, explore buttons, search command (without ⌘K badge), course catalog, teacher profiles, and auto-hide navbar on scroll up/down remain verified and functional.
