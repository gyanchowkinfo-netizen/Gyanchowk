'use client';

import { motion } from 'motion/react';
import { duration, ease, viewportOnce } from '@/lib/motion';
import { useMotionPrefs } from '@/components/motion';
import { brand } from '@/lib/brand';

export function RoadmapTimeline({
  steps,
}: {
  steps: Array<{ title: string; body?: string }>;
}) {
  const { reduce } = useMotionPrefs();
  const items = steps;
  if (!items.length) {
    return <p className="text-sm text-gc-mute">No steps published for this roadmap yet.</p>;
  }
  const h = Math.max(240, items.length * 92);

  return (
    <div className="relative">
      <svg className="absolute left-4 top-0 h-full w-8 md:left-1/2 md:-ml-4" viewBox={`0 0 32 ${h}`} aria-hidden>
        <motion.path
          d={`M16 8 V${h - 8}`}
          fill="none"
          stroke={brand.primary}
          strokeWidth="3"
          strokeLinecap="round"
          initial={{ pathLength: reduce ? 1 : 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={viewportOnce}
          transition={{ duration: reduce ? 0.01 : 1.1, ease: ease.smooth }}
        />
      </svg>
      <ol className="space-y-6">
        {items.map((s, i) => (
          <motion.li
            key={`${s.title}-${i}`}
            className={`relative ml-12 gc-card p-5 md:ml-0 md:w-[calc(50%-2rem)] ${i % 2 ? 'md:ml-auto' : ''}`}
            initial={reduce ? false : { opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={viewportOnce}
            transition={{ duration: duration.normal, delay: i * 0.06, ease: ease.smooth }}
          >
            <span className="absolute -left-12 top-5 grid h-7 w-7 place-items-center rounded-full bg-gc-gold text-xs text-black md:left-auto md:right-[-3.35rem] md:translate-x-1/2">
              {i + 1}
            </span>
            <p className="font-display text-lg text-gc-gold">{s.title}</p>
            {s.body ? <p className="mt-1 text-sm text-gc-mist">{s.body}</p> : null}
          </motion.li>
        ))}
      </ol>
    </div>
  );
}
