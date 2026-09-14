'use client';

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { ScrollProgress } from '@/components/motion';
import { ErrorState } from '@/components/ui/States';
import type { CareerArticle, CareerCategory, CareerRoadmap } from '@/lib/types';
import { CareerHero } from './CareerHero';
import { CareerExplorer } from './CareerExplorer';
import { CareerPath } from './CareerPath';
import { CareerRoadmaps } from './CareerRoadmaps';
import { CareerSkills } from './CareerSkills';
import { CareerResources } from './CareerResources';
import { CareerArticles } from './CareerArticles';
import { CareerCTA } from './CareerCTA';

interface Listing {
  items: CareerArticle[];
  categories?: CareerCategory[];
  featured?: CareerArticle[];
}

export function CareerPageClient() {
  const [category, setCategory] = useState('');
  const articles = useQuery({
    queryKey: ['career-articles'],
    queryFn: () => api<Listing>('/api/career/articles'),
  });
  const roadmaps = useQuery({
    queryKey: ['career-roadmaps'],
    queryFn: () => api<{ items: CareerRoadmap[] }>('/api/career/roadmaps'),
  });

  const list = useMemo(() => {
    const items = articles.data?.items ?? [];
    if (category) return items.filter((item) => item.category === category);
    const featured = articles.data?.featured ?? [];
    if (featured.length) return featured;
    return items.slice(0, 6);
  }, [articles.data, category]);

  if (articles.isError && roadmaps.isError) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-16">
        <ErrorState
          message="Unable to load career resources."
          onRetry={() => {
            void articles.refetch();
            void roadmaps.refetch();
          }}
        />
      </main>
    );
  }

  return (
    <main>
      <ScrollProgress />
      <CareerHero />
      <CareerExplorer
        categories={articles.data?.categories ?? []}
        articleCount={articles.data?.items?.length ?? 0}
        roadmapCount={roadmaps.data?.items?.length ?? 0}
        onCategory={(name) => {
          setCategory(name);
          document.getElementById('articles')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }}
      />
      <CareerPath />
      <CareerRoadmaps items={roadmaps.data?.items ?? []} loading={roadmaps.isLoading} />
      <CareerSkills />
      <CareerResources />
      <CareerArticles items={list} category={category} onClear={() => setCategory('')} loading={articles.isLoading} />
      <CareerCTA />
    </main>
  );
}
