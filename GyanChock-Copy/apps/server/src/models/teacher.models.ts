import mongoose, { Schema, Document } from 'mongoose';

export interface ITeacherAchievement {
  _id?: string;
  title: string;
  description: string;
  value: string;
  icon?: string;
  order?: number;
}

export interface ITeacherReview {
  _id?: string;
  studentName: string;
  studentAvatar?: string;
  targetExam?: string;
  roleOrExam?: string;
  rating: number;
  reviewText?: string;
  comment?: string;
  date?: string;
  approved?: boolean;
  featured?: boolean;
}

export interface ITeacherCustomCourse {
  _id?: string;
  title: string;
  slug?: string;
  subject?: string;
  modulesCount?: number;
  duration?: string;
  durationHours?: number;
  thumbnail?: string;
  rating?: number;
  price?: number;
  url?: string;
  featured?: boolean;
  order?: number;
}

export interface ITeacherBenefit {
  title: string;
  subtitle: string;
  icon?: string;
}

export interface ITeacher extends Document {
  user?: mongoose.Types.ObjectId;
  name: string;
  slug: string;
  email?: string;
  phone?: string;
  profileImage?: {
    url?: string;
    publicId?: string;
  };
  coverImage?: {
    url?: string;
    publicId?: string;
  };
  designation?: string;
  subject?: string;
  subjects?: string[];
  specialization?: string;
  experience?: string;
  education?: string;
  location?: string;
  languages?: string[];
  tagline?: string;
  bio?: string;
  teachingMethodology?: string;
  certifications?: string[];
  qualifications?: string[];
  socialLinks?: {
    linkedin?: string;
    youtube?: string;
    instagram?: string;
    facebook?: string;
    website?: string;
  };
  stats?: {
    courseCount: number;
    enrollmentCount: number;
    reviewCount: number;
    rating: number;
  };
  featured: boolean;
  status: 'draft' | 'pending' | 'approved' | 'published' | 'archived';
  displayOrder: number;
  quote?: {
    text: string;
    author: string;
    bgImage?: string;
    active: boolean;
  };
  doubtCTA?: {
    title: string;
    description: string;
    buttonText: string;
    buttonUrl?: string;
    active: boolean;
  };
  achievements?: ITeacherAchievement[];
  reviews?: ITeacherReview[];
  courses?: mongoose.Types.ObjectId[];
  customCourses?: ITeacherCustomCourse[];
  benefits?: ITeacherBenefit[];
  seo?: {
    title?: string;
    description?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const teacherSchema = new Schema<ITeacher>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: false, index: true },
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true, index: true },
    email: { type: String, trim: true, lowercase: true },
    phone: { type: String, trim: true },
    profileImage: {
      url: String,
      publicId: String,
    },
    coverImage: {
      url: String,
      publicId: String,
    },
    designation: { type: String, default: '' },
    subject: { type: String, default: '', index: true },
    subjects: [{ type: String, index: true }],
    specialization: { type: String, default: '' },
    experience: { type: String, default: '' },
    education: { type: String, default: '' },
    location: { type: String, default: 'Online / New Delhi' },
    languages: [{ type: String }],
    tagline: { type: String, default: '' },
    bio: { type: String, default: '' },
    teachingMethodology: { type: String, default: '' },
    certifications: [{ type: String }],
    qualifications: [{ type: String }],
    socialLinks: {
      linkedin: { type: String, default: '' },
      youtube: { type: String, default: '' },
      instagram: { type: String, default: '' },
      facebook: { type: String, default: '' },
      website: { type: String, default: '' },
    },
    stats: {
      courseCount: { type: Number, default: 0 },
      enrollmentCount: { type: Number, default: 0 },
      reviewCount: { type: Number, default: 0 },
      rating: { type: Number, default: 5.0 },
    },
    featured: { type: Boolean, default: false, index: true },
    status: {
      type: String,
      enum: ['draft', 'pending', 'approved', 'published', 'archived'],
      default: 'published',
      index: true,
    },
    displayOrder: { type: Number, default: 0, index: true },
    quote: {
      text: { type: String, default: '' },
      author: { type: String, default: '' },
      bgImage: { type: String, default: '' },
      active: { type: Boolean, default: true },
    },
    doubtCTA: {
      title: { type: String, default: 'Have doubts?' },
      description: { type: String, default: 'Ask directly in the doubt section.' },
      buttonText: { type: String, default: 'Ask a Question' },
      buttonUrl: { type: String, default: '/contact' },
      active: { type: Boolean, default: true },
    },
    achievements: [
      {
        title: { type: String, required: true },
        description: { type: String, default: '' },
        value: { type: String, required: true },
        icon: { type: String, default: 'star' },
        order: { type: Number, default: 0 },
      },
    ],
    reviews: [
      {
        studentName: { type: String, required: true },
        studentAvatar: { type: String, default: '' },
        targetExam: { type: String, default: '' },
        roleOrExam: { type: String, default: '' },
        rating: { type: Number, default: 5 },
        reviewText: { type: String, default: '' },
        comment: { type: String, default: '' },
        date: { type: String, default: '' },
        approved: { type: Boolean, default: true },
        featured: { type: Boolean, default: true },
      },
    ],
    courses: [{ type: Schema.Types.ObjectId, ref: 'Course' }],
    customCourses: [
      {
        title: { type: String, required: true },
        slug: { type: String, default: '' },
        subject: { type: String, default: '' },
        modulesCount: { type: Number, default: 0 },
        duration: { type: String, default: '' },
        durationHours: { type: Number, default: 0 },
        thumbnail: { type: String, default: '' },
        rating: { type: Number, default: 5.0 },
        price: { type: Number, default: 0 },
        url: { type: String, default: '' },
        featured: { type: Boolean, default: true },
        order: { type: Number, default: 0 },
      },
    ],
    benefits: [
      {
        title: { type: String, required: true },
        subtitle: { type: String, default: '' },
        icon: { type: String, default: 'star' },
      },
    ],
    seo: {
      title: { type: String, default: '' },
      description: { type: String, default: '' },
    },
  },
  { timestamps: true }
);

teacherSchema.index({ name: 'text', designation: 'text', bio: 'text', subject: 'text' });

export const TeacherModel: mongoose.Model<ITeacher> =
  (mongoose.models.Teacher as mongoose.Model<ITeacher>) || mongoose.model<ITeacher>('Teacher', teacherSchema);
