import mongoose from 'mongoose';
import {
  QuestionModel,
  RankingModel,
  TestAnswerModel,
  TestAttemptModel,
  TestModel,
  TestResultModel,
  UserModel,
} from '../models/index.js';
import { badRequest, conflict, forbidden, notFound } from '../utils/errors.js';
import { notify } from './notification.service.js';

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const a = copy[i]!;
    copy[i] = copy[j]!;
    copy[j] = a;
  }
  return copy;
}

export function gradeAnswer(
  question: {
    type: string;
    correctKeys?: string[];
    numericalAnswer?: number;
    numericalTolerance?: number;
    marks: number;
    negativeMarks: number;
  },
  answer: unknown,
): { correct: boolean; marks: number } {
  if (answer === undefined || answer === null || answer === '') {
    return { correct: false, marks: 0 };
  }
  let correct = false;
  if (question.type === 'single_mcq' || question.type === 'true_false' || question.type === 'assertion_reason') {
    correct = String(answer) === String(question.correctKeys?.[0]);
  } else if (question.type === 'multi_mcq') {
    const got = Array.isArray(answer) ? [...answer].map(String).sort() : [];
    const exp = [...(question.correctKeys ?? [])].map(String).sort();
    correct = got.length === exp.length && got.every((v, i) => v === exp[i]);
  } else if (question.type === 'numerical') {
    const n = Number(answer);
    const tol = question.numericalTolerance ?? 0;
    correct = Number.isFinite(n) && Math.abs(n - (question.numericalAnswer ?? 0)) <= tol;
  } else if (question.type === 'match') {
    correct = JSON.stringify(answer) === JSON.stringify(question.correctKeys);
  } else {
    return { correct: false, marks: 0 };
  }
  return { correct, marks: correct ? question.marks : -Math.abs(question.negativeMarks) };
}

export async function startAttempt(userId: string, testId: string) {
  const test = await TestModel.findById(testId);
  if (!test) throw notFound('Test not found');
  const now = new Date();
  if (test.startsAt && test.startsAt > now) throw forbidden('Test has not started');
  if (test.endsAt && test.endsAt < now) throw forbidden('Test window has ended');
  if (!['scheduled', 'live', 'published'].includes(test.status) && test.status !== 'live') {
    if (test.status === 'draft' || test.status === 'archived') throw forbidden('Test is not available');
  }

  const previous = await TestAttemptModel.countDocuments({
    test: testId,
    user: userId,
    status: { $in: ['submitted', 'auto_submitted', 'evaluated'] },
  });
  if (previous >= (test.attemptLimit ?? 1)) throw conflict('Attempt limit reached');

  const inProgress = await TestAttemptModel.findOne({ test: testId, user: userId, status: 'in_progress' });
  if (inProgress) return inProgress;

  const questionIds = test.sections.flatMap((s) => s.questionIds);
  const order = test.randomQuestions ? shuffle(questionIds) : questionIds;
  const expiresAt = new Date(Date.now() + test.durationMin * 60 * 1000);

  return TestAttemptModel.create({
    test: test._id,
    user: userId,
    status: 'in_progress',
    questionOrder: order,
    expiresAt,
  });
}

export async function saveAnswer(
  userId: string,
  attemptId: string,
  questionId: string,
  answer: unknown,
  markedForReview?: boolean,
) {
  const attempt = await TestAttemptModel.findById(attemptId);
  if (!attempt || String(attempt.user) !== userId) throw notFound('Attempt not found');
  if (attempt.status !== 'in_progress') throw forbidden('Attempt is closed');
  if (attempt.expiresAt && attempt.expiresAt < new Date()) {
    return submitAttempt(userId, attemptId, true);
  }
  await TestAnswerModel.findOneAndUpdate(
    { attempt: attempt._id, question: questionId },
    { $set: { answer, markedForReview: Boolean(markedForReview), savedAt: new Date() } },
    { upsert: true },
  );
  return { ok: true };
}

