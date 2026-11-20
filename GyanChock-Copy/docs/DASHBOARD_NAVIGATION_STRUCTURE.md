# Dashboard Navigation Structure

This document outlines the organized navigation hierarchy implemented in `PanelShell.tsx` for Admin, Teacher, and Student roles. All existing routes and URL paths have been preserved.

---

## 1. Admin Navigation Structure

| Group | Item Label | Route | Icon | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| **Overview** | Home Page | `/` | `Home` | Redirect to public website storefront |
| | Dashboard | `/admin` | `LayoutDashboard` | Platform KPIs, revenue aggregates, recent orders |
| | Reports | `/admin/reports` | `BarChart3` | Analytics, completion statistics, financial reports |
| | Audit Logs | `/admin/audit-logs` | `Shield` | Administrative action traceability logs |
| **Content & CMS** | CMS | `/admin/cms` | `FileText` | Unified CMS hub (Sections, FAQs, Blogs, Legal Pages) |
| | About Page | `/admin/about-page` | `Info` | About page content, mission, vision, graphics |
| | Teachers Page | `/admin/teachers-page` | `GraduationCap` | Faculty showcase settings and verification copy |
| | Homepage Cards | `/admin/homepage-cards` | `LayoutDashboard` | Custom card blocks rendered on homepage |
| | Why Gyan Chowk | `/admin/learning-stack` | `Layers` | Learning stack value proposition editor |
| | Banners | `/admin/banners` | `Images` | Promotional banners, sliders, and schedules |
| | Career | `/admin/career` | `GraduationCap` | Career guides, vacancies, and scholarship editors |
| **Course Management** | Catalogue Courses | `/admin/catalogue-courses` | `LayoutDashboard` | Storefront display and pricing overrides |
| | Courses | `/admin/courses` | `BookOpen` | Master course listings, approval, archiving |
| | Batches | `/admin/batches` | `GraduationCap` | Scheduled cohort batches, schedules, limits |
| | Videos | `/admin/videos` | `PlayCircle` | Cloudinary video assets and HLS processing |
| | Materials | `/admin/materials` | `FileText` | Downloadable notes, formula sheets, PYQs |
| **People Management** | Students | `/admin/students` | `Users` | Enrolled students, activity, account standing |
| | Teachers | `/admin/teachers` | `GraduationCap` | Teacher verification, status, subject expertise |
| | Admins | `/admin/admins` | `Shield` | Administrative personnel and access permissions |
| | Users | `/admin/users` | `Users` | Master account directory, session revocation |
| **Learning & Assessment** | Assignments | `/admin/assignments` | `ClipboardList` | Course assignments and grading criteria |
| | Tests | `/admin/tests` | `ClipboardList` | Mock examinations and practice test schedules |
| | Questions | `/admin/questions` | `HelpCircle` | Question bank repository |
| | Doubts | `/admin/doubts` | `HelpCircle` | Student doubt resolution center |
| | Mentorship | `/admin/mentorship` | `Users` | 1-on-1 mentorship session bookings |
| | Attendance | `/admin/attendance` | `Users` | Batch and live lecture attendance logs |
| | Reviews | `/admin/reviews` | `FileText` | Course and teacher student ratings |
| **Finance & Payments** | Payments | `/admin/payments` | `IndianRupee` | Captured transactions, gateways (Razorpay/Stripe) |
| | Refunds | `/admin/refunds` | `IndianRupee` | Disputed charges and issued credit refunds |
| | Coupons | `/admin/coupons` | `Wallet` | Discount vouchers and promotional codes |
| | Offers | `/admin/offers` | `Wallet` | Seasonal deal campaigns |
| | Wallets | `/admin/wallet` | `Wallet` | Student wallet credits and balance ledgers |
| | Referrals | `/admin/referrals` | `Users` | Referral conversions and reward distributions |
| | Payouts | `/admin/payouts` | `IndianRupee` | Instructor revenue payouts and bank processing |
| **System & Settings** | Notifications | `/admin/notifications` | `Bell` | System broadcasts and push dispatches |
| | Settings | `/admin/settings` | `Settings` | Platform configurations and commission rates |
| | Security | `/admin/security` | `Shield` | Token lifetimes, password policies, audit guards |

---

## 2. Teacher Navigation Structure

