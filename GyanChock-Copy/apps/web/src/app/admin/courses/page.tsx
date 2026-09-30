'use client';

import { ResourceManager, type ManagerField } from '@/components/panel/ResourceManager';
import { CourseCoverManager } from '@/components/admin/CourseCoverManager';

const courseFields: ManagerField[] = [
  { name: 'title', label: 'Title', required: true },
  { name: 'subtitle', label: 'Subtitle / short description' },
  { name: 'category', label: 'Category', placeholder: 'JEE, NEET, UPSC…' },
  { name: 'targetExam', label: 'Target exam', placeholder: 'JEE Main' },
  { name: 'language', label: 'Language', placeholder: 'English / Hindi / Hinglish' },
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
];

function coursePayload(form: FormData) {
  const subjects = String(form.get('subjects') || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  return {
    title: form.get('title'),
    subtitle: form.get('subtitle'),
    category: form.get('category'),
    targetExam: form.get('targetExam'),
    language: form.get('language'),
    foundation: form.get('foundation'),
    careerTrack: form.get('careerTrack'),
    subjects,
    pricingType: form.get('pricingType'),
    price: Number(form.get('price') || 0),
    discountPercent: Number(form.get('discountPercent') || 0),
  };
}

function courseFromRow(row: Record<string, unknown>) {
  const subjects = Array.isArray(row.subjects) ? row.subjects.join(', ') : '';
  return {
    title: String(row.title ?? ''),
    subtitle: String(row.subtitle ?? ''),
    category: String(row.category ?? ''),
    targetExam: String(row.targetExam ?? ''),
    language: String(row.language ?? ''),
    foundation: String(row.foundation ?? ''),
    careerTrack: String(row.careerTrack ?? ''),
    subjects,
    pricingType: String(row.pricingType ?? 'paid'),
    price: Number(row.price ?? 0),
    discountPercent: Number(row.discountPercent ?? 0),
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
          { key: 'title', label: 'Title' },
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
            options: ['draft', 'published', 'archived'].map((v) => ({ value: v, label: v })),
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
