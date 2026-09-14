'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { usePathname } from 'next/navigation';
import { isAppPanelPath } from '@/lib/paths';

export function AnnouncementBar() {
  const pathname = usePathname();
  const { data } = useQuery({
    queryKey: ['cms-public'],
    queryFn: () => api<{ banners: Array<{ title?: string; subtitle?: string; href?: string; placement?: string }> }>('/api/cms/public'),
    staleTime: 60_000,
  });
  if (isAppPanelPath(pathname)) return null;
  const banner = data?.banners?.find((b) => b.placement === 'hero' || b.title);
  if (!banner?.title) return null;
  return (
    <div className="border-b border-gc-line/70 bg-gc-blue/40 px-4 py-2 text-center text-sm">
      {banner.href ? (
        <a href={banner.href} className="text-gc-gold hover:underline">
          {banner.title} {banner.subtitle ? `— ${banner.subtitle}` : ''}
        </a>
      ) : (
        <span>
          {banner.title} {banner.subtitle}
        </span>
      )}
    </div>
  );
}
