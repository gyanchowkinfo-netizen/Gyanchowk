'use client';

import { FormEvent, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useDebounce } from '@/lib/hooks';
import { ScrollProgress } from '@/components/motion';
import { ErrorState } from '@/components/ui/States';
import type { BlogPost, BlogTag } from '@/lib/types';
import { BlogHero } from './BlogHero';
import { FeaturedArticle } from './FeaturedArticle';
import { BlogCategories } from './BlogCategories';
import { ArticleGrid } from './ArticleGrid';
import { PopularArticles } from './PopularArticles';
import { BlogCTA } from './BlogCTA';

interface Listing {
  items: BlogPost[];
  tags?: BlogTag[];
  featured?: BlogPost | null;
  featuredReads?: BlogPost[];
}

export function BlogPageClient() {
  const [query, setQuery] = useState('');
  const [tag, setTag] = useState('');
  const dq = useDebounce(query, 280);
  const qs = useMemo(() => {
    const u = new URLSearchParams();
    if (dq) u.set('q', dq);
    if (tag) u.set('tag', tag);
    const s = u.toString();
    return s ? `?${s}` : '';
  }, [dq, tag]);

  const listing = useQuery({
    queryKey: ['blogs', qs],
    queryFn: () => api<Listing>(`/api/cms/blogs${qs}`),
  });

  if (listing.isError && !listing.data) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-16">
        <ErrorState message="Unable to load articles." onRetry={() => void listing.refetch()} />
      </main>
    );
  }

  const items = listing.data?.items ?? [];
  const featured = listing.data?.featured ?? null;
  const featuredReads = listing.data?.featuredReads ?? [];

  return (
    <main>
      <ScrollProgress />
      <BlogHero
        query={query}
        onQuery={setQuery}
        onSearch={(e: FormEvent) => {
          e.preventDefault();
          document.getElementById('articles')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }}
      />
      {featured && !dq && !tag ? <FeaturedArticle post={featured} /> : null}
      <BlogCategories
        tags={listing.data?.tags ?? []}
        active={tag}
        onSelect={(name) => {
          setTag(name);
          document.getElementById('articles')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }}
      />
      <ArticleGrid items={items} query={dq} tag={tag} loading={listing.isLoading} />
      {!dq && !tag ? <PopularArticles items={featuredReads.filter((p) => p.slug !== featured?.slug)} /> : null}
      <BlogCTA />
    </main>
  );
}
