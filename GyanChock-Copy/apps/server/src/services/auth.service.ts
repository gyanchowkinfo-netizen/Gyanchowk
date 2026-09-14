import mongoose from 'mongoose';
import { nanoid } from 'nanoid';
import {
  loginSchema,
  registerSchema,
  type AuthUser,
} from '@gyan-chowk/shared';
import { env } from '../config/env.js';
import {
  ReferralModel,
  SessionModel,
  UserModel,
  WalletModel,
} from '../models/index.js';
import { badRequest, conflict, forbidden, tooMany, unauthorized } from '../utils/errors.js';
import {
  hashPassword,
  randomToken,
  sha256,
  signAccessToken,
  signRefreshToken,
  verifyPassword,
  verifyRefreshToken,
} from '../utils/crypto.js';
import { notify } from './notification.service.js';

const LOCK_AFTER = 8;
const LOCK_MS = 15 * 60 * 1000;

function toAuthUser(user: {
  _id: mongoose.Types.ObjectId;
  role: AuthUser['role'];
  email: string;
  name: string;
  status: string;
    teacherStatus?: string | null;
    permissions?: string[];
    mustChangePassword?: boolean;
  }): AuthUser {
    return {
      id: String(user._id),
      role: user.role,
      email: user.email,
      name: user.name,
      status: user.status,
      teacherStatus: user.teacherStatus ?? undefined,
    permissions: user.permissions,
    mustChangePassword: user.mustChangePassword,
  };
}

export async function registerUser(
  input: unknown,
  meta: { ip?: string; userAgent?: string },
) {
  const data = registerSchema.parse(input);
  const existing = await UserModel.findOne({ email: data.email });
  if (existing) throw conflict('An account with this email already exists');

  if (data.referralCode && data.referralCode.length > 0) {
    const referrer = await UserModel.findOne({ referralCode: data.referralCode.toUpperCase() });
    if (!referrer) throw badRequest('Invalid referral code');
    if (referrer.email === data.email) throw badRequest('Self-referral is not allowed');
  }

  const passwordHash = await hashPassword(data.password);
  const emailToken = randomToken();
  const referralCode = nanoid(8).toUpperCase();

  const user = await UserModel.create({
    name: data.name,
    email: data.email,
    phone: data.phone,
    passwordHash,
    role: data.role,
    status: 'pending_verification',
    teacherStatus: data.role === 'teacher' ? 'pending' : undefined,
    state: data.state,
    headline: data.headline,
    bio: data.bio,
    emailVerifyTokenHash: sha256(emailToken),
    emailVerifyExpires: new Date(Date.now() + 1000 * 60 * 60 * 24),
    referralCode,
    referredBy: undefined,
  });

  await WalletModel.create({ user: user._id });

  if (data.referralCode) {
    const referrer = await UserModel.findOne({ referralCode: data.referralCode.toUpperCase() });
    if (referrer && String(referrer._id) !== String(user._id)) {
      user.referredBy = referrer._id;
      await user.save();
      await ReferralModel.create({
        referrer: referrer._id,
        referee: user._id,
        status: 'registered',
      });
    }
  }

  await notify({
    userId: String(user._id),
    title: 'Welcome to Gyan Chowk',
    body: 'Verify your email to start learning.',
    type: 'welcome',
  });

  return {
    user: toAuthUser(user),
    verifyToken: env.NODE_ENV === 'production' ? undefined : emailToken,
    message:
      data.role === 'teacher'
        ? 'Teacher account created. Verify email and wait for admin approval.'
        : 'Account created. Please verify your email.',
    meta,
  };
}

export async function verifyEmail(token: string) {
  const user = await UserModel.findOne({
    emailVerifyTokenHash: sha256(token),
    emailVerifyExpires: { $gt: new Date() },
  }).select('+emailVerifyTokenHash');
  if (!user) throw badRequest('Invalid or expired verification token');
  user.status = user.role === 'teacher' ? 'active' : 'active';
  user.emailVerifiedAt = new Date();
  user.emailVerifyTokenHash = undefined;
  user.emailVerifyExpires = undefined;
  await user.save();
  return { ok: true };
}

