import type { MetadataRoute } from 'next';
import { API_URL } from '@/lib/api';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const app = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const staticUrls = ['', '/courses', '/batches', '/teachers', '/career', '/career/roadmaps', '/blog', '/about', '/contact', '/faq'].map(
    (path) => ({ url: `${app}${path}`, lastModified: new Date() }),
  );
  try {
    const [courseRes, teacherRes, batchRes, careerRes, blogRes, roadmapRes] = await Promise.all([
      fetch(`${API_URL}/api/courses?limit=50`, { next: { revalidate: 3600 }, signal: AbortSignal.timeout(12_000) }),
      fetch(`${API_URL}/api/catalog/teachers?limit=100`, { next: { revalidate: 3600 }, signal: AbortSignal.timeout(12_000) }),
      fetch(`${API_URL}/api/batches?limit=100`, { next: { revalidate: 3600 }, signal: AbortSignal.timeout(12_000) }),
      fetch(`${API_URL}/api/career/articles`, { next: { revalidate: 3600 }, signal: AbortSignal.timeout(12_000) }),
      fetch(`${API_URL}/api/cms/blogs`, { next: { revalidate: 3600 }, signal: AbortSignal.timeout(12_000) }),
      fetch(`${API_URL}/api/career/roadmaps`, { next: { revalidate: 3600 }, signal: AbortSignal.timeout(12_000) }),
    ]);
    const coursesJson = (await courseRes.json()) as { items?: Array<{ slug: string; updatedAt?: string }> };
    const teachersJson = (await teacherRes.json()) as { items?: Array<{ _id: string; createdAt?: string }> };
    const batchesJson = (await batchRes.json()) as { items?: Array<{ slug: string; updatedAt?: string; createdAt?: string }> };
    const careerJson = (await careerRes.json()) as { items?: Array<{ slug: string; updatedAt?: string }> };
    const blogJson = (await blogRes.json()) as { items?: Array<{ slug: string; updatedAt?: string; publishedAt?: string }> };
    const roadmapJson = (await roadmapRes.json()) as { items?: Array<{ slug: string; updatedAt?: string }> };
    const courses = (coursesJson.items ?? []).map((c) => ({
      url: `${app}/courses/${c.slug}`,
      lastModified: c.updatedAt ? new Date(c.updatedAt) : new Date(),
    }));
    const teachers = (teachersJson.items ?? []).map((t) => ({
      url: `${app}/teachers/${t._id}`,
      lastModified: t.createdAt ? new Date(t.createdAt) : new Date(),
    }));
    const batches = (batchesJson.items ?? []).map((b) => ({
      url: `${app}/batches/${b.slug}`,
      lastModified: b.updatedAt ? new Date(b.updatedAt) : b.createdAt ? new Date(b.createdAt) : new Date(),
    }));
    const career = (careerJson.items ?? []).map((a) => ({
      url: `${app}/career/${a.slug}`,
      lastModified: a.updatedAt ? new Date(a.updatedAt) : new Date(),
    }));
    const blogs = (blogJson.items ?? []).map((p) => ({
      url: `${app}/blog/${p.slug}`,
      lastModified: p.updatedAt ? new Date(p.updatedAt) : p.publishedAt ? new Date(p.publishedAt) : new Date(),
    }));
    const roadmaps = (roadmapJson.items ?? []).map((r) => ({
      url: `${app}/career/roadmaps/${r.slug}`,
      lastModified: r.updatedAt ? new Date(r.updatedAt) : new Date(),
    }));
    return [...staticUrls, ...courses, ...teachers, ...batches, ...career, ...blogs, ...roadmaps];
  } catch {
    return staticUrls;
  }
}
