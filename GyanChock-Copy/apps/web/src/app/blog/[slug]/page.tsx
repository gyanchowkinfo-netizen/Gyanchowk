import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ArticleView } from '@/components/blog/ArticleView';
import { getBlogPost } from '@/lib/content';
import { authorName } from '@/lib/format';

const APP = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const data = await getBlogPost(slug);
  if (!data?.post) return { title: 'Article', robots: { index: false } };
  const post = data.post;
  const title = post.seoTitle || post.title;
  const description = post.seoDescription || post.excerpt || 'An article from Gyan Chowk.';
  return {
    title,
    description,
    robots: { index: true, follow: true },
    alternates: { canonical: `/blog/${slug}` },
    openGraph: {
      title,
      description,
      url: `/blog/${slug}`,
      type: 'article',
      images: post.cover?.url ? [post.cover.url] : ['/g1.png'],
    },
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await getBlogPost(slug);
  if (!data?.post) notFound();
  const post = data.post;
  const related = data.related ?? [];
  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: post.title,
      description: post.excerpt,
      datePublished: post.publishedAt || post.createdAt,
      dateModified: post.updatedAt,
      image: post.cover?.url,
      author: { '@type': 'Person', name: authorName(post.author) || 'Gyan Chowk' },
      publisher: { '@type': 'Organization', name: 'Gyan Chowk', logo: `${APP}/g1.png` },
      url: `${APP}/blog/${slug}`,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: APP },
        { '@type': 'ListItem', position: 2, name: 'Blog', item: `${APP}/blog` },
        { '@type': 'ListItem', position: 3, name: post.title, item: `${APP}/blog/${slug}` },
      ],
    },
  ];
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ArticleView post={post} related={related} url={`${APP}/blog/${slug}`} />
    </>
  );
}
