'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ImagePlus, Pencil, Trash2 } from 'lucide-react';
import { api } from '@/lib/api';
import { uploadCloudinaryImage } from '@/lib/upload';
import { toast } from '@/lib/toast';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/Overlay';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/States';

type Media = { publicId?: string; url?: string };
type CourseCover = {
  _id: string;
  title: string;
  thumbnail?: Media;
};

export function CourseCoverManager() {
  const query = useQuery({
    queryKey: ['admin-course-covers'],
    queryFn: () => api<{ items: CourseCover[] }>('/api/courses?mine=1&limit=40'),
  });
  const items = query.data?.items ?? [];
  const [busyId, setBusyId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  async function saveCover(id: string, thumbnail: Media | null) {
    setBusyId(id);
    try {
      await api(`/api/courses/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ thumbnail }),
      });
      toast.success(thumbnail ? 'Course image saved.' : 'Course image removed.');
      await query.refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not update image.');
    } finally {
      setBusyId(null);
    }
  }

  async function onFile(id: string, file: File) {
    setBusyId(id);
    try {
      const media = await uploadCloudinaryImage(file, 'courses');
      await saveCover(id, media);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Upload failed.');
      setBusyId(null);
    }
  }

  return (
    <section className="mt-10 space-y-4">
      <div>
        <h2 className="font-display text-2xl text-gc-black">Course cover images</h2>
        <p className="mt-1 text-sm text-gc-mute">
          These images appear on Featured courses and the catalogue. Add, replace, or delete a cover without changing course content.
        </p>
      </div>
      {query.isLoading ? <LoadingState label="Loading course images…" /> : null}
      {query.isError ? <ErrorState message="Unable to load courses." onRetry={() => void query.refetch()} /> : null}
      {!query.isLoading && !query.isError && items.length === 0 ? (
        <EmptyState title="No courses yet" body="Create a course first, then upload its cover image here." />
      ) : null}
      {items.length ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((course) => (
            <article key={course._id} className="gc-card overflow-hidden">
              <div className="gc-course-media h-40">
                {course.thumbnail?.url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={course.thumbnail.url} alt="" />
                ) : (
                  <div className="grid h-full place-items-center text-sm text-white/80">No image yet</div>
                )}
              </div>
              <div className="space-y-3 p-4">
                <p className="font-display text-lg text-gc-black">{course.title}</p>
                <div className="flex flex-wrap gap-2">
                  <label className="gc-btn-outline h-9 cursor-pointer px-3 text-xs">
                    {course.thumbnail?.url ? (
                      <>
                        <Pencil size={14} /> Replace
                      </>
                    ) : (
                      <>
                        <ImagePlus size={14} /> Add image
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      disabled={busyId === course._id}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) void onFile(course._id, file);
                        e.currentTarget.value = '';
                      }}
                    />
                  </label>
                  {course.thumbnail?.url ? (
                    <Button
                      type="button"
                      variant="ghost"
                      className="h-9 px-3 text-xs"
                      disabled={busyId === course._id}
                      onClick={() => setDeleteId(course._id)}
                    >
                      <Trash2 size={14} /> Delete
                    </Button>
                  ) : null}
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : null}
      <ConfirmDialog
        open={Boolean(deleteId)}
        title="Delete course image?"
        body="The cover is removed from the landing page and catalogue. You can upload a new image later."
        confirmLabel="Delete"
        loading={busyId === deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => {
          if (!deleteId) return;
          void saveCover(deleteId, null).then(() => setDeleteId(null));
        }}
      />
    </section>
  );
}
