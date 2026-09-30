'use client';

import dynamic from 'next/dynamic';

const TeachersPageContentEditor = dynamic(
  () =>
    import('@/components/admin/TeachersPageContentEditor').then(
      (mod) => mod.TeachersPageContentEditor
    ),
  {
    ssr: false,
    loading: () => (
      <div className="space-y-6 animate-pulse" suppressHydrationWarning>
        <div className="h-16 rounded-2xl bg-slate-100" />
        <div className="h-12 rounded-xl bg-slate-100" />
        <div className="h-96 rounded-2xl bg-slate-100" />
      </div>
    ),
  }
);

export default function AdminTeachersPageCMS() {
  return (
    <div className="space-y-6" suppressHydrationWarning>
      <TeachersPageContentEditor />
    </div>
  );
}
