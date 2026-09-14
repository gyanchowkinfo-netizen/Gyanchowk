'use client';

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent,
  type ReactNode,
} from 'react';
import Link from 'next/link';
import {
  AnimatePresence,
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type HTMLMotionProps,
} from 'motion/react';
import { usePathname } from 'next/navigation';
import { duration, ease, spring, variantFor, variants, viewportOnce, type RevealDirection } from '@/lib/motion';
import { cn } from '@/lib/format';
import { isAppPanelPath } from '@/lib/paths';
import { brand } from '@/lib/brand';

interface MotionPrefs {
  reduce: boolean;
  coarse: boolean;
  allow3d: boolean;
}

const MotionCtx = createContext<MotionPrefs>({ reduce: false, coarse: false, allow3d: false });

export function useMotionPrefs() {
  return useContext(MotionCtx);
}

function webglAvailable() {
  if (typeof window === 'undefined') return false;
  try {
    const canvas = document.createElement('canvas');
    return Boolean(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
  } catch {
    return false;
  }
}

export function MotionProvider({ children }: { children: ReactNode }) {
  const reduceHook = useReducedMotion();
  const [coarse, setCoarse] = useState(false);
  const [webgl, setWebgl] = useState(false);

  useEffect(() => {
    setCoarse(window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 768);
    setWebgl(webglAvailable());
  }, []);

  const reduce = Boolean(reduceHook);
  const value = useMemo<MotionPrefs>(
    () => ({
      reduce,
      coarse,
      allow3d: !reduce && !coarse && webgl,
    }),
    [reduce, coarse, webgl],
  );

  return <MotionCtx.Provider value={value}>{children}</MotionCtx.Provider>;
}

export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { reduce } = useMotionPrefs();
  const skip = reduce || isAppPanelPath(pathname);

  if (skip) return children;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: duration.fast, ease: ease.smooth }}
    >
      {children}
    </motion.div>
  );
}

export function AnimatedSection({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <Reveal className={className} delay={delay}>
      {children}
    </Reveal>
  );
}

export function Reveal({
  children,
  direction = 'up',
  className,
  delay = 0,
  once = true,
}: {
  children: ReactNode;
  direction?: RevealDirection;
  className?: string;
  delay?: number;
  once?: boolean;
}) {
  const { reduce } = useMotionPrefs();
  const v = reduce ? { hidden: { opacity: 0 }, visible: { opacity: 1 } } : variantFor(direction);
  return (
    <motion.div
      className={className}
      variants={v}
      initial="hidden"
      whileInView="visible"
      viewport={{ ...viewportOnce, once }}
      transition={{ delay }}
    >
      {children}
    </motion.div>
  );
}

export function FadeIn(props: { children: ReactNode; className?: string; delay?: number }) {
  return <Reveal direction="in" {...props} />;
}

export function SlideIn({
  children,
  from = 'up',
  className,
}: {
  children: ReactNode;
  from?: RevealDirection;
  className?: string;
}) {
  return (
    <Reveal direction={from} className={className}>
      {children}
    </Reveal>
  );
}

export function ScaleIn(props: { children: ReactNode; className?: string }) {
  return <Reveal direction="scale" {...props} />;
}

export function BlurReveal(props: { children: ReactNode; className?: string }) {
  const { reduce } = useMotionPrefs();
  return <Reveal direction={reduce ? 'in' : 'blur'} {...props} />;
}

export function StaggerContainer({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const { reduce } = useMotionPrefs();
  return (
    <motion.div
      className={className}
      variants={reduce ? undefined : variants.staggerChildren}
      initial="hidden"
      whileInView="visible"
      viewport={viewportOnce}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className }: { children: ReactNode; className?: string }) {
  const { reduce } = useMotionPrefs();
  return (
    <motion.div className={className} variants={reduce ? variants.fadeIn : variants.fadeUp}>
      {children}
    </motion.div>
  );
}

export function Parallax({
  children,
  speed = 0.15,
  className,
}: {
  children: ReactNode;
  speed?: number;
  className?: string;
}) {
  const { reduce, coarse } = useMotionPrefs();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [speed * 48, speed * -48]);
  if (reduce || coarse) return <div className={className}>{children}</div>;
  return (
    <motion.div ref={ref} style={{ y }} className={className}>
      {children}
    </motion.div>
  );
}

export function FloatingElement({
  children,
  className,
  duration: floatDuration = 5.5,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  duration?: number;
  delay?: number;
}) {
  const { reduce } = useMotionPrefs();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      animate={{ y: [0, -8, 0] }}
      transition={{ duration: floatDuration, delay, repeat: Infinity, ease: 'easeInOut' }}
    >
      {children}
    </motion.div>
  );
}

