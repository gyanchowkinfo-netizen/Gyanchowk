'use client';

import dynamic from 'next/dynamic';

const LearningStackCardManager = dynamic(
  () =>
    import('@/components/admin/LearningStackCardManager').then(
      (mod) => mod.LearningStackCardManager
    ),
  {
    ssr: false,
    loading: () => (
      <div className="space-y-6 animate-pulse" suppressHydrationWarning>
        <div className="h-20 rounded-2xl bg-slate-100" />
        <div className="h-16 rounded-xl bg-slate-100" />
        <div className="h-96 rounded-2xl bg-slate-100" />
      </div>
    ),
  }
);

export default function AdminLearningStackPage() {
  return (
    <div className="space-y-6" suppressHydrationWarning>
      <LearningStackCardManager />
    </div>
  );
}
