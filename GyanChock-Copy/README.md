# Gyan Chowk — E-Learning Platform

Production-ready recorded-learning platform: **Next.js** frontend, **Express + TypeScript** API, **MongoDB**, **Cloudinary** video/image delivery, **Razorpay** payments.

Tagline: **Learn. Code. Grow.**

This is not a live-class product. There is **no live streaming, no live class chat, and no DPP**.

## Architecture

```
apps/web      Next.js 15 App Router (student / teacher / admin)
apps/server   Express REST API
packages/shared   Zod schemas, roles, constants
```

See `/docs` for architecture, database, API, deployment and security notes.

## Requirements

- Node.js 20+
- MongoDB 6+
- Cloudinary account (videos/images/files)
- Razorpay account (payments)

## Installation

```bash
cd GyanChock
copy .env.example .env
npm install
```

Place brand assets (already copied if present):

- `apps/web/public/g1.png` — navbar / login / footer logo
- `apps/web/public/g2.png` — favicon

## Environment variables

Copy `.env.example` and fill:

| Variable | Purpose |
| --- | --- |
| `MONGODB_URI` | Mongo connection string |
| `CLOUDINARY_*` | Media (secret stays on the server) |
| `RAZORPAY_*` | Payments + webhook secret |
| `JWT_SECRET` / `JWT_REFRESH_SECRET` | Auth |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | First admin bootstrap |
| `NEXT_PUBLIC_API_URL` | Browser → API |
| `NEXT_PUBLIC_APP_URL` | Canonical site URL |
| `CLIENT_ORIGIN` | CORS whitelist |

Never commit `.env`.

## MongoDB

Create a database (example `gyan-chowk`) and put the URI in `MONGODB_URI`. Indexes are declared on the Mongoose schemas.

## Cloudinary

1. Create an unsigned-is-not-used workflow: the API issues **signed, authenticated** upload signatures.
2. Videos are requested as **HLS** (`m3u8` + `streaming_profile: hd`) with short-lived signed URLs.
3. Only enrolled users receive playback grants for paid content.

## Razorpay

1. Set `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET`.
2. Set `RAZORPAY_WEBHOOK_SECRET` and point webhooks to `POST /api/webhooks/razorpay`.
3. Course access is unlocked **only after signature/webhook verification**, never from the browser “success” event alone.

## Development

```bash
npm run dev
```

- Web: http://localhost:3000
- API: http://localhost:4000/api/health

```bash
npm run dev:web
npm run dev:server
```

## Seed / admin bootstrap

```bash
npm run seed
```

Creates the admin from `ADMIN_EMAIL` / `ADMIN_PASSWORD` (hashed with argon2), plus sample teacher, student, course, batch, questions and CMS.

Default sample logins after seed (change immediately in production):

- Admin: `ADMIN_EMAIL` / `ADMIN_PASSWORD`
- Teacher: `teacher@gyanchowk.com` / `Teacher@12345`
- Student: `student@gyanchowk.com` / `Student@12345`

After first admin login, change the password (`mustChangePassword` is set).

## Production build

```bash
npm run build
npm run start -w @gyan-chowk/server
npm run start -w @gyan-chowk/web
```

## Tests

```bash
npm test
```

Critical coverage includes grading, payment math, Razorpay HMAC shape, and RBAC constraints.

## Design

UI colours are taken from `g1.png` / `g2.png`: midnight navy, electric blue (`#0047AB` / `#1E6FFF`) and gold (`#FFD000` / `#F5A400`) on a near-black field.

## Security notes

- Passwords: argon2id
- Sessions: httpOnly cookies + refresh rotation
- Admin cannot register publicly
- Teacher APIs require `teacherStatus === approved`
- Paid video URLs are signed and enrollment-gated
- Wallet is a ledger (no silent balance edits)
- Audit logs omit secrets
