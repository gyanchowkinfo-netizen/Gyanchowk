'use client';

import { ResourceManager } from '@/components/panel/ResourceManager';

export default function Page() {
  return (
    <ResourceManager
      title="Question bank"
      path="/api/questions"
      empty="No questions yet"
      columns={[
        { key: 'stem', label: 'Stem' },
        { key: 'type', label: 'Type', kind: 'status' },
        { key: 'difficulty', label: 'Difficulty', kind: 'status' },
        { key: 'marks', label: 'Marks' },
      ]}
      create={{
        label: 'Add question',
        path: '/api/questions',
        fields: [
          { name: 'stem', label: 'Stem', type: 'textarea', required: true },
          {
            name: 'type',
            label: 'Type',
            type: 'select',
            options: [
              'single_mcq',
              'multi_mcq',
              'numerical',
              'true_false',
              'fill_blank',
              'assertion_reason',
              'match',
              'subjective',
            ].map((v) => ({ value: v, label: v.replaceAll('_', ' ') })),
          },
          { name: 'correctKeys', label: 'Correct keys (comma, e.g. A,B)' },
          { name: 'options', label: 'Options (A=..., B=...)' },
          { name: 'marks', label: 'Marks', type: 'number' },
          {
            name: 'difficulty',
            label: 'Difficulty',
            type: 'select',
            options: ['easy', 'medium', 'hard'].map((v) => ({ value: v, label: v })),
          },
        ],
        transform: (form) => {
          const options = String(form.get('options') || '')
            .split(',')
            .map((part) => part.trim())
            .filter(Boolean)
            .map((part) => {
              const [key, ...rest] = part.split('=');
              return { key: (key || 'A').trim(), text: rest.join('=').trim() || part };
            });
          const correctKeys = String(form.get('correctKeys') || '')
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean);
          return {
            stem: form.get('stem'),
            type: form.get('type'),
            options,
            correctKeys,
            marks: Number(form.get('marks') || 1),
            difficulty: form.get('difficulty'),
          };
        },
      }}
      actions={[
        {
          label: 'Delete',
          variant: 'danger',
          path: (row) => `/api/questions/${row._id}`,
          method: 'DELETE',
          confirm: { title: 'Delete this question?', body: 'It is removed from the bank.' },
        },
      ]}
    />
  );
}
