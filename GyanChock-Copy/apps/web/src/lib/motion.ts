export const duration = {
  fast: 0.22,
  normal: 0.4,
  slow: 0.55,
} as const;

export const ease = {
  smooth: [0.22, 1, 0.36, 1] as const,
  out: [0.16, 1, 0.3, 1] as const,
};

export const spring = {
  type: 'spring' as const,
  stiffness: 320,
  damping: 28,
  mass: 0.7,
};

export const viewportOnce = { once: true, amount: 0.2, margin: '0px 0px -8% 0px' } as const;

export const variants = {
  fadeIn: {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: duration.normal, ease: ease.smooth } },
  },
  fadeUp: {
    hidden: { opacity: 0, y: 28, scale: 0.98 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: duration.normal, ease: ease.smooth } },
  },
  fadeDown: {
    hidden: { opacity: 0, y: -16 },
    visible: { opacity: 1, y: 0, transition: { duration: duration.normal, ease: ease.smooth } },
  },
  fadeLeft: {
    hidden: { opacity: 0, x: 28 },
    visible: { opacity: 1, x: 0, transition: { duration: duration.normal, ease: ease.smooth } },
  },
  fadeRight: {
    hidden: { opacity: 0, x: -28 },
    visible: { opacity: 1, x: 0, transition: { duration: duration.normal, ease: ease.smooth } },
  },
  scaleIn: {
    hidden: { opacity: 0, scale: 0.96 },
    visible: { opacity: 1, scale: 1, transition: { duration: duration.fast, ease: ease.smooth } },
  },
  blurIn: {
    hidden: { opacity: 0, filter: 'blur(8px)', y: 12 },
    visible: { opacity: 1, filter: 'blur(0px)', y: 0, transition: { duration: duration.slow, ease: ease.smooth } },
  },
  staggerChildren: {
    hidden: {},
    visible: { transition: { staggerChildren: 0.06, delayChildren: 0.04 } },
  },
};

export type RevealDirection = 'up' | 'down' | 'left' | 'right' | 'in' | 'scale' | 'blur';

export function variantFor(direction: RevealDirection) {
  switch (direction) {
    case 'down':
      return variants.fadeDown;
    case 'left':
      return variants.fadeLeft;
    case 'right':
      return variants.fadeRight;
    case 'in':
      return variants.fadeIn;
    case 'scale':
      return variants.scaleIn;
    case 'blur':
      return variants.blurIn;
    default:
      return variants.fadeUp;
  }
}

export const reduced = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.01 } },
};
