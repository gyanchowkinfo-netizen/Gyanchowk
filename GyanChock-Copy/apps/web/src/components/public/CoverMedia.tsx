import Image from 'next/image';
import { cn } from '@/lib/format';

export function CoverMedia({
  src,
  alt,
  className,
  sizes = '(max-width: 768px) 100vw, 50vw',
}: {
  src?: string;
  alt: string;
  className?: string;
  sizes?: string;
}) {
  if (!src) {
    return <div className={cn('absolute inset-0 bg-gradient-to-br from-gc-blue/30 via-gc-navy to-gc-ink', className)} aria-hidden />;
  }
  const cloudinary = src.includes('res.cloudinary.com');
  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      className={cn('object-cover', className)}
      unoptimized={!cloudinary}
    />
  );
}
