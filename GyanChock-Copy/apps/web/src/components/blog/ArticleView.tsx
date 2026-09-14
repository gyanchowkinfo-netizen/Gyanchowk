'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { PageContainer, Breadcrumbs } from '@/components/layout/Page';
import { CoverMedia } from '@/components/public/CoverMedia';
import { ScrollProgress } from '@/components/motion';
import { authorName, formatDate, readingMinutes } from '@/lib/format';
import { extractHeadings, renderArticleBlocks } from '@/lib/article';
import type { BlogPost } from '@/lib/types';
import { ArticleCard } from './ArticleCard';
import { BlogCTA } from './BlogCTA';

export function ArticleView({
  post,
  related,
  url,
}: {
  post: BlogPost;
  related: BlogPost[];
  url: string;
}) {
  const headings = useMemo(() => extractHeadings(post.body), [post.body]);
  const blocks = useMemo(() => renderArticleBlocks(post.body), [post.body]);
  const [active, setActive] = useState(headings[0]?.id ?? '');
  const mins = readingMinutes(`${post.excerpt ?? ''} ${post.body ?? ''}`);
  const tag = post.tags?.[0];

  useEffect(() => {
    if (!headings.length) return;
    const els = headings
      .map((h) => document.getElementById(h.id))
      .filter((el): el is HTMLElement => Boolean(el));
    if (!els.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target.id) setActive(visible.target.id);
      },
      { rootMargin: '-20% 0px -60% 0px', threshold: [0, 0.25, 0.6] },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [headings]);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
    } catch {
      /* ignore */
    }
  }

  const shareUrl = url;

  return (
    <main>
      <ScrollProgress />
      <PageContainer>
        <Breadcrumbs items={[{ href: '/', label: 'Home' }, { href: '/blog', label: 'Blog' }, { label: post.title }]} />
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_220px]">
          <article>
            {tag ? <p className="text-xs uppercase tracking-widest text-gc-glow">{tag}</p> : null}
            <h1 className="mt-2 font-display text-4xl text-gc-black md:text-5xl">{post.title}</h1>
            {post.excerpt ? <p className="mt-4 text-lg text-gc-mist">{post.excerpt}</p> : null}
            <p className="mt-3 text-sm text-gc-mute">
              {[authorName(post.author), formatDate(post.publishedAt || post.createdAt), `${mins} min read`]
                .filter(Boolean)
                .join(' · ')}
            </p>
            {post.cover?.url ? (
              <div className="relative mt-8 aspect-[16/8] overflow-hidden rounded-3xl border border-gc-line">
                <CoverMedia src={post.cover.url} alt={post.title} sizes="(max-width: 1024px) 100vw, 800px" />
              </div>
            ) : null}
            <div className="mt-8 max-w-3xl space-y-4 text-gc-mist">
              {blocks.map((block, i) => {
                if (block.type === 'h2') {
                  return (
                    <h2 key={block.id ?? i} id={block.id} className="scroll-mt-24 font-display text-2xl text-gc-black">
                      {block.text}
                    </h2>
                  );
                }
                if (block.type === 'h3') {
                  return (
                    <h3 key={block.id ?? i} id={block.id} className="scroll-mt-24 font-display text-xl text-gc-black">
                      {block.text}
                    </h3>
                  );
                }
                return (
                  <p key={i} className="whitespace-pre-wrap">
                    {block.text}
                  </p>
                );
              })}
            </div>
            <div className="mt-10 flex flex-wrap gap-2">
              <button type="button" className="gc-btn-ghost" onClick={() => void copyLink()}>
                Copy link
              </button>
              <a
                className="gc-btn-ghost"
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(shareUrl)}`}
                target="_blank"
                rel="noreferrer"
              >
                Share on X
              </a>
              <a
                className="gc-btn-ghost"
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`}
                target="_blank"
                rel="noreferrer"
              >
                Share on LinkedIn
              </a>
            </div>
          </article>
          {headings.length ? (
            <aside className="hidden lg:block">
              <nav className="sticky top-24 space-y-2 text-sm" aria-label="Table of contents">
                <p className="text-xs uppercase tracking-widest text-gc-gold">On this page</p>
                {headings.map((h) => (
                  <a
                    key={h.id}
                    href={`#${h.id}`}
                    className={active === h.id ? 'block text-gc-gold' : 'block text-gc-mute hover:text-gc-mist'}
                  >
                    {h.text}
                  </a>
                ))}
              </nav>
            </aside>
          ) : null}
        </div>
        {related.length ? (
          <section className="mt-16">
            <h2 className="font-display text-2xl text-gc-black">Related articles</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {related.map((item) => (
                <ArticleCard key={item.slug} post={item} />
              ))}
            </div>
          </section>
        ) : null}
        <div className="mt-8">
          <Link href="/blog" className="text-sm text-gc-glow hover:underline">
            ← All articles
          </Link>
        </div>
      </PageContainer>
      <BlogCTA />
    </main>
  );
}
