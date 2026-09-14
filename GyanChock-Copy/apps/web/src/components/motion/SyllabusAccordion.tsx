'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { duration, ease } from '@/lib/motion';
import { useMotionPrefs } from '@/components/motion';

export function SyllabusAccordion({
  chapters,
  lessons,
}: {
  chapters: Array<{ _id: string; name: string }>;
  lessons: Array<{ _id: string; title: string; isDemo?: boolean; chapter?: string }>;
}) {
  const { reduce } = useMotionPrefs();
  const [open, setOpen] = useState<string | null>(chapters[0]?._id ?? null);

  if (!chapters.length) {
    return (
      <ul className="space-y-2">
        {lessons.map((l) => (
          <li key={l._id} className="gc-card px-4 py-3 text-sm transition hover:border-gc-gold">
            {l.title} {l.isDemo ? <span className="text-gc-gold">· demo</span> : null}
          </li>
        ))}
      </ul>
    );
  }

  return (
    <div className="space-y-2">
      {chapters.map((ch) => {
        const items = lessons.filter((l) => String(l.chapter) === String(ch._id) || !l.chapter);
        const isOpen = open === ch._id;
        return (
          <div key={ch._id} className="gc-card overflow-hidden">
            <button
              type="button"
              className="flex w-full items-center justify-between px-4 py-3 text-left font-medium"
              aria-expanded={isOpen}
              onClick={() => setOpen(isOpen ? null : ch._id)}
            >
              {ch.name}
              <motion.span animate={{ rotate: isOpen ? 90 : 0 }} transition={{ duration: duration.fast }} aria-hidden>
                ›
              </motion.span>
            </button>
            <AnimatePresence initial={false}>
              {isOpen ? (
                <motion.ul
                  className="space-y-1 overflow-hidden px-4 pb-3 text-sm text-gc-mist"
                  initial={reduce ? false : { height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={reduce ? undefined : { height: 0, opacity: 0 }}
                  transition={{ duration: duration.normal, ease: ease.smooth }}
                >
                  {items.map((l, i) => (
                    <motion.li
                      key={l._id}
                      className="rounded-lg px-2 py-1.5 hover:bg-gc-navy"
                      initial={reduce ? false : { opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04, duration: duration.fast }}
                    >
                      {l.title} {l.isDemo ? <span className="text-gc-gold">· demo</span> : null}
                    </motion.li>
                  ))}
                </motion.ul>
              ) : null}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
