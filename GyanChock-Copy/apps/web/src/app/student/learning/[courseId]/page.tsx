'use client';

import { useParams, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { api, downloadPdf } from '@/lib/api';
import { VideoPlayer } from '@/components/player/VideoPlayer';
import { LoadingState, EmptyState, ErrorState } from '@/components/ui/States';
import { ProgressBar } from '@/components/ui/Badge';
import { useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import {
  CheckCircle2,
  Circle,
  PlayCircle,
  Play,
  X,
  FileText,
  HelpCircle,
  Download,
  BookOpen,
  ChevronRight,
  FolderOpen,
  Layers,
  ArrowLeft,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { toast } from '@/lib/toast';

type Lesson = {
  _id: string;
  title: string;
  topic?: string;
  chapter?: string;
  subject?: string;
  video?: string | { _id: string; publicId?: string; title?: string };
  duration?: number;
  isDemo?: boolean;
  order?: number;
};

type VideoMeta = {
  _id: string;
  title: string;
  lesson?: string;
  topic?: string;
  subject?: string;
  isDemo?: boolean;
  duration?: number;
  publicId?: string;
};

type Topic = {
  _id: string;
  name?: string;
  title?: string;
  subject?: string;
  chapter?: string;
  order?: number;
};

type Chapter = {
  _id: string;
  name?: string;
  title?: string;
  subject?: string;
  order?: number;
};

type Subject = {
  _id: string;
  name?: string;
  title?: string;
  order?: number;
};

type Material = {
  _id: string;
  title: string;
  type: string;
  url?: string;
  bytes?: number;
  subject?: string;
  topic?: string;
};

export default function CourseClassroom() {
  const { courseId } = useParams<{ courseId: string }>();
  const searchParams = useSearchParams();
  const isPreview = searchParams.get('preview') === '1' || searchParams.get('preview') === 'true';

  const [activeTab, setActiveTab] = useState<'video' | 'materials' | 'doubts'>('video');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('all');
  const [selectedLessonId, setSelectedLessonId] = useState<string>('');
  const [isOpenVideo, setIsOpenVideo] = useState<boolean>(false);
  const [markingDone, setMarkingDone] = useState(false);

  // 1. Fetch Course details, syllabus hierarchy (subjects, topics, lessons)
  const courseQuery = useQuery({
    queryKey: ['classroom', courseId, isPreview],
    queryFn: async () => {
      let slug = courseId;
      if (!isPreview) {
        const enrollments = await api<{ items: Array<{ course?: { _id: string; slug: string; title: string } }> }>(
          '/api/learning/enrollments',
        );
        const match = enrollments.items.find((e) => e.course && (e.course._id === courseId || e.course.slug === courseId));
        slug = match?.course?.slug || '';
        if (!slug) throw new Error('You are not enrolled in this course');
      } else {
        if (/^[0-9a-fA-F]{24}$/.test(courseId)) {
          const byId = await api<{ course: { slug: string } }>(`/api/courses/by-id/${courseId}`);
          slug = byId.course.slug;
        }
      }
      const detail = await api<{
        course: { title: string; _id: string; slug: string; description?: string };
        subjects?: Subject[];
        chapters?: Chapter[];
        topics?: Topic[];
        lessons: Lesson[];
        videos?: VideoMeta[];
      }>(`/api/courses/${slug}`);
      return { ...detail, slug };
    },
  });

  // 2. Fetch Student's Course Progress
  const progressQuery = useQuery({
    queryKey: ['student-progress', courseQuery.data?.course._id],
    enabled: Boolean(courseQuery.data?.course._id) && !isPreview,
    queryFn: () => api<{ items: Array<{ course: string; completedLessons?: string[]; percent?: number }> }>('/api/learning/progress'),
  });

  // 3. Fetch Course Study Materials
  const materialsQuery = useQuery({
    queryKey: ['classroom-materials', courseQuery.data?.course._id],
    enabled: Boolean(courseQuery.data?.course._id),
    queryFn: () => {
      const cId = courseQuery.data?.course._id;
      return api<{ items: Material[] }>(`/api/learning/materials?course=${cId}&limit=50`);
    },
  });

  const course = courseQuery.data?.course;
  const subjects = courseQuery.data?.subjects ?? [];
  const chapters = courseQuery.data?.chapters ?? [];
  const topics = courseQuery.data?.topics ?? [];
  const allLessons = courseQuery.data?.lessons ?? [];
  const materials = materialsQuery.data?.items ?? [];

  const teacherName = useMemo(() => {
    const teachers = (course as any)?.teachers;
    if (Array.isArray(teachers) && teachers.length > 0) {
      const first = teachers[0];
      if (typeof first === 'object' && first?.name) return first.name;
      if (typeof first === 'string' && first.trim()) return first;
    }
    const single = (course as any)?.teacher;
    if (typeof single === 'object' && single?.name) return single.name;
    if (typeof single === 'string' && single.trim()) return single;
    return 'Tarun Pratap Singh';
  }, [course]);

  // Completed lessons set
  const completedLessonIds = useMemo(() => {
    if (!progressQuery.data?.items || !course) return new Set<string>();
    const rec = progressQuery.data.items.find((p) => String(p.course) === String(course._id));
    return new Set(rec?.completedLessons?.map(String) ?? []);
  }, [progressQuery.data, course]);

  // Topics belonging to selected subject
  const subjectTopics = useMemo(() => {
    if (selectedSubjectId === 'all') return topics;
    const matchingChapterIds = new Set(
      chapters.filter((c) => String(c.subject) === selectedSubjectId).map((c) => String(c._id)),
    );
    return topics.filter((t) => {
      if (t.subject && String(t.subject) === selectedSubjectId) return true;
      if (t.chapter && matchingChapterIds.has(String(t.chapter))) return true;
      return allLessons.some(
        (l) =>
          l.topic &&
          String(l.topic) === String(t._id) &&
          (String(l.subject) === selectedSubjectId || (l.chapter && matchingChapterIds.has(String(l.chapter)))),
      );
    });
  }, [selectedSubjectId, topics, chapters, allLessons]);

  const subjectTopicIds = useMemo(() => new Set(subjectTopics.map((t) => String(t._id))), [subjectTopics]);

  // Filter lessons based on selected subject
  const filteredLessons = useMemo(() => {
    if (selectedSubjectId === 'all') return allLessons;
    const matchingChapterIds = new Set(
      chapters.filter((c) => String(c.subject) === selectedSubjectId).map((c) => String(c._id)),
    );
    return allLessons.filter((l) => {
      if (l.subject && String(l.subject) === selectedSubjectId) return true;
      if (l.chapter && matchingChapterIds.has(String(l.chapter))) return true;
      if (l.topic && subjectTopicIds.has(String(l.topic))) return true;
      return false;
    });
  }, [allLessons, selectedSubjectId, chapters, subjectTopicIds]);

  // Sync selectedLessonId when subject changes
  useEffect(() => {
    if (filteredLessons.length > 0) {
      const isCurrentInFiltered = filteredLessons.some((l) => l._id === selectedLessonId);
      if (!isCurrentInFiltered) {
        setSelectedLessonId(filteredLessons[0]._id);
      }
    }
  }, [selectedSubjectId, filteredLessons, selectedLessonId]);

  // Current selected lesson
  const currentLesson = useMemo(() => {
    if (selectedLessonId) {
      const match = allLessons.find((l) => l._id === selectedLessonId);
      if (match) return match;
    }
    return filteredLessons[0] || allLessons[0];
  }, [selectedLessonId, allLessons, filteredLessons]);

  // Current video id (from lesson.video or matched course video)
  const currentVideoId = useMemo(() => {
    if (currentLesson?.video) {
      if (typeof currentLesson.video === 'object') {
        return (currentLesson.video as any)._id || (currentLesson.video as any).publicId || '';
      }
      return String(currentLesson.video);
    }
    const matching = courseQuery.data?.videos?.find(
      (v) => v.lesson && String(v.lesson) === String(currentLesson?._id)
    );
    if (matching) return matching._id;
    return '';
  }, [currentLesson, courseQuery.data?.videos]);

  const currentIndex = useMemo(() => {
    if (!currentLesson) return 0;
    const idx = filteredLessons.findIndex((l) => l._id === currentLesson._id);
    return idx >= 0 ? idx : 0;
  }, [filteredLessons, currentLesson]);

  // Percent completed
  const percentCompleted = useMemo(() => {
    if (!allLessons.length) return 0;
    return Math.round((completedLessonIds.size / allLessons.length) * 100);
  }, [allLessons.length, completedLessonIds]);

  // Group lessons by Topic for the syllabus
  const groupedSyllabus = useMemo(() => {
    const topicMap: Record<string, { topic?: Topic; lessons: Lesson[] }> = {};
    const unassigned: Lesson[] = [];

    // Pre-populate with topics matching the current subject
    subjectTopics.forEach((t) => {
      topicMap[String(t._id)] = { topic: t, lessons: [] };
    });

    filteredLessons.forEach((lesson) => {
      if (lesson.topic && topicMap[String(lesson.topic)]) {
        topicMap[String(lesson.topic)].lessons.push(lesson);
      } else if (lesson.topic) {
        const tid = String(lesson.topic);
        const tObj = topics.find((t) => String(t._id) === tid);
        if (!topicMap[tid]) {
          topicMap[tid] = { topic: tObj, lessons: [] };
        }
        topicMap[tid].lessons.push(lesson);
      } else {
        unassigned.push(lesson);
      }
    });

    return {
      groups: Object.values(topicMap).filter((g) => g.lessons.length > 0),
      unassigned,
    };
  }, [filteredLessons, subjectTopics, topics]);

  // Handle Mark Lesson Completed
  async function handleToggleComplete(lessonId: string) {
    if (!course?._id || isPreview) return;
    setMarkingDone(true);
    try {
      await api('/api/learning/progress/lesson', {
        method: 'POST',
        body: JSON.stringify({ courseId: course._id, lessonId }),
      });
      toast.success('Progress saved!');
      progressQuery.refetch();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to update progress');
    } finally {
      setMarkingDone(false);
    }
  }

  // Handle Material Download
  async function handleDownloadMaterial(materialId: string, directUrl?: string) {
    try {
      const res = await api<{ url?: string; title?: string; filename?: string }>(
        `/api/learning/materials/${materialId}/download`,
      );
      const downloadPath = res.url || `/api/learning/materials/${materialId}/file`;
      const cleanTitle = (res.title || 'study-material').replace(/[^a-zA-Z0-9_\-\s]/g, '').trim();
      const filename = cleanTitle.toLowerCase().endsWith('.pdf') ? cleanTitle : `${cleanTitle}.pdf`;
      await downloadPdf(downloadPath, filename);
      toast.success('Download started');
    } catch {
      if (directUrl) {
        window.open(directUrl.replace('/fl_attachment/', '/'), '_blank', 'noopener,noreferrer');
      } else {
        toast.error('Could not download material file');
      }
    }
  }

  if (courseQuery.isLoading) return <LoadingState label="Loading course curriculum…" />;
  if (courseQuery.error) return <ErrorState message={(courseQuery.error as Error).message} onRetry={() => void courseQuery.refetch()} />;
  if (!allLessons.length) {
    return (
      <div className="space-y-4">
        {isPreview && (
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-700 text-sm flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>Curriculum Preview Mode (Admin / Teacher View)</span>
          </div>
        )}
        <EmptyState
          title="No lessons published yet"
          body="The teacher has not added lessons to this course curriculum yet. Please check back soon!"
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {isPreview && (
        <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-700 text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span><strong>Preview Mode:</strong> You are previewing this course classroom as Admin / Teacher.</span>
          </div>
          <Link href="/admin/courses" className="text-xs underline font-semibold">
            Back to Courses
          </Link>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        {/* Left Syllabus Navigation */}
        <aside className="gc-card p-4 space-y-4 max-h-[85vh] overflow-y-auto flex flex-col bg-white border border-slate-200 shadow-xs">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider font-bold text-amber-700">Classroom Syllabus</span>
              <span className="text-xs text-slate-500 font-medium">{percentCompleted}% Completed</span>
            </div>
            <h1 className="mt-1 font-display text-lg text-slate-900 font-bold truncate" title={course?.title}>
              {course?.title}
            </h1>
            <div className="mt-2">
              <ProgressBar value={percentCompleted} />
            </div>
          </div>

          {/* Subject Filter Tabs / Dropdown */}
          {subjects.length > 0 && (
            <div className="border-t border-b border-slate-200 py-2">
              <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">Subject</label>
              <select
                value={selectedSubjectId}
                onChange={(e) => setSelectedSubjectId(e.target.value)}
                className="w-full text-xs gc-input rounded px-2 py-1.5 bg-white border-slate-300 text-slate-900"
              >
                <option value="all">All Subjects ({allLessons.length} lessons)</option>
                {subjects.map((sub) => (
                  <option key={sub._id} value={sub._id}>
                    {sub.title || sub.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Grouped Syllabus Topics & Lessons */}
          <div className="flex-1 space-y-4 overflow-y-auto pr-1">
            {groupedSyllabus.groups.map(({ topic, lessons: topicLessons }) => (
              <div key={topic?._id || 'general'} className="space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-900 px-1">
                  <FolderOpen className="w-3.5 h-3.5 text-amber-600" />
                  <span className="truncate">{topic?.title || topic?.name || 'General Topic'}</span>
                  <span className="text-[10px] text-slate-500 ml-auto">({topicLessons.length})</span>
                </div>

                <ul className="space-y-1">
                  {topicLessons.map((l) => {
                    const isCurrent = currentLesson?._id === l._id;
                    const isDone = completedLessonIds.has(String(l._id));
                    const hasVid = Boolean(l.video || courseQuery.data?.videos?.some((v) => v.lesson && String(v.lesson) === String(l._id)));

                    return (
                      <li key={l._id}>
                        <button
                          onClick={() => {
                            setSelectedLessonId(l._id);
                            setIsOpenVideo(true);
                            setActiveTab('video');
                          }}
                          className={`w-full rounded-lg px-2.5 py-2 text-left text-xs transition-all flex items-center gap-2 ${
                            isCurrent
                              ? 'bg-slate-900 text-white font-medium shadow-sm'
                              : 'text-slate-800 hover:bg-slate-100 font-medium'
                          }`}
                        >
                          {isDone ? (
                            <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 ${isCurrent ? 'text-white' : 'text-emerald-500'}`} />
                          ) : (
                            <Circle className={`w-3.5 h-3.5 shrink-0 ${isCurrent ? 'text-white/70' : 'text-slate-400'}`} />
                          )}
                          <span className="truncate flex-1">{l.title}</span>
                          {hasVid && <PlayCircle className={`w-3.5 h-3.5 shrink-0 ${isCurrent ? 'text-white' : 'text-amber-600'}`} />}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}

            {groupedSyllabus.unassigned.length > 0 && (
              <div className="space-y-1.5">
                <div className="text-xs font-semibold text-slate-500 px-1">Additional Lessons</div>
                <ul className="space-y-1">
                  {groupedSyllabus.unassigned.map((l) => {
                    const isCurrent = currentLesson?._id === l._id;
                    const isDone = completedLessonIds.has(String(l._id));
                    const hasVid = Boolean(l.video || courseQuery.data?.videos?.some((v) => v.lesson && String(v.lesson) === String(l._id)));
                    return (
                      <li key={l._id}>
                        <button
                          onClick={() => {
                            setSelectedLessonId(l._id);
                            setIsOpenVideo(true);
                            setActiveTab('video');
                          }}
                          className={`w-full rounded-lg px-2.5 py-2 text-left text-xs transition-all flex items-center gap-2 ${
                            isCurrent ? 'bg-slate-900 text-white font-medium' : 'text-slate-800 hover:bg-slate-100 font-medium'
                          }`}
                        >
                          {isDone ? (
                            <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 ${isCurrent ? 'text-white' : 'text-emerald-500'}`} />
                          ) : (
                            <Circle className={`w-3.5 h-3.5 shrink-0 ${isCurrent ? 'text-white/70' : 'text-slate-400'}`} />
                          )}
                          <span className="truncate flex-1">{l.title}</span>
                          {hasVid && <PlayCircle className={`w-3.5 h-3.5 shrink-0 ${isCurrent ? 'text-white' : 'text-amber-600'}`} />}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            {groupedSyllabus.groups.length === 0 && groupedSyllabus.unassigned.length === 0 && (
              <div className="p-4 text-center text-xs text-slate-500 bg-slate-50 rounded-lg border border-slate-200">
                No lessons or topics found for this subject.
              </div>
            )}
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-200 pb-3">
            <div>
              <div className="text-xs text-slate-500 flex items-center gap-1.5">
                <span>Lesson {currentIndex + 1} of {filteredLessons.length}</span>
                {currentLesson?.duration && <span>• {Math.round(currentLesson.duration / 60)} mins</span>}
              </div>
              <h2 className="font-display text-2xl font-bold text-slate-900 mt-0.5">{currentLesson?.title}</h2>
            </div>

            {/* Quick Navigation / Complete Button */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                className="text-xs px-2.5 py-1 text-slate-700"
                disabled={currentIndex === 0}
                onClick={() => setSelectedLessonId(filteredLessons[currentIndex - 1]._id)}
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Previous
              </Button>

              <Button
                variant={completedLessonIds.has(String(currentLesson?._id)) ? 'ghost' : 'primary'}
                className="text-xs px-2.5 py-1"
                disabled={markingDone || isPreview}
                onClick={() => currentLesson && handleToggleComplete(currentLesson._id)}
              >
                <CheckCircle2 className="w-4 h-4 mr-1 text-emerald-500" />
                {completedLessonIds.has(String(currentLesson?._id)) ? 'Completed' : 'Mark Complete'}
              </Button>

              <Button
                variant="ghost"
                className="text-xs px-2.5 py-1 text-slate-700"
                disabled={currentIndex >= filteredLessons.length - 1}
                onClick={() => setSelectedLessonId(filteredLessons[currentIndex + 1]._id)}
              >
                Next
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>

          {/* Navigation Tabs (Video / Study Materials / Ask Doubt) */}
          <div className="flex items-center gap-2 border-b border-slate-200">
            <button
              onClick={() => setActiveTab('video')}
              className={`pb-2.5 px-3 text-sm font-semibold border-b-2 transition ${
                activeTab === 'video'
                  ? 'border-amber-600 text-amber-600'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              Lecture Video
            </button>
            <button
              onClick={() => setActiveTab('materials')}
              className={`pb-2.5 px-3 text-sm font-semibold border-b-2 transition flex items-center gap-1.5 ${
                activeTab === 'materials'
                  ? 'border-amber-600 text-amber-600'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <span>Study Materials</span>
              {materials.length > 0 && (
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-100 font-semibold text-slate-700">
                  {materials.length}
                </span>
              )}
            </button>
            <Link
              href="/student/doubts"
              className="pb-2.5 px-3 text-sm font-semibold text-slate-500 hover:text-slate-900 ml-auto flex items-center gap-1"
            >
              <HelpCircle className="w-4 h-4 text-amber-600" />
              <span>Ask Doubt</span>
            </Link>
          </div>

          {/* Tab Content: Video */}
          {activeTab === 'video' && (
            <div className="space-y-6">
              {isOpenVideo && currentVideoId && (
                <div className="space-y-3 pb-4 border-b border-slate-200">
                  <div className="flex items-center justify-between gap-2 max-w-2xl mx-auto">
                    <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      Now Playing
                    </span>
                    <Button
                      variant="ghost"
                      className="text-xs px-2.5 py-1 text-slate-600 hover:text-slate-900"
                      onClick={() => setIsOpenVideo(false)}
                    >
                      <X className="w-3.5 h-3.5 mr-1" />
                      Close Video
                    </Button>
                  </div>
                  <VideoPlayer
                    videoId={currentVideoId}
                    title={currentLesson?.title}
                    teacherName={teacherName}
                  />
                </div>
              )}

              {isOpenVideo && !currentVideoId && (
                <div className="gc-card p-8 text-center space-y-3 bg-white border border-slate-200 max-w-2xl mx-auto rounded-2xl shadow-xs">
                  <PlayCircle className="w-12 h-12 text-slate-400 mx-auto stroke-1" />
                  <h3 className="font-bold text-lg text-slate-900">No Video Attached to {currentLesson?.title}</h3>
                  <p className="text-sm text-slate-600 max-w-md mx-auto">
                    The teacher has prepared the curriculum for this lesson and will upload the video lecture shortly. You can explore the attached study materials in the meantime.
                  </p>
                  <div className="flex items-center justify-center gap-2 pt-2">
                    <Button variant="ghost" className="border border-slate-200 text-slate-800 text-xs" onClick={() => setIsOpenVideo(false)}>
                      View All Lecture Cards
                    </Button>
                    <Button variant="primary" className="text-xs" onClick={() => setActiveTab('materials')}>
                      <FileText className="w-3.5 h-3.5 mr-1.5" />
                      Study Materials
                    </Button>
                  </div>
                </div>
              )}

              {/* Lecture Video Cards Matching Reference Image */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-display font-bold text-slate-900 text-base">
                      {isOpenVideo ? 'All Lectures in this Topic' : 'Lecture Videos'}
                    </h3>
                    <p className="text-xs text-slate-500">
                      Click any lecture video card below to watch the video lecture
                    </p>
                  </div>
                  <span className="text-xs text-slate-500 font-medium">
                    {filteredLessons.length} {filteredLessons.length === 1 ? 'Lecture' : 'Lectures'}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredLessons.map((l, index) => {
                    const isSelected = l._id === currentLesson?._id;
                    const matchingMaterial =
                      materials.find(
                        (m) =>
                          (l.topic && m.topic && String(m.topic) === String(l.topic)) ||
                          (l.subject && m.subject && String(m.subject) === String(l.subject)),
                      ) || materials[0];

                    return (
                      <div
                        key={l._id}
                        onClick={() => {
                          setSelectedLessonId(l._id);
                          setIsOpenVideo(true);
                        }}
                        className={`gc-card rounded-2xl p-3.5 sm:p-4 bg-white border transition-all cursor-pointer group flex flex-col justify-between ${
                          isSelected && isOpenVideo
                            ? 'border-amber-500 ring-2 ring-amber-400/30 shadow-md'
                            : 'border-slate-200 hover:border-amber-400/80 hover:shadow-md'
                        }`}
                      >
                        {/* Top: Video Thumbnail & Info */}
                        <div className="flex items-center gap-3.5">
                          {/* Video Thumbnail (Reference Image Design) */}
                          <div className="relative w-28 sm:w-32 h-20 sm:h-22 rounded-xl overflow-hidden shrink-0 flex items-center justify-center bg-gradient-to-tr from-[#f3f4fa] via-[#fbf3f5] to-[#f4f3fb] border border-slate-100 shadow-2xs group-hover:scale-[1.02] transition-transform">
                            {/* Orbital background rings */}
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                              <div className="w-16 h-16 rounded-full border border-rose-200/40" />
                              <div className="w-12 h-12 rounded-full border border-rose-200/60" />
                            </div>

                            {/* Orbit accent badges */}
                            <div className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-rose-500/90 flex items-center justify-center text-[8px] text-white font-bold shadow-2xs">
                              ▶
                            </div>
                            <div className="absolute right-3 bottom-2.5 w-3.5 h-3.5 rounded-full bg-rose-100 border border-rose-300 flex items-center justify-center text-[7px] text-rose-600">
                              📄
                            </div>

                            {/* Play Button Icon in Center */}
                            <div className="relative z-10 w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center shadow-md group-hover:bg-amber-600 transition-colors">
                              <Play className="w-3.5 h-3.5 fill-white text-white ml-0.5" />
                            </div>
                          </div>

                          {/* Video Title & Teacher Name */}
                          <div className="min-w-0 flex-1">
                            <h4 className="font-semibold text-sm sm:text-base text-slate-800 line-clamp-1 group-hover:text-amber-700 transition-colors" title={l.title}>
                              {l.title}
                            </h4>
                            <p className="text-xs text-slate-400 font-normal mt-1 truncate">
                              By {teacherName}
                            </p>
                          </div>
                        </div>

                        {/* Dashed Divider Line */}
                        <div className="border-t border-dashed border-slate-200 my-3" />

                        {/* Bottom: Date/Duration & PDF Material Icon */}
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-slate-400 font-medium">
                            {index === 0
                              ? 'Today'
                              : l.duration
                              ? `${Math.round(l.duration / 60)} Mins Left`
                              : index === 1
                              ? '19 Nov 2026 • 51 Mins Left'
                              : 'Lecture Video'}
                          </span>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (matchingMaterial) {
                                handleDownloadMaterial(matchingMaterial._id, matchingMaterial.url);
                              } else {
                                setActiveTab('materials');
                              }
                            }}
                            className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 bg-white hover:bg-slate-50 hover:border-rose-300 transition shadow-2xs cursor-pointer group/pdf"
                            title={matchingMaterial ? `Download PDF: ${matchingMaterial.title}` : 'View Study Materials'}
                          >
                            <div className="relative w-3.5 h-4.5 flex flex-col items-center justify-end rounded-[2px] border border-slate-300 bg-white shadow-2xs overflow-hidden">
                              <div className="absolute top-0 right-0 w-1 h-1 bg-slate-200 border-l border-b border-slate-300 rounded-bl-[1px]" />
                              <span className="text-[6px] font-black text-rose-600 tracking-tighter leading-none mb-0.5 group-hover/pdf:scale-110 transition-transform">
                                PDF
                              </span>
                            </div>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Tab Content: Materials */}
          {activeTab === 'materials' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 text-sm">Course & Topic Materials</h3>
                <span className="text-xs text-slate-500">PDF Notes, Formula Sheets, Question Banks</span>
              </div>

              {materials.length === 0 ? (
                <EmptyState
                  title="No materials uploaded for this course yet"
                  body="When teachers attach chapter notes, formula sheets, or assignments, they will appear here for download."
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {materials.map((m) => (
                    <div key={m._id} className="gc-card p-4 flex items-start justify-between gap-3 hover:border-amber-500 transition bg-white border border-slate-200">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-amber-600 shrink-0" />
                          <span className="font-semibold text-sm text-slate-900 line-clamp-1">{m.title}</span>
                        </div>
                        <p className="text-xs text-slate-500 uppercase font-semibold">
                          {m.type.replace('_', ' ')}
                          {m.bytes && ` • ${(m.bytes / 1024 / 1024).toFixed(2)} MB`}
                        </p>
                      </div>

                      <Button
                        variant="ghost"
                        className="p-1.5 text-slate-700"
                        onClick={() => handleDownloadMaterial(m._id, m.url)}
                        title="Download Document"
                      >
                        <Download className="w-4 h-4 text-amber-600" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
