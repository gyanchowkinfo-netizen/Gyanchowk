# Student Learning Phase

## 1. Overview
The Student Learning Phase is the central pedagogical destination on GyanChock where enrolled students interact with lecture videos, study materials, notes, and doubt resolution.

Located at:
`apps/web/src/app/student/learning/[courseId]/page.tsx`
With route alias fallback at:
`apps/web/src/app/student/courses/[courseId]/page.tsx`

---

## 2. Structured Syllabus Hierarchy

### 2.1 Multi-Tier Navigation
Instead of displaying a flat, unorganized list of lessons, the syllabus integrates the full course hierarchy:

```
Course Title (with overall % progress bar)
   │
   ├── [Subject Dropdown / Selector] (e.g. All Subjects | Physics | Chemistry | Mathematics)
   │
   └── Topics
        ├── Topic 1 (e.g. Kinematics)
        │     ├── Lesson 1: Introduction to Vectors [✓] (14 mins, Video Attached)
        │     ├── Lesson 2: Projectile Motion [○] (22 mins, Video Attached)
        │     └── Lesson 3: Relative Velocity [○] (18 mins)
        │
        └── Topic 2 (e.g. Newton's Laws of Motion)
              ├── Lesson 4: Free Body Diagrams [○] (25 mins, Video Attached)
              └── Lesson 5: Friction & Circular Dynamics [○] (30 mins)
```

### 2.2 Lesson Card Metadata
- **Status Icon**: Green checkmark for completed lessons; grey circle for uncompleted.
- **Title**: Clean typography.
- **Video Indicator**: Play icon displayed when video content is linked.
- **Duration**: Displayed in minutes.

---

## 3. Video Playback & Resource Features

### 3.1 Adaptive Video Streaming
- Powered by `VideoPlayer` with `hls.js`.
- Quality levels adapt to network conditions.
- Playback speed adjustment persisted across lessons.
- Timestamped personal note-taking during playback.
- Bookmarks system with timestamp indicators.

### 3.2 Integrated Study Materials Tab
- Students can toggle between the **Lecture Video** tab and the **Study Materials** tab without leaving the classroom.
- Lists all PDFs, formula sheets, assignments, and PYQs linked to the course and topic.
- One-click secure download button.

### 3.3 Progress Tracking Mechanics
- When a student completes a lesson, clicking **Mark Complete** calls `POST /api/learning/progress/lesson`.
- Backend calculates total completed lessons, recalculates percentage, and updates the student's daily learning streak.
- Seamless previous and next buttons allow learners to progress sequentially through the curriculum.

### 3.4 Doubt Desk Bridge
- Direct link from classroom to `/student/doubts` pre-populating context for fast student query submission.
