# Admin & Teacher Content Management

## 1. Overview & Operational Philosophy
GyanChock implements a collaborative, hierarchical content management model where:
1. **Teachers** have primary creative ownership of their courses, video lectures, and study materials.
2. **Administrators** maintain comprehensive supervisory, editing, and publishing authority across all content on the platform.
3. Every operation maintains strict auditability, ensuring neither teacher ownership nor administrative provenance is lost or distorted.

---

## 2. Content Ownership and Traceability Architecture

### 2.1 Schema Separation: Owner vs. Operator
In both `Video` and `StudyMaterial` MongoDB models:
- **`teacher` (Owner)**: References the authorized teacher responsible for the pedagogical content. This ensures student enrollment calculations, course ratings, teacher profiles, and teacher revenue allocations are attributed accurately.
- **`uploadedBy` (Operator)**: References the exact user ID (Admin or Teacher) who executed the upload transaction.
- **`createdBy`**: Tracks the initial creator of the course or entity.

### 2.2 Operational Scenarios

#### Scenario A: Teacher Uploads Content
- Teacher creates course, videos, or materials.
- `teacher = req.user.id`
- `uploadedBy = req.user.id`
- Audit log records teacher action.

#### Scenario B: Admin Uploads on Behalf of Teacher
- Admin uploads a video or study material and selects the teacher (or system auto-resolves the course's teacher).
- `teacher = teacherId` (ownership preserved for the teacher)
- `uploadedBy = adminId` (operator identified as Admin)
- Audit log captures `actor: adminId`, `role: 'admin'`, action `video.create` or `material.create`, target entity, and ownership metadata.

#### Scenario C: Admin Directly Creates Course
- Admin creates a platform-owned course without assigning a teacher.
- `createdBy = adminId`
- `teachers = []`
- Course is published under platform authority. Teacher ownership is not falsely fabricated.

---

## 3. Curriculum Hierarchical Structure
The system enforces a standardized, multi-level hierarchy:

```
Course
  └── Subject (e.g., Organic Chemistry, Mechanics)
       └── Chapter (optional module divider)
            └── Topic (e.g., Alkanes & Alkyl Halides)
                 └── Lesson (e.g., Electrophilic Addition Reaction)
                      ├── Video Attachment (Cloudinary HLS ready)
                      └── Study Materials (PDF Notes, Practice Sets)
```

Both Teachers and Administrators use identical database models (`SubjectModel`, `ChapterModel`, `TopicModel`, `LessonModel`, `VideoModel`, `StudyMaterialModel`). No parallel or conflicting shadow schemas exist.

---

## 4. Moderation and Safety Controls
- **Course Status Matrix**:
  - `draft`: Editable by teacher/admin; not visible to students.
  - `pending_review`: Locked for evaluation; visible in admin review queue.
  - `published`: Publicly discoverable; accessible to enrolled students.
  - `archived`: Retained for historical enrollments; hidden from storefront.
- **Material Status Matrix**:
  - `published`: Downloadable by enrolled students.
  - `hidden`: Hidden from student views while retained for administrative review.
  - `draft`: Work-in-progress.
- **Video Demo Matrix**:
  - `isDemo: true`: Public preview enabled for non-enrolled students.
  - `isDemo: false`: Enforced playback restriction via signed authorization token.
