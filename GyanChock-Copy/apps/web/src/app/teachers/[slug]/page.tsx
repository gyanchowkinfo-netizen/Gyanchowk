import type { Metadata } from 'next';
import { cache } from 'react';
import { notFound } from 'next/navigation';
import { api } from '@/lib/api';
import { TeacherProfileView, type TeacherProfilePayload } from '@/components/teachers/TeacherProfileView';
import { staticParams } from '@/lib/static-params';

export const dynamic = 'force-static';
export const dynamicParams = false;
export const revalidate = 120;

export function generateStaticParams() {
  return staticParams('/api/catalog/teachers?limit=200', '_id');
}

const APP = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

const loadTeacher = cache(async (id: string) => api<TeacherProfilePayload>(`/api/catalog/teachers/${id}`));

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  try {
    const data = await loadTeacher(slug);
    const t = data.teacher;
    const description = (t.headline || t.bio || `Learn from ${t.name} on Gyan Chowk.`).slice(0, 160);
    return {
      title: t.name,
      description,
      alternates: { canonical: `/teachers/${slug}` },
      openGraph: {
        title: `${t.name} | Gyan Chowk`,
        description,
        url: `/teachers/${slug}`,
        images: t.avatar?.url ? [t.avatar.url] : ['/g1.png'],
      },
    };
  } catch {
    return { title: 'Teacher', robots: { index: false, follow: true } };
  }
}

export default async function TeacherProfilePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  try {
    const data = await loadTeacher(slug);
    const t = data.teacher;
    const jsonLd = [
      {
        '@context': 'https://schema.org',
        '@type': 'Person',
        name: t.name,
        description: t.headline || t.bio,
        image: t.avatar?.url,
        url: `${APP}/teachers/${t._id}`,
        jobTitle: t.headline || 'Teacher',
        worksFor: { '@type': 'EducationalOrganization', name: 'Gyan Chowk', url: APP },
      },
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: APP },
          { '@type': 'ListItem', position: 2, name: 'Teachers', item: `${APP}/teachers` },
          { '@type': 'ListItem', position: 3, name: t.name, item: `${APP}/teachers/${t._id}` },
        ],
      },
    ];
    return (
      <>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <TeacherProfileView slug={slug} initial={data} />
      </>
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : '';
    if (/not found/i.test(message)) notFound();
    return <TeacherProfileView slug={slug} />;
  }
}
