import mongoose, { Schema } from 'mongoose';
import { ATTENDANCE_MARKS, DOUBT_STATUSES } from '@gyan-chowk/shared';

const doubtSchema = new Schema(
  {
    title: { type: String, required: true },
    body: { type: String, required: true },
    student: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    assignedTo: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    course: { type: Schema.Types.ObjectId, ref: 'Course', index: true },
    batch: { type: Schema.Types.ObjectId, ref: 'Batch', index: true },
    subject: { type: Schema.Types.ObjectId, ref: 'Subject' },
    chapter: { type: Schema.Types.ObjectId, ref: 'Chapter' },
    image: { publicId: String, url: String },
    status: { type: String, enum: DOUBT_STATUSES, default: 'pending', index: true },
    firstResponseAt: Date,
    closedAt: Date,
  },
  { timestamps: true },
);
doubtSchema.index({ assignedTo: 1, status: 1, createdAt: 1 });
doubtSchema.index({ title: 'text', body: 'text' });

const doubtMessageSchema = new Schema(
  {
    doubt: { type: Schema.Types.ObjectId, ref: 'Doubt', required: true, index: true },
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    role: { type: String, enum: ['student', 'teacher', 'admin'] },
    body: { type: String, required: true },
    image: { publicId: String, url: String },
  },
  { timestamps: true },
);

const mentorSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    specialties: [String],
    bio: String,
    capacity: { type: Number, default: 30 },
    active: { type: Boolean, default: true },
  },
  { timestamps: true },
);

const mentorshipSchema = new Schema(
  {
    mentor: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    student: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    status: { type: String, enum: ['active', 'paused', 'ended'], default: 'active' },
    goals: [{ title: String, done: Boolean }],
    notes: [{ body: String, createdAt: { type: Date, default: Date.now }, author: Schema.Types.ObjectId }],
    meetings: [
      {
        startsAt: Date,
        endsAt: Date,
        agenda: String,
        notes: String,
        status: { type: String, enum: ['scheduled', 'completed', 'cancelled'], default: 'scheduled' },
      },
    ],
    messages: [
      {
        author: { type: Schema.Types.ObjectId, ref: 'User' },
        body: String,
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true },
);
mentorshipSchema.index({ mentor: 1, student: 1 }, { unique: true });

const attendanceSessionSchema = new Schema(
  {
    batch: { type: Schema.Types.ObjectId, ref: 'Batch', required: true, index: true },
    teacher: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    scheduledAt: { type: Date, required: true, index: true },
    notes: String,
  },
  { timestamps: true },
);

const attendanceSchema = new Schema(
  {
    session: { type: Schema.Types.ObjectId, ref: 'AttendanceSession', required: true, index: true },
    student: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    batch: { type: Schema.Types.ObjectId, ref: 'Batch', required: true, index: true },
    mark: { type: String, enum: ATTENDANCE_MARKS, required: true },
    markedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true },
);
attendanceSchema.index({ session: 1, student: 1 }, { unique: true });
attendanceSchema.index({ student: 1, batch: 1 });

export const DoubtModel = mongoose.model('Doubt', doubtSchema);
export const DoubtMessageModel = mongoose.model('DoubtMessage', doubtMessageSchema);
export const MentorModel = mongoose.model('Mentor', mentorSchema);
export const MentorshipModel = mongoose.model('Mentorship', mentorshipSchema);
export const AttendanceSessionModel = mongoose.model('AttendanceSession', attendanceSessionSchema);
export const AttendanceModel = mongoose.model('Attendance', attendanceSchema);
