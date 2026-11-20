import type { NextFunction, Request, Response } from 'express';
import type { AuthUser, Permission, Role } from '@gyan-chowk/shared';
import { UserModel } from '../models/index.js';
import { forbidden, unauthorized } from '../utils/errors.js';
import { verifyAccessToken } from '../utils/crypto.js';

export interface AuthedRequest extends Request {
  user?: AuthUser;
}

function extractToken(req: Request): string | null {
  const header = req.headers.authorization;
  if (header?.startsWith('Bearer ')) return header.slice(7);
  const cookie = req.cookies?.gc_access as string | undefined;
  if (cookie) return cookie;
  const queryToken = req.query?.token as string | undefined;
  if (queryToken) return queryToken;
  return null;
}

export async function authenticate(req: AuthedRequest, _res: Response, next: NextFunction) {
  try {
    const token = extractToken(req);
    if (!token) throw unauthorized();
    const payload = verifyAccessToken(token);
    const id = payload.sub || payload.id;
    const user = await UserModel.findById(id).lean();
    if (!user || user.status === 'suspended' || user.status === 'deactivated') {
      throw unauthorized('Account is not active');
    }

    let currentTeacherStatus = user.teacherStatus ?? undefined;
    if (user.role === 'teacher' && currentTeacherStatus !== 'approved' && (currentTeacherStatus as string) !== 'published') {
      const { TeacherModel } = await import('../models/teacher.models.js');
      const teacherProfile = await TeacherModel.findOne({
        $or: [{ user: user._id }, { email: user.email.toLowerCase() }],
        status: { $in: ['published', 'approved'] },
      }).lean();
      if (teacherProfile) {
        await UserModel.findByIdAndUpdate(user._id, { teacherStatus: 'approved', status: 'active' });
        currentTeacherStatus = 'approved';
      }
    }

    req.user = {
      id: String(user._id),
      role: user.role,
      email: user.email,
      name: user.name,
      status: currentTeacherStatus === 'approved' ? 'active' : user.status,
      teacherStatus: currentTeacherStatus,
      permissions: user.permissions,
      mustChangePassword: user.mustChangePassword,
    };
    next();
  } catch (err) {
    next(err && typeof err === 'object' && 'status' in err ? err : unauthorized('Invalid or expired session'));
  }
}

export function optionalAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  const token = extractToken(req);
  if (!token) return next();
  return authenticate(req, res, next);
}

export function requireRoles(...roles: Role[]) {
  return (req: AuthedRequest, _res: Response, next: NextFunction) => {
    if (!req.user) throw unauthorized();
    if (!roles.includes(req.user.role)) throw forbidden();
    if (req.user.role === 'teacher') {
      const isApproved = req.user.teacherStatus === 'approved' || (req.user.teacherStatus as string) === 'published';
      if (!isApproved) {
        throw forbidden('Teacher account is pending admin approval');
      }
    }
    next();
  };
}

export function requirePermissions(...perms: Permission[]) {
  return (req: AuthedRequest, _res: Response, next: NextFunction) => {
    if (!req.user) throw unauthorized();
    if (req.user.role === 'admin' && (!req.user.permissions || req.user.permissions.length === 0)) {
      return next();
    }
    if (req.user.role === 'admin') {
      const ok = perms.every((p) => req.user!.permissions?.includes(p));
      if (!ok) throw forbidden();
      return next();
    }
    throw forbidden();
  };
}

export function teacherOrAdmin(req: AuthedRequest, _res: Response, next: NextFunction) {
  if (!req.user) throw unauthorized();
  if (req.user.role === 'admin') return next();
  if (req.user.role === 'teacher') {
    const isApproved = req.user.teacherStatus === 'approved' || (req.user.teacherStatus as string) === 'published';
    if (isApproved) return next();
  }
  throw forbidden();
}