export function TiltCard({
  children,
  className,
  intensity = 6,
}: {
  children: ReactNode;
  className?: string;
  intensity?: number;
}) {
  const { reduce, coarse } = useMotionPrefs();
  const ref = useRef<HTMLDivElement>(null);
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const rotateX = useSpring(rx, { stiffness: 180, damping: 18 });
  const rotateY = useSpring(ry, { stiffness: 180, damping: 18 });

  if (reduce || coarse) {
    return <div className={cn('transition-transform duration-300 hover:-translate-y-1', className)}>{children}</div>;
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{ rotateX, rotateY, transformPerspective: 900 }}
      onMouseMove={(e) => {
        const el = ref.current;
        if (!el) return;
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        rx.set(py * -intensity);
        ry.set(px * intensity);
      }}
      onMouseLeave={() => {
        rx.set(0);
        ry.set(0);
      }}
    >
      {children}
    </motion.div>
  );
}

export function MagneticButton({
  children,
  className,
  href,
  variant = 'primary',
}: {
  children: ReactNode;
  className?: string;
  href?: string;
  variant?: 'primary' | 'secondary';
}) {
  const { reduce, coarse } = useMotionPrefs();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, spring);
  const sy = useSpring(y, spring);
  const inner = (
    <motion.span className="inline-flex items-center gap-2" style={reduce || coarse ? undefined : { x: sx, y: sy }}>
      {children}
      <span aria-hidden className="gc-btn-arrow">
        →
      </span>
    </motion.span>
  );

  function onMove(e: MouseEvent<HTMLElement>) {
    if (reduce || coarse) return;
    const r = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - r.left - r.width / 2) * 0.18);
    y.set((e.clientY - r.top - r.height / 2) * 0.18);
  }

  const props = {
    className: cn(variant === 'secondary' ? 'gc-btn-secondary' : 'gc-btn-primary', 'inline-flex', className),
    onMouseMove: onMove,
    onMouseLeave: () => {
      x.set(0);
      y.set(0);
    },
  };

  if (href) {
    return (
      <Link href={href} {...props}>
        {inner}
      </Link>
    );
  }
  return (
    <button type="button" {...props}>
      {inner}
    </button>
  );
}

export function CountUp({
  value,
  className,
  suffix = '',
  durationMs = 700,
  digits = 0,
}: {
  value: number;
  className?: string;
  suffix?: string;
  durationMs?: number;
  digits?: number;
}) {
  const { reduce } = useMotionPrefs();
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const safeValue = Number.isFinite(value) ? value : 0;
  const [shown, setShown] = useState(reduce ? safeValue : 0);
  const animatedTo = useRef<number | null>(null);
  const shownRef = useRef(shown);
  shownRef.current = shown;

  useEffect(() => {
    if (!inView) return;
    if (animatedTo.current === safeValue) return;
    const from = shownRef.current;
    animatedTo.current = safeValue;
    if (reduce) {
      setShown(safeValue);
      return;
    }
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      const eased = 1 - Math.pow(1 - t, 3);
      const raw = from + (safeValue - from) * eased;
      const next = digits > 0 ? Number(raw.toFixed(digits)) : Math.round(raw);
      setShown(next);
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [inView, safeValue, reduce, durationMs, digits]);

  return (
    <span ref={ref} className={className}>
      {digits > 0 ? shown.toFixed(digits) : shown}
      {suffix}
    </span>
  );
}

export function AnimatedProgress({ value, className }: { value: number; className?: string }) {
  const { reduce } = useMotionPrefs();
  const v = Math.max(0, Math.min(100, value));
  return (
    <div
      className={cn('h-2 w-full overflow-hidden rounded-full bg-gc-navy', className)}
      role="progressbar"
      aria-valuenow={v}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <motion.div
        className="h-full origin-left bg-gradient-to-r from-gc-blue to-gc-gold"
        initial={{ scaleX: reduce ? v / 100 : 0 }}
        whileInView={{ scaleX: v / 100 }}
        viewport={viewportOnce}
        transition={{ duration: duration.slow, ease: ease.smooth }}
      />
    </div>
  );
}

export function ProgressCircle({ value, size = 96 }: { value: number; size?: number }) {
  const { reduce } = useMotionPrefs();
  const v = Math.max(0, Math.min(100, value));
  const r = 36;
  const c = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} viewBox="0 0 96 96" aria-hidden>
      <circle cx="48" cy="48" r={r} fill="none" stroke={brand.border} strokeWidth="8" />
      <motion.circle
        cx="48"
        cy="48"
        r={r}
        fill="none"
        stroke={brand.secondary}
        strokeWidth="8"
        strokeLinecap="round"
        strokeDasharray={c}
        initial={{ strokeDashoffset: c }}
        whileInView={{ strokeDashoffset: c - (c * v) / 100 }}
        viewport={viewportOnce}
        transition={{ duration: reduce ? 0.01 : duration.slow, ease: ease.smooth }}
        style={{ rotate: -90, transformOrigin: '48px 48px' }}
      />
    </svg>
  );
}