export async function login(
  input: unknown,
  meta: { ip?: string; userAgent?: string },
) {
  const data = loginSchema.parse(input);
  const user = await UserModel.findOne({ email: data.email }).select(
    '+passwordHash +failedLoginAttempts +lockUntil',
  );
  if (!user) throw unauthorized('Invalid email or password');

  if (user.lockUntil && user.lockUntil > new Date()) {
    throw tooMany('Account temporarily locked. Try again later.');
  }

  const ok = await verifyPassword(user.passwordHash, data.password);
  if (!ok) {
    user.failedLoginAttempts = (user.failedLoginAttempts ?? 0) + 1;
    if (user.failedLoginAttempts >= LOCK_AFTER) {
      user.lockUntil = new Date(Date.now() + LOCK_MS);
      user.failedLoginAttempts = 0;
    }
    await user.save();
    throw unauthorized('Invalid email or password');
  }

  if (user.status === 'suspended' || user.status === 'deactivated') {
    throw forbidden('This account has been disabled');
  }
  if (user.role === 'teacher' && user.teacherStatus === 'rejected') {
    throw forbidden('Teacher application was rejected');
  }

  user.failedLoginAttempts = 0;
  user.lockUntil = undefined;
  user.lastLoginAt = new Date();
  await user.save();

  const auth = toAuthUser(user);
  const session = await SessionModel.create({
    user: user._id,
    refreshTokenHash: 'pending',
    userAgent: meta.userAgent,
    ip: meta.ip,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });
  const refresh = signRefreshToken(String(session._id), String(user._id));
  session.refreshTokenHash = sha256(refresh);
  await session.save();

  return {
    user: auth,
    accessToken: signAccessToken(auth),
    refreshToken: refresh,
  };
}

export async function refreshSession(refreshToken: string, meta: { ip?: string; userAgent?: string }) {
  let payload: { sub: string; sid: string };
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    throw unauthorized('Invalid refresh token');
  }
  const session = await SessionModel.findOne({
    _id: payload.sid,
    user: payload.sub,
    revokedAt: { $exists: false },
    expiresAt: { $gt: new Date() },
  });
  if (!session || session.refreshTokenHash !== sha256(refreshToken)) {
    if (session) {
      session.revokedAt = new Date();
      await session.save();
    }
    throw unauthorized('Refresh token reuse detected');
  }

  const user = await UserModel.findById(payload.sub);
  if (!user || user.status === 'suspended' || user.status === 'deactivated') {
    throw unauthorized();
  }

  session.revokedAt = new Date();
  await session.save();

  const auth = toAuthUser(user);
  const next = await SessionModel.create({
    user: user._id,
    refreshTokenHash: 'pending',
    userAgent: meta.userAgent,
    ip: meta.ip,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });
  const newRefresh = signRefreshToken(String(next._id), String(user._id));
  next.refreshTokenHash = sha256(newRefresh);
  await next.save();

  return {
    user: auth,
    accessToken: signAccessToken(auth),
    refreshToken: newRefresh,
  };
}

export async function logout(refreshToken: string | undefined, allDevices: boolean, userId?: string) {
  if (allDevices && userId) {
    await SessionModel.updateMany({ user: userId, revokedAt: { $exists: false } }, { revokedAt: new Date() });
    return;
  }
  if (!refreshToken) return;
  try {
    const payload = verifyRefreshToken(refreshToken);
    await SessionModel.updateOne({ _id: payload.sid }, { revokedAt: new Date() });
  } catch {
    /* ignore */
  }
}

export async function requestPasswordReset(email: string) {
  const user = await UserModel.findOne({ email: email.toLowerCase() });
  const token = randomToken();
  if (user) {
    user.passwordResetTokenHash = sha256(token);
    user.passwordResetExpires = new Date(Date.now() + 1000 * 60 * 30);
    await user.save();
  }
  return { ok: true, resetToken: env.NODE_ENV === 'production' ? undefined : user ? token : undefined };
}

export async function resetPassword(token: string, password: string) {
  const user = await UserModel.findOne({
    passwordResetTokenHash: sha256(token),
    passwordResetExpires: { $gt: new Date() },
  }).select('+passwordResetTokenHash');
  if (!user) throw badRequest('Invalid or expired reset token');
  user.passwordHash = await hashPassword(password);
  user.passwordResetTokenHash = undefined;
  user.passwordResetExpires = undefined;
  user.mustChangePassword = false;
  await user.save();
  await SessionModel.updateMany({ user: user._id }, { revokedAt: new Date() });
  return { ok: true };
}

export async function changePassword(userId: string, current: string, next: string) {
  const user = await UserModel.findById(userId).select('+passwordHash');
  if (!user) throw unauthorized();
  const ok = await verifyPassword(user.passwordHash, current);
  if (!ok) throw badRequest('Current password is incorrect');
  user.passwordHash = await hashPassword(next);
  user.mustChangePassword = false;
  await user.save();
}
