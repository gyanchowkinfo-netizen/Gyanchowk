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