export function TextReveal({ text, className }: { text: string; className?: string }) {
  const { reduce } = useMotionPrefs();
  if (reduce) return <span className={className}>{text}</span>;
  const words = text.split(' ');
  return (
    <span className={className}>
      {words.map((w, i) => (
        <motion.span
          key={`${w}-${i}`}
          className="inline-block pr-[0.28em]"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: duration.fast, delay: i * 0.04, ease: ease.smooth }}
        >
          {w}
        </motion.span>
      ))}
    </span>
  );
}

export function ImageReveal({ children, className }: { children: ReactNode; className?: string }) {
  const { reduce } = useMotionPrefs();
  return (
    <motion.div
      className={cn('overflow-hidden', className)}
      initial={reduce ? false : { clipPath: 'inset(8% 8% 8% 8% round 16px)', opacity: 0.7, scale: 1.04 }}
      whileInView={{ clipPath: 'inset(0% 0% 0% 0% round 16px)', opacity: 1, scale: 1 }}
      viewport={viewportOnce}
      transition={{ duration: duration.slow, ease: ease.smooth }}
    >
      {children}
    </motion.div>
  );
}

export function ScrollProgress() {
  const { reduce } = useMotionPrefs();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 28, restDelta: 0.001 });
  if (reduce) return null;
  return (
    <motion.div
      className="fixed left-0 top-0 z-[70] h-0.5 origin-left bg-gradient-to-r from-gc-blue to-gc-gold"
      style={{ scaleX, width: '100%' }}
    />
  );
}

export function SoftBg({ className }: { className?: string }) {
  const { reduce, coarse } = useMotionPrefs();
  return (
    <div className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)} aria-hidden>
      <div
        className={cn(
          'absolute -left-24 top-10 h-64 w-64 rounded-full bg-gc-blue/20 blur-3xl',
          !reduce && !coarse && 'gc-blob',
        )}
      />
      <div
        className={cn(
          'absolute -right-16 bottom-0 h-72 w-72 rounded-full bg-gc-gold/10 blur-3xl',
          !reduce && !coarse && 'gc-blob gc-blob-delay',
        )}
      />
    </div>
  );
}

export function ModalMotion({
  open,
  children,
}: {
  open: boolean;
  children: ReactNode;
}) {
  const { reduce } = useMotionPrefs();
  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduce ? 0.01 : duration.fast }}
        >
          {children}
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

export function DrawerPanel({ open, children }: { open: boolean; children: ReactNode }) {
  const { reduce } = useMotionPrefs();
  return (
    <AnimatePresence>
      {open ? (
        <motion.aside
          className="absolute inset-y-0 right-0 h-full w-full max-w-sm overflow-y-auto border-l border-gc-line bg-gc-navy p-5"
          initial={reduce ? { opacity: 1 } : { x: '100%' }}
          animate={{ x: 0, opacity: 1 }}
          exit={reduce ? { opacity: 0 } : { x: '100%' }}
          transition={{ duration: duration.normal, ease: ease.smooth }}
        >
          {children}
        </motion.aside>
      ) : null}
    </AnimatePresence>
  );
}

export function ConfettiBurst({ active }: { active: boolean }) {
  const { reduce } = useMotionPrefs();
  if (!active || reduce) return null;
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {Array.from({ length: 14 }).map((_, i) => (
        <motion.span
          key={i}
          className="absolute h-1.5 w-1.5 rounded-full"
          style={
            {
              left: `${8 + ((i * 7) % 84)}%`,
              top: '20%',
              background: i % 2 ? brand.secondary : brand.primary,
            } as CSSProperties
          }
          initial={{ opacity: 1, y: 0, scale: 1 }}
          animate={{ opacity: 0, y: 80 + (i % 5) * 12, scale: 0.4 }}
          transition={{ duration: 0.9, delay: i * 0.03, ease: ease.out }}
        />
      ))}
    </div>
  );
}

export function motionProps(extra?: HTMLMotionProps<'div'>): HTMLMotionProps<'div'> {
  return extra ?? {};
}

export { CertificateReveal } from './CertificateReveal';
export { CertificateVerified } from './CertificateVerified';
export { RoadmapTimeline } from './RoadmapTimeline';
export { SyllabusAccordion } from './SyllabusAccordion';
