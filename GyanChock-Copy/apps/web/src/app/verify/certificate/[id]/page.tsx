import { api } from '@/lib/api';
import { CertificateVerified } from '@/components/motion/CertificateVerified';

export default async function VerifyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let cert: { certificateId: string; issuedAt: string; user?: { name: string }; course?: { title: string } } | null =
    null;
  let error = '';
  try {
    cert = await api(`/api/certificates/${id}`);
  } catch (e) {
    error = e instanceof Error ? e.message : 'Not found';
  }
  return (
    <main className="mx-auto max-w-xl px-4 py-16">
      <h1 className="font-display text-3xl text-gc-black">Certificate verification</h1>
      {error ? (
        <p className="mt-6 text-red-400">{error}</p>
      ) : (
        <CertificateVerified>
          <div className="mt-6 gc-card p-6">
            <p className="text-xs tracking-widest text-gc-glow">VERIFIED ✓</p>
            <p className="mt-2 text-2xl">{cert?.user?.name}</p>
            <p className="text-gc-mist">{cert?.course?.title}</p>
            <p className="mt-4 text-sm text-gc-mute">ID {cert?.certificateId}</p>
          </div>
        </CertificateVerified>
      )}
    </main>
  );
}
