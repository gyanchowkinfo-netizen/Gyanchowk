import { hashPassword } from '../utils/crypto.js';
import { env } from '../config/env.js';
import { connectDb, disconnectDb } from '../config/db.js';
import {
  BannerModel,
  BatchModel,
  BlogModel,
  CareerArticleModel,
  ChapterModel,
  CourseModel,
  CMSPageModel,
  FAQModel,
  LessonModel,
  QuestionModel,
  RoadmapModel,
  SubjectModel,
  TopicModel,
  UserModel,
  WalletModel,
} from '../models/index.js';
import { slugify } from '../utils/helpers.js';

async function seedAdmin() {
  const email = env.ADMIN_EMAIL.toLowerCase();
  const passwordHash = await hashPassword(env.ADMIN_PASSWORD);
  const existing = await UserModel.findOne({ email, role: 'admin' }).select('+passwordHash');
  if (existing) {
    existing.passwordHash = passwordHash;
    existing.status = 'active';
    if (!existing.emailVerifiedAt) existing.emailVerifiedAt = new Date();
    await existing.save();
    console.log('Synced admin password from ADMIN_PASSWORD:', email);
    return existing;
  }
  const admin = await UserModel.create({
    name: 'Gyan Chowk Admin',
    email,
    passwordHash,
    role: 'admin',
    status: 'active',
    emailVerifiedAt: new Date(),
    mustChangePassword: true,
    referralCode: 'GCADMIN',
  });
  await WalletModel.create({ user: admin._id });
  console.log('Seeded admin:', email);
  return admin;
}

