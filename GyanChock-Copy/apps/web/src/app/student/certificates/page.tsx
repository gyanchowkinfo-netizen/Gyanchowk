'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/States';
import { Button } from '@/components/ui/Button';
import { toast } from '@/lib/toast';
import { CertificateReveal, StaggerContainer, StaggerItem } from '@/components/motion';

export default function CertificatesPage() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['certs'],
    queryFn: () =>
      api<{ items: Array<{ _id: string; certificateId?: string; course?: { title?: string }; issuedAt?: string }> }>(
        '/api/learning/certificates',
      ),
  });
  const origin = typeof window !== 'undefined' ? window.location.origin : '';

  async function share(id: string) {
    const url = `${origin}/verify/certificate/${id}`;
    await navigator.clipboard.writeText(url);
    toast.success('Verification link copied');
  }

  return (
    <div>
      <h1 className="font-display text-3xl text-gc-black">Certificates</h1>
      {isLoading ? <LoadingState /> : null}
      {error ? <ErrorState message={(error as Error).message} onRetry={() => void refetch()} /> : null}
      <StaggerContainer className="mt-6 grid gap-4 md:grid-cols-2">
        {(data?.items ?? []).map((c) => {
          const vid = c.certificateId ?? c._id;
          return (
            <StaggerItem key={c._id}>
              <CertificateReveal>
                <article className="gc-card p-5">
                  <p className="font-display text-lg">{c.course?.title ?? 'Certificate'}</p>
                  <p className="text-xs text-gc-mute">{c.issuedAt ? new Date(c.issuedAt).toLocaleDateString() : ''}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <a className="gc-btn-gold" href={`/verify/certificate/${vid}`}>
                      Public verify
                    </a>
                    <Button variant="ghost" type="button" onClick={() => void share(vid)}>
                      Share
                    </Button>
                  </div>
                </article>
              </CertificateReveal>
            </StaggerItem>
          );
        })}
      </StaggerContainer>
      {!isLoading && !(data?.items.length) ? (
        <EmptyState title="No certificates yet" body="Certificates issue when course completion rules are met on the server." />
      ) : null}
    </div>
  );
}
