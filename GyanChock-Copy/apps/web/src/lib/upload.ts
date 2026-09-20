import { FILE_LIMITS } from '@gyan-chowk/shared';
import { api } from './api';

type Folder = 'banners' | 'courses' | 'cms' | 'avatars' | 'blogs';

export async function uploadCloudinaryImage(file: File, folder: Folder) {
  const maxBytes = FILE_LIMITS.imageMb * 1024 * 1024;
  if (!file.type.startsWith('image/')) {
    throw new Error('Choose a JPG, PNG, WebP or GIF image.');
  }
  if (file.size > maxBytes) {
    throw new Error(`Image must be under ${FILE_LIMITS.imageMb} MB.`);
  }
  const sig = await api<{
    timestamp: number;
    signature: string;
    folder: string;
    cloudName: string;
    apiKey: string;
    resourceType: string;
    type?: string;
  }>('/api/uploads/signature', {
    method: 'POST',
    body: JSON.stringify({ folder, resourceType: 'image' }),
  });
  const fd = new FormData();
  fd.append('file', file);
  fd.append('api_key', sig.apiKey);
  fd.append('timestamp', String(sig.timestamp));
  fd.append('signature', sig.signature);
  fd.append('folder', sig.folder);
  if (sig.type) fd.append('type', sig.type);
  const cloud = await fetch(`https://api.cloudinary.com/v1_1/${sig.cloudName}/image/upload`, {
    method: 'POST',
    body: fd,
  });
  const json = (await cloud.json()) as {
    public_id?: string;
    secure_url?: string;
    error?: { message?: string };
  };
  if (!json.public_id || !json.secure_url) {
    throw new Error(json.error?.message || 'Upload failed. Check Cloudinary credentials.');
  }
  return { publicId: json.public_id, url: json.secure_url };
}
