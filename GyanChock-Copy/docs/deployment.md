# Deployment

## Hosting layout

- **Web (Next.js)** → Vercel — `https://gyanchowk.vercel.app`
- **API (Express)** → Render — Node 20 web service
- **Database** → MongoDB Atlas
- Cloudinary for media, Razorpay for payments

The GitHub repo root is a thin deploy wrapper. The real workspace is `GyanChock-Copy/`.

## Vercel (frontend)

Root Directory **must** be `GyanChock-Copy/apps/web` (this repo also sets that in `vercel.json`).

| Setting | Value |
| --- | --- |
| Framework | Next.js |
| Root Directory | `GyanChock-Copy/apps/web` |
| Install Command | `npm install --prefix ../.. --include=dev` |
| Build Command | `npm run build:web --prefix ../..` |
| Node.js | 20.x |

Environment variables on Vercel:

- `NEXT_PUBLIC_API_URL` — `https://gyanchowk-1.onrender.com` (optional; this is the production default)
- `NEXT_PUBLIC_APP_URL` — `https://gyanchowk.vercel.app`

The browser calls same-origin `/api/*`, and Next.js rewrites those requests to the Render API.

## Render (API)

If the service was created from Git with an empty Root Directory, the repo-root `package.json` now provides `build` / `start` so npm can find a manifest at `/opt/render/project/src/package.json`.

Preferred service settings (also in `render.yaml`):

| Setting | Value |
| --- | --- |
| Runtime | Node |
| Root Directory | `GyanChock-Copy` |
| Build Command | `npm install --include=dev && npm run build:server` |
| Start Command | `npm start` |
| Node | 20 |

Required env vars: `MONGODB_URI`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `CLIENT_ORIGIN`, `NEXT_PUBLIC_APP_URL`, `NODE_ENV=production`. Render sets `PORT` automatically.

`CLIENT_ORIGIN` must be `https://gyanchowk.vercel.app`. `NEXT_PUBLIC_APP_URL` should match.

Health: `GET /api/health` → `{ ok: true, service: "gyan-chowk" }`.

## Process

1. Provision MongoDB, Cloudinary, Razorpay.
2. Set production env vars (strong JWT secrets, HTTPS origins).
3. Seed once after the API is up: `npm run seed` (from `GyanChock-Copy`).
4. Configure Razorpay webhook: `https://<api-host>/api/webhooks/razorpay`.
5. Set `CLIENT_ORIGIN` and `NEXT_PUBLIC_APP_URL` to the public site.
