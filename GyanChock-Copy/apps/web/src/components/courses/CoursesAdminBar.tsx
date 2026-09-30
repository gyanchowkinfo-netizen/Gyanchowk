'use client';

import { useState } from 'react';
import { Settings, Edit3, X, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { Drawer } from '@/components/ui/Overlay';
import { CoursesPageContentEditor } from '@/components/admin/CoursesPageContentEditor';

export function CoursesAdminBar() {
  const user = useAuth((s) => s.user);
  const [open, setOpen] = useState(false);

  if (user?.role !== 'admin') {
    return null;
  }

  return (
    <>
      {/* Sticky or Floating Admin Bar for Courses Page */}
      <div className="sticky top-16 z-30 w-full border-b border-amber-300 bg-amber-500/10 px-4 py-2 text-xs backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-amber-900 font-medium">
            <span className="flex h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
            <span>
              <strong>Admin Mode:</strong> You can edit, add, update, or delete content in the Courses Page Hero &amp; Featured Banner sections.
            </span>
          </div>

          <button
            suppressHydrationWarning
            type="button"
            onClick={() => setOpen(true)}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-slate-900 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-slate-800 transition"
          >
            <Edit3 size={13} />
            <span>Manage Content</span>
          </button>
        </div>
      </div>

      {/* Admin Content Drawer */}
      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        title="Manage Courses Page Content"
      >
        <div className="p-4 sm:p-6 max-h-[85vh] overflow-y-auto">
          <CoursesPageContentEditor onClose={() => setOpen(false)} />
        </div>
      </Drawer>
    </>
  );
}
