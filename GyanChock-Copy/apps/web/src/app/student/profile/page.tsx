'use client';

import { useState, useRef, FormEvent, ChangeEvent } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { toast } from '@/lib/toast';
import { uploadCloudinaryImage } from '@/lib/upload';
import { LoadingState } from '@/components/ui/States';
import { PageHeader } from '@/components/panel/ResourceManager';
import {
  Pencil,
  Loader2,
  Check,
  X,
  Mail,
  BookOpen,
  Award,
  GraduationCap,
  Trash2,
} from 'lucide-react';

export default function StudentProfilePage() {
  const { user, refresh } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [savingName, setSavingName] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const enrollments = useQuery({
    queryKey: ['enrollments'],
    queryFn: () => api<{ items: unknown[] }>('/api/learning/enrollments'),
  });

  const certs = useQuery({
    queryKey: ['certs'],
    queryFn: () => api<{ items: unknown[] }>('/api/learning/certificates'),
  });

  if (!user) return <LoadingState />;

  const initials = (user.name || 'Student')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase();

  // Save updated name
  async function handleSaveName(e?: FormEvent) {
    if (e) e.preventDefault();
    const trimmed = nameInput.trim();
    if (!trimmed || trimmed.length < 2) {
      toast.error('Name must be at least 2 characters long.');
      return;
    }
    if (trimmed.length > 80) {
      toast.error('Name cannot exceed 80 characters.');
      return;
    }
    if (trimmed === user?.name) {
      setIsEditingName(false);
      return;
    }

    setSavingName(true);
    try {
      await api('/api/auth/me', {
        method: 'PATCH',
        body: JSON.stringify({ name: trimmed }),
      });
      await refresh();
      setIsEditingName(false);
      toast.success('Name updated successfully!');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update name');
    } finally {
      setSavingName(false);
    }
  }

  function handleCancelEdit() {
    setNameInput(user?.name || '');
    setIsEditingName(false);
  }

  // Handle avatar upload / change / add
  async function handleAvatarChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please choose a valid image file (PNG, JPG, WebP, GIF)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be under 5MB');
      return;
    }

    setUploadingAvatar(true);
    try {
      let avatarData: { publicId: string; url?: string };
      try {
        // Attempt upload to Cloudinary via server signature
        avatarData = await uploadCloudinaryImage(file, 'avatars');
      } catch {
        // Fallback to local Data URL if Cloudinary is not configured in local environment
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
        avatarData = {
          publicId: `avatar_${Date.now()}`,
          url: dataUrl,
        };
      }

      await api('/api/auth/me', {
        method: 'PATCH',
        body: JSON.stringify({ avatar: avatarData }),
      });

      await refresh();
      toast.success('Profile picture updated successfully!');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update profile picture');
    } finally {
      setUploadingAvatar(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }

  // Remove profile picture
  async function handleRemoveAvatar() {
    if (!confirm('Are you sure you want to remove your profile picture?')) return;
    setUploadingAvatar(true);
    try {
      await api('/api/auth/me', {
        method: 'PATCH',
        body: JSON.stringify({ avatar: { publicId: '', url: '' } }),
      });
      await refresh();
      toast.success('Profile picture removed');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to remove profile picture');
    } finally {
      setUploadingAvatar(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Profile" subtitle="A snapshot of your Gyan Chowk account." />

      {/* Main Profile Info Card */}
      <div className="gc-card p-6">
        <div className="flex flex-col items-center gap-6 text-center sm:flex-row sm:items-center sm:text-left">
          {/* Avatar with Round Pencil Button */}
          <div className="relative inline-block shrink-0">
            <div className="relative h-24 w-24 overflow-hidden rounded-full border-4 border-white shadow-md ring-1 ring-gc-line sm:h-28 sm:w-28">
              {user.avatar?.url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.avatar.url}
                  alt={user.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-stone-900 font-display text-2xl font-bold tracking-wider text-amber-200 sm:text-3xl">
                  {initials}
                </div>
              )}

              {uploadingAvatar && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-[1px]">
                  <Loader2 className="h-6 w-6 animate-spin text-white" />
                </div>
              )}
            </div>

            {/* Round Pencil Action Button for Photo Add / Update / Change */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingAvatar}
              title={user.avatar?.url ? 'Change profile picture' : 'Add profile picture'}
              aria-label="Change profile picture"
              className="absolute bottom-0 right-0 flex h-9 w-9 items-center justify-center rounded-full bg-stone-900 text-amber-300 shadow-md ring-2 ring-white transition-all hover:scale-110 hover:bg-stone-800 active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {uploadingAvatar ? (
                <Loader2 className="h-4 w-4 animate-spin text-amber-200" />
              ) : (
                <Pencil className="h-4 w-4 stroke-[2.2]" />
              )}
            </button>

            {/* Hidden File Input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </div>

          {/* Name & Account Details */}
          <div className="min-w-0 flex-1">
            {isEditingName ? (
              <form onSubmit={handleSaveName} className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  autoFocus
                  placeholder="Enter your name"
                  maxLength={80}
                  disabled={savingName}
                  className="h-10 rounded-lg border border-gc-line bg-white px-3 font-display text-lg font-semibold text-gc-black shadow-sm focus:border-gc-blue focus:outline-none focus:ring-1 focus:ring-gc-blue"
                />
                <button
                  type="submit"
                  disabled={savingName || !nameInput.trim()}
                  className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-gc-blue px-4 text-xs font-semibold text-white shadow transition hover:opacity-95 disabled:opacity-50 cursor-pointer"
                >
                  {savingName ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Check className="h-3.5 w-3.5 stroke-[2.5]" />
                  )}
                  <span>Save</span>
                </button>
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  disabled={savingName}
                  className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-gc-line bg-white px-3 text-xs font-medium text-stone-600 transition hover:bg-stone-50 disabled:opacity-50 cursor-pointer"
                >
                  <X className="h-3.5 w-3.5" />
                  <span>Cancel</span>
                </button>
              </form>
            ) : (
              <div className="flex flex-wrap items-center justify-center gap-2.5 sm:justify-start">
                <h2 className="font-display text-2xl font-bold text-gc-black sm:text-3xl">
                  {user.name}
                </h2>
                <button
                  type="button"
                  onClick={() => {
                    setNameInput(user.name);
                    setIsEditingName(true);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-full border border-gc-line bg-white px-3 py-1 text-xs font-medium text-stone-700 shadow-sm transition hover:border-gc-blue hover:text-gc-blue active:scale-95 cursor-pointer"
                  title="Edit name"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  <span>Edit name</span>
                </button>
              </div>
            )}

            <p className="mt-1 flex items-center justify-center gap-1.5 text-sm text-gc-mute sm:justify-start">
              <Mail className="h-4 w-4 shrink-0 text-stone-400" />
              <span>{user.email}</span>
            </p>

            <div className="mt-3 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
              <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-800">
                <GraduationCap className="h-3.5 w-3.5" />
                Student
              </span>
              {user.avatar?.url && !uploadingAvatar && (
                <button
                  type="button"
                  onClick={handleRemoveAvatar}
                  className="inline-flex items-center gap-1 rounded-full border border-red-200 bg-red-50/70 px-2.5 py-0.5 text-xs font-medium text-red-600 transition hover:bg-red-100 active:scale-95 cursor-pointer"
                  title="Remove profile picture"
                >
                  <Trash2 className="h-3 w-3" />
                  <span>Remove picture</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Courses & Certificates Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          href="/student/courses"
          className="gc-card group block p-5 transition-all hover:border-gc-blue hover:shadow-sm"
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-gc-mute">Purchased courses</p>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-gc-blue transition group-hover:scale-110">
              <BookOpen className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 font-display text-3xl font-bold text-gc-black">
            {enrollments.data?.items.length ?? 0}
          </p>
          <p className="mt-2 text-xs text-gc-blue group-hover:underline">View enrolled courses &rarr;</p>
        </Link>

        <Link
          href="/student/certificates"
          className="gc-card group block p-5 transition-all hover:border-gc-blue hover:shadow-sm"
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-gc-mute">Certificates</p>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-50 text-amber-600 transition group-hover:scale-110">
              <Award className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 font-display text-3xl font-bold text-gc-black">
            {certs.data?.items.length ?? 0}
          </p>
          <p className="mt-2 text-xs text-amber-600 group-hover:underline">View certificates &rarr;</p>
        </Link>
      </div>
    </div>
  );
}