export async function submitAttempt(userId: string, attemptId: string, auto = false) {
  const attempt = await TestAttemptModel.findById(attemptId);
  if (!attempt || String(attempt.user) !== userId) throw notFound('Attempt not found');
  if (attempt.status !== 'in_progress') {
    const existing = await TestResultModel.findOne({ attempt: attempt._id });
    return existing;
  }

  const test = await TestModel.findById(attempt.test);
  if (!test) throw notFound('Test not found');
  const answers = await TestAnswerModel.find({ attempt: attempt._id }).lean();
  const questions = await QuestionModel.find({ _id: { $in: attempt.questionOrder } }).lean();
  const qMap = new Map(questions.map((q) => [String(q._id), q]));
  const aMap = new Map(answers.map((a) => [String(a.question), a]));

  let score = 0;
  let maxScore = 0;
  let attempted = 0;
  let correct = 0;
  let incorrect = 0;
  let skipped = 0;
  const subjectBreakdown: Record<string, { score: number; correct: number; total: number }> = {};
  const chapterBreakdown: Record<string, { score: number; correct: number; total: number }> = {};
  const difficultyBreakdown: Record<string, { score: number; correct: number; total: number }> = {};

  for (const qid of attempt.questionOrder) {
    const q = qMap.get(String(qid));
    if (!q) continue;
    maxScore += q.marks;
    const ans = aMap.get(String(qid));
    const subjectKey = String(q.subject ?? 'general');
    const chapterKey = String(q.chapter ?? 'general');
    const diffKey = q.difficulty ?? 'medium';
    subjectBreakdown[subjectKey] ??= { score: 0, correct: 0, total: 0 };
    chapterBreakdown[chapterKey] ??= { score: 0, correct: 0, total: 0 };
    difficultyBreakdown[diffKey] ??= { score: 0, correct: 0, total: 0 };
    subjectBreakdown[subjectKey].total += 1;
    chapterBreakdown[chapterKey].total += 1;
    difficultyBreakdown[diffKey].total += 1;

    if (!ans || ans.answer === undefined || ans.answer === null || ans.answer === '') {
      skipped += 1;
      continue;
    }
    attempted += 1;
    const graded = gradeAnswer(
      {
        type: q.type,
        correctKeys: q.correctKeys ?? undefined,
        numericalAnswer: q.numericalAnswer ?? undefined,
        numericalTolerance: q.numericalTolerance ?? undefined,
        marks: q.marks,
        negativeMarks: q.negativeMarks,
      },
      ans.answer,
    );
    score += graded.marks;
    if (graded.correct) {
      correct += 1;
      subjectBreakdown[subjectKey].correct += 1;
      chapterBreakdown[chapterKey].correct += 1;
      difficultyBreakdown[diffKey].correct += 1;
    } else incorrect += 1;
    subjectBreakdown[subjectKey].score += graded.marks;
    chapterBreakdown[chapterKey].score += graded.marks;
    difficultyBreakdown[diffKey].score += graded.marks;
  }

  const timeTakenSec = Math.round((Date.now() - attempt.startedAt.getTime()) / 1000);
  attempt.status = auto ? 'auto_submitted' : 'submitted';
  attempt.submittedAt = new Date();
  attempt.timeTakenSec = timeTakenSec;
  await attempt.save();

  const user = await UserModel.findById(userId).lean();
  const result = await TestResultModel.create({
    attempt: attempt._id,
    test: test._id,
    user: userId,
    batch: test.batch,
    course: test.course,
    state: user?.state,
    score,
    maxScore,
    percentage: maxScore ? Math.round((score / maxScore) * 10000) / 100 : 0,
    accuracy: attempted ? Math.round((correct / attempted) * 10000) / 100 : 0,
    attempted,
    correct,
    incorrect,
    skipped,
    timeTakenSec,
    subjectBreakdown,
    chapterBreakdown,
    difficultyBreakdown,
  });

  await recomputeTestRanks(String(test._id));
  await notify({
    userId,
    title: 'Test result ready',
    body: `${test.title}: ${result.percentage}%`,
    type: 'test_result',
    href: `/student/results`,
  });
  return result;
}

