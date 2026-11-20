'use client';

import { ResourceManager, type ManagerField } from '@/components/panel/ResourceManager';
import { CourseCoverManager } from '@/components/admin/CourseCoverManager';
import { toast } from '@/lib/toast';

const courseFields: ManagerField[] = [
  { name: 'title', label: 'Title', required: true },
  { name: 'subtitle', label: 'Subtitle / short description' },
  { name: 'teacherId', label: 'Assigned Teacher ID (Optional)', placeholder: 'User ID of teacher owner' },
  { name: 'category', label: 'Category', placeholder: 'JEE, NEET, UPSC…' },
  { name: 'targetExam', label: 'Target exam', placeholder: 'JEE Main' },
  { name: 'language', label: 'Language', placeholder: 'English / Hindi / Hinglish' },
  { name: 'level', label: 'Level', placeholder: 'Beginner / Intermediate / Advanced' },
  { name: 'duration', label: 'Duration', placeholder: 'e.g. 12 Months or 60 Hours' },
  { name: 'foundation', label: 'Foundation / level', placeholder: 'Foundation' },
  { name: 'careerTrack', label: 'Career track', placeholder: 'government-exam' },
  { name: 'subjects', label: 'Subjects (comma separated)' },
  {
    name: 'pricingType',
    label: 'Pricing',
    type: 'select',
    options: [
      { value: 'paid', label: 'Paid' },
      { value: 'free', label: 'Free' },
    ],
  },
  { name: 'price', label: 'Price (INR)', type: 'number' },
  { name: 'discountPercent', label: 'Discount %', type: 'number' },
  { name: 'validityDays', label: 'Validity (Days)', type: 'number' },
  { name: 'description', label: 'Detailed Description', type: 'textarea' },
];

