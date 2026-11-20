# GyanChock — Video Upload & Hierarchy Workflow Report

## 1. Overview

This document details the video upload, processing, storage, and dynamic hierarchy association systems implemented in GyanChock.

- **Primary Interface**: `apps/web/src/app/teacher/videos/page.tsx`
- **Backend Service**: `apps/server/src/services/video.service.ts`
- **Backend Routes**: `apps/server/src/routes/video.routes.ts`
- **Player Component**: `apps/web/src/components/player/VideoPlayer.tsx`

---

## 2. Cloudinary Direct Upload & Signature Fix

### 2.1 The Issue
Previously, video uploads triggered Cloudinary rejection with the following error:
> `Invalid Signature 5b4411fa6d572e393708bf7c5ab49b2261593969. String to sign - 'folder=gyan-chowk/videos&timestamp=1795017036'`

### 2.2 Root Cause Analysis
In Cloudinary's direct client upload protocol:
- Parameters excluded from the string-to-sign calculation: `file`, `cloud_name`, `api_key`, `resource_type`.
- Parameters included: Any additional form data fields sent by the browser.
- The server's `uploadSignature` service previously included `type: 'authenticated'` and `eager: 'sp_hd/m3u8'`, which the browser did not send in its `FormData`. Consequently, the string to sign evaluated by Cloudinary differed from the string evaluated by the server.

### 2.3 The Fix
In `apps/server/src/services/video.service.ts`:
- Adjusted `uploadSignature` to compute the SHA-1 HMAC using strictly `folder` and `timestamp`.
- Updated `signHlsUrl`, `signPosterUrl`, and `signImageUrl` to use standard delivery type `'upload'` with signed URL fallback.
- The browser successfully uploads directly to `https://api.cloudinary.com/v1_1/<cloud_name>/video/upload` with zero server bandwidth overhead.

---

## 3. Dynamic Cascading Curriculum Selectors

Videos are tightly integrated into the curriculum hierarchy:
`Course → Subject → Topic → Lesson`

### 3.1 Cascading Selectors Flow
In `apps/web/src/app/teacher/videos/page.tsx`:
1. **Course Selection**: Lists only courses owned by the authenticated teacher.
2. **Subject Selection**: Asynchronously loads subjects associated with the selected course via `GET /api/catalog/subjects?course=:courseId`. Disabled until a course is chosen.
3. **Topic Selection**: Loads topics belonging to the selected subject via `GET /api/catalog/topics?subject=:subjectId&course=:courseId`. Disabled until a subject is chosen.
4. **Lesson Selection**: Loads lessons for the chosen topic via `GET /api/catalog/lessons?topic=:topicId&course=:courseId`.
5. When a lesson is chosen, the uploaded video is automatically linked to that `LessonModel` via its `video` reference.

### 3.2 Backend Endpoints Implemented
- `GET /api/catalog/subjects?course=:courseId`: Returns subjects sorted by display order.
- `GET /api/catalog/topics?subject=:subjectId&course=:courseId`: Returns topics for a given subject.
- `GET /api/catalog/lessons?topic=:topicId&course=:courseId`: Returns lessons under a given topic.

---

## 4. Video Management & Search

The `/teacher/videos` dashboard includes full lifecycle management:
- **Search Bar**: Real-time debounce filter matching video title or description.
- **Course Filter**: Filter existing videos by course.
- **Subject Filter**: Filter existing videos by subject.
- **Video Cards**: Display duration (MM:SS), format badge, date added, and active associations (Course, Subject, Topic).
- **Inline Preview**: Teachers can toggle a preview player to verify video stream quality.
- **Edit Details Modal**: Teachers can edit video title and description in place (`PATCH /api/videos/:id`).
- **Delete Video with Safe Unlinking**: Safely deletes the video record and unlinks it from any lessons referencing it (`DELETE /api/videos/:id`).

---

## 5. Player Compatibility & Fallback

The video player in `apps/web/src/components/player/VideoPlayer.tsx` supports both HLS adaptive bitrate streaming and standard direct MP4 playback:
- Inspects streaming URL for `.m3u8`.
- If HLS is supported and the URL is an `.m3u8` manifest, `hls.js` initializes seamlessly.
- If the URL is a direct MP4 or WebM stream (or HLS is unavailable), it attaches directly to `<video src="..." />` with native browser hardware acceleration.
- Automatic fallback prevents video stall on browsers without HLS support.
