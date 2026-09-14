import mongoose, { Schema } from 'mongoose';
import { PERMISSIONS, ROLES, TEACHER_STATUSES, USER_STATUSES } from '@gyan-chowk/shared';

const permissionSchema = new Schema(
  {
    key: { type: String, enum: PERMISSIONS, required: true, unique: true },
    description: { type: String, default: '' },
  },
  { timestamps: true },
);

const roleSchema = new Schema(
  {
    name: { type: String, required: true, unique: true },
    permissions: [{ type: String, enum: PERMISSIONS }],
    isSystem: { type: Boolean, default: false },
  },
  { timestamps: true },
);

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: { type: String, required: true, unique: true, lowercase: true, index: true },
    phone: { type: String, trim: true },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ROLES, required: true, index: true },
    status: { type: String, enum: USER_STATUSES, default: 'pending_verification', index: true },
    teacherStatus: { type: String, enum: TEACHER_STATUSES },
    permissions: [{ type: String, enum: PERMISSIONS }],
    avatar: {
      publicId: String,
      url: String,
    },
    bio: { type: String, maxlength: 2000 },
    headline: { type: String, maxlength: 160 },
    teacherDocuments: [{ publicId: String, url: String, name: String }],
    state: { type: String, index: true },
    city: String,
    language: { type: String, default: 'en' },
    emailVerifiedAt: Date,
    emailVerifyTokenHash: { type: String, select: false },
    emailVerifyExpires: Date,
    passwordResetTokenHash: { type: String, select: false },
    passwordResetExpires: Date,
    mustChangePassword: { type: Boolean, default: false },
    referralCode: { type: String, unique: true, sparse: true, index: true },
    referredBy: { type: Schema.Types.ObjectId, ref: 'User' },
    lastLoginAt: Date,
    failedLoginAttempts: { type: Number, default: 0 },
    lockUntil: Date,
    twoFactorEnabled: { type: Boolean, default: false },
    twoFactorSecret: { type: String, select: false },
    wishlist: [{ type: Schema.Types.ObjectId, ref: 'Course' }],
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: true },
);

userSchema.index({ role: 1, status: 1 });
userSchema.index({ teacherStatus: 1 });
userSchema.index({ name: 'text', email: 'text', headline: 'text' });

const sessionSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    refreshTokenHash: { type: String, required: true, index: true },
    userAgent: String,
    ip: String,
    expiresAt: { type: Date, required: true, index: true },
    revokedAt: Date,
  },
  { timestamps: true },
);

sessionSchema.index({ user: 1, revokedAt: 1 });

export const PermissionModel = mongoose.model('Permission', permissionSchema);
export const RoleModel = mongoose.model('Role', roleSchema);
export const UserModel = mongoose.model('User', userSchema);
export const SessionModel = mongoose.model('Session', sessionSchema);
