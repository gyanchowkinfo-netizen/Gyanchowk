'use client';

import { useState } from 'react';
import Link from 'next/link';
import { HomeVisualCardEditor, type HomeCardSectionKind } from '@/components/admin/HomeVisualCardEditor';
import { LearningStackCardManager } from '@/components/admin/LearningStackCardManager';
import { cn } from '@/lib/format';

const TABS: Array<{ id: HomeCardSectionKind; label: string }> = [
  { id: 'why', label: 'Why Gyan Chowk / Learning Stack' },
  { id: 'platform', label: 'Platform' },
  { id: 'discovery', label: 'Discovery' },
];

export default function HomepageCardsPage() {
  const [tab, setTab] = useState<HomeCardSectionKind>('why');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl text-gc-black">Homepage Cards</h1>
        <p className="mt-1 max-w-2xl text-sm text-gc-mute">
          Manage the homepage sections: Why Gyan Chowk / Learning Stack, Platform, and Discovery.
        </p>
        <p className="mt-2 text-sm">
          <Link href="/admin/cms" className="text-[color:var(--brand-blue)] hover:underline">
            Also available from CMS
          </Link>
        </p>
      </div>
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Homepage card sections">
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={tab === item.id}
            className={cn(
              'rounded-full border px-4 py-2 text-sm font-medium transition-colors',
              tab === item.id
                ? 'border-[color:var(--brand-navy)] bg-[color:var(--brand-navy)] text-white'
                : 'border-gc-line bg-white text-gc-mist hover:text-gc-black',
            )}
            onClick={() => setTab(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>
      {tab === 'why' ? (
        <LearningStackCardManager />
      ) : (
        <HomeVisualCardEditor key={tab} kind={tab} />
      )}
    </div>
  );
}
