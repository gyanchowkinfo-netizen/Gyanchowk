'use client';

import Link from 'next/link';
import { PageContainer } from '@/components/layout/Page';
import { CoverMedia } from '@/components/public/CoverMedia';
import { Reveal } from '@/components/motion';
import { authorName, formatDate, readingMinutes } from '@/lib/format';
import type { BlogPost } from '@/lib/types';

export function FeaturedArticle({ post }: { post: BlogPost }) {
  const mins = readingMinutes(`${post.excerpt ?? ''} ${post.body ?? ''}`);
  const tag = post.tags?.[0];
  return (
    <section id="featured" className="relative">
      <PageContainer>
        <Reveal>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gc-gold">Featured article</p>
        </Reveal>
        <div className="mt-6 grid items-center gap-8 overflow-hidden rounded-3xl border border-gc-line bg-gc-ink/50 lg:grid-cols-2">
          <Reveal>
            <div className="relative aspect-[16/10] overflow-hidden lg:aspect-auto lg:h-full lg:min-h-[320px]">
              <CoverMedia src={post.cover?.url} alt={post.title} sizes="(max-width: 1024px) 100vw, 50vw" className="origin-center" />
            </div>
          </Reveal>
          <Reveal delay={0.08} direction="right">
            <div className="p-6 md:p-8">
              {tag ? <p className="text-xs uppercase tracking-widest text-gc-glow">{tag}</p> : null}
              <h2 className="mt-2 font-display text-3xl text-gc-black md:text-4xl">{post.title}</h2>
              {post.excerpt ? <p className="mt-4 text-gc-mist">{post.excerpt}</p> : null}
              <p className="mt-4 text-sm text-gc-mute">
                {[authorName(post.author), formatDate(post.publishedAt || post.createdAt), `${mins} min read`]
                  .filter(Boolean)
                  .join(' · ')}
              </p>
              <Link href={`/blog/${post.slug}`} className="gc-btn-gold mt-6 inline-flex">
                Read Article
              </Link>
            </div>
          </Reveal>
        </div>
      </PageContainer>
    </section>
  );
}