export async function recomputeTestRanks(testId: string) {
  const results = await TestResultModel.find({ test: testId }).sort({ score: -1, timeTakenSec: 1 }).lean();
  const n = results.length || 1;
  const ops: mongoose.AnyBulkWriteOperation<typeof RankingModel.prototype>[] = [];
  const resultOps: Array<{ updateOne: { filter: { _id: unknown }; update: { $set: Record<string, unknown> } } }> =
    [];

  const byState = new Map<string, typeof results>();
  const byBatch = new Map<string, typeof results>();

  for (const r of results) {
    if (r.state) {
      const list = byState.get(r.state) ?? [];
      list.push(r);
      byState.set(r.state, list);
    }
    if (r.batch) {
      const key = String(r.batch);
      const list = byBatch.get(key) ?? [];
      list.push(r);
      byBatch.set(key, list);
    }
  }

  results.forEach((r, idx) => {
    const rank = idx + 1;
    const percentile = Math.round(((n - rank) / n) * 10000) / 100;
    resultOps.push({
      updateOne: {
        filter: { _id: r._id },
        update: { $set: { rankAllIndia: rank, percentile } },
      },
    });
    ops.push({
      updateOne: {
        filter: { scope: 'all_india', scopeId: testId, user: r.user },
        update: {
          $set: {
            scope: 'all_india',
            scopeId: testId,
            test: testId,
            user: r.user,
            rank,
            percentile,
            score: r.score,
            computedAt: new Date(),
          },
        },
        upsert: true,
      },
    });
  });

  for (const [state, list] of byState) {
    list.forEach((r, idx) => {
      resultOps.push({
        updateOne: { filter: { _id: r._id }, update: { $set: { rankState: idx + 1 } } },
      });
      ops.push({
        updateOne: {
          filter: { scope: 'state', scopeId: `${testId}:${state}`, user: r.user },
          update: {
            $set: {
              scope: 'state',
              scopeId: `${testId}:${state}`,
              test: testId,
              user: r.user,
              rank: idx + 1,
              score: r.score,
              computedAt: new Date(),
            },
          },
          upsert: true,
        },
      });
    });
  }
  for (const [batch, list] of byBatch) {
    list.forEach((r, idx) => {
      resultOps.push({
        updateOne: { filter: { _id: r._id }, update: { $set: { rankBatch: idx + 1 } } },
      });
      ops.push({
        updateOne: {
          filter: { scope: 'batch', scopeId: `${testId}:${batch}`, user: r.user },
          update: {
            $set: {
              scope: 'batch',
              scopeId: `${testId}:${batch}`,
              test: testId,
              user: r.user,
              rank: idx + 1,
              score: r.score,
              computedAt: new Date(),
            },
          },
          upsert: true,
        },
      });
    });
  }

  if (resultOps.length) await TestResultModel.bulkWrite(resultOps);
  if (ops.length) await RankingModel.bulkWrite(ops);
}

export async function getAttemptPaper(userId: string, attemptId: string) {
  const attempt = await TestAttemptModel.findById(attemptId);
  if (!attempt || String(attempt.user) !== userId) throw notFound('Attempt not found');
  const questions = await QuestionModel.find({ _id: { $in: attempt.questionOrder } }).lean();
  const qMap = new Map(questions.map((q) => [String(q._id), q]));
  const answers = await TestAnswerModel.find({ attempt: attempt._id }).lean();
  const aMap = new Map(answers.map((a) => [String(a.question), a]));
  const test = await TestModel.findById(attempt.test).lean();

  const paper = attempt.questionOrder.map((id) => {
    const q = qMap.get(String(id));
    if (!q) return null;
    const { correctKeys: _c, numericalAnswer: _n, ...safe } = q;
    void _c;
    void _n;
    return {
      ...safe,
      id: String(q._id),
      options: test?.randomOptions ? shuffle(q.options ?? []) : q.options,
      saved: aMap.get(String(id)) ?? null,
    };
  });

  return {
    attempt,
    test: { id: test?._id, title: test?.title, durationMin: test?.durationMin, endsAt: test?.endsAt },
    questions: paper.filter(Boolean),
    serverNow: new Date(),
  };
}

export { shuffle };
