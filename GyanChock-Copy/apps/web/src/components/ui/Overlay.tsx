'use client';

import { useEffect, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Button } from './Button';
import { useToastStore } from '@/lib/toast';
import { duration, ease } from '@/lib/motion';

export function Modal({
  open,
  title,
  children,
  onClose,
}: {
  open: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);
  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-4 sm:items-center"
          role="dialog"
          aria-modal
          aria-labelledby="modal-title"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: duration.fast }}
        >
          <button className="absolute inset-0" aria-label="Close" onClick={onClose} />
          <motion.div
            className="relative z-10 w-full max-w-lg rounded-t-[20px] border border-gc-line bg-white p-5 shadow-lg sm:rounded-[20px] sm:p-6"
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: duration.fast, ease: ease.smooth }}
          >
            <h2 id="modal-title" className="font-display text-xl text-gc-black">
              {title}
            </h2>
            <div className="mt-4">{children}</div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

export function Drawer({
  open,
  title,
  children,
  onClose,
}: {
  open: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
}) {
  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-50 flex justify-end bg-black/60"
          role="dialog"
          aria-modal
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <button className="flex-1" aria-label="Close filters" onClick={onClose} />
          <motion.aside
            className="h-full w-full max-w-sm overflow-y-auto border-l border-gc-line bg-white p-5"
            initial={{ x: '100%', opacity: 1 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 1 }}
            transition={{ duration: duration.normal, ease: ease.smooth }}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-lg text-gc-black">{title}</h2>
              <Button variant="ghost" onClick={onClose}>
                Close
              </Button>
            </div>
            {children}
          </motion.aside>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

export function ConfirmDialog({
  open,
  title,
  body,
  confirmLabel = 'Confirm',
  onConfirm,
  onClose,
  loading,
}: {
  open: boolean;
  title: string;
  body: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onClose: () => void;
  loading?: boolean;
}) {
  return (
    <Modal open={open} title={title} onClose={onClose}>
      <p className="text-sm text-gc-mist">{body}</p>
      <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button variant="ghost" className="w-full sm:w-auto" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="danger" className="w-full sm:w-auto" loading={loading} onClick={onConfirm}>
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}

export function ToastViewport() {
  const { items, dismiss } = useToastStore();
  return (
    <div className="pointer-events-none fixed inset-x-4 bottom-[calc(var(--bottom-nav)+0.5rem)] z-[60] space-y-2 sm:inset-x-auto sm:bottom-6 sm:right-4" aria-live="polite">
      <AnimatePresence>
        {items.map((t) => (
          <motion.button
            key={t.id}
            className={`pointer-events-auto block w-full rounded-xl border px-4 py-3 text-left text-sm shadow-md sm:w-auto ${
              t.kind === 'error'
                ? 'border-[color:var(--gyan-error)]/30 bg-[color:var(--gyan-error-soft)] text-[color:var(--gyan-error)]'
                : t.kind === 'success'
                  ? 'border-[color:var(--gyan-success)]/30 bg-[color:var(--gyan-success-soft)] text-[color:var(--gyan-success)]'
                  : 'border-gc-line bg-white text-gc-black'
            }`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            onClick={() => dismiss(t.id)}
          >
            {t.message}
          </motion.button>
        ))}
      </AnimatePresence>
    </div>
  );
}
