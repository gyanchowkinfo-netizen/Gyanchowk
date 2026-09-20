import type { Metadata } from 'next';
import { API_URL } from '@/lib/api';
import { staticParams } from '@/lib/static-params';

export const dynamic = 'force-static';
export const dynamicParams = false;
export const revalidate = 120;

export function generateStaticParams() {
  return staticParams('/api/courses?limit=200');
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  try {
    const res = await fetch(`${API_URL}/api/courses/${slug}`, { next: { revalidate: 120 } });
    const data = (await res.json()) as { course?: { title?: string; subtitle?: string; seoTitle?: string; seoDescription?: string } };
    const title = data.course?.seoTitle || data.course?.title || 'Course';
    const description = data.course?.seoDescription || data.course?.subtitle || 'Recorded course on Gyan Chowk';
    return {
      title,
      description,
      alternates: { canonical: `/courses/${slug}` },
      openGraph: { title, description, images: ['/g1.png'] },
    };
  } catch {
    return { title: 'Course' };
  }
}

export default function CourseLayout({ children }: { children: React.ReactNode }) {
  return children;
}
