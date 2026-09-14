import { Router } from 'express';
import { z } from 'zod';
import { QUESTION_TYPES } from '@gyan-chowk/shared';
import { authenticate, requireRoles, teacherOrAdmin, type AuthedRequest } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/error.js';
import { validate } from '../middleware/validate.js';
import {
  QuestionBankModel,
  QuestionModel,
  RankingModel,
  TestAttemptModel,
  TestModel,
  TestResultModel,
} from '../models/index.js';
import { getAttemptPaper, saveAnswer, startAttempt, submitAttempt } from '../services/test.service.js';
import { CalendarEventModel } from '../models/index.js';
import { notFound } from '../utils/errors.js';

export const testRouter = Router();
export const questionRouter = Router();
export const rankingRouter = Router();

questionRouter.post(
  '/banks',
  authenticate,
  teacherOrAdmin,
  validate(z.object({ name: z.string(), course: z.string().optional(), subject: z.string().optional() })),
  asyncHandler(async (req: AuthedRequest, res) => {
    const bank = await QuestionBankModel.create({ ...req.body, createdBy: req.user!.id });
    res.status(201).json({ bank });
  }),
);

questionRouter.get(
  '/banks',
  authenticate,
  teacherOrAdmin,
  asyncHandler(async (req: AuthedRequest, res) => {
    const filter = req.user!.role === 'admin' ? {} : { createdBy: req.user!.id };
    const items = await QuestionBankModel.find(filter).lean();
    res.json({ items });
  }),
);

questionRouter.post(
  '/',
  authenticate,
  teacherOrAdmin,
  validate(
    z.object({
      bank: z.string().optional(),
      course: z.string().optional(),
      subject: z.string().optional(),
      chapter: z.string().optional(),
      type: z.enum(QUESTION_TYPES),
      stem: z.string(),
      options: z.array(z.object({ key: z.string(), text: z.string() })).optional(),
      correctKeys: z.array(z.string()).optional(),
      numericalAnswer: z.number().optional(),
      numericalTolerance: z.number().optional(),
      marks: z.number().optional(),
      negativeMarks: z.number().optional(),
      difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
      explanation: z.string().optional(),
    }),
  ),
  asyncHandler(async (req: AuthedRequest, res) => {
    const question = await QuestionModel.create({ ...req.body, createdBy: req.user!.id });
    res.status(201).json({ question });
  }),
);

questionRouter.get(
  '/',
  authenticate,
  teacherOrAdmin,
  asyncHandler(async (req, res) => {
    const filter: Record<string, unknown> = {};
    if (req.query.bank) filter.bank = req.query.bank;
    if (req.query.course) filter.course = req.query.course;
    const items = await QuestionModel.find(filter).limit(200).lean();
    res.json({ items });
  }),
);

testRouter.get(
  '/',
  authenticate,
  asyncHandler(async (req: AuthedRequest, res) => {
    const filter: Record<string, unknown> = {};
    if (req.user!.role === 'student') filter.status = { $in: ['scheduled', 'live', 'ended'] };
    if (req.query.course) filter.course = req.query.course;
    if (req.query.batch) filter.batch = req.query.batch;
    const items = await TestModel.find(filter).sort({ startsAt: -1 }).lean();
    res.json({ items });
  }),
);

testRouter.post(
  '/',
  authenticate,
  teacherOrAdmin,
  validate(
    z.object({
      title: z.string(),
      course: z.string().optional(),
      batch: z.string().optional(),
      durationMin: z.number().int().positive(),
      negativeMarking: z.boolean().optional(),
      randomQuestions: z.boolean().optional(),
      randomOptions: z.boolean().optional(),
      attemptLimit: z.number().optional(),
      startsAt: z.coerce.date().optional(),
      endsAt: z.coerce.date().optional(),
      status: z.enum(['draft', 'scheduled', 'live', 'ended', 'archived']).optional(),
      sections: z.array(
        z.object({
          name: z.string(),
          durationMin: z.number().optional(),
          questionIds: z.array(z.string()),
        }),
      ),
    }),
  ),
  asyncHandler(async (req: AuthedRequest, res) => {
    const totalMarks = 0;
    const test = await TestModel.create({ ...req.body, createdBy: req.user!.id, totalMarks });
    if (test.startsAt) {
      await CalendarEventModel.create({
        title: test.title,
        type: 'test',
        batch: test.batch,
        course: test.course,
        startsAt: test.startsAt,
        endsAt: test.endsAt,
        refId: test._id,
        refModel: 'Test',
      });
    }
    res.status(201).json({ test });
  }),
);

testRouter.post(
  '/:id/start',
  authenticate,
  requireRoles('student'),
  asyncHandler(async (req: AuthedRequest, res) => {
    const attempt = await startAttempt(req.user!.id, req.params.id!);
    res.status(201).json({ attempt });
  }),
);

testRouter.get(
  '/attempts/:attemptId',
  authenticate,
  asyncHandler(async (req: AuthedRequest, res) => {
    res.json(await getAttemptPaper(req.user!.id, req.params.attemptId!));
  }),
);

testRouter.post(
  '/attempts/:attemptId/answer',
  authenticate,
  validate(z.object({ questionId: z.string(), answer: z.unknown(), markedForReview: z.boolean().optional() })),
  asyncHandler(async (req: AuthedRequest, res) => {
    res.json(await saveAnswer(req.user!.id, req.params.attemptId!, req.body.questionId, req.body.answer, req.body.markedForReview));
  }),
);

testRouter.post(
  '/attempts/:attemptId/submit',
  authenticate,
  asyncHandler(async (req: AuthedRequest, res) => {
    res.json({ result: await submitAttempt(req.user!.id, req.params.attemptId!) });
  }),
);

testRouter.get(
  '/results',
  authenticate,
  asyncHandler(async (req: AuthedRequest, res) => {
    const filter = req.user!.role === 'student' ? { user: req.user!.id } : {};
    if (req.query.test) (filter as Record<string, unknown>).test = req.query.test;
    const items = await TestResultModel.find(filter).sort({ createdAt: -1 }).limit(50).lean();
    res.json({ items });
  }),
);

testRouter.get(
  '/results/:id',
  authenticate,
  asyncHandler(async (req: AuthedRequest, res) => {
    const result = await TestResultModel.findById(req.params.id).lean();
    if (!result) throw notFound('Result not found');
    if (req.user!.role === 'student' && String(result.user) !== req.user!.id) throw notFound('Result not found');
    const questions = result.test
      ? await (await import('../models/index.js')).QuestionModel.find().limit(0)
      : [];
    void questions;
    const test = await TestModel.findById(result.test).lean();
    const questionsFull = await (await import('../models/index.js')).QuestionModel.find({
      _id: { $in: (await TestAttemptModel.findById(result.attempt))?.questionOrder ?? [] },
    }).lean();
    res.json({ result, test, solutions: questionsFull });
  }),
);

rankingRouter.get(
  '/',
  authenticate,
  asyncHandler(async (req, res) => {
    const scope = String(req.query.scope ?? 'all_india');
    const scopeId = String(req.query.scopeId ?? '');
    const items = await RankingModel.find({ scope, scopeId }).sort({ rank: 1 }).limit(100).populate('user', 'name state').lean();
    res.json({ items });
  }),
);

rankingRouter.get(
  '/me',
  authenticate,
  asyncHandler(async (req: AuthedRequest, res) => {
    const items = await RankingModel.find({ user: req.user!.id }).sort({ computedAt: -1 }).limit(20).lean();
    res.json({ items });
  }),
);
