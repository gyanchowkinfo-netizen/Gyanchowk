import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { TeacherModel } from '../models/teacher.models.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });

export async function seedTeacherRiju() {
  const existing = await TeacherModel.findOne({ slug: 'riju' });
  if (existing) {
    console.log('[Seed] Teacher Riju already exists in TeacherModel.');
    return existing;
  }

  const riju = new TeacherModel({
    name: 'Riju',
    slug: 'riju',
    email: 'riju@gyanchowk.com',
    profileImage: {
      url: 'https://res.cloudinary.com/giihax3q/image/authenticated/s--ebZ9srgo--/v1789678965/gyan-chowk/cms/d8m3sxxc0seffcmobrt4.jpg',
    },
    designation: 'Chemistry Expert',
    subject: 'Chemistry',
    subjects: ['Chemistry', 'Organic Chemistry', 'Inorganic Chemistry', 'Physical Chemistry'],
    specialization: 'Organic & Inorganic Chemistry for JEE / NEET / CBSE',
    experience: '8+ Years',
    education: 'M.Sc. Chemistry',
    location: 'Online / New Delhi',
    languages: ['English', 'Hindi'],
    tagline: 'Make Chemistry simple, logical and interesting. Learn with concepts, not just notes.',
    bio: 'Riju is a passionate Chemistry educator with over 8 years of teaching experience. He has helped thousands of students achieve their dream through simple explanations, real-life examples and result-oriented teaching methods.',
    teachingMethodology: 'Conceptual clarity first, followed by visual problem-solving, mind-maps, and daily practice problem sets.',
    certifications: ['Certified Senior Chemistry Faculty', 'National Chemistry Olympiad Trainer'],
    qualifications: ['M.Sc. Chemistry', 'B.Sc. Honours Chemistry'],
    stats: {
      courseCount: 3,
      enrollmentCount: 17,
      reviewCount: 38,
      rating: 5.0,
    },
    featured: true,
    status: 'published',
    displayOrder: 1,
    quote: {
      text: 'Good teaching is not just about information, it’s about transformation.',
      author: 'Riju',
      bgImage: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&q=80&w=800',
      active: true,
    },
    doubtCTA: {
      title: 'Have doubts?',
      description: 'Ask Riju directly in the doubt section.',
      buttonText: 'Ask a Question',
      buttonUrl: '/contact?teacher=riju',
      active: true,
    },
    achievements: [
      {
        title: 'Verified Enrollments',
        description: 'Students actively enrolled in courses and batches',
        value: '17',
        icon: 'enrollments',
        order: 1,
      },
      {
        title: 'Course Reviews',
        description: 'Honest reviews submitted by enrolled students',
        value: '38',
        icon: 'reviews',
        order: 2,
      },
      {
        title: 'Average Rating',
        description: 'Consistent 5-star rating across all course modules',
        value: '5.0',
        icon: 'rating',
        order: 3,
      },
    ],
    reviews: [
      {
        studentName: 'Amit Kumar',
        studentAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=160',
        targetExam: 'UPSC Aspirant',
        rating: 5,
        reviewText: "Riju Sir's teaching style is amazing. Concepts are very clear and easy to understand. Highly recommended!",
        date: '12 Aug 2025',
        approved: true,
        featured: true,
      },
      {
        studentName: 'Priya Sharma',
        studentAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=160',
        targetExam: 'NEET Aspirant',
        rating: 5,
        reviewText: "The way he explains organic chemistry is just next level. It's simple, logical and very effective.",
        date: '5 Aug 2025',
        approved: true,
        featured: true,
      },
      {
        studentName: 'Rahul Singh',
        studentAvatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&q=80&w=160',
        targetExam: 'JEE Aspirant',
        rating: 5,
        reviewText: "Best teacher for Chemistry. His notes and examples are very helpful. I have improved a lot under his guidance.",
        date: '28 Jul 2025',
        approved: true,
        featured: true,
      },
    ],
    customCourses: [
      {
        title: 'Organic Chemistry Complete Course',
        slug: 'organic-chemistry-complete-course',
        subject: 'Chemistry',
        modulesCount: 12,
        duration: '45 Hours',
        thumbnail: 'https://images.unsplash.com/photo-1603126857599-f6e157fa2fe6?auto=format&fit=crop&q=80&w=400',
        rating: 5.0,
        featured: true,
        order: 1,
      },
      {
        title: 'Inorganic Chemistry Mastery',
        slug: 'inorganic-chemistry-mastery',
        subject: 'Chemistry',
        modulesCount: 10,
        duration: '38 Hours',
        thumbnail: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&q=80&w=400',
        rating: 5.0,
        featured: true,
        order: 2,
      },
      {
        title: 'Physical Chemistry Concepts',
        slug: 'physical-chemistry-concepts',
        subject: 'Chemistry',
        modulesCount: 8,
        duration: '32 Hours',
        thumbnail: 'https://images.unsplash.com/photo-1507668077129-56e32842fceb?auto=format&fit=crop&q=80&w=400',
        rating: 5.0,
        featured: true,
        order: 3,
      },
    ],
    benefits: [
      {
        title: 'Expert Guidance',
        subtitle: 'Learn from experienced educators',
        icon: 'guidance',
      },
      {
        title: 'Flexible Learning',
        subtitle: 'Study at your own pace',
        icon: 'flexible',
      },
      {
        title: 'Live Doubt Sessions',
        subtitle: 'Get your queries resolved',
        icon: 'doubt',
      },
      {
        title: 'Lifetime Access',
        subtitle: 'Learn anytime, anywhere',
        icon: 'access',
      },
    ],
    seo: {
      title: 'Riju — Chemistry Expert | Gyan Chowk',
      description: 'Learn with Riju, senior Chemistry educator at Gyan Chowk. Conceptual clarity, real-world examples, and exam preparation.',
    },
  });

  await riju.save();
  console.log('[Seed] Created Teacher Riju successfully.');
  return riju;
}

if (process.argv[1] && process.argv[1].endsWith('seed_teacher_riju.ts')) {
  mongoose.connect(process.env.MONGODB_URI!).then(async () => {
    await seedTeacherRiju();
    await mongoose.disconnect();
    process.exit(0);
  });
}
