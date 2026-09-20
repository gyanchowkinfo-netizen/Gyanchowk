'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Input';
import { toast } from '@/lib/toast';

interface Props {
  videoId: string;
}

const SPEED_KEY = 'gc-playback-rate';

export function VideoPlayer({ videoId }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const lastSent = useRef(0);
  const [error, setError] = useState('');
  const [rate, setRate] = useState(1);
  const [notes, setNotes] = useState<Array<{ _id: string; timestampSec: number; body: string }>>([]);
  const [bookmarks, setBookmarks] = useState<Array<{ _id: string; timestampSec: number; label?: string }>>([]);
  const [showNotes, setShowNotes] = useState(false);

  useEffect(() => {
    const saved = Number(localStorage.getItem(SPEED_KEY) || '1');
    if (saved) setRate(saved);
  }, []);

  useEffect(() => {
    const el = videoRef.current;
    if (el) el.playbackRate = rate;
    localStorage.setItem(SPEED_KEY, String(rate));
  }, [rate]);

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
        player.querySelectorAll('track').forEach((t) => t.remove());
        for (const track of grant.subtitles ?? []) {
          const t = document.createElement('track');
          t.kind = 'subtitles';
          t.label = track.label;
          t.srclang = track.srclang;
          t.src = track.src;
          t.default = false;
          player.appendChild(t);
        }

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
            player.playbackRate = Number(localStorage.getItem(SPEED_KEY) || '1');
            if (grantResume > 0 && grantResume < (player.duration || Infinity)) {
              player.currentTime = grantResume;
            }
          },
          { once: true },
        );
        const [b, n] = await Promise.all([
          api<{ items: Array<{ _id: string; timestampSec: number; label?: string }> }>(`/api/videos/${videoId}/bookmarks`),
          api<{ items: Array<{ _id: string; timestampSec: number; body: string }> }>(`/api/videos/${videoId}/notes`),
        ]);
        setBookmarks(b.items ?? []);
        setNotes(n.items ?? []);
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

  async function bookmark() {
    const t = videoRef.current?.currentTime ?? 0;
    try {
      const res = await api<{ item: { _id: string; timestampSec: number } }>(`/api/videos/${videoId}/bookmarks`, {
        method: 'POST',
        body: JSON.stringify({ timestampSec: t, label: `At ${Math.floor(t)}s` }),
      });
      setBookmarks((prev) => [...prev, res.item]);
      toast.success('Moment bookmarked');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not bookmark');
    }
  }

  async function addNote(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const t = videoRef.current?.currentTime ?? 0;
    try {
      const res = await api<{ item: { _id: string; timestampSec: number; body: string } }>(`/api/videos/${videoId}/notes`, {
        method: 'POST',
        body: JSON.stringify({ timestampSec: t, body: form.get('body') }),
      });
      setNotes((prev) => [...prev, res.item]);
      e.currentTarget.reset();
      toast.success('Note saved');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not save note');
    }
  }

  async function pip() {
    const el = videoRef.current as HTMLVideoElement & { requestPictureInPicture?: () => Promise<unknown> };
    if (!el?.requestPictureInPicture) {
      toast.error('Picture-in-picture is not available in this browser');
      return;
    }
    try {
      await el.requestPictureInPicture();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'PiP failed');
    }
  }

  async function downloadOffline() {
    try {
      await api(`/api/learning/downloads/${videoId}`, { method: 'POST' });
      toast.success('Encrypted offline grant created. Manage it under Downloads.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Download grant failed');
    }
  }

  return (
    <div className="space-y-3">
      <div className="overflow-hidden rounded-2xl border border-gc-line bg-black shadow-glow">
        {error ? <p className="p-6 text-sm text-red-300">{error}</p> : null}
        <video
          ref={videoRef}
          className="aspect-video w-full bg-black"
          controls
          playsInline
          controlsList="nodownload"
          preload="metadata"
          crossOrigin="anonymous"
        />
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <label className="text-sm text-gc-mist">
          Speed
          <select
            aria-label="Playback speed"
            className="gc-input ml-2 w-auto"
            value={rate}
            onChange={(e) => setRate(Number(e.target.value))}
            suppressHydrationWarning
          >
            {[0.5, 0.75, 1, 1.25, 1.5, 1.75, 2].map((s) => (
              <option key={s} value={s}>
                {s}x
              </option>
            ))}
          </select>
        </label>
        <Button variant="ghost" type="button" aria-label="Bookmark this moment" onClick={() => void bookmark()}>
          Bookmark this moment
        </Button>
        <Button variant="ghost" type="button" aria-label="Picture in picture" onClick={() => void pip()}>
          Picture-in-picture
        </Button>
        <Button variant="ghost" type="button" aria-label="Toggle notes" onClick={() => setShowNotes((v) => !v)}>
          Notes
        </Button>
        <Button variant="ghost" type="button" aria-label="Download for offline" onClick={() => void downloadOffline()}>
          Download for offline
        </Button>
      </div>
      {bookmarks.length ? (
        <div className="flex flex-wrap gap-2 text-xs">
          {bookmarks.map((b) => (
            <button
              key={b._id}
              type="button"
              className="rounded-full border border-gc-line px-3 py-1"
              onClick={() => {
                if (videoRef.current) videoRef.current.currentTime = b.timestampSec;
              }}
            >
              {Math.floor(b.timestampSec)}s
            </button>
          ))}
        </div>
      ) : null}
      {showNotes ? (
        <div className="gc-card p-4">
          <form onSubmit={addNote} className="grid gap-2">
            <Textarea name="body" label="Note at current timestamp" required />
            <Button type="submit">Save note</Button>
          </form>
          <ul className="mt-3 space-y-2 text-sm">
            {notes.map((n) => (
              <li key={n._id}>
                <button
                  type="button"
                  className="text-gc-gold"
                  onClick={() => {
                    if (videoRef.current) videoRef.current.currentTime = n.timestampSec;
                  }}
                >
                  {Math.floor(n.timestampSec)}s
                </button>
                : {n.body}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
