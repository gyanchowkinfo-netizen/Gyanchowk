import { getCloudinary, isCloudinaryConfigured } from '../config/cloudinary.js';
import { VideoModel, VideoProgressModel } from '../models/index.js';
import { forbidden, notFound } from '../utils/errors.js';
import { assertEnrollment } from './enrollment.service.js';
import type { PlaybackGrant } from '@gyan-chowk/shared';

const SIGNED_TTL_SEC = 60 * 15;

export function signImageUrl(publicId: string, opts?: { width?: number; crop?: string }) {
  if (!isCloudinaryConfigured()) return '';
  return getCloudinary().url(publicId, {
    sign_url: true,
    type: 'authenticated',
    transformation: [
      { width: opts?.width ?? 800, crop: opts?.crop ?? 'fill', quality: 'auto', fetch_format: 'auto' },
    ],
  });
}

export function signHlsUrl(publicId: string): string {
  if (!isCloudinaryConfigured()) {
    return '';
  }
  return getCloudinary().url(publicId, {
    resource_type: 'video',
    sign_url: true,
    type: 'authenticated',
    streaming_profile: 'hd',
    format: 'm3u8',
    expires_at: Math.floor(Date.now() / 1000) + SIGNED_TTL_SEC,
  });
}

export function signPosterUrl(publicId: string): string {
  if (!isCloudinaryConfigured()) return '';
  return getCloudinary().url(publicId, {
    resource_type: 'video',
    sign_url: true,
    type: 'authenticated',
    format: 'jpg',
    transformation: [{ width: 1280, crop: 'fill', quality: 'auto' }],
  });
}

export async function grantPlayback(input: {
  userId: string;
  role: string;
  videoId: string;
}): Promise<PlaybackGrant> {
  const video = await VideoModel.findById(input.videoId);
  if (!video) throw notFound('Video not found');

  if (!video.isDemo) {
    await assertEnrollment(input.userId, input.role, { courseId: String(video.course) });
  } else if (!input.userId && !video.isDemo) {
    throw forbidden();
  }

  const progress = await VideoProgressModel.findOne({
    user: input.userId,
    video: video._id,
  }).lean();

  const hlsUrl = signHlsUrl(video.publicId);
  const posterUrl = video.posterPublicId
    ? signPosterUrl(video.posterPublicId)
    : signPosterUrl(video.publicId);

  return {
    videoId: String(video._id),
    hlsUrl,
    posterUrl,
    duration: video.duration ?? undefined,
    subtitles: (video.subtitles ?? []).map((s) => ({
      label: s.label ?? 'English',
      srclang: s.srclang ?? 'en',
      src: s.publicId ? signHlsUrl(s.publicId) : '',
    })),
    resumeAt: progress?.positionSec ?? 0,
  };
}

export async function saveProgress(input: {
  userId: string;
  videoId: string;
  positionSec: number;
  durationSec: number;
}) {
  const video = await VideoModel.findById(input.videoId);
  if (!video) throw notFound('Video not found');
  const completed = input.durationSec > 0 && input.positionSec / input.durationSec >= 0.9;
  await VideoProgressModel.findOneAndUpdate(
    { user: input.userId, video: video._id },
    {
      $set: {
        course: video.course,
        positionSec: Math.max(0, input.positionSec),
        durationSec: input.durationSec,
        completed,
        lastWatchedAt: new Date(),
      },
    },
    { upsert: true },
  );
  return { ok: true, completed };
}

export function uploadSignature(folder: string, resourceType: 'image' | 'video' | 'raw') {
  if (!isCloudinaryConfigured()) {
    throw new Error('Cloudinary is not configured');
  }
  const timestamp = Math.round(Date.now() / 1000);
  const eager =
    resourceType === 'video' ? 'sp_hd/m3u8' : undefined;
  const params: Record<string, string | number> = {
    timestamp,
    folder: `gyan-chowk/${folder}`,
    type: 'authenticated',
  };
  if (eager) params.eager = eager;
  const signature = getCloudinary().utils.api_sign_request(
    params,
    getCloudinary().config().api_secret as string,
  );
  return {
    timestamp,
    signature,
    folder: params.folder,
    eager,
    resourceType,
    cloudName: getCloudinary().config().cloud_name,
    apiKey: getCloudinary().config().api_key,
  };
}
