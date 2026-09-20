import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/format';

export function BrandLogo({
  size = 40,
  withWordmark = false,
  imageClassName,
}: {
  size?: number;
  withWordmark?: boolean;
  imageClassName?: string;
}) {
  return (
    <Link href="/" className="flex shrink-0 items-center gap-2.5" aria-label="Gyan Chowk home">
      <Image
        src="/g1.png"
        alt="Gyan Chowk"
        width={Math.round(size * 2.4)}
        height={size}
        className={cn('h-9 w-auto object-contain sm:h-10', imageClassName)}
        priority
      />
      {withWordmark ? (
        <span className="hidden font-display text-base font-semibold tracking-tight sm:block">
          <span className="text-gc-blue">Gyan</span> <span className="text-[color:var(--gyan-secondary-dark)]">Chowk</span>
        </span>
      ) : null}
    </Link>
  );
}
