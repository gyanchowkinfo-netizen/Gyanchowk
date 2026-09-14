'use client';

import { FormEvent } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { toast } from '@/lib/toast';
import { EmptyState, LoadingState } from '@/components/ui/States';

export default function AdminCareerPage() {
  const articles = useQuery({
    queryKey: ['career-articles'],
    queryFn: () => api<{ items: Array<{ _id: string; title: string; slug: string }> }>('/api/career/articles'),
  });
  const roadmaps = useQuery({
    queryKey: ['career-roadmaps'],
    queryFn: () => api<{ items: Array<{ _id: string; title: string; slug: string }> }>('/api/career/roadmaps'),
  });

  async function createArticle(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const slug = String(f.get('slug'))
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    try {
      await api('/api/career/admin/articles', {
        method: 'POST',
        body: JSON.stringify({
          title: f.get('title'),
          slug,
          excerpt: f.get('excerpt'),
          body: f.get('body'),
          category: f.get('category'),
          featured: f.get('featured') === 'on',
          published: true,
        }),
      });
      toast.success('Article published');
      await articles.refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed');
    }
  }

  async function createRoadmap(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const slug = String(f.get('slug'))
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    try {
      await api('/api/career/admin/roadmaps', {
        method: 'POST',
        body: JSON.stringify({
          title: f.get('title'),
          slug,
          description: f.get('description'),
          published: true,
        }),
      });
      toast.success('Roadmap published');
      await roadmaps.refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed');
    }
  }

  return (
    <div className="space-y-8">
      <h1 className="font-display text-3xl text-gc-black">Career CMS</h1>
      <form onSubmit={createArticle} className="gc-card space-y-3 p-5">
        <h2 className="font-display text-xl">New article</h2>
        <Input name="title" label="Title" required />
        <Input name="slug" label="Slug" required />
        <Input name="excerpt" label="Excerpt" />
        <Input name="category" label="Category" placeholder="Career, Exams, Interviews" />
        <label className="flex items-center gap-2 text-sm text-gc-mist">
          <input type="checkbox" name="featured" className="accent-gc-gold" />
          Feature this article
        </label>
        <Textarea name="body" label="Body" required />
        <Button type="submit">Publish</Button>
      </form>
      {articles.isLoading ? <LoadingState /> : null}
      <ul className="space-y-2 text-sm">
        {(articles.data?.items ?? []).map((a) => (
          <li key={a._id} className="gc-card p-3">
            {a.title} · /career/{a.slug}
          </li>
        ))}
      </ul>
      {!articles.data?.items?.length ? <EmptyState title="No career articles yet" /> : null}
      <form onSubmit={createRoadmap} className="gc-card space-y-3 p-5">
        <h2 className="font-display text-xl">New roadmap</h2>
        <Input name="title" label="Title" required />
        <Input name="slug" label="Slug" required />
        <Textarea name="description" label="Description" />
        <Button type="submit">Publish roadmap</Button>
      </form>
      <ul className="space-y-2 text-sm">
        {(roadmaps.data?.items ?? []).map((a) => (
          <li key={a._id} className="gc-card p-3">
            {a.title} · /career/roadmaps/{a.slug}
          </li>
        ))}
      </ul>
    </div>
  );
}
