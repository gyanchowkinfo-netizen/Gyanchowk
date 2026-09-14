import { Router } from 'express';
import { z } from 'zod';
import {
  changePasswordSchema,
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  verifyEmailSchema,
} from '@gyan-chowk/shared';
import { authenticate, type AuthedRequest } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../middleware/error.js';
import {
  changePassword,
  login,
  logout,
  refreshSession,
  registerUser,
  requestPasswordReset,
  resetPassword,
  verifyEmail,
} from '../services/auth.service.js';
import { clearAuthCookies, setAuthCookies } from '../utils/cookies.js';
import { UserModel } from '../models/index.js';
import { notFound } from '../utils/errors.js';

export const authRouter = Router();

authRouter.post(
  '/register',
  validate(registerSchema),
  asyncHandler(async (req, res) => {
    const result = await registerUser(req.body, { ip: req.ip, userAgent: req.get('user-agent') });
    res.status(201).json(result);
  }),
);

authRouter.post(
  '/login',
  validate(loginSchema),
  asyncHandler(async (req, res) => {
    const result = await login(req.body, { ip: req.ip, userAgent: req.get('user-agent') });
    setAuthCookies(res, result.accessToken, result.refreshToken);
    res.json(result);
  }),
);

authRouter.post(
  '/refresh',
  asyncHandler(async (req, res) => {
    const token = (req.cookies?.gc_refresh as string) || req.body.refreshToken;
    const result = await refreshSession(token, { ip: req.ip, userAgent: req.get('user-agent') });
    setAuthCookies(res, result.accessToken, result.refreshToken);
    res.json(result);
  }),
);

authRouter.post(
  '/logout',
  asyncHandler(async (req: AuthedRequest, res) => {
    const all = Boolean(req.body?.allDevices);
    const token = req.cookies?.gc_refresh as string | undefined;
    await logout(token, all, req.user?.id);
    clearAuthCookies(res);
    res.json({ ok: true });
  }),
);

authRouter.post(
  '/forgot-password',
  validate(forgotPasswordSchema),
  asyncHandler(async (req, res) => {
    const result = await requestPasswordReset(req.body.email);
    res.json({ ok: true, ...(result.resetToken ? { resetToken: result.resetToken } : {}) });
  }),
);

authRouter.post(
  '/reset-password',
  validate(resetPasswordSchema),
  asyncHandler(async (req, res) => {
    await resetPassword(req.body.token, req.body.password);
    res.json({ ok: true });
  }),
);

authRouter.post(
  '/verify-email',
  validate(verifyEmailSchema),
  asyncHandler(async (req, res) => {
    await verifyEmail(req.body.token);
    res.json({ ok: true });
  }),
);

authRouter.get(
  '/me',
  authenticate,
  asyncHandler(async (req: AuthedRequest, res) => {
    const user = await UserModel.findById(req.user!.id).select('-passwordHash').lean();
    res.json({ user });
  }),
);

authRouter.post(
  '/change-password',
  authenticate,
  validate(changePasswordSchema),
  asyncHandler(async (req: AuthedRequest, res) => {
    await changePassword(req.user!.id, req.body.currentPassword, req.body.newPassword);
    res.json({ ok: true });
  }),
);

authRouter.patch(
  '/me',
  authenticate,
  validate(
    z.object({
      name: z.string().min(2).max(80).optional(),
      phone: z.string().max(20).optional(),
      bio: z.string().max(2000).optional(),
      headline: z.string().max(160).optional(),
      state: z.string().max(80).optional(),
      city: z.string().max(80).optional(),
      language: z.string().max(20).optional(),
      teacherDocuments: z
        .array(z.object({ publicId: z.string(), url: z.string().optional(), name: z.string().optional() }))
        .optional(),
    }),
  ),
  asyncHandler(async (req: AuthedRequest, res) => {
    const { teacherDocuments, ...rest } = req.body as {
      teacherDocuments?: Array<{ publicId: string; url?: string; name?: string }>;
    };
    const $set: Record<string, unknown> = { ...rest };
    const user = await UserModel.findById(req.user!.id);
    if (!user) throw notFound('User not found');
    Object.assign(user, $set);
    if (teacherDocuments?.length) {
      user.teacherDocuments.push(...teacherDocuments);
    }
    await user.save();
    const safe = await UserModel.findById(user._id).select('-passwordHash');
    res.json({ user: safe });
  }),
);
