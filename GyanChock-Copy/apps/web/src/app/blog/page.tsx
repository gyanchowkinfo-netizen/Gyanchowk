import { BlogPageClient } from '@/components/blog/BlogPageClient';
import { getBlogListing } from '@/lib/content';

const APP = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export default async function BlogPage() {
  const data = await getBlogListing();
  const items = data.items ?? [];
  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'Blog',
      name: 'Gyan Chowk Blog',
      url: `${APP}/blog`,
      blogPost: items.map((p) => ({
        '@type': 'BlogPosting',
        headline: p.title,
        url: `${APP}/blog/${p.slug}`,
        datePublished: p.publishedAt || p.createdAt,
      })),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: APP },
        { '@type': 'ListItem', position: 2, name: 'Blog', item: `${APP}/blog` },
      ],
    },
  ];
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ul className="sr-only">
        {items.map((p) => (
          <li key={p.slug}>{p.title}</li>
        ))}
      </ul>
      <BlogPageClient />
    </>
  );
}
