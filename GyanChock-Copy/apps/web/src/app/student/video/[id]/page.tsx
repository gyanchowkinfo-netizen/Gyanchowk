'use client';

import { VideoPlayer } from '@/components/player/VideoPlayer';
import { useParams } from 'next/navigation';

export default function StudentVideoPage() {
  const { id } = useParams<{ id: string }>();
  return (
    <div>
      <h1 className="mb-4 font-display text-2xl font-bold text-slate-900">Lesson player</h1>
      <VideoPlayer videoId={id} />
      <p className="mt-3 text-sm text-slate-600">
        Playback uses Cloudinary HLS with enrollment checks. Progress is saved about every 10 seconds.
      </p>
    </div>
  );
}
