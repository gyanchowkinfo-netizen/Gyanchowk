# Video and Materials Workflow

## 1. Cloudinary Signed Upload Integration
All video lectures and study documents use Cloudinary signed uploads. The browser directly sends large files to Cloudinary, ensuring the application server is never burdened by gigabyte file streaming.

### 1.1 Upload Authorization Flow
1. **Client requests signature**:
   - `POST /api/uploads/signature`
   - Body: `{ folder: 'videos' | 'materials', resourceType: 'video' | 'raw' }`
   - Permissions: Validated by role. Students are blocked from video or CMS uploads.
2. **Server generates cryptographic HMAC-SHA1 signature**:
   - Computes signature using `CLOUDINARY_API_SECRET`.
   - Returns `{ timestamp, signature, folder, cloudName, apiKey }`.
3. **Client uploads directly to Cloudinary REST API**:
   - Target: `https://api.cloudinary.com/v1_1/<cloudName>/<resourceType>/upload`
   - Receives response containing `public_id`, `secure_url`, `duration`, `bytes`, `format`.
4. **Client notifies GyanChock server**:
   - Calls `POST /api/videos` or `POST /api/learning/materials` with metadata and relations.

---

## 2. Video Upload & Linking Workflow

### 2.1 Cascading Selector Sequence
The upload form enforces relational consistency:
1. **Course Selection**: Lists courses owned by the teacher (or all courses for Admin).
2. **Subject Selection**: Populates subjects belonging to the selected course.
3. **Topic Selection**: Populates topics belonging to the selected subject.
4. **Lesson Selection (Optional)**: If selected, the backend automatically updates the `Lesson` document to link `lesson.video = video._id`.

### 2.2 Video Document Properties
- `title`: Video lecture name.
- `course`, `subject`, `topic`, `lesson`: Relational hierarchy links.
- `teacher`: Teacher owner ID.
- `uploadedBy`: User ID who initiated upload.
- `publicId`: Cloudinary asset ID.
- `duration`: Duration in seconds.
- `bytes`, `format`: File size and container format.
- `isDemo`: Boolean flag for free preview.
- `status`: Set to `ready`.
- `hlsReady`: Set to `true`.

### 2.3 Secure Playback Authorization
- Endpoint: `GET /api/videos/:id/playback`
- Checks whether the video is marked `isDemo: true`, or whether the requesting student holds an `active` enrollment in the associated course/batch.
- Returns an authenticated HLS / MP4 playback URL with limited validity.

---

## 3. Study Material Upload & Delivery Workflow

### 3.1 Material Categories Supported
- `pdf_notes`: Comprehensive lecture notes.
- `class_notes`: Hand-written / whiteboard annotations.
- `revision_notes`: Quick review summaries.
- `formula_sheet`: High-yield equations and formula compendiums.
- `question_bank`: Practice problem collections.
- `assignment`: Homework / tutorial problem sets.
- `pyq`: Previous Years' Examination Questions with solutions.

### 3.2 Material Document Properties
- `title`: Document name.
- `type`: One of the supported material categories.
- `course`, `subject`, `topic`: Hierarchical linkage.
- `teacher`: Teacher owner ID.
- `uploadedBy`: User ID who uploaded the file.
- `publicId`, `url`, `bytes`, `mime`: File metadata.
- `status`: `published` (visible to students) or `hidden` (internal draft).

### 3.3 Secure Material Download
- Endpoint: `GET /api/learning/materials/:id/download`
- Enforces active student enrollment check via `assertEnrollment`.
- Generates a private signed download URL via Cloudinary SDK expiring within 120 seconds.
