'use client';

import { FormEvent, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input, Textarea, Select } from '@/components/ui/Input';
import { toast } from '@/lib/toast';
import { Alert } from '@/components/ui/Badge';

export default function CmsPage() {
  const cms = useQuery({
    queryKey: ['cms-public'],
    queryFn: () =>
      api<{
        faqs: Array<{ _id: string; question: string; answer: string }>;
        banners: Array<{ _id: string; title?: string; href?: string }>;
        pages: Array<{ key: string; title?: string }>;
      }>('/api/cms/public'),
  });
  const [msg, setMsg] = useState('');

  async function post(path: string, body: unknown, ok: string) {
    setMsg('');
    try {
      await api(`/api/cms/admin${path}`, { method: 'POST', body: JSON.stringify(body) });
      toast.success(ok);
      setMsg(ok);
      await cms.refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Save failed');
    }
  }

  return (
    <div className="space-y-8">
      <h1 className="font-display text-3xl text-gc-black">CMS</h1>
      <p className="text-sm text-gc-mute">Edit public content without changing source code. Unpublished drafts stay in MongoDB.</p>
      {msg ? <Alert kind="success">{msg}</Alert> : null}

      <form
        className="gc-card grid gap-3 p-5 md:grid-cols-2"
        onSubmit={(e: FormEvent<HTMLFormElement>) => {
          e.preventDefault();
          const f = new FormData(e.currentTarget);
          void post(
            '/faqs',
            { question: f.get('question'), answer: f.get('answer'), published: true },
            'FAQ saved',
          );
        }}
      >
        <h2 className="font-display text-xl text-gc-black md:col-span-2">New FAQ</h2>
        <Input name="question" label="Question" required className="md:col-span-2" />
        <Textarea name="answer" label="Answer" required className="md:col-span-2" />
        <Button type="submit">Publish FAQ</Button>
      </form>

      <ul className="space-y-2 text-sm">
        {(cms.data?.faqs ?? []).map((f) => (
          <li key={f._id} className="gc-card p-3">
            {f.question}
          </li>
        ))}
      </ul>

      <form
        className="gc-card grid gap-3 p-5"
        onSubmit={(e) => {
          e.preventDefault();
          const f = new FormData(e.currentTarget);
          void post(
            '/banners',
            { title: f.get('title'), subtitle: f.get('subtitle'), href: f.get('href'), active: true },
            'Banner saved',
          );
        }}
      >
        <h2 className="font-display text-xl text-gc-black">Banner</h2>
        <Input name="title" label="Title" required />
        <Input name="subtitle" label="Subtitle" />
        <Input name="href" label="Link" placeholder="/courses" />
        <Button type="submit">Add banner</Button>
      </form>

      <form
        className="gc-card grid gap-3 p-5"
        onSubmit={(e) => {
          e.preventDefault();
          const f = new FormData(e.currentTarget);
          void post(
            '/pages',
            { key: f.get('key'), title: f.get('title'), body: f.get('body') },
            'Legal page saved',
          );
        }}
      >
        <h2 className="font-display text-xl text-gc-black">Legal / CMS page</h2>
        <p className="text-sm text-gc-mute">
          Use keys about, about-mission, about-vision and about-future to edit the public About page without changing code.
        </p>
        <Select name="key" label="Key" defaultValue="privacy-policy">
          {['privacy-policy', 'terms-and-conditions', 'refund-policy', 'cookie-policy', 'payment-policy', 'about', 'about-mission', 'about-vision', 'about-future'].map((k) => (
            <option key={k}>{k}</option>
          ))}
        </Select>
        <Input name="title" label="Title" required />
        <Textarea name="body" label="Body" required />
        <Button type="submit">Save page</Button>
      </form>

      <form
        className="gc-card grid gap-3 p-5"
        onSubmit={(e) => {
          e.preventDefault();
          const f = new FormData(e.currentTarget);
          const slug = String(f.get('slug') || '')
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '');
          void post(
            '/blogs',
            {
              title: f.get('title'),
              slug,
              excerpt: f.get('excerpt'),
              body: f.get('body'),
              tags: String(f.get('tags') || '')
                .split(',')
                .map((t) => t.trim())
                .filter(Boolean),
              featured: f.get('featured') === 'on',
              published: true,
            },
            'Article published',
          );
        }}
      >
        <h2 className="font-display text-xl text-gc-black">Blog article</h2>
        <Input name="title" label="Title" required />
        <Input name="slug" label="Slug" required placeholder="how-to-prepare-for-jee" />
        <Input name="excerpt" label="Excerpt" />
        <Input name="tags" label="Tags" placeholder="career, exams, study-tips" />
        <label className="flex items-center gap-2 text-sm text-gc-mist">
          <input type="checkbox" name="featured" className="accent-gc-gold" />
          Feature this article
        </label>
        <Textarea name="body" label="Body" required />
        <Button type="submit">Publish article</Button>
      </form>
    </div>
  );
}
