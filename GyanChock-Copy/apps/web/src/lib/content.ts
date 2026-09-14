import { cache } from 'react';
import { api } from '@/lib/api';
import type { BlogPost, CareerArticle, CareerCategory, CareerRoadmap, CmsPage, PublicPlatformStats } from '@/lib/types';

export const getCareerListing = cache(async () => {
  try {
    const [articles, roadmaps] = await Promise.all([
      api<{ items: CareerArticle[]; categories?: CareerCategory[]; featured?: CareerArticle[] }>('/api/career/articles'),
      api<{ items: CareerRoadmap[] }>('/api/career/roadmaps'),
    ]);
    return {
      articles: articles.items ?? [],
      categories: articles.categories ?? [],
      featured: articles.featured ?? [],
      roadmaps: roadmaps.items ?? [],
    };
  } catch {
    return { articles: [], categories: [], featured: [], roadmaps: [] };
  }
});

export const getCareerArticle = cache(async (slug: string) => {
  try {
    return await api<{ item: CareerArticle; related?: CareerArticle[] }>(`/api/career/articles/${slug}`);
  } catch {
    return null;
  }
});

export const getCareerRoadmap = cache(async (slug: string) => {
  try {
    return await api<{ item: CareerRoadmap }>(`/api/career/roadmaps/${slug}`);
  } catch {
    return null;
  }
});

export const getBlogListing = cache(async () => {
  try {
    return await api<{
      items: BlogPost[];
      tags?: Array<{ name: string; count: number }>;
      featured?: BlogPost | null;
      featuredReads?: BlogPost[];
    }>('/api/cms/blogs');
  } catch {
    return { items: [] as BlogPost[], tags: [], featured: null, featuredReads: [] };
  }
});

export const getBlogPost = cache(async (slug: string) => {
  try {
    return await api<{ post: BlogPost; related?: BlogPost[] }>(`/api/cms/blogs/${slug}`);
  } catch {
    return null;
  }
});

export const getPublicCms = cache(async () => {
  try {
    return await api<{
      pages?: CmsPage[];
      stats?: PublicPlatformStats;
    }>('/api/cms/public');
  } catch {
    return { pages: [] as CmsPage[], stats: undefined };
  }
});

export function cmsBody(pages: CmsPage[] | undefined, key: string) {
  return pages?.find((p) => p.key === key);
}
