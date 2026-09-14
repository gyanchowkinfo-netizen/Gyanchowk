'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useDebounce } from '@/lib/hooks';
import { Modal } from '@/components/ui/Overlay';

interface SearchHit {
  courses: Array<{ _id: string; title: string; slug: string }>;
  batches: Array<{ _id: string; name: string; slug: string }>;
  teachers: Array<{ _id: string; name: string }>;
  blogs: Array<{ title: string; slug: string }>;
  career: Array<{ title: string; slug: string }>;
}

export function SearchCommand() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const debounced = useDebounce(q, 350);
  const [data, setData] = useState<SearchHit | null>(null);
  const router = useRouter();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    if (!open || debounced.length < 2) {
      setData(null);
      return;
    }
    void api<SearchHit>(`/api/catalog/search?q=${encodeURIComponent(debounced)}`).then(setData).catch(() => setData(null));
  }, [debounced, open]);

  function go(href: string) {
    setOpen(false);
    setQ('');
    router.push(href);
  }

  return (
    <>
      <button
        className="gc-btn-ghost hidden h-10 min-w-[240px] justify-between px-4 text-sm md:inline-flex lg:min-w-[300px]"
        onClick={() => setOpen(true)}
        aria-label="Search"
      >
        <span className="text-gc-mute">Search courses, batches, teachers…</span>
        <kbd className="ml-3 rounded border border-gc-line px-1.5 py-0.5 text-[10px] text-gc-mist">Ctrl K</kbd>
      </button>
      <Modal open={open} title="Search Gyan Chowk" onClose={() => setOpen(false)}>
        <input
          autoFocus
          className="gc-input"
          placeholder="Courses, batches, teachers, blogs…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <div className="mt-4 max-h-72 space-y-3 overflow-y-auto text-sm">
          {data?.courses.map((c) => (
            <button key={c._id} className="block w-full rounded-lg px-2 py-2 text-left hover:bg-gc-ink" onClick={() => go(`/courses/${c.slug}`)}>
              Course · {c.title}
            </button>
          ))}
          {data?.batches.map((b) => (
            <button key={b._id} className="block w-full rounded-lg px-2 py-2 text-left hover:bg-gc-ink" onClick={() => go(`/batches/${b.slug}`)}>
              Batch · {b.name}
            </button>
          ))}
          {data?.teachers.map((t) => (
            <button key={t._id} className="block w-full rounded-lg px-2 py-2 text-left hover:bg-gc-ink" onClick={() => go(`/teachers/${t._id}`)}>
              Teacher · {t.name}
            </button>
          ))}
          {data?.blogs.map((b) => (
            <button key={b.slug} className="block w-full rounded-lg px-2 py-2 text-left hover:bg-gc-ink" onClick={() => go(`/blog/${b.slug}`)}>
              Blog · {b.title}
            </button>
          ))}
          {data?.career.map((c) => (
            <button key={c.slug} className="block w-full rounded-lg px-2 py-2 text-left hover:bg-gc-ink" onClick={() => go(`/career/${c.slug}`)}>
              Career · {c.title}
            </button>
          ))}
          {debounced.length >= 2 && data && !data.courses.length && !data.batches.length ? (
            <p className="text-gc-mute">No matches.</p>
          ) : null}
        </div>
      </Modal>
    </>
  );
}
