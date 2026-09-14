'use client';

import { type ReactNode } from 'react';
import { motion } from 'motion/react';
import { duration, ease } from '@/lib/motion';
import { useMotionPrefs } from '@/components/motion';

export function CertificateVerified({ children }: { children: ReactNode }) {
  const { reduce } = useMotionPrefs();
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: duration.normal, ease: ease.smooth }}
    >
      {children}
    </motion.div>
  );
}
