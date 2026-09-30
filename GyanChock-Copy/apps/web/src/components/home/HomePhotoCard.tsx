'use client';

import Link from 'next/link';
import { cn } from '@/lib/format';
import type { HomeCardAccent } from '@/lib/types';
import styles from './HomeVisualCards.module.css';

export type VisualCardData = {
  title: string;
  body: string;
  imageUrl?: string;
  href?: string;
  ctaText?: string;
  accent?: HomeCardAccent;
};

const ACCENTS: HomeCardAccent[] = ['blue', 'lavender', 'cyan', 'mint', 'peach', 'pink'];

export function accentFor(index: number, accent?: HomeCardAccent): HomeCardAccent {
  return accent ?? ACCENTS[index % ACCENTS.length];
}

export function HomePhotoCard({
  card,
  index = 0,
  eager,
}: {
  card: VisualCardData;
  index?: number;
  eager?: boolean;
}) {
  const accent = accentFor(index, card.accent);
  const inner = (
    <>
      <div className={styles.media}>
        {card.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={card.imageUrl} alt={card.title} loading={eager ? 'eager' : 'lazy'} />
        ) : (
          <span className="block h-full w-full bg-[color:var(--gyan-primary-soft)]" />
        )}
      </div>
      <div className={styles.body}>
        <h3 className={styles.cardTitle}>{card.title}</h3>
        <span className={styles.rule} aria-hidden="true" />
        <p className={styles.text}>{card.body}</p>
        {card.ctaText ? <span className={styles.cta}>{card.ctaText}</span> : null}
      </div>
    </>
  );

  const className = cn(styles.card);
  if (card.href) {
    return (
      <Link href={card.href} className={className} data-accent={accent} aria-label={card.title}>
        {inner}
      </Link>
    );
  }

  return (
    <article className={className} data-accent={accent} aria-label={card.title}>
      {inner}
    </article>
  );
}
