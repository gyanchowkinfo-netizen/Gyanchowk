'use client';

import { FormEvent, useEffect, useState } from 'react';
import { api, downloadPdf } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { PageContainer, PageHeader } from '@/components/layout/Page';
import { toast } from '@/lib/toast';
import { useAuth } from '@/lib/auth';

type Draft = {
  contact?: { name?: string; email?: string; phone?: string; location?: string };
  education?: Array<{ school: string; detail?: string; year?: string }>;
  skills?: string[];
  experience?: Array<{ title: string; org?: string; detail?: string }>;
  projects?: Array<{ name: string; detail?: string }>;
};

export default function ResumeBuilderPage() {
  const { user } = useAuth();
  const [draft, setDraft] = useState<Draft>({ contact: { name: user?.name, email: user?.email }, skills: [] });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void api<{ draft: Draft }>('/api/learning/resume')
      .then((res) => setDraft(res.draft ?? draft))
      .catch(() => undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function save(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const next: Draft = {
      contact: {
        name: String(form.get('name') || ''),
        email: String(form.get('email') || ''),
        phone: String(form.get('phone') || ''),
        location: String(form.get('location') || ''),
      },
      education: String(form.get('education') || '')
        .split('\n')
        .filter(Boolean)
        .map((line) => ({ school: line })),
      skills: String(form.get('skills') || '')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      experience: String(form.get('experience') || '')
        .split('\n')
        .filter(Boolean)
        .map((line) => ({ title: line })),
      projects: String(form.get('projects') || '')
        .split('\n')
        .filter(Boolean)
        .map((line) => ({ name: line })),
    };
    setDraft(next);
    if (!user) {
      toast.error('Sign in to save and export');
      return;
    }
    setBusy(true);
    try {
      await api('/api/learning/resume', { method: 'PUT', body: JSON.stringify(next) });
      toast.success('Draft saved');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <PageContainer>
      <PageHeader title="Resume builder" subtitle="Live preview on the right. Export uses the server PDF service." />
      <div className="grid gap-6 lg:grid-cols-2">
        <form onSubmit={save} className="gc-card grid gap-3 p-5">
          <Input name="name" label="Name" defaultValue={draft.contact?.name} />
          <Input name="email" label="Email" defaultValue={draft.contact?.email} />
          <Input name="phone" label="Phone" defaultValue={draft.contact?.phone} />
          <Input name="location" label="Location" defaultValue={draft.contact?.location} />
          <Input name="skills" label="Skills (comma)" defaultValue={(draft.skills ?? []).join(', ')} />
          <Textarea name="education" label="Education (one per line)" defaultValue={(draft.education ?? []).map((e) => e.school).join('\n')} />
          <Textarea name="experience" label="Experience (one per line)" defaultValue={(draft.experience ?? []).map((e) => e.title).join('\n')} />
          <Textarea name="projects" label="Projects (one per line)" defaultValue={(draft.projects ?? []).map((e) => e.name).join('\n')} />
          <div className="flex gap-2">
            <Button loading={busy} type="submit">
              Save draft
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={async () => {
                try {
                  await downloadPdf('/api/learning/resume/pdf', 'resume.pdf');
                } catch (err) {
                  toast.error(err instanceof Error ? err.message : 'Export failed');
                }
              }}
            >
              Export PDF
            </Button>
          </div>
        </form>
        <article className="gc-card p-6">
          <p className="text-xs uppercase tracking-widest text-gc-gold">Preview</p>
          <h2 className="mt-2 font-display text-2xl">{draft.contact?.name || 'Your name'}</h2>
          <p className="text-sm text-gc-mute">
            {draft.contact?.email} · {draft.contact?.phone} · {draft.contact?.location}
          </p>
          <h3 className="mt-4 text-gc-gold">Skills</h3>
          <p className="text-sm">{(draft.skills ?? []).join(', ') || '—'}</p>
          <h3 className="mt-4 text-gc-gold">Education</h3>
          <ul className="list-disc pl-5 text-sm">
            {(draft.education ?? []).map((e) => (
              <li key={e.school}>{e.school}</li>
            ))}
          </ul>
          <h3 className="mt-4 text-gc-gold">Experience</h3>
          <ul className="list-disc pl-5 text-sm">
            {(draft.experience ?? []).map((e) => (
              <li key={e.title}>{e.title}</li>
            ))}
          </ul>
        </article>
      </div>
    </PageContainer>
  );
}
