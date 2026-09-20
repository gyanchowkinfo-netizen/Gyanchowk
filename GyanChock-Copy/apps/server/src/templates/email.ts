import { env } from '../config/env.js';

function layout(title: string, body: string) {
  const app = env.NEXT_PUBLIC_APP_URL || 'https://gyanchowk.vercel.app';
  return `<!doctype html>
<html>
  <body style="margin:0;background:#0b1b33;color:#f4f1ea;font-family:Georgia,serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#0b1b33;padding:32px 16px;">
      <tr>
        <td align="center">
          <table width="560" cellpadding="0" cellspacing="0" style="background:#12243f;border:1px solid #c9a227;border-radius:16px;padding:28px;">
            <tr><td style="font-size:13px;letter-spacing:.28em;color:#c9a227;text-transform:uppercase;">Gyan Chowk</td></tr>
            <tr><td style="padding-top:12px;font-size:24px;color:#f4f1ea;">${title}</td></tr>
            <tr><td style="padding-top:16px;font-size:15px;line-height:1.6;color:#d7d0c3;">${body}</td></tr>
            <tr><td style="padding-top:28px;font-size:12px;color:#8a8378;">
              <a href="${app}" style="color:#c9a227;">Open Gyan Chowk</a>
            </td></tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export function verifyEmailTemplate(name: string, url: string) {
  return {
    subject: 'Verify your Gyan Chowk email',
    html: layout(
      'Verify your email',
      `Hi ${name},<br/><br/>Confirm your address to start learning.<br/><br/><a href="${url}" style="color:#c9a227;">Verify email</a><br/><br/>This link expires in 24 hours.`,
    ),
  };
}

export function resetPasswordTemplate(name: string, url: string) {
  return {
    subject: 'Reset your Gyan Chowk password',
    html: layout(
      'Password reset',
      `Hi ${name},<br/><br/>Use this link to choose a new password.<br/><br/><a href="${url}" style="color:#c9a227;">Reset password</a><br/><br/>This link expires in 30 minutes. If you did not request it, ignore this email.`,
    ),
  };
}

export function paymentSuccessTemplate(name: string, amountLabel: string, invoiceUrl: string) {
  return {
    subject: 'Payment successful — Gyan Chowk',
    html: layout(
      'You are enrolled',
      `Hi ${name},<br/><br/>We received ${amountLabel}. Your course access is unlocked.<br/><br/><a href="${invoiceUrl}" style="color:#c9a227;">Download invoice</a>`,
    ),
  };
}

export function teacherDecisionTemplate(name: string, status: string) {
  const approved = status === 'approved';
  return {
    subject: approved ? 'Your teacher application was approved' : `Teacher application ${status}`,
    html: layout(
      approved ? 'Welcome to the faculty' : 'Application update',
      `Hi ${name},<br/><br/>Your Gyan Chowk teacher application is now <strong>${status}</strong>.${
        approved ? '<br/><br/>You can sign in and start publishing courses.' : ''
      }`,
    ),
  };
}

export function certificateIssuedTemplate(name: string, courseTitle: string, url: string) {
  return {
    subject: `Certificate issued — ${courseTitle}`,
    html: layout(
      'Certificate ready',
      `Hi ${name},<br/><br/>Your certificate for <strong>${courseTitle}</strong> is ready.<br/><br/><a href="${url}" style="color:#c9a227;">View certificate</a>`,
    ),
  };
}

export function refundProcessedTemplate(name: string, amountLabel: string) {
  return {
    subject: 'Refund processed — Gyan Chowk',
    html: layout(
      'Refund credited',
      `Hi ${name},<br/><br/>${amountLabel} has been credited to your Gyan Chowk wallet.`,
    ),
  };
}

export function announcementTemplate(title: string, body: string) {
  return {
    subject: title,
    html: layout(title, body.replace(/\n/g, '<br/>')),
  };
}
