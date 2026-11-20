'use client';

import { FormEvent, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/States';
import { toast } from '@/lib/toast';

type Session = {
  _id: string;
  title: string;
  scheduledAt?: string;
  course?: { _id: string; title: string } | string;
};
type Student = { user?: { _id: string; name?: string; email?: string } };

export default function TeacherAttendancePage() {
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [marks, setMarks] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [creating, setCreating] = useState(false);

  // 1. Fetch teacher's courses
  const coursesQuery = useQuery({
    queryKey: ['teacher-courses-attendance'],
    queryFn: () => api<{ items: Array<{ _id: string; title: string }> }>('/api/courses?mine=1&limit=100'),
  });

  // 2. Fetch attendance sessions
  const sessions = useQuery({
    queryKey: ['att-sessions', selectedCourseId],
    queryFn: () => {
      const q = selectedCourseId ? `?course=${selectedCourseId}` : '';
      return api<{ items: Session[] }>(`/api/attendance/sessions${q}`);
    },
  });

  // 3. Fetch student roster (filtered by selected session's course or active course filter)
  const activeSession = (sessions.data?.items ?? []).find((s) => s._id === sessionId);
  const activeCourseId =
    typeof activeSession?.course === 'object' && activeSession.course
      ? activeSession.course._id
      : typeof activeSession?.course === 'string'
      ? activeSession.course
      : selectedCourseId;

  const roster = useQuery({
    queryKey: ['att-roster', activeCourseId],
    queryFn: () => {
      const q = activeCourseId ? `?course=${activeCourseId}` : '';
      return api<{ items: Student[] }>(`/api/learning/roster${q}`);
    },
  });

  async function createSession(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const course = form.get('course');
    if (!course) {
      toast.error('Please select a course');
      return;
    }
    setCreating(true);
    try {
      await api('/api/attendance/sessions', {
        method: 'POST',
        body: JSON.stringify({
          title: form.get('title'),
          course,
          scheduledAt: form.get('scheduledAt'),
        }),
      });
      toast.success('Attendance session created');
      (e.target as HTMLFormElement).reset();
      await sessions.refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create session');
    } finally {
      setCreating(false);
    }
  }

  async function saveMarks() {
    if (!sessionId) return;
    setBusy(true);
    try {
      await api(`/api/attendance/sessions/${sessionId}/mark`, {
        method: 'POST',
        body: JSON.stringify({
          marks: Object.entries(marks).map(([studentId, mark]) => ({ studentId, mark })),
        }),
      });
      toast.success('Attendance saved');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed');
    } finally {
      setBusy(false);
    }
  }

  const courses = coursesQuery.data?.items ?? [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl text-gc-black">Course Attendance</h1>
        <p className="text-sm text-gc-mute">
          Schedule classroom attendance sessions for your courses and mark student attendance.
        </p>
      </div>

      {/* Create Session Form */}
      <form onSubmit={createSession} className="gc-card grid gap-4 p-5 md:grid-cols-4 items-end">
        <div>
          <label className="block text-xs font-semibold uppercase text-gc-mute mb-1">Session Title</label>
          <Input name="title" placeholder="e.g. Lecture 12 Attendance" required />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase text-gc-mute mb-1">Select Course</label>
          <Select name="course" required defaultValue="">
            <option value="">Select a course…</option>
            {courses.map((c) => (
              <option key={c._id} value={c._id}>
                {c.title} (ID: {c._id})
              </option>
            ))}
          </Select>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase text-gc-mute mb-1">Scheduled When</label>
          <Input name="scheduledAt" type="datetime-local" required />
        </div>

        <div>
          <Button loading={creating} type="submit" className="w-full">
            Create session
          </Button>
        </div>
      </form>

      {/* Filter and Session Selector */}
      <div className="gc-card p-4 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <label className="block text-xs font-semibold uppercase text-gc-mute mb-1">Filter by Course</label>
            <Select
              value={selectedCourseId}
              onChange={(e) => {
                setSelectedCourseId(e.target.value);
                setSessionId('');
              }}
            >
              <option value="">All My Courses</option>
              {courses.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.title}
                </option>
              ))}
            </Select>
          </div>

          <div className="flex-1">
            <label className="block text-xs font-semibold uppercase text-gc-mute mb-1">Select Attendance Session</label>
            <Select value={sessionId} onChange={(e) => setSessionId(e.target.value)}>
              <option value="">Choose session to mark…</option>
              {(sessions.data?.items ?? []).map((s) => {
                const cTitle = typeof s.course === 'object' && s.course?.title ? s.course.title : '';
                return (
                  <option key={s._id} value={s._id}>
                    {s.title} {cTitle ? `(${cTitle})` : ''}
                  </option>
                );
              })}
            </Select>
          </div>
        </div>
      </div>

      {sessions.isLoading ? <LoadingState label="Loading sessions…" /> : null}
      {sessions.error ? <ErrorState message={(sessions.error as Error).message} onRetry={() => void sessions.refetch()} /> : null}

      {/* Roster & Marking */}
      {sessionId && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg text-gc-ink">Student Attendance Roster</h2>
            <span className="text-xs text-gc-mute">Enrolled students in this course</span>
          </div>

          {roster.isLoading ? (
            <LoadingState label="Loading students roster…" />
          ) : (roster.data?.items ?? []).length === 0 ? (
            <EmptyState
              title="No students enrolled yet"
              body="When students enroll in this course, they will appear here for attendance marking."
            />
          ) : (
            <>
              <ul className="space-y-2">
                {(roster.data?.items ?? []).map((row) => {
                  const id = row.user?._id;
                  if (!id) return null;
                  return (
                    <li key={id} className="gc-card flex flex-wrap items-center justify-between gap-3 p-3">
                      <div>
                        <div className="font-medium text-sm text-gc-ink">{row.user?.name}</div>
                        <div className="text-xs text-gc-mute">{row.user?.email}</div>
                      </div>
                      <Select
                        aria-label={`Mark ${row.user?.name}`}
                        value={marks[id] ?? 'present'}
                        onChange={(e) => setMarks((m) => ({ ...m, [id]: e.target.value }))}
                      >
                        {['present', 'absent', 'late', 'excused'].map((m) => (
                          <option key={m} value={m}>
                            {m.charAt(0).toUpperCase() + m.slice(1)}
                          </option>
                        ))}
                      </Select>
                    </li>
                  );
                })}
              </ul>

              <Button loading={busy} type="button" onClick={() => void saveMarks()}>
                Save attendance marks
              </Button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
