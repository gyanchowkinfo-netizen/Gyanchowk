import mongoose from 'mongoose';
import { TeacherModel, ITeacher } from '../models/teacher.models.js';
import { CourseModel, BatchModel } from '../models/catalog.models.js';
import { UserModel } from '../models/user.models.js';

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-');
}

export async function ensureDefaultTeachers() {
  const count = await TeacherModel.countDocuments();
  if (count === 0) {
    const { seedTeacherRiju } = await import('../scripts/seed_teacher_riju.js');
    await seedTeacherRiju();
  }

  // Also sync any UserModel teachers that don't exist in TeacherModel
  const userTeachers = await UserModel.find({ role: 'teacher' }).lean();
  for (const u of userTeachers) {
    const slug = slugify(u.name) || String(u._id);
    const exists = await TeacherModel.findOne({
      $or: [{ user: u._id }, { slug }],
    });
    if (!exists) {
      await TeacherModel.create({
        user: u._id,
        name: u.name,
        slug,
        email: u.email,
        phone: u.phone,
        profileImage: u.avatar ? { url: u.avatar.url, publicId: u.avatar.publicId } : undefined,
        designation: u.headline || 'Faculty & Mentor',
        subject: (u.expertise && u.expertise[0]) || 'General Studies',
        subjects: u.expertise?.length ? u.expertise : ['General Studies'],
        bio: u.bio || '',
        experience: '5+ Years',
        education: 'Educator',
        location: u.city ? `${u.city}${u.state ? ', ' + u.state : ''}` : 'Online',
        languages: u.language ? [u.language] : ['English', 'Hindi'],
        stats: {
          courseCount: 0,
          enrollmentCount: 0,
          reviewCount: 0,
          rating: 5.0,
        },
        featured: false,
        status: u.teacherStatus === 'approved' ? 'published' : 'pending',
        displayOrder: 99,
      });
    }
  }
}

export interface TeacherFilterOptions {
  q?: string;
  subject?: string;
  category?: string;
  experience?: string;
  minRating?: number;
  sort?: string;
  status?: string;
  featured?: boolean;
  page?: number;
  limit?: number;
}

export async function getPublicTeachers(options: TeacherFilterOptions) {
  await ensureDefaultTeachers();

  const filter: Record<string, unknown> = {
    status: 'published',
  };

  const q = options.q?.trim();
  if (q) {
    const rx = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    filter.$or = [
      { name: rx },
      { designation: rx },
      { subject: rx },
      { subjects: rx },
      { bio: rx },
      { specialization: rx },
    ];
  }

  const subject = options.subject || options.category;
  if (subject && subject.toLowerCase() !== 'all') {
    const sRx = new RegExp(`^${subject.trim()}$`, 'i');
    filter.$or = [{ subject: sRx }, { subjects: sRx }];
  }

  if (options.minRating && options.minRating > 0) {
    filter['stats.rating'] = { $gte: Number(options.minRating) };
  }

  if (options.featured !== undefined) {
    filter.featured = options.featured;
  }

  const page = Math.max(1, Number(options.page) || 1);
  const limit = Math.max(1, Math.min(100, Number(options.limit) || 12));
  const skip = (page - 1) * limit;

  // Sorting
  let sortOption: Record<string, 1 | -1> = { displayOrder: 1, 'stats.rating': -1, createdAt: -1 };
  if (options.sort === 'rating') {
    sortOption = { 'stats.rating': -1, 'stats.reviewCount': -1 };
  } else if (options.sort === 'students') {
    sortOption = { 'stats.enrollmentCount': -1 };
  } else if (options.sort === 'courses') {
    sortOption = { 'stats.courseCount': -1 };
  } else if (options.sort === 'newest') {
    sortOption = { createdAt: -1 };
  } else if (options.sort === 'name') {
    sortOption = { name: 1 };
  }

  const [items, total] = await Promise.all([
    TeacherModel.find(filter).sort(sortOption).skip(skip).limit(limit).lean(),
    TeacherModel.countDocuments(filter),
  ]);

  // Aggregate categories
  const allPublished = await TeacherModel.find({ status: 'published' }).select('subject subjects').lean();
  const categoriesSet = new Set<string>();
  allPublished.forEach((t: any) => {
    if (t.subject) categoriesSet.add(t.subject);
    if (Array.isArray(t.subjects)) t.subjects.forEach((s: any) => categoriesSet.add(s));
  });

  return {
    items,
    total,
    page,
    limit,
    pages: Math.ceil(total / limit) || 1,
    categories: Array.from(categoriesSet).filter(Boolean),
  };
}

export async function getPublicTeacherBySlugOrId(identifier: string) {
  await ensureDefaultTeachers();

  const isObjectId = mongoose.Types.ObjectId.isValid(identifier);
  const query = isObjectId
    ? { $or: [{ _id: identifier }, { slug: identifier.toLowerCase() }] }
    : { slug: identifier.toLowerCase() };

  let teacher = await TeacherModel.findOne(query).lean();
  if (!teacher && isObjectId) {
    // Check if it's a User ID
    teacher = await TeacherModel.findOne({ user: identifier }).lean();
  }

  if (!teacher) {
    return null;
  }

  // If teacher has associated courses from CourseModel, attach them
  let courses: any[] = [];
  if (teacher.courses?.length) {
    courses = await CourseModel.find({ _id: { $in: teacher.courses }, status: 'published' }).lean();
  } else if (teacher.user) {
    courses = await CourseModel.find({ teachers: teacher.user, status: 'published' }).lean();
  }

  return {
    teacher,
    courses,
  };
}