| Group | Item Label | Route | Icon | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| **Overview** | Home Page | `/` | `Home` | Redirect to public website storefront |
| | Dashboard | `/teacher` | `LayoutDashboard` | Active courses, pending questions, teaching summary |
| | Analytics | `/teacher/analytics` | `BarChart3` | Engagement metrics, student drop-off rates |
| **Course & Content** | My Courses | `/teacher/courses` | `BookOpen` | Course creation, curriculum hierarchy, submissions |
| | Videos | `/teacher/videos` | `PlayCircle` | Video lecture uploads via Cloudinary |
| | Materials | `/teacher/materials` | `FileText` | Study note attachments (PDF, documents) |
| **Student Management** | Students | `/teacher/students` | `Users` | Students enrolled in teacher's courses |
| | Batches | `/teacher/batches` | `GraduationCap` | Cohort schedules, timings, student limits |
| | Attendance | `/teacher/attendance` | `Users` | Student roll call and lecture presence logs |
| **Assessment** | Question Bank | `/teacher/questions` | `HelpCircle` | Teacher's personal and shared question pools |
| | Tests | `/teacher/tests` | `ClipboardList` | Test authoring, section marking, attempt limits |
| | Assignments | `/teacher/assignments` | `ClipboardList` | Homework questions and student submission reviews |
| **Support** | Doubts | `/teacher/doubts` | `HelpCircle` | Answering assigned student doubts |
| | Mentorship | `/teacher/mentorship` | `Users` | Managing 1-on-1 mentorship appointments |
| | Notifications | `/teacher/notifications` | `Bell` | Important student and platform alerts |
| **Earnings & Settings** | Earnings | `/teacher/earnings` | `IndianRupee` | Course sales commissions and revenue share |
| | Payouts | `/teacher/payouts` | `Wallet` | Payout history, pending requests, bank IFSC |
| | Settings | `/teacher/settings` | `Settings` | Public faculty profile, headline, biography, UPI |

---

## 3. Student Navigation Structure (Strictly Preserved)

| Group | Item Label | Route | Icon | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| **Learn** | Home Page | `/` | `Home` | Return to main storefront |
| | Dashboard | `/student` | `LayoutDashboard` | Enrolled courses, streak, progress overview |
| | My courses | `/student/courses` | `BookOpen` | Purchased and active video courses |
| | My batches | `/student/batches` | `GraduationCap` | Live scheduled batches and announcements |
| | Learning | `/student/learning` | `PlayCircle` | Continue last watched lecture |
| | Materials | `/student/materials` | `FileText` | Study notes, formula sheets, downloads |
| **Practice** | Assignments | `/student/assignments` | `ClipboardList` | Pending and graded assignments |
| | Tests | `/student/tests` | `ClipboardList` | Mock examinations and live tests |
| | Results | `/student/results` | `BarChart3` | Detailed test scorecards and percentile breakdown |
| | Rankings | `/student/rankings` | `Trophy` | All-India and state-level rank leaderboards |
| **Support** | Doubts | `/student/doubts` | `HelpCircle` | Submit questions and receive mentor answers |
| | Mentorship | `/student/mentorship` | `Users` | Book 1-on-1 expert mentor calls |
| | Attendance | `/student/attendance` | `Users` | Class attendance record |
| | Calendar | `/student/calendar` | `Calendar` | Test dates and lecture schedule |
| | Progress | `/student/progress` | `BarChart3` | Completion trajectory and study statistics |
| | Backlog | `/student/backlog` | `ClipboardList` | Study backlog planner |
| **Account** | Profile | `/student/profile` | `User` | Student avatar, name editing, account credentials |
| | Certificates | `/student/certificates` | `GraduationCap` | Earned verifiable course completion certificates |
| | Downloads | `/student/downloads` | `PlayCircle` | Offline DRM video keys |
| | Wallet | `/student/wallet` | `Wallet` | Prepaid credit balance and promotional credits |
| | Referrals | `/student/referrals` | `Users` | Referral link, referral code, friend rewards |
| | Wishlist | `/student/wishlist` | `BookOpen` | Saved catalogue courses |
| | Payments | `/student/payments` | `IndianRupee` | Payment history, invoice receipts |
| | Notifications | `/student/notifications` | `Bell` | Study alerts and platform notifications |
| | Help | `/student/help` | `HelpCircle` | Support documentation and ticket creation |
