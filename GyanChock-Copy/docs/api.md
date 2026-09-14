# API

Base: `http://localhost:4000/api`

Auth cookies: `gc_access`, `gc_refresh`.

## Auth

- `POST /auth/register` student|teacher
- `POST /auth/login`
- `POST /auth/refresh`
- `POST /auth/logout`
- `POST /auth/forgot-password`
- `POST /auth/reset-password`
- `POST /auth/verify-email`
- `GET /auth/me`
- `PATCH /auth/me`
- `POST /auth/change-password`

## Catalogue

- `GET /courses` paginated filters
- `GET /courses/:slug`
- `POST /courses` teacher/admin
- `PATCH /courses/:id`
- `GET /batches`
- `GET /batches/:slug`
- `POST /batches`
- `POST /catalog/subjects|chapters|topics|lessons`
- `GET /catalog/teachers`

## Video / uploads

- `POST /uploads/signature`
- `POST /videos`
- `GET /videos/:id/playback` enrollment gated
- `POST /videos/:id/progress`

## Payments

- `POST /payments/orders`
- `POST /payments/verify`
- `POST /payments/enroll-free`
- `GET /payments/history`
- `POST /payments/refunds/:paymentId` admin
- `POST /webhooks/razorpay` raw body + HMAC

## Learning

- `GET /learning/enrollments|progress|analytics|backlog|calendar|materials|assignments|certificates`
- `POST /learning/materials`
- `GET /learning/materials/:id/download`
- `POST /learning/assignments/:id/submit`
- `GET /certificates/:certificateId` public verify

## Tests

- `POST /questions` `/questions/banks`
- `POST /tests` `POST /tests/:id/start`
- `POST /tests/attempts/:id/answer|submit`
- `GET /tests/results`
- `GET /rankings` `GET /rankings/me`

## Support

- Doubts CRUD + assign + messages
- Mentorship assign/messages/goals/meetings
- Attendance sessions + bulk mark + student report

## Finance

- Wallet ledger, admin credit
- Referrals
- Reviews (enrolled students)
- Teacher earnings + payout request + admin decision

## Admin / CMS

- `GET /admin/dashboard|users|audit-logs|settings`
- Teacher approve/reject
- Create admin accounts
- CMS banners, FAQs, pages, blogs
- Career articles and roadmaps