async function seedContent(adminId: string) {
  const teacherEmail = 'teacher@gyanchowk.com';
  let teacher = await UserModel.findOne({ email: teacherEmail });
  if (!teacher) {
    teacher = await UserModel.create({
      name: 'Ananya Sharma',
      email: teacherEmail,
      passwordHash: await hashPassword('Teacher@12345'),
      role: 'teacher',
      status: 'active',
      teacherStatus: 'approved',
      emailVerifiedAt: new Date(),
      headline: 'IIT Physics faculty',
      bio: '10+ years mentoring JEE aspirants.',
      referralCode: 'TEACH01',
    });
    await WalletModel.create({ user: teacher._id });
  }

  const studentEmail = 'student@gyanchowk.com';
  if (!(await UserModel.findOne({ email: studentEmail }))) {
    const student = await UserModel.create({
      name: 'Rahul Verma',
      email: studentEmail,
      passwordHash: await hashPassword('Student@12345'),
      role: 'student',
      status: 'active',
      emailVerifiedAt: new Date(),
      state: 'Delhi',
      referralCode: 'STUD01',
    });
    await WalletModel.create({ user: student._id });
  }

  let course = await CourseModel.findOne({ slug: 'jee-main-physics-mastery' });
  if (!course) {
    course = await CourseModel.create({
      title: 'JEE Main Physics Mastery',
      slug: 'jee-main-physics-mastery',
      subtitle: 'Concept-first recorded lessons, tests and doubt support',
      description:
        'A complete recorded Physics programme for JEE Main covering mechanics, waves, electricity and modern physics with tests, assignments and doubt resolution.',
      teachers: [teacher._id],
      category: 'JEE',
      subjects: ['Physics'],
      examCategories: ['JEE Main', 'JEE Advanced'],
      targetClass: '12',
      targetExam: 'JEE Main',
      language: 'en',
      pricingType: 'paid',
      price: 4999,
      discountPercent: 20,
      validityDays: 365,
      status: 'published',
      certificateEnabled: true,
      outcomes: ['Master core Physics', 'Score with accuracy analytics', 'Clear backlog with a planner'],
      faqs: [
        { question: 'Are classes live?', answer: 'No. Gyan Chowk is focused on high-quality recorded learning.' },
        { question: 'Do I get a certificate?', answer: 'Yes, after completing the course.' },
      ],
      createdBy: adminId,
      publishedAt: new Date(),
      seoTitle: 'JEE Main Physics Mastery | Gyan Chowk',
      seoDescription: 'Recorded JEE Physics course with tests, doubts, assignments and rankings.',
    });
  }

  if (!(await CourseModel.findOne({ slug: 'free-coding-foundations' }))) {
    await CourseModel.create({
      title: 'Free Coding Foundations',
      slug: 'free-coding-foundations',
      subtitle: 'Start programming with recorded lessons',
      description: 'A free introduction to programming for school and college students.',
      teachers: [teacher._id],
      category: 'Career',
      subjects: ['Programming'],
      targetExam: 'Campus',
      language: 'en',
      pricingType: 'free',
      price: 0,
      status: 'published',
      certificateEnabled: true,
      createdBy: adminId,
      publishedAt: new Date(),
    });
  }

  if (!(await BatchModel.findOne({ slug: 'jee-2027-target-batch' }))) {
    await BatchModel.create({
      name: 'JEE 2027 Target Batch',
      slug: 'jee-2027-target-batch',
      description: 'Structured batch with schedule, attendance and mentorship.',
      course: course._id,
      teachers: [teacher._id],
      startDate: new Date(),
      endDate: new Date(Date.now() + 365 * 86400000),
      language: 'en',
      examCategory: 'JEE',
      targetClass: '12',
      targetExam: 'JEE Main',
      status: 'open',
      maxStudents: 200,
      price: 7999,
      discountPercent: 10,
      createdBy: adminId,
      schedule: [
        { day: 'Monday', startTime: '18:00', endTime: '19:30', title: 'Mechanics revision' },
        { day: 'Wednesday', startTime: '18:00', endTime: '19:30', title: 'Problem practice' },
      ],
    });
  }

  let subject = await SubjectModel.findOne({ course: course._id, slug: 'physics' });
  if (!subject) {
    subject = await SubjectModel.create({ name: 'Physics', slug: 'physics', course: course._id, order: 1 });
  }
  let chapter = await ChapterModel.findOne({ subject: subject._id, slug: 'kinematics' });
  if (!chapter) {
    chapter = await ChapterModel.create({
      name: 'Kinematics',
      slug: 'kinematics',
      subject: subject._id,
      course: course._id,
      order: 1,
    });
  }
  let topic = await TopicModel.findOne({ chapter: chapter._id, slug: 'motion-in-1d' });
  if (!topic) {
    topic = await TopicModel.create({
      name: 'Motion in one dimension',
      slug: 'motion-in-1d',
      chapter: chapter._id,
      course: course._id,
      order: 1,
    });
  }
  if (!(await LessonModel.findOne({ topic: topic._id, slug: 'intro-to-kinematics' }))) {
    await LessonModel.create({
      title: 'Introduction to Kinematics',
      slug: 'intro-to-kinematics',
      topic: topic._id,
      chapter: chapter._id,
      course: course._id,
      isDemo: true,
      order: 1,
      durationSec: 720,
    });
  }

  if ((await QuestionModel.countDocuments()) < 8) {
    await QuestionModel.insertMany([
      {
        course: course._id,
        type: 'single_mcq',
        stem: 'A body starts from rest and accelerates uniformly. Distance is proportional to?',
        options: [
          { key: 'A', text: 't' },
          { key: 'B', text: 't²' },
          { key: 'C', text: '1/t' },
          { key: 'D', text: '√t' },
        ],
        correctKeys: ['B'],
        marks: 4,
        negativeMarks: 1,
        difficulty: 'easy',
        explanation: 's = ut + ½at² with u=0 ⇒ s ∝ t²',
        createdBy: teacher._id,
      },
      {
        course: course._id,
        type: 'true_false',
        stem: 'Displacement can be greater than distance.',
        options: [
          { key: 'T', text: 'True' },
          { key: 'F', text: 'False' },
        ],
        correctKeys: ['F'],
        marks: 1,
        negativeMarks: 0,
        difficulty: 'easy',
        createdBy: teacher._id,
      },
      {
        course: course._id,
        type: 'numerical',
        stem: 'A car travels 100 m in 5 s with uniform speed. Speed in m/s is',
        numericalAnswer: 20,
        numericalTolerance: 0.1,
        marks: 4,
        negativeMarks: 1,
        difficulty: 'medium',
        createdBy: teacher._id,
      },
    ]);
  }

  if (!(await FAQModel.findOne({ question: /live classes/i }))) {
    await FAQModel.insertMany([
      {
        question: 'Does Gyan Chowk offer live classes?',
        answer: 'No. The platform is built for recorded video learning, batches, tests and mentorship — not live streaming.',
        category: 'product',
        order: 1,
      },
      {
        question: 'How do payments work?',
        answer: 'We use Razorpay. Access is unlocked only after server-side payment verification.',
        category: 'payments',
        order: 2,
      },
    ]);
  }

  if (!(await BannerModel.findOne({ title: 'Learn. Code. Grow.' }))) {
    await BannerModel.create({
      title: 'Learn. Code. Grow.',
      subtitle: 'Recorded courses, batches, tests and mentorship — built like a serious EdTech product.',
      href: '/courses',
      placement: 'hero',
      active: true,
      order: 0,
    });
  }

  await CMSPageModel.findOneAndUpdate(
    { key: 'about' },
    {
      title: 'About Gyan Chowk',
      body: 'Gyan Chowk is a recorded-learning platform for serious exam and career preparation. We combine video lessons, batches, study materials, tests, doubts and mentorship.',
      seoTitle: 'About Gyan Chowk',
      seoDescription: 'Gyan Chowk e-learning platform — recorded courses, batches and tests.',
    },
    { upsert: true },
  );

  if (!(await BlogModel.findOne({ slug: 'how-to-study-with-recorded-lessons' }))) {
    await BlogModel.create({
      title: 'How to study with recorded lessons',
      slug: 'how-to-study-with-recorded-lessons',
      excerpt: 'Use backlog planning, tests and doubt engine to stay on track.',
      body: 'Recorded learning works when you treat it like a batch: schedule, attendance of your own study, and weekly tests.',
      published: true,
      publishedAt: new Date(),
      tags: ['study', 'jee'],
    });
  }

  if (!(await CareerArticleModel.findOne({ slug: 'resume-builder-guide' }))) {
    await CareerArticleModel.create({
      title: 'Resume builder guide',
      slug: 'resume-builder-guide',
      excerpt: 'Structure a campus resume that recruiters actually read.',
      body: 'Lead with impact, quantify projects, and keep one page for internships.',
      category: 'resume',
      published: true,
    });
  }

  if (!(await RoadmapModel.findOne({ slug: 'jee-main-physics' }))) {
    await RoadmapModel.create({
      title: 'JEE Main Physics roadmap',
      slug: 'jee-main-physics',
      description: 'A 16-week recorded-learning path.',
      published: true,
      steps: [
        { title: 'Mechanics', body: 'Kinematics to rotation', order: 1 },
        { title: 'Waves & Thermo', body: 'Build intuition then numericals', order: 2 },
        { title: 'Electrodynamics', body: 'Daily problem sets + mock tests', order: 3 },
      ],
    });
  }

  void slugify;
}

async function main() {
  await connectDb();
  const admin = await seedAdmin();
  await seedContent(String(admin._id));
  console.log('Seed complete. Change the initial admin password after first login.');
  await disconnectDb();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
