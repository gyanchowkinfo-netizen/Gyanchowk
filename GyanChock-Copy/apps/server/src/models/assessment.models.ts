import mongoose, { Schema } from 'mongoose';
import {
  ASSIGNMENT_STATUSES,
  ATTEMPT_STATUSES,
  QUESTION_TYPES,
  RANK_SCOPES,
  SUBMISSION_STATUSES,
  TEST_STATUSES,
} from '@gyan-chowk/shared';

const questionSchema = new Schema(
  {
    bank: { type: Schema.Types.ObjectId, ref: 'QuestionBank', index: true },
    course: { type: Schema.Types.ObjectId, ref: 'Course', index: true },
    subject: { type: Schema.Types.ObjectId, ref: 'Subject', index: true },
    chapter: { type: Schema.Types.ObjectId, ref: 'Chapter', index: true },
    type: { type: String, enum: QUESTION_TYPES, required: true, index: true },
    stem: { type: String, required: true },
    options: [{ key: String, text: String }],
    correctKeys: [String],
    numericalAnswer: Number,
    numericalTolerance: Number,
    assertion: String,
    reason: String,
    matchPairs: [{ left: String, right: String }],
    marks: { type: Number, default: 1 },
    negativeMarks: { type: Number, default: 0 },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium', index: true },
    explanation: String,
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true },
);
questionSchema.index({ stem: 'text' });

const questionBankSchema = new Schema(
  {
    name: { type: String, required: true },
    course: { type: Schema.Types.ObjectId, ref: 'Course', index: true },
    subject: { type: Schema.Types.ObjectId, ref: 'Subject' },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true },
);

const testSchema = new Schema(
  {
    title: { type: String, required: true },
    course: { type: Schema.Types.ObjectId, ref: 'Course', index: true },
    batch: { type: Schema.Types.ObjectId, ref: 'Batch', index: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, enum: TEST_STATUSES, default: 'draft', index: true },
    durationMin: { type: Number, required: true },
    totalMarks: { type: Number, default: 0 },
    negativeMarking: { type: Boolean, default: true },
    randomQuestions: { type: Boolean, default: false },
    randomOptions: { type: Boolean, default: false },
    attemptLimit: { type: Number, default: 1 },
    startsAt: Date,
    endsAt: Date,
    autoSubmit: { type: Boolean, default: true },
    sections: [
      {
        name: String,
        durationMin: Number,
        questionIds: [{ type: Schema.Types.ObjectId, ref: 'Question' }],
      },
    ],
  },
  { timestamps: true },
);
testSchema.index({ batch: 1, startsAt: 1 });

const testAttemptSchema = new Schema(
  {
    test: { type: Schema.Types.ObjectId, ref: 'Test', required: true, index: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    status: { type: String, enum: ATTEMPT_STATUSES, default: 'in_progress', index: true },
    startedAt: { type: Date, default: Date.now },
    submittedAt: Date,
    expiresAt: Date,
    questionOrder: [{ type: Schema.Types.ObjectId, ref: 'Question' }],
    currentSection: { type: Number, default: 0 },
    timeTakenSec: { type: Number, default: 0 },
  },
  { timestamps: true },
);
testAttemptSchema.index({ test: 1, user: 1, status: 1 });

const testAnswerSchema = new Schema(
  {
    attempt: { type: Schema.Types.ObjectId, ref: 'TestAttempt', required: true, index: true },
    question: { type: Schema.Types.ObjectId, ref: 'Question', required: true },
    answer: Schema.Types.Mixed,
    markedForReview: { type: Boolean, default: false },
    savedAt: Date,
  },
  { timestamps: true },
);
testAnswerSchema.index({ attempt: 1, question: 1 }, { unique: true });

const testResultSchema = new Schema(
  {
    attempt: { type: Schema.Types.ObjectId, ref: 'TestAttempt', required: true, unique: true },
    test: { type: Schema.Types.ObjectId, ref: 'Test', required: true, index: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    batch: { type: Schema.Types.ObjectId, ref: 'Batch', index: true },
    course: { type: Schema.Types.ObjectId, ref: 'Course', index: true },
    state: String,
    score: Number,
    maxScore: Number,
    percentage: Number,
    accuracy: Number,
    attempted: Number,
    correct: Number,
    incorrect: Number,
    skipped: Number,
    timeTakenSec: Number,
    subjectBreakdown: Schema.Types.Mixed,
    chapterBreakdown: Schema.Types.Mixed,
    difficultyBreakdown: Schema.Types.Mixed,
    rankAllIndia: Number,
    rankState: Number,
    rankBatch: Number,
    percentile: Number,
  },
  { timestamps: true },
);
testResultSchema.index({ test: 1, score: -1, timeTakenSec: 1 });
testResultSchema.index({ user: 1, createdAt: -1 });

const rankingSchema = new Schema(
  {
    scope: { type: String, enum: RANK_SCOPES, required: true, index: true },
    scopeId: { type: String, required: true, index: true },
    test: { type: Schema.Types.ObjectId, ref: 'Test', index: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    rank: { type: Number, required: true },
    percentile: Number,
    score: Number,
    computedAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);
rankingSchema.index({ scope: 1, scopeId: 1, rank: 1 });
rankingSchema.index({ scope: 1, scopeId: 1, user: 1 }, { unique: true });

const assignmentSchema = new Schema(
  {
    title: { type: String, required: true },
    instructions: String,
    course: { type: Schema.Types.ObjectId, ref: 'Course', index: true },
    batch: { type: Schema.Types.ObjectId, ref: 'Batch', index: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
    questions: [
      {
        prompt: String,
        marks: Number,
      },
    ],
    attachment: {
      publicId: String,
      url: String,
    },
    totalMarks: Number,
    deadline: { type: Date, index: true },
    allowResubmit: { type: Boolean, default: false },
    status: { type: String, enum: ASSIGNMENT_STATUSES, default: 'draft', index: true },
  },
  { timestamps: true },
);

const assignmentSubmissionSchema = new Schema(
  {
    assignment: { type: Schema.Types.ObjectId, ref: 'Assignment', required: true, index: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    answers: String,
    files: [{ publicId: String, url: String }],
    status: { type: String, enum: SUBMISSION_STATUSES, default: 'submitted' },
    submittedAt: { type: Date, default: Date.now },
    marksAwarded: Number,
    feedback: String,
    evaluatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    evaluatedAt: Date,
  },
  { timestamps: true },
);
assignmentSubmissionSchema.index({ assignment: 1, user: 1 }, { unique: true });

export const QuestionModel = mongoose.model('Question', questionSchema);
export const QuestionBankModel = mongoose.model('QuestionBank', questionBankSchema);
export const TestModel = mongoose.model('Test', testSchema);
export const TestAttemptModel = mongoose.model('TestAttempt', testAttemptSchema);
export const TestAnswerModel = mongoose.model('TestAnswer', testAnswerSchema);
export const TestResultModel = mongoose.model('TestResult', testResultSchema);
export const RankingModel = mongoose.model('Ranking', rankingSchema);
export const AssignmentModel = mongoose.model('Assignment', assignmentSchema);
export const AssignmentSubmissionModel = mongoose.model(
  'AssignmentSubmission',
  assignmentSubmissionSchema,
);
