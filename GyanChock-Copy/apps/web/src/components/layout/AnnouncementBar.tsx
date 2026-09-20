'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { usePathname } from 'next/navigation';
import { isAppPanelPath } from '@/lib/paths';

export function AnnouncementBar() {
  const pathname = usePathname();
  const { data } = useQuery({
    queryKey: ['cms-public'],
    queryFn: () => api<{ banners: Array<{ title?: string; subtitle?: string; href?: string; ctaUrl?: string; placement?: string }> }>('/api/cms/public'),
    staleTime: 60_000,
  });
  if (isAppPanelPath(pathname)) return null;
  const banner = data?.banners?.find((b) => b.placement === 'top' || b.placement === 'announcement');
  if (!banner?.title) return null;
  const href = banner.ctaUrl || banner.href;
  const label = `${banner.title}${banner.subtitle ? ` — ${banner.subtitle}` : ''}`;
  return (
    <div className="border-b border-gc-line px-4 py-2 text-center text-[13px] text-gc-mute">
      {href ? (
        <a href={href} className="line-clamp-1 hover:text-gc-black">
          {label}
        </a>
      ) : (
        <span className="line-clamp-1">{label}</span>
      )}
    </div>
  );
}
