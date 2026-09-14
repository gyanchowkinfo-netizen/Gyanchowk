import { Router } from 'express';
import { authRouter } from './auth.routes.js';
import { batchRouter, catalogRouter, courseRouter } from './catalog.routes.js';
import { uploadRouter, videoRouter } from './video.routes.js';
import { paymentRouter } from './payment.routes.js';
import { learningRouter, publicCertRouter } from './learning.routes.js';
import { questionRouter, rankingRouter, testRouter } from './assessment.routes.js';
import { attendanceRouter, doubtRouter, mentorshipRouter } from './support.routes.js';
import {
  notificationRouter,
  payoutRouter,
  referralRouter,
  reviewRouter,
  walletRouter,
} from './finance.routes.js';
import { adminRouter, careerRouter, cmsRouter } from './admin.routes.js';

export const api = Router();

api.use('/auth', authRouter);
api.use('/courses', courseRouter);
api.use('/batches', batchRouter);
api.use('/catalog', catalogRouter);
api.use('/uploads', uploadRouter);
api.use('/videos', videoRouter);
api.use('/payments', paymentRouter);
api.use('/learning', learningRouter);
api.use('/certificates', publicCertRouter);
api.use('/tests', testRouter);
api.use('/questions', questionRouter);
api.use('/rankings', rankingRouter);
api.use('/doubts', doubtRouter);
api.use('/mentorship', mentorshipRouter);
api.use('/attendance', attendanceRouter);
api.use('/wallet', walletRouter);
api.use('/referrals', referralRouter);
api.use('/reviews', reviewRouter);
api.use('/payouts', payoutRouter);
api.use('/notifications', notificationRouter);
api.use('/admin', adminRouter);
api.use('/cms', cmsRouter);
api.use('/career', careerRouter);
