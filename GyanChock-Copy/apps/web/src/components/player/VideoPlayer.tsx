'use client';

import { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import { api } from '@/lib/api';

interface Props {
  videoId: string;
}

export function VideoPlayer({ videoId }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const lastSent = useRef(0);
  const [error, setError] = useState('');

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    let hls: Hls | null = null;
    let grantResume = 0;

    async function load() {
      const player = videoRef.current;
      if (!player) return;
      try {
        const grant = await api<{
          hlsUrl: string;
          posterUrl?: string;
          resumeAt: number;
          subtitles: Array<{ label: string; src: string; srclang: string }>;
        }>(`/api/videos/${videoId}/playback`);
        if (!grant.hlsUrl) {
          setError('Video URL was not issued. Configure Cloudinary on the server and ensure you are enrolled.');
          return;
        }
        grantResume = grant.resumeAt;
        player.poster = grant.posterUrl ?? '';
        player.preload = 'metadata';

        if (Hls.isSupported()) {
          hls = new Hls({
            enableWorker: true,
            lowLatencyMode: false,
            startLevel: -1,
            maxBufferLength: 30,
          });
          hls.loadSource(grant.hlsUrl);
          hls.attachMedia(player);
        } else {
          player.src = grant.hlsUrl;
        }

        player.addEventListener(
          'loadedmetadata',
          () => {
            if (grantResume > 0 && grantResume < (player.duration || Infinity)) {
              player.currentTime = grantResume;
            }
          },
          { once: true },
        );
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Playback is not available');
      }
    }

    void load();

    const onTime = () => {
      const now = Date.now();
      if (now - lastSent.current < 10000) return;
      lastSent.current = now;
      void api(`/api/videos/${videoId}/progress`, {
        method: 'POST',
        body: JSON.stringify({
          positionSec: el.currentTime,
          durationSec: el.duration || 0,
        }),
      });
    };
    el.addEventListener('timeupdate', onTime);
    return () => {
      el.removeEventListener('timeupdate', onTime);
      hls?.destroy();
    };
  }, [videoId]);

  return (
    <div className="overflow-hidden rounded-2xl border border-gc-line bg-black shadow-glow">
      {error ? <p className="p-6 text-sm text-red-300">{error}</p> : null}
      <video
        ref={videoRef}
        className="aspect-video w-full bg-black"
        controls
        playsInline
        controlsList="nodownload"
        preload="metadata"
      />
    </div>
  );
}
