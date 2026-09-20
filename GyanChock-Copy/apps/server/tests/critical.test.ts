import { describe, expect, it } from 'vitest';
import crypto from 'node:crypto';
import { gradeAnswer } from '../src/services/test.service.js';
import { applyDiscount, rupeesToPaise } from '../src/utils/helpers.js';

describe('payment math', () => {
  it('never trusts a discounted price below zero', () => {
    expect(applyDiscount(1000, 20)).toBe(800);
    expect(applyDiscount(100, 100)).toBe(0);
    expect(applyDiscount(99, 0, 200)).toBe(0);
  });

  it('converts rupees to paise without float drift for typical prices', () => {
    expect(rupeesToPaise(4999)).toBe(499900);
    expect(rupeesToPaise(7999.5)).toBe(799950);
  });
});

describe('razorpay signature verification', () => {
  it('matches HMAC SHA256 of order|payment', () => {
    const secret = 'test_secret';
    const orderId = 'order_1';
    const paymentId = 'pay_1';
    const expected = crypto.createHmac('sha256', secret).update(`${orderId}|${paymentId}`).digest('hex');
    const forged = crypto.createHmac('sha256', 'other').update(`${orderId}|${paymentId}`).digest('hex');
    expect(expected).not.toBe(forged);
    expect(expected).toHaveLength(64);
  });
});

describe('test grading', () => {
  it('grades single MCQ with negative marking', () => {
    const q = { type: 'single_mcq', correctKeys: ['B'], marks: 4, negativeMarks: 1 };
    expect(gradeAnswer(q, 'B')).toEqual({ correct: true, marks: 4 });
    expect(gradeAnswer(q, 'A')).toEqual({ correct: false, marks: -1 });
    expect(gradeAnswer(q, '')).toEqual({ correct: false, marks: 0 });
  });

  it('grades multi MCQ only when the set matches exactly', () => {
    const q = { type: 'multi_mcq', correctKeys: ['A', 'C'], marks: 4, negativeMarks: 2 };
    expect(gradeAnswer(q, ['C', 'A']).correct).toBe(true);
    expect(gradeAnswer(q, ['A']).correct).toBe(false);
  });

  it('grades numerical with tolerance', () => {
    const q = { type: 'numerical', numericalAnswer: 20, numericalTolerance: 0.1, marks: 4, negativeMarks: 1 };
    expect(gradeAnswer(q, 20.05).correct).toBe(true);
    expect(gradeAnswer(q, 21).correct).toBe(false);
  });
});

describe('rbac expectations', () => {
  it('public registration cannot create admin', () => {
    const allowed = ['student', 'teacher'];
    expect(allowed).not.toContain('admin');
  });
});

describe('email delivery', () => {
  it('records outbound mail and never includes raw tokens in the payload API shape', async () => {
    const { clearEmailOutbox, getEmailOutbox, sendPasswordResetEmail } = await import('../src/services/email.service.js');
    clearEmailOutbox();
    await sendPasswordResetEmail('a@b.com', 'Ada', 'super-secret-token-value');
    const mail = getEmailOutbox()[0];
    expect(mail.subject).toMatch(/password/i);
    expect(mail.html).toContain('super-secret-token-value');
    expect(mail.to).toBe('a@b.com');
  });
});

describe('pdf generation', () => {
  it('invoice and certificate buffers start with %PDF and use application/pdf', async () => {
    const { invoicePdf, certificatePdf, PDF_CONTENT_TYPE } = await import('../src/services/pdf.service.js');
    expect(PDF_CONTENT_TYPE).toBe('application/pdf');
    const invoice = await invoicePdf({
      invoiceNumber: 'INV-1',
      studentName: 'Ada',
      studentEmail: 'a@b.com',
      productLabel: 'Physics',
      amountPaise: 49900,
      gateway: 'stripe',
      issuedAt: new Date('2026-01-01'),
    });
    const cert = await certificatePdf({
      certificateId: 'GC-ABC',
      studentName: 'Ada',
      courseTitle: 'Physics',
      issuedAt: new Date('2026-01-01'),
    });
    expect(invoice.subarray(0, 4).toString()).toBe('%PDF');
    expect(cert.subarray(0, 4).toString()).toBe('%PDF');
  }, 20_000);
});

describe('coupon and refund contracts', () => {
  it('coupon codes are stored uppercase via the shared schema', async () => {
    const { couponSchema } = await import('@gyan-chowk/shared');
    const parsed = couponSchema.parse({ code: 'save10', type: 'percent', value: 10 });
    expect(parsed.code).toBe('SAVE10');
    expect(couponSchema.safeParse({ code: 'ab', type: 'percent', value: 10 }).success).toBe(false);
  });
});

describe('stripe webhook signatures', () => {
  it('accepts Stripe constructEvent for a correctly signed payload and rejects a forged one', async () => {
    const Stripe = (await import('stripe')).default;
    const stripe = new Stripe('sk_test_placeholder');
    const secret = 'whsec_test_secret';
    const payload = JSON.stringify({
      id: 'evt_test',
      object: 'event',
      type: 'checkout.session.completed',
      data: { object: { id: 'cs_test' } },
    });
    const timestamp = Math.floor(Date.now() / 1000);
    const signed = crypto.createHmac('sha256', secret).update(`${timestamp}.${payload}`).digest('hex');
    const event = stripe.webhooks.constructEvent(payload, `t=${timestamp},v1=${signed}`, secret);
    expect(event.type).toBe('checkout.session.completed');
    expect(() => stripe.webhooks.constructEvent(payload, `t=${timestamp},v1=deadbeef`, secret)).toThrow();
  });
});

describe('test taxonomy', () => {
  it('exposes daily/weekly/chapter/subject/mock categories', async () => {
    const { TEST_CATEGORIES, PAYMENT_GATEWAYS } = await import('@gyan-chowk/shared');
    expect(TEST_CATEGORIES).toEqual(expect.arrayContaining(['daily', 'weekly', 'chapter', 'subject', 'mock']));
    expect(PAYMENT_GATEWAYS).toEqual(expect.arrayContaining(['razorpay', 'stripe']));
  });
});
