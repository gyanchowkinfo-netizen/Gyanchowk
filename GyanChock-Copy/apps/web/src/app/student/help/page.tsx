'use client';

import Link from 'next/link';

export default function StudentHelpPage() {
  return (
    <div className="space-y-4">
      <h1 className="font-display text-3xl text-gc-black">Help</h1>
      <p className="text-gc-mist">Gyan Chowk is recorded-learning only. There are no live classes or DPP.</p>
      <ul className="space-y-2 text-sm">
        <li><Link className="text-gc-glow" href="/faq">FAQs</Link></li>
        <li><Link className="text-gc-glow" href="/contact">Contact</Link></li>
        <li><Link className="text-gc-glow" href="/refund-policy">Refund policy</Link></li>
        <li><Link className="text-gc-glow" href="/student/doubts">Ask a doubt</Link></li>
      </ul>
    </div>
  );
}
