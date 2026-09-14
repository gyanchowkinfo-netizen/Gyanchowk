# Security

- **Secrets** only in environment variables. Cloudinary and Razorpay secrets never ship to the browser (only `RAZORPAY_KEY_ID` is used in checkout).
- **Passwords** hashed with argon2id. Reset and email-verify tokens stored as SHA-256 hashes.
- **Admin** is seeded from env; public register allows only `student` and `teacher`.
- **RBAC** on every mutating/protected route. Teachers need `teacherStatus=approved`. Students cannot read other students’ attempts/results.
- **Payments**: amount from DB; HMAC of `order_id|payment_id`; webhook HMAC; duplicate payment ids rejected; enrollment only after capture.
- **Videos**: playback grant after enrollment (unless demo). Signed HLS, short TTL.
- **Uploads**: folder/resourceType constrained by role; MIME/size intended to be enforced at Cloudinary upload preset + signature folder namespace.
- **Rate limits** global + stricter login limiter. Helmet + CORS allowlist.
- **AuditLog** records admin/teacher sensitive actions without passwords/tokens.
- **Wallet** immutable ledger + idempotency keys.
- **CSRF**: SameSite cookies (`strict` in production) + CORS origin allowlist. Refresh rotation detects reuse.
