import nodemailer from 'nodemailer';
import { env } from '../config/env.js';
import {
  announcementTemplate,
  certificateIssuedTemplate,
  paymentSuccessTemplate,
  refundProcessedTemplate,
  resetPasswordTemplate,
  teacherDecisionTemplate,
  verifyEmailTemplate,
} from '../templates/email.js';

export type OutboundEmail = { to: string; subject: string; html: string };

const outbox: OutboundEmail[] = [];
let transporter: nodemailer.Transporter | null = null;

export function getEmailOutbox() {
  return outbox;
}

export function clearEmailOutbox() {
  outbox.length = 0;
}

function isSmtpConfigured() {
  return Boolean(env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS);
}

function getTransport() {
  if (!isSmtpConfigured()) return null;
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_PORT === 465,
      auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
    });
  }
  return transporter;
}

export async function sendEmail(input: OutboundEmail) {
  outbox.push(input);
  const transport = getTransport();
  if (!transport) {
    if (env.NODE_ENV !== 'test') {
      console.warn(`[email] SMTP not configured; skipped "${input.subject}" to ${input.to}`);
    }
    return { skipped: true as const };
  }
  await transport.sendMail({
    from: env.SMTP_FROM,
    to: input.to,
    subject: input.subject,
    html: input.html,
  });
  return { skipped: false as const };
}

function appUrl(path: string) {
  return `${env.NEXT_PUBLIC_APP_URL.replace(/\/$/, '')}${path}`;
}

export async function sendVerifyEmail(to: string, name: string, token: string) {
  const tpl = verifyEmailTemplate(name, appUrl(`/verify-email?token=${encodeURIComponent(token)}`));
  return sendEmail({ to, ...tpl });
}

export async function sendPasswordResetEmail(to: string, name: string, token: string) {
  const tpl = resetPasswordTemplate(name, appUrl(`/reset-password?token=${encodeURIComponent(token)}`));
  return sendEmail({ to, ...tpl });
}

export async function sendPaymentSuccessEmail(to: string, name: string, amountLabel: string, orderId: string) {
  const tpl = paymentSuccessTemplate(name, amountLabel, appUrl(`/student/payments`));
  void orderId;
  return sendEmail({ to, ...tpl });
}

export async function sendTeacherDecisionEmail(to: string, name: string, status: string) {
  const tpl = teacherDecisionTemplate(name, status);
  return sendEmail({ to, ...tpl });
}

export async function sendCertificateEmail(to: string, name: string, courseTitle: string, certificateId: string) {
  const tpl = certificateIssuedTemplate(name, courseTitle, appUrl(`/verify/certificate/${certificateId}`));
  return sendEmail({ to, ...tpl });
}

export async function sendRefundEmail(to: string, name: string, amountLabel: string) {
  const tpl = refundProcessedTemplate(name, amountLabel);
  return sendEmail({ to, ...tpl });
}

export async function sendAnnouncementEmail(to: string, title: string, body: string) {
  const tpl = announcementTemplate(title, body);
  return sendEmail({ to, ...tpl });
}
