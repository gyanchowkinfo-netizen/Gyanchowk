'use client';

import Link from 'next/link';
import { CoverMedia } from '@/components/public/CoverMedia';
import { TiltCard } from '@/components/motion';
import { authorName, formatDate, readingMinutes } from '@/lib/format';
import type { BlogPost } from '@/lib/types';

export function ArticleCard({ post }: { post: BlogPost }) {
  const mins = readingMinutes(`${post.excerpt ?? ''} ${post.body ?? ''}`);
  const tag = post.tags?.[0];
  return (
    <TiltCard intensity={4} className="h-full">
      <article className="gc-card group flex h-full flex-col overflow-hidden p-0 hover:border-gc-gold">
        <Link href={`/blog/${post.slug}`} className="flex h-full flex-col">
          <div className="relative h-44 overflow-hidden">
            <CoverMedia src={post.cover?.url} alt="" className="transition-transform duration-300 group-hover:scale-[1.04]" />
          </div>
          <div className="flex flex-1 flex-col p-5">
            {tag ? <p className="text-xs uppercase tracking-widest text-gc-glow">{tag}</p> : null}
            <h3 className="mt-2 font-display text-lg group-hover:text-gc-gold">{post.title}</h3>
            {post.excerpt ? <p className="mt-2 line-clamp-2 flex-1 text-sm text-gc-mute">{post.excerpt}</p> : null}
            <p className="mt-4 text-xs text-gc-mute">
              {[authorName(post.author), formatDate(post.publishedAt || post.createdAt), `${mins} min read`]
                .filter(Boolean)
                .join(' · ')}
            </p>
            <span className="mt-3 text-sm text-gc-glow">Read article →</span>
          </div>
        </Link>
      </article>
    </TiltCard>
  );
}
