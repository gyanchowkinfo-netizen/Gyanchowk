'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  X,
  Plus,
  Trash2,
  ImagePlus,
  Save,
  BookOpen,
  ArrowUp,
  ArrowDown,
  Sparkles,
  Link as LinkIcon,
} from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { toast } from '@/lib/toast';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Overlay';
import { uploadCloudinaryImage } from '@/lib/upload';
import type { TeacherCardData } from '@/lib/types';

export interface FeaturedCourseItem {
  title: string;
  subject?: string;
  modulesCount?: number;
  durationHours?: number;
  rating?: number;
  price?: number;
  url?: string;
  thumbnail?: string;
}

const DEFAULT_COURSES: FeaturedCourseItem[] = [
  {
    title: 'Organic Chemistry Complete Course',
    subject: 'Chemistry',
    modulesCount: 12,
    durationHours: 45,
    rating: 5.0,
    thumbnail: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=120&q=80',
    url: '/courses',
  },
  {
    title: 'Inorganic Chemistry Mastery',
    subject: 'Chemistry',
    modulesCount: 10,
    durationHours: 38,
    rating: 5.0,
    thumbnail: 'https://images.unsplash.com/photo-1603126857599-f6e157fa2fe6?auto=format&fit=crop&w=120&q=80',
    url: '/courses',
  },
  {
    title: 'Physical Chemistry Concepts',
    subject: 'Chemistry',
    modulesCount: 8,
    durationHours: 32,
    rating: 5.0,
    thumbnail: 'https://images.unsplash.com/photo-1507668077129-56e32842fceb?auto=format&fit=crop&w=120&q=80',
    url: '/courses',
  },
];

