'use client';

import Link from 'next/link';
import { formatPrice, cn } from '@/lib/format';
import { Rating, StatusBadge } from '@/components/ui/Badge';
import type { BatchCardData } from '@/lib/types';
import { StaggerContainer, StaggerItem, TiltCard } from '@/components/motion';

function durationLabel(batch: BatchCardData) {
  if (batch.durationDays) return `${batch.durationDays} days`;
  if (batch.validityDays) return `${batch.validityDays} days access`;
  return null;
}

export function BatchCard({ batch, featured }: { batch: BatchCardData; featured?: boolean }) {
  const seats = (batch.maxStudents ?? 0) - (batch.enrolledCount ?? 0);
  const course = batch.courseTitle || batch.course?.title;
  const exam = batch.exam || batch.targetExam || batch.examCategory;
  const teachers = (batch.teachers ?? []).map((t) => t.name).filter(Boolean).join(', ');
  const duration = durationLabel(batch);
  return (
    <TiltCard intensity={5} className="h-full">
      <Link
        href={`/batches/${batch.slug}`}
        className={cn('gc-card group relative flex h-full flex-col overflow-hidden hover:border-gc-gold', featured ? 'p-0' : 'p-0')}
      >
        <div className="relative h-40 overflow-hidden bg-gradient-to-br from-gc-blue/25 to-gc-navy">
          {batch.thumbnail?.url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={batch.thumbnail.url}
              alt=""
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
            />
          ) : null}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-gc-ink/80 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          <span className="absolute left-3 top-3">
            <StatusBadge status={batch.status} />
          </span>
        </div>
        <div className={cn('flex flex-1 flex-col p-5', featured && 'p-6')}>
          <h3 className={cn('font-display group-hover:text-gc-gold', featured ? 'text-2xl' : 'text-xl')}>{batch.name}</h3>
          {course ? <p className="mt-1 text-sm text-gc-gold">{course}</p> : null}
          <p className="mt-1 text-xs text-gc-mute">
            {[exam, batch.targetClass, batch.language].filter(Boolean).join(' · ')}
          </p>
          {teachers ? <p className="mt-2 text-sm text-gc-mist">{teachers}</p> : <p className="mt-2 text-sm text-gc-mute">Faculty TBA</p>}
          <p className="mt-2 line-clamp-2 flex-1 text-sm text-gc-mute">{batch.description}</p>
          <dl className="mt-4 grid grid-cols-2 gap-2 text-xs text-gc-mute">
            <div>
              <dt>Starts</dt>
              <dd className="text-gc-mist">{batch.startDate ? new Date(batch.startDate).toLocaleDateString() : '—'}</dd>
            </div>
            <div>
              <dt>Duration</dt>
              <dd className="text-gc-mist">{duration ?? '—'}</dd>
            </div>
          </dl>
          <div className="mt-3 flex items-center justify-between gap-2">
            {batch.ratingCount ? <Rating value={batch.ratingAvg} count={batch.ratingCount} /> : <span className="text-xs text-gc-mute">Ratings after course reviews</span>}
            {batch.maxStudents ? <span className="text-xs text-gc-mute">{Math.max(0, seats)} seats left</span> : null}
          </div>
          <div className="mt-4 flex items-end justify-between gap-2">
            <p>
              <span className="font-display text-lg text-gc-gold">{formatPrice(batch.price, batch.discountPercent)}</span>
              {batch.discountPercent ? (
                <span className="ml-2 text-xs text-gc-mute line-through">{formatPrice(batch.price, 0)}</span>
              ) : null}
            </p>
            <span className="gc-btn-gold px-3 py-1.5 text-xs">
              View batch <span className="gc-btn-arrow">→</span>
            </span>
          </div>
        </div>
      </Link>
    </TiltCard>
  );
}

export function BatchGrid({ batches }: { batches: BatchCardData[] }) {
  return (
    <StaggerContainer className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {batches.map((b) => (
        <StaggerItem key={b._id} className="h-full">
          <BatchCard batch={b} />
        </StaggerItem>
      ))}
    </StaggerContainer>
  );
}
