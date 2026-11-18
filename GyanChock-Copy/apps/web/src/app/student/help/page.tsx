'use client';

import Link from 'next/link';
import { ArrowRight, HelpCircle, Video, MessageCircleQuestion, FileText, ShieldAlert } from 'lucide-react';

export default function StudentHelpPage() {
  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="font-display text-3xl font-medium text-gc-black">Student Help & Support</h1>
        <p className="mt-1 text-sm text-gc-mist">
          Gyan Chowk is 100% recorded-learning. There are no live classes or daily practice papers (DPP).
        </p>
      </div>

      {/* Featured link to main Help Centre */}
      <div className="gc-card flex flex-col justify-between gap-4 p-5 sm:flex-row sm:items-center">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
            <HelpCircle className="h-3.5 w-3.5" />
            Knowledge Base
          </span>
          <h2 className="mt-2 font-display text-lg font-medium text-gc-black">
            Gyan Chowk Comprehensive Help Centre
          </h2>
          <p className="text-xs text-gc-mist sm:text-sm">
            Detailed guides on watching videos, HLS resume, Razorpay payments, test autosave, and certificates.
          </p>
        </div>
        <Link
          href="/help"
          className="gc-btn-primary shrink-0 text-xs sm:text-sm"
        >
          <span>Open Help Centre</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Link
          href="/student/doubts"
          className="gc-card group flex items-start gap-3.5 p-4 transition hover:-translate-y-0.5 hover:border-gc-black/30"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 text-amber-800">
            <MessageCircleQuestion className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-display text-base font-medium text-gc-black group-hover:text-amber-900">
              Ask a Doubt
            </h3>
            <p className="text-xs text-gc-mist">Submit timestamps and questions for teacher review.</p>
          </div>
        </Link>

        <Link
          href="/faq"
          className="gc-card group flex items-start gap-3.5 p-4 transition hover:-translate-y-0.5 hover:border-gc-black/30"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/15 text-blue-800">
            <HelpCircle className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-display text-base font-medium text-gc-black group-hover:text-blue-900">
              Frequently Asked Questions
            </h3>
            <p className="text-xs text-gc-mist">Quick answers regarding account, tests, and devices.</p>
          </div>
        </Link>

        <Link
          href="/contact"
          className="gc-card group flex items-start gap-3.5 p-4 transition hover:-translate-y-0.5 hover:border-gc-black/30"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-500/15 text-teal-800">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-display text-base font-medium text-gc-black group-hover:text-teal-900">
              Contact Platform Admins
            </h3>
            <p className="text-xs text-gc-mist">Send direct inquiries for enrollment or billing help.</p>
          </div>
        </Link>

        <Link
          href="/refund-policy"
          className="gc-card group flex items-start gap-3.5 p-4 transition hover:-translate-y-0.5 hover:border-gc-black/30"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-stone-200/60 text-stone-700">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-display text-base font-medium text-gc-black group-hover:text-stone-900">
              Refund Policy
            </h3>
            <p className="text-xs text-gc-mist">Read terms and conditions for course refunds.</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