export function TeacherCourseManagerModal({
  teacher,
  open,
  onClose,
  onSaved,
}: {
  teacher: TeacherCardData;
  open: boolean;
  onClose: () => void;
  onSaved?: () => void;
}) {
  const queryClient = useQueryClient();
  const [courses, setCourses] = useState<FeaturedCourseItem[]>([]);
  const [saving, setSaving] = useState(false);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);

  useEffect(() => {
    if (!open) return;
    if (teacher.customCourses && teacher.customCourses.length > 0) {
      setCourses(JSON.parse(JSON.stringify(teacher.customCourses)));
    } else {
      setCourses(JSON.parse(JSON.stringify(DEFAULT_COURSES)));
    }
  }, [open, teacher]);

  function addCourse() {
    setCourses((prev) => [
      ...prev,
      {
        title: '',
        subject: teacher.subject || 'Chemistry',
        modulesCount: 10,
        durationHours: 30,
        rating: 5.0,
        url: '/courses',
        thumbnail: '',
      },
    ]);
  }

  function updateCourse(index: number, patch: Partial<FeaturedCourseItem>) {
    setCourses((prev) =>
      prev.map((c, i) => (i === index ? { ...c, ...patch } : c)),
    );
  }

  function removeCourse(index: number) {
    setCourses((prev) => prev.filter((_, i) => i !== index));
  }

  function moveCourse(index: number, direction: 'up' | 'down') {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === courses.length - 1)
    ) {
      return;
    }
    const target = direction === 'up' ? index - 1 : index + 1;
    const next = [...courses];
    const temp = next[index];
    next[index] = next[target];
    next[target] = temp;
    setCourses(next);
  }

  async function handleImageUpload(index: number, file: File) {
    setUploadingIndex(index);
    try {
      const res = await uploadCloudinaryImage(file, 'courses');
      updateCourse(index, { thumbnail: res.url });
      toast.success('Course logo image updated');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Logo upload failed');
    } finally {
      setUploadingIndex(null);
    }
  }

  async function handleSave() {
    // Validate titles
    const empty = courses.find((c) => !c.title?.trim());
    if (empty) {
      toast.error('All courses must have a title');
      return;
    }

    setSaving(true);
    try {
      await api(`/api/admin/teachers/${teacher._id}`, {
        method: 'PUT',
        body: JSON.stringify({ customCourses: courses }),
      });
      toast.success('Featured courses saved successfully');
      await queryClient.invalidateQueries({ queryKey: ['teacher-profile', teacher.slug] });
      await queryClient.invalidateQueries({ queryKey: ['teacher-profile', teacher._id] });
      await queryClient.invalidateQueries({ queryKey: ['teachers-list'] });
      onSaved?.();
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save courses');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Manage Featured Courses: ${teacher.name}`}
    >
      <div className="flex flex-col max-h-[80vh] w-full max-w-3xl">
        <div className="flex items-center justify-between border-b border-stone-200 pb-3 mb-4">
          <div>
            <p className="text-xs font-semibold text-stone-900">
              Featured Courses on Profile
            </p>
            <p className="text-[11px] text-stone-500">
              Add, edit details, update logo image, reorder, or delete featured courses.
            </p>
          </div>

          <Button type="button" onClick={addCourse}>
            <Plus className="h-4 w-4 mr-1" />
            Add Course
          </Button>
        </div>

        {/* Scrollable Course Cards */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-4">
          {courses.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-stone-300 p-8 text-center bg-stone-50">
              <BookOpen className="mx-auto h-8 w-8 text-stone-400 mb-2" />
              <p className="text-xs font-semibold text-stone-700">No featured courses added</p>
              <p className="text-[11px] text-stone-500 mt-1">
                Click &quot;Add Course&quot; to showcase courses on this teacher&apos;s page.
              </p>
              <div className="mt-4">
                <Button type="button" onClick={addCourse}>
                  <Plus className="h-4 w-4 mr-1" /> Add First Course
                </Button>
              </div>
            </div>
          ) : (
            courses.map((c, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm space-y-3 transition hover:border-amber-300"
              >
                {/* Header row with order & delete */}
                <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-100 text-[11px] font-bold text-amber-900">
                      {idx + 1}
                    </span>
                    <span className="text-xs font-bold text-stone-800">
                      {c.title || 'Untitled Course'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => moveCourse(idx, 'up')}
                      disabled={idx === 0}
                      title="Move up"
                      className="p-1 rounded text-stone-400 hover:text-stone-700 disabled:opacity-30"
                    >
                      <ArrowUp className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveCourse(idx, 'down')}
                      disabled={idx === courses.length - 1}
                      title="Move down"
                      className="p-1 rounded text-stone-400 hover:text-stone-700 disabled:opacity-30"
                    >
                      <ArrowDown className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeCourse(idx)}
                      title="Delete course"
                      className="p-1 rounded text-red-500 hover:bg-red-50 hover:text-red-700 ml-1"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Main Inputs Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                      Course Title <span className="text-red-500">*</span>
                    </label>
                    <Input
                      value={c.title}
                      onChange={(e) => updateCourse(idx, { title: e.target.value })}
                      placeholder="e.g. Organic Chemistry Complete Course"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                      Subject
                    </label>
                    <Input
                      value={c.subject || ''}
                      onChange={(e) => updateCourse(idx, { subject: e.target.value })}
                      placeholder="e.g. Chemistry"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                        Modules Count
                      </label>
                      <Input
                        type="number"
                        min="1"
                        value={String(c.modulesCount ?? 10)}
                        onChange={(e) =>
                          updateCourse(idx, {
                            modulesCount: parseInt(e.target.value, 10) || 0,
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                        Duration (Hours)
                      </label>
                      <Input
                        type="number"
                        min="1"
                        value={String(c.durationHours ?? 40)}
                        onChange={(e) =>
                          updateCourse(idx, {
                            durationHours: parseInt(e.target.value, 10) || 0,
                          })
                        }
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                      Course Link / URL
                    </label>
                    <Input
                      value={c.url || ''}
                      onChange={(e) => updateCourse(idx, { url: e.target.value })}
                      placeholder="e.g. /courses/organic-chemistry"
                    />
                  </div>
                </div>

                {/* Logo Image Management Section */}
                <div className="rounded-xl border border-stone-100 bg-stone-50 p-3">
                  <label className="block text-[11px] font-bold text-stone-700 mb-2">
                    Course Logo / Thumbnail Image
                  </label>

                  <div className="flex flex-wrap items-center gap-3">
                    {c.thumbnail ? (
                      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-stone-200 bg-white">
                        <Image
                          src={c.thumbnail}
                          alt="Course Logo"
                          fill
                          className="object-cover"
                          sizes="56px"
                        />
                        <button
                          type="button"
                          onClick={() => updateCourse(idx, { thumbnail: '' })}
                          title="Remove logo"
                          className="absolute right-0.5 top-0.5 rounded-full bg-red-600 p-0.5 text-white shadow hover:bg-red-700"
                        >
                          <X className="h-2.5 w-2.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-dashed border-stone-300 bg-white text-stone-400">
                        <BookOpen className="h-5 w-5" />
                      </div>
                    )}

                    <div className="flex flex-col gap-1.5">
                      <label className="cursor-pointer inline-flex items-center gap-1.5 rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-xs font-semibold text-stone-700 shadow-sm transition hover:bg-stone-50">
                        <ImagePlus className="h-3.5 w-3.5 text-stone-500" />
                        <span>
                          {uploadingIndex === idx
                            ? 'Uploading...'
                            : c.thumbnail
                            ? 'Replace Logo Image'
                            : 'Upload Logo Image'}
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          disabled={uploadingIndex === idx}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) void handleImageUpload(idx, file);
                          }}
                        />
                      </label>
                      <p className="text-[10px] text-stone-400">
                        Square logo or icon recommended (JPG, PNG, WebP)
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal Actions */}
        <div className="mt-4 flex items-center justify-end gap-2.5 border-t border-stone-200 pt-3">
          <Button variant="ghost" type="button" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSave} disabled={saving}>
            <Save className="h-4 w-4 mr-1.5" />
            {saving ? 'Saving...' : 'Save Featured Courses'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
