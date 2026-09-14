import Image from 'next/image';
import Link from 'next/link';

export function BrandLogo({ size = 44, withWordmark = false }: { size?: number; withWordmark?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-3">
      <Image
        src="/g1.png"
        alt="Gyan Chowk"
        width={size * 2.4}
        height={size}
        className="h-11 w-auto object-contain drop-shadow-[0_0_18px_color-mix(in_srgb,var(--gyan-primary-light)_35%,transparent)]"
        priority
      />
      {withWordmark ? (
        <span className="hidden font-display text-lg font-semibold tracking-wide sm:block">
          <span className="text-gc-glow">GYAN</span> <span className="text-gc-gold">CHOWK</span>
        </span>
      ) : null}
    </Link>
  );
}
