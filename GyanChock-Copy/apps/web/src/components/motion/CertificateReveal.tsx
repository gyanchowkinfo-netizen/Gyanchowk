'use client';

import { type ReactNode } from 'react';
import { motion } from 'motion/react';
import { duration, ease, viewportOnce } from '@/lib/motion';
import { useMotionPrefs } from '@/components/motion';

export function CertificateReveal({ children }: { children: ReactNode }) {
  const { reduce } = useMotionPrefs();
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={viewportOnce}
      transition={{ duration: duration.normal, ease: ease.smooth }}
    >
      {children}
    </motion.div>
  );
}
