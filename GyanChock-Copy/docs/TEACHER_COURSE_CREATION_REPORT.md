# GyanChock — Teacher Course Creation & Curriculum Report

## 1. Overview

The Teacher Course Creation & Curriculum interface provides educators with an intuitive, multi-stage workflow to create and manage courses, design multi-level curriculum trees, link video lectures, and track approval status.

- **Primary Course Management Route**: `apps/web/src/app/teacher/courses/page.tsx`
- **Curriculum Tree Manager Component**: `apps/web/src/components/teachers/CourseCurriculumManager.tsx`
- **API Endpoints Utilized**:
  - `GET /api/courses?mine=1`
  - `POST /api/courses`
  - `PATCH /api/courses/:id`
  - `GET /api/catalog/curriculum/:courseId`
  - `POST /api/courses/:id/submit-review`
  - `POST/PATCH/DELETE /api/catalog/subjects/:id?`
  - `POST/PATCH/DELETE /api/catalog/chapters/:id?`
  - `POST/PATCH/DELETE /api/catalog/topics/:id?`
  - `POST/PATCH/DELETE /api/catalog/lessons/:id?`

---

## 2. Course Creation Wizard

### 2.1 Multi-Step Wizard Breakdown
The course creation wizard is toggled via the **"Create New Course"** button and presents a three-stage step progression:

1. **Step 1: Basic Information**
   - **Course Title** (`title`, required): Name of the course (minimum 3 characters).
   - **Subtitle / Tagline** (`subtitle`): Short descriptive summary.
   - **Category** (`category`): Academic category (e.g., JEE, NEET, Foundation).
   - **Target Exam** (`targetExam`): Exam target (e.g., JEE Main & Advanced).
   - **Course Level** (`level`): Beginner, Intermediate, Advanced, All Levels.
   - **Language / Medium** (`language`): English, Hindi, Hinglish.
   - **Duration** (`duration`): Nominal duration (e.g., "12 Months", "60 Hours").
   - **Detailed Description** (`description`): Full markdown-compatible syllabus details.

2. **Step 2: Pricing & Validity**
   - **Pricing Model** (`pricingType`): "Paid" or "Free".
   - **Price** (`price`): In INR (defaults to 0 for free courses).
   - **Enrollment Validity** (`validityDays`): Active student access duration (default 365 days).
   - **Certificate Generation** (`certificateEnabled`): Toggle for automatic certificate issuance upon $100\%$ course completion.

3. **Step 3: Confirmation & Initial Save**
   - Saves record to MongoDB as `draft`.
   - Teacher ownership automatically assigned: `teachers: [teacherId]`, `createdBy: teacherId`.
   - Automatically transitions the teacher to the **Curriculum Builder** view.

---

## 3. Curriculum Tree Builder

The curriculum manager renders the full course hierarchy and provides granular CRUD operations:

```
Course
  └── Subject
        └── Chapter
              └── Topic
                    └── Lesson (Video, Free Preview flag, duration)
```

### 3.1 Subject Management
- **Add Subject Modal**: Captures Subject Title, Description, and Display Order.
- **Edit Subject**: Updates subject details via `PATCH /api/catalog/subjects/:id`.
- **Delete Subject**: Safe delete removing nested chapters, topics, and lessons with confirmation dialog.

### 3.2 Chapter Management
- **Add Chapter**: Associated with the parent subject and course.
- **Edit / Delete Chapter**: In-place modification and deletion.

### 3.3 Topic Management
- **Add Topic**: Associated with the parent chapter and course.
- **Edit / Delete Topic**: Modifies topic sequence and notes.

### 3.4 Lesson Management & Video Association
- **Add / Edit Lesson**:
  - Title and Notes.
  - Video Selector: Populated from `availableVideos` belonging to the teacher.
  - Duration in minutes.
  - Free Preview toggle (`isDemo`): Allows potential students to watch sample lessons without purchasing.
  - Ordering index.

---

## 4. In-Place Course Metadata Editing

Teachers can update course details without leaving the page or restarting the wizard:
- Accessible from both the course card in the catalogue list and the header of the curriculum builder.
- Updates title, subtitle, category, target exam, level, language, duration, price, and description via `PATCH /api/courses/:id`.

---

## 5. Pre-Submission Readiness Checklist

The curriculum manager provides a dynamic **Publishing Readiness** card:
- Title validation: $\ge 3$ characters.
- Subject check: At least 1 subject present.
- Lesson check: At least 1 lesson present.
- When all criteria are met, the **"Submit for Review"** button is activated.

---

## 6. Admin Review Feedback Loop

When an admin reviews the course and requests modifications:
1. Status reverts from `pending_review` to `draft`.
2. Admin feedback is stored in `approvalNotes`.
3. In-app notifications inform the teacher.
4. An amber review feedback card renders prominently on the course card and curriculum builder:
   > **Feedback from Administrator Review**: *Specific instructions from the reviewer.*
5. The teacher can resolve the requested changes and re-submit for approval with a single click.
