import type { ReactNode } from 'react';
import { cn } from '@/lib/format';

const VARIANTS = {
  primary: '',
  accent: 'gc-icon-well-accent',
  warm: 'gc-icon-well-warm',
  neutral: 'gc-icon-well-neutral',
  featured: 'gc-icon-well-featured',
} as const;

const SIZES = {
  sm: 'gc-icon-well-sm',
  md: '',
  lg: 'gc-icon-well-lg',
} as const;

export type CardIconVariant = keyof typeof VARIANTS;
export type CardIconSize = keyof typeof SIZES;

export function CardIcon({
  children,
  variant = 'primary',
  size = 'md',
  className,
}: {
  children: ReactNode;
  variant?: CardIconVariant;
  size?: CardIconSize;
  className?: string;
}) {
  return <span className={cn('gc-icon-well', VARIANTS[variant], SIZES[size], className)}>{children}</span>;
}

export const CARD_ICON_CYCLE: CardIconVariant[] = ['primary', 'accent', 'warm', 'neutral'];
