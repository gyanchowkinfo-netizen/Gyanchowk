# Database

MongoDB via Mongoose. Connection string: `MONGODB_URI` only.

## Collections

User, Role, Permission, Session, Course, Batch, Subject, Chapter, Topic, Lesson, Video, StudyMaterial, Enrollment, Assignment, AssignmentSubmission, Question, QuestionBank, Test, TestAttempt, TestAnswer, TestResult, Ranking, Doubt, DoubtMessage, Mentor, Mentorship, Attendance, AttendanceSession, CalendarEvent, Progress, VideoProgress, Certificate, Payment, Order, Refund, Coupon, Offer, Wallet, WalletTransaction, Referral, Review, Notification, NotificationPreference, TeacherEarning, TeacherPayout, CareerArticle, Roadmap, Blog, FAQ, CMSPage, Banner, Setting, AuditLog.

## Indexes (high traffic)

- User: unique email, referralCode, role+status, text search
- Course: unique slug, status+pricing+rating, text search
- Enrollment: unique user+course / user+batch, user+status+expiresAt
- VideoProgress: unique user+video
- TestResult: test+score+time
- Ranking: unique scope+scopeId+user, scope+scopeId+rank
- WalletTransaction: unique sparse idempotencyKey
- Order: unique sparse razorpayOrderId

## Transactions

Payment capture uses a Mongo session: create payment, mark order captured, increment coupon usage, debit wallet, then fulfill enrollment outside or after commit. Wallet credits use idempotency keys to block duplicate referral rewards.

## Timestamps

All business collections use `{ timestamps: true }`.