function coursePayload(form: FormData) {
  const subjects = String(form.get('subjects') || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  const teacherId = String(form.get('teacherId') || '').trim();
  return {
    title: form.get('title'),
    subtitle: form.get('subtitle'),
    teachers: teacherId ? [teacherId] : undefined,
    category: form.get('category'),
    targetExam: form.get('targetExam'),
    language: form.get('language'),
    level: form.get('level'),
    duration: form.get('duration'),
    foundation: form.get('foundation'),
    careerTrack: form.get('careerTrack'),
    subjects,
    pricingType: form.get('pricingType'),
    price: Number(form.get('price') || 0),
    discountPercent: Number(form.get('discountPercent') || 0),
    validityDays: Number(form.get('validityDays') || 365),
    description: form.get('description'),
  };
}

function courseFromRow(row: Record<string, unknown>) {
  const subjects = Array.isArray(row.subjects) ? row.subjects.join(', ') : '';
  const teacherId = Array.isArray(row.teachers) && row.teachers.length > 0 ? String(row.teachers[0]) : '';
  return {
    title: String(row.title ?? ''),
    subtitle: String(row.subtitle ?? ''),
    teacherId,
    category: String(row.category ?? ''),
    targetExam: String(row.targetExam ?? ''),
    language: String(row.language ?? ''),
    level: String(row.level ?? ''),
    duration: String(row.duration ?? ''),
    foundation: String(row.foundation ?? ''),
    careerTrack: String(row.careerTrack ?? ''),
    subjects,
    pricingType: String(row.pricingType ?? 'paid'),
    price: Number(row.price ?? 0),
    discountPercent: Number(row.discountPercent ?? 0),
    validityDays: Number(row.validityDays ?? 365),
    description: String(row.description ?? ''),
  };
}

export default function Page() {
  return (
    <>
      <ResourceManager
        title="Courses"
        subtitle="Create, edit, publish, feature, or delete catalogue courses. Upload cover images below for Featured courses."
        path="/api/courses"
        empty="No courses yet"
        emptyCta="Create your first course"
        columns={[
          {
            key: 'title',
            label: 'Title & Course ID',
            render: (row) => {
              const id = String(row._id ?? '');
              return (
                <div>
                  <div className="font-semibold text-gc-ink">{String(row.title ?? '')}</div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="font-mono text-[10px] text-gc-mute select-all">ID: {id}</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigator.clipboard.writeText(id);
                        toast.success('Course ID copied');
                      }}
                      className="text-[10px] text-gc-primary hover:underline cursor-pointer"
                      title="Copy Course ID"
                    >
                      Copy
                    </button>
                  </div>
                </div>
              );
            },
          },
          { key: 'targetExam', label: 'Target Exam' },
          { key: 'category', label: 'Category' },
          { key: 'status', label: 'Status', kind: 'status' },
          { key: 'pricingType', label: 'Pricing', kind: 'status' },
          { key: 'price', label: 'Price (INR)' },
          { key: 'enrollmentCount', label: 'Enrolled' },
        ]}
        filters={[
          {
            name: 'status',
            label: 'Status',
            options: ['draft', 'pending_review', 'published', 'archived'].map((v) => ({ value: v, label: v.replace('_', ' ') })),
          },
        ]}
        create={{
          label: 'Create course',
          path: '/api/courses',
          success: 'Course created',
          fields: courseFields,
          transform: coursePayload,
        }}
        edit={{
          label: 'Edit',
          path: (row) => `/api/courses/${row._id}`,
          success: 'Course updated',
          fields: courseFields,
          transform: (form) => coursePayload(form),
          fromRow: courseFromRow,
        }}
        actions={[
          {
            label: 'Curriculum (Subjects & Topics)',
            href: (row) => `/admin/courses/${row._id}/curriculum`,
          },
          {
            label: 'Review Classroom',
            href: (row) => `/student/learning/${row._id}?preview=1`,
          },
          {
            label: 'Approve & Publish',
            path: (row) => `/api/courses/${row._id}/approve`,
            method: 'POST',
            confirm: { title: 'Approve and publish course?', body: 'This marks the course as published and available on the store.' },
            success: 'Course approved and published',
          },
          {
            label: 'Request Changes',
            path: (row) => `/api/courses/${row._id}/request-changes`,
            method: 'POST',
            confirm: {
              title: 'Request changes from teacher?',
              body: 'This will return the course to draft so the teacher can revise the curriculum and resubmit.',
            },
            success: 'Changes requested. Course returned to draft.',
          },
          {
            label: 'Reject to Draft',
            path: (row) => `/api/courses/${row._id}/reject`,
            method: 'POST',
            confirm: { title: 'Reject course back to draft?', body: 'The teacher will be able to revise the course curriculum and resubmit.' },
            success: 'Course rejected to draft',
          },
          {
            label: 'Publish',
            path: (row) => `/api/courses/${row._id}`,
            method: 'PATCH',
            body: () => ({ status: 'published' }),
            confirm: { title: 'Publish this course?', body: 'It becomes visible in the public catalogue.' },
            success: 'Published',
          },
          {
            label: 'Feature',
            path: (row) => `/api/courses/${row._id}`,
            method: 'PATCH',
            body: () => ({ featured: true }),
            success: 'Featured on homepage when in top enrolments',
          },
          {
            label: 'Unfeature',
            path: (row) => `/api/courses/${row._id}`,
            method: 'PATCH',
            body: () => ({ featured: false }),
            success: 'Removed from featured flag',
          },
          {
            label: 'Archive',
            variant: 'danger',
            path: (row) => `/api/courses/${row._id}`,
            method: 'PATCH',
            body: () => ({ status: 'archived' }),
            confirm: { title: 'Archive this course?', body: 'Archived courses drop out of the storefront.' },
            success: 'Archived',
          },
          {
            label: 'Delete',
            variant: 'danger',
            path: (row) => `/api/courses/${row._id}`,
            method: 'DELETE',
            confirm: {
              title: 'Delete this course permanently?',
              body: 'This removes the course record. Enrollments may still reference it — prefer Archive when unsure.',
              confirmLabel: 'Delete',
            },
            success: 'Course deleted',
          },
        ]}
      />
      <CourseCoverManager />
    </>
  );
}