export async function getAdminTeachers(options: TeacherFilterOptions) {
  await ensureDefaultTeachers();

  const filter: Record<string, unknown> = {};

  const q = options.q?.trim();
  if (q) {
    const rx = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    filter.$or = [
      { name: rx },
      { email: rx },
      { designation: rx },
      { subject: rx },
      { specialization: rx },
    ];
  }

  if (options.status && options.status !== 'all') {
    filter.status = options.status;
  }

  if (options.featured !== undefined) {
    filter.featured = options.featured;
  }

  if (options.subject && options.subject !== 'all') {
    const sRx = new RegExp(`^${options.subject.trim()}$`, 'i');
    filter.$or = [{ subject: sRx }, { subjects: sRx }];
  }

  const page = Math.max(1, Number(options.page) || 1);
  const limit = Math.max(1, Math.min(100, Number(options.limit) || 20));
  const skip = (page - 1) * limit;

  // Sorting
  let sortOption: Record<string, 1 | -1> = { displayOrder: 1, createdAt: -1 };
  if (options.sort === 'rating') {
    sortOption = { 'stats.rating': -1 };
  } else if (options.sort === 'students') {
    sortOption = { 'stats.enrollmentCount': -1 };
  } else if (options.sort === 'name') {
    sortOption = { name: 1 };
  } else if (options.sort === 'oldest') {
    sortOption = { createdAt: 1 };
  } else if (options.sort === 'newest') {
    sortOption = { createdAt: -1 };
  }

  const [items, total, totalAll, totalPublished, totalDraft, totalFeatured, totalPending] =
    await Promise.all([
      TeacherModel.find(filter).sort(sortOption).skip(skip).limit(limit).lean(),
      TeacherModel.countDocuments(filter),
      TeacherModel.countDocuments(),
      TeacherModel.countDocuments({ status: 'published' }),
      TeacherModel.countDocuments({ status: 'draft' }),
      TeacherModel.countDocuments({ featured: true }),
      TeacherModel.countDocuments({ status: 'pending' }),
    ]);

  return {
    items,
    total,
    page,
    limit,
    pages: Math.ceil(total / limit) || 1,
    summary: {
      total: totalAll,
      published: totalPublished,
      draft: totalDraft,
      featured: totalFeatured,
      pending: totalPending,
    },
  };
}

export async function createTeacher(data: Partial<ITeacher>) {
  if (!data.name?.trim()) {
    throw new Error('Teacher name is required');
  }

  let slug = data.slug ? slugify(data.slug) : slugify(data.name);
  if (!slug) slug = `teacher-${Date.now()}`;

  // Ensure unique slug
  let uniqueSlug = slug;
  let counter = 1;
  while (await TeacherModel.findOne({ slug: uniqueSlug })) {
    uniqueSlug = `${slug}-${counter++}`;
  }

  // Get next displayOrder
  const lastTeacher = await TeacherModel.findOne().sort({ displayOrder: -1 }).select('displayOrder').lean();
  const nextOrder = (lastTeacher?.displayOrder ?? 0) + 1;

  const teacher = new TeacherModel({
    ...data,
    slug: uniqueSlug,
    displayOrder: data.displayOrder ?? nextOrder,
    status: data.status || 'published',
  });

  await teacher.save();
  return teacher;
}

export async function updateTeacher(id: string, data: Partial<ITeacher>) {
  const teacher = await TeacherModel.findById(id);
  if (!teacher) {
    throw new Error('Teacher not found');
  }

  if (data.slug && data.slug !== teacher.slug) {
    const slug = slugify(data.slug);
    const existing = await TeacherModel.findOne({ slug, _id: { $ne: id } });
    if (existing) {
      throw new Error(`Slug "${slug}" is already in use by another teacher`);
    }
    data.slug = slug;
  }

  Object.assign(teacher, data);
  await teacher.save();
  return teacher;
}

export async function deleteTeacher(id: string, soft = true) {
  if (soft) {
    const teacher = await TeacherModel.findByIdAndUpdate(
      id,
      { $set: { status: 'archived' } },
      { new: true }
    );
    if (!teacher) throw new Error('Teacher not found');
    return teacher;
  }
  const deleted = await TeacherModel.findByIdAndDelete(id);
  if (!deleted) throw new Error('Teacher not found');
  return deleted;
}

export async function reorderTeachers(orderedIds: string[]) {
  const operations = orderedIds.map((id, index) => ({
    updateOne: {
      filter: { _id: id },
      update: { $set: { displayOrder: index + 1 } },
    },
  }));

  if (operations.length > 0) {
    await TeacherModel.bulkWrite(operations);
  }
  return true;
}
