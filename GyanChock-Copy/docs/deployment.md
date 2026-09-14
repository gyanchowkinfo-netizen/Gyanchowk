# Deployment

## Process

1. Provision MongoDB, Cloudinary, Razorpay.
2. Set production env vars (strong JWT secrets, HTTPS origins).
3. `npm install && npm run build && npm run seed` (seed once).
4. Run API behind a reverse proxy (`PORT=4000`).
5. Run Next.js (`next start`) or export through a Node host.
6. Configure Razorpay webhook: `https://api.yourdomain.com/api/webhooks/razorpay`.
7. Set `CLIENT_ORIGIN` and `NEXT_PUBLIC_APP_URL` to the public site.

## Suggested layout

- `web` on Vercel / any Node 20 host
- `server` on a VM or container with 1+ replicas
- MongoDB Atlas with IP allowlist
- Cloudinary authenticated media

## Health

`GET /api/health` → `{ ok: true, service: "gyan-chowk" }`
