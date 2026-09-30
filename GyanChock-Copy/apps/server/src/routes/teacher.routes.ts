import { Router } from 'express';
import { asyncHandler } from '../middleware/error.js';
import {
  getPublicTeachers,
  getPublicTeacherBySlugOrId,
} from '../services/teacher.service.js';
import { TeacherModel } from '../models/teacher.models.js';

export const teacherRouter = Router();

// Public: Get teachers list with search & filters
teacherRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const q = req.query.q ? String(req.query.q) : undefined;
    const subject = req.query.subject ? String(req.query.subject) : undefined;
    const category = req.query.category ? String(req.query.category) : undefined;
    const experience = req.query.experience ? String(req.query.experience) : undefined;
    const minRating = req.query.minRating ? Number(req.query.minRating) : undefined;
    const sort = req.query.sort ? String(req.query.sort) : undefined;
    const page = req.query.page ? Number(req.query.page) : 1;
    const limit = req.query.limit ? Number(req.query.limit) : 12;

    const result = await getPublicTeachers({
      q,
      subject,
      category,
      experience,
      minRating,
      sort,
      page,
      limit,
    });

    res.json(result);
  })
);

// Public: Get categories
teacherRouter.get(
  '/categories',
  asyncHandler(async (_req, res) => {
    const allPublished = await TeacherModel.find({ status: 'published' }).select('subject subjects').lean();
    const categoriesSet = new Set<string>();
    allPublished.forEach((t) => {
      if (t.subject) categoriesSet.add(t.subject);
      if (Array.isArray(t.subjects)) t.subjects.forEach((s) => categoriesSet.add(s));
    });

    const defaultCategories = [
      'Chemistry',
      'Physics',
      'Mathematics',
      'Biology',
      'English',
      'Computer Science',
      'General Studies',
      'Competitive Exams',
    ];
    defaultCategories.forEach((c) => categoriesSet.add(c));

    res.json({ categories: Array.from(categoriesSet).filter(Boolean) });
  })
);

// Public: Get teacher profile by slug or ID
teacherRouter.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const idOrSlug = String(req.params.id ?? '').trim();
    const result = await getPublicTeacherBySlugOrId(idOrSlug);
    if (!result) {
      return res.status(404).json({ error: 'Teacher not found' });
    }
    res.json(result);
  })
);

// Public: Submit a real student review & rating for a teacher
teacherRouter.post(
  '/:id/reviews',
  asyncHandler(async (req, res) => {
    const idOrSlug = String(req.params.id ?? '').trim();
    const { default: mongoose } = await import('mongoose');
    const isObjectId = mongoose.Types.ObjectId.isValid(idOrSlug);
    const query = isObjectId
      ? { $or: [{ _id: idOrSlug }, { slug: idOrSlug.toLowerCase() }] }
      : { slug: idOrSlug.toLowerCase() };

    const teacher = await TeacherModel.findOne(query);
    if (!teacher) {
      return res.status(404).json({ error: 'Teacher not found' });
    }

    const {
      studentName,
      studentAvatar,
      roleOrExam,
      targetExam,
      rating,
      comment,
      reviewText,
    } = req.body;

    if (!studentName?.trim()) {
      return res.status(400).json({ error: 'Student name is required' });
    }

    const reviewBody = (comment || reviewText || '').trim();
    if (!reviewBody) {
      return res.status(400).json({ error: 'Review text is required' });
    }

    const ratingVal = Math.max(1, Math.min(5, Number(rating) || 5));
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

    const newReview = {
      studentName: studentName.trim(),
      studentAvatar: studentAvatar?.trim() || '',
      roleOrExam: (roleOrExam || targetExam || 'Student').trim(),
      targetExam: (roleOrExam || targetExam || 'Student').trim(),
      rating: ratingVal,
      comment: reviewBody,
      reviewText: reviewBody,
      date: dateStr,
      approved: true,
      featured: true,
    };

    if (!teacher.reviews) teacher.reviews = [];
    teacher.reviews.unshift(newReview as any);

    // Compute live stats from all approved reviews
    const approvedReviews = teacher.reviews.filter((r) => r.approved !== false);
    const avgRating =
      approvedReviews.reduce((sum, r) => sum + (r.rating || 5), 0) / (approvedReviews.length || 1);
    if (!teacher.stats) teacher.stats = { courseCount: 0, enrollmentCount: 0, reviewCount: 0, rating: 5 };
    teacher.stats.rating = Number(avgRating.toFixed(1));
    teacher.stats.reviewCount = approvedReviews.length;

    await teacher.save();

    res.status(201).json({ success: true, review: newReview, stats: teacher.stats });
  })
);

