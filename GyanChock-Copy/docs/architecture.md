# Architecture

Gyan Chowk is a **monorepo**:

- `apps/web` — Next.js App Router, Tailwind, TanStack Query, React Hook Form/Zod on forms, Zustand for session user only.
- `apps/server` — Express REST API, Mongoose, JWT + refresh sessions, Cloudinary, Razorpay.
- `packages/shared` — enums, Zod request schemas, shared TS types.

## Request flow

1. Browser calls `NEXT_PUBLIC_API_URL` with `credentials: 'include'`.
2. Access JWT is in `gc_access` (httpOnly) or `Authorization: Bearer`.
3. Refresh uses `gc_refresh`; reuse of a rotated token revokes the session.
4. Protected handlers check auth → status → role → ownership.

## Video pipeline

Teacher/admin requests an upload signature → Cloudinary authenticated upload with eager HLS → metadata stored on `Video` → student calls `/api/videos/:id/playback` → server verifies enrollment → returns a short-lived signed HLS URL and poster → `hls.js` plays adaptive bitrate. Progress posts at most every 10s.

## Payments

Order amount is computed from MongoDB price/discount/coupon/wallet. Razorpay order is created server-side. Checkout signature and/or webhook must verify before `fulfillOrder` creates an `Enrollment`, invoice, earnings split and notifications.

## Rankings

Test results are stored once. `recomputeTestRanks` bulk-writes precomputed `Ranking` documents (AIR / state / batch) so leaderboards do not scan millions of rows on each page view.

## i18n

English, Hindi and Hinglish dictionaries live in `apps/web/src/i18n`. Additional locales can be added to `messages.ts` without changing routes.
