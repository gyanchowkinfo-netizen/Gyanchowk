'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import {
  ChevronDown,
  Clock,
  Download,
  FileText,
  Gauge,
  Maximize2,
} from 'lucide-react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Input';
import { toast } from '@/lib/toast';

interface Props {
  videoId: string;
  title?: string;
  teacherName?: string;
}

const SPEED_KEY = 'gc-playback-rate';

export function VideoPlayer({ videoId, title, teacherName }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const lastSent = useRef(0);
  const [error, setError] = useState('');
  const [rate, setRate] = useState(1);
  const [notes, setNotes] = useState<Array<{ _id: string; timestampSec: number; body: string }>>([]);
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

  function skipBackward() {
    if (!videoRef.current) return;
    videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - 5);
  }

  function skipForward() {
    if (!videoRef.current) return;
    videoRef.current.currentTime = Math.min(
      videoRef.current.duration || Infinity,
      videoRef.current.currentTime + 5,
    );
  }

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        skipBackward();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        skipForward();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

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

        if (Hls.isSupported() && grant.hlsUrl.includes('.m3u8')) {
          hls = new Hls({
            enableWorker: true,
            lowLatencyMode: false,
            startLevel: -1,
            maxBufferLength: 30,
          });
          hls.loadSource(grant.hlsUrl);
          hls.attachMedia(player);
          hls.on(Hls.Events.ERROR, (_event, data) => {
            if (data.fatal && player) {
              player.src = grant.hlsUrl;
            }
          });
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
        const n = await api<{ items: Array<{ _id: string; timestampSec: number; body: string }> }>(`/api/videos/${videoId}/notes`);
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
    <div className="space-y-3 max-w-2xl mx-auto">
      {/* Video Screen Container */}
      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-black shadow-xl aspect-video w-full relative">
        {error ? (
          <div className="absolute inset-0 flex items-center justify-center p-6 bg-slate-950/90 text-red-300 text-sm z-10">
            <p className="max-w-md text-center bg-red-950/80 p-4 rounded-xl border border-red-800/80">{error}</p>
          </div>
        ) : null}

        <video
          ref={videoRef}
          className="h-full w-full bg-black object-contain"
          controls
          playsInline
          controlsList="nodownload"
          preload="metadata"
          crossOrigin="anonymous"
        />
      </div>

      {/* Playback Controls & Features Bar (Directly below video matching reference image) */}
      <div className="rounded-2xl border border-slate-200 bg-white p-2.5 sm:p-3 shadow-xs">
        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
          {/* Speed Selector */}
          <div className="relative inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-100/70 px-3 py-2 transition shadow-2xs cursor-pointer">
            <Gauge className="h-4 w-4 text-amber-600 shrink-0" />
            <span className="text-xs sm:text-[13px] font-semibold text-slate-900">
              Speed: <span className="font-bold">{rate}x</span>
            </span>
            <ChevronDown className="h-3.5 w-3.5 text-slate-700 shrink-0" />
            <select
              aria-label="Playback speed"
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full text-xs"
              value={rate}
              onChange={(e) => setRate(Number(e.target.value))}
              suppressHydrationWarning
            >
              {[0.5, 0.75, 1, 1.25, 1.5, 1.75, 2].map((s) => (
                <option key={s} value={s} className="bg-white text-slate-900">
                  {s}x
                </option>
              ))}
            </select>
          </div>

          {/* Picture in Picture */}
          <button
            type="button"
            onClick={() => void pip()}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50/80 px-3 py-2 text-xs sm:text-[13px] font-semibold text-slate-900 shadow-2xs transition cursor-pointer"
            title="Pop out video player"
          >
            <Maximize2 className="h-4 w-4 text-slate-600 shrink-0" />
            <span>Picture-in-picture</span>
          </button>

          {/* Notes Toggle */}
          <button
            type="button"
            onClick={() => setShowNotes((v) => !v)}
            className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs sm:text-[13px] font-semibold shadow-2xs transition cursor-pointer ${
              showNotes
                ? 'border-amber-500 bg-amber-50 text-amber-900'
                : 'border-slate-200 bg-white text-slate-900 hover:bg-slate-50/80'
            }`}
            title="Open personal video notes"
          >
            <FileText className="h-4 w-4 text-amber-600 shrink-0" />
            <span>Notes</span>
            {notes.length > 0 && (
              <span className="ml-0.5 rounded-full bg-amber-200/90 px-1.5 py-0.2 text-[10px] font-bold text-amber-900">
                {notes.length}
              </span>
            )}
          </button>

          {/* Download for offline */}
          <button
            type="button"
            onClick={() => void downloadOffline()}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50/80 px-3 py-2 text-xs sm:text-[13px] font-semibold text-slate-900 shadow-2xs transition cursor-pointer"
            title="Download encrypted lecture for offline study"
          >
            <Download className="h-4 w-4 text-slate-600 shrink-0" />
            <span>Download for offline</span>
          </button>
        </div>
      </div>

      {/* Video Title and Teacher Name (Below controls bar) */}
      <div className="px-1 py-1">
        <h3 className="font-display text-lg font-bold text-slate-900 truncate" title={title || 'Lecture Video'}>
          {title || 'Lecture Video'}
        </h3>
        {teacherName && (
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            By {teacherName}
          </p>
        )}
      </div>

      {/* Notes Section */}
      {showNotes && (
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <h4 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-1.5">
            <FileText className="h-4 w-4 text-amber-600" />
            Lecture Notes
          </h4>
          <form onSubmit={addNote} className="grid gap-2">
            <Textarea
              name="body"
              label="Note at current timestamp"
              placeholder="Write a note or reminder for this video lecture..."
              required
            />
            <div className="flex justify-end">
              <Button type="submit" variant="primary" className="text-xs px-3 py-1.5">
                Save Note
              </Button>
            </div>
          </form>
          {notes.length > 0 && (
            <ul className="mt-3 space-y-2 text-sm border-t border-slate-100 pt-3">
              {notes.map((n) => (
                <li key={n._id} className="flex items-start gap-2 p-2 rounded-lg bg-slate-50 border border-slate-200">
                  <button
                    type="button"
                    className="inline-flex items-center gap-0.5 rounded px-2 py-0.5 text-xs font-bold text-amber-800 bg-amber-100/90 hover:bg-amber-200 shrink-0 cursor-pointer"
                    onClick={() => {
                      if (videoRef.current) videoRef.current.currentTime = n.timestampSec;
                    }}
                    title="Jump to timestamp"
                  >
                    <Clock className="h-3 w-3 text-amber-700" />
                    {Math.floor(n.timestampSec)}s
                  </button>
                  <span className="text-xs text-slate-800 flex-1 leading-relaxed">{n.body}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
