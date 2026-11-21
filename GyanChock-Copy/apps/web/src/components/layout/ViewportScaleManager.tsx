'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export function ViewportScaleManager() {
  const pathname = usePathname();

  useEffect(() => {
    function applyDesktopScale() {
      try {
        const target = 1200;
        const w = window.screen.width;
        const h = window.screen.height;
        if (!w || w <= 0) return;

        const isLandscape =
          window.orientation === 90 ||
          window.orientation === -90 ||
          (window.innerWidth > 0 && window.innerHeight > 0 && window.innerWidth > window.innerHeight) ||
          (typeof window.matchMedia === 'function' && window.matchMedia('(orientation: landscape)').matches);

        const screenWidth = isLandscape ? Math.max(w, h) : Math.min(w, h);

        if (screenWidth < target) {
          const scale = Number((screenWidth / target).toFixed(4));
          const content = `width=${target}, initial-scale=${scale}, minimum-scale=${scale}, maximum-scale=5.0, user-scalable=yes, viewport-fit=cover`;
          const meta = document.querySelector('meta[name="viewport"]');
          if (meta) {
            meta.setAttribute('content', content);
          } else {
            const newMeta = document.createElement('meta');
            newMeta.name = 'viewport';
            newMeta.content = content;
            document.head.appendChild(newMeta);
          }
        }
      } catch {
        // no-op
      }
    }

    applyDesktopScale();

    window.addEventListener('resize', applyDesktopScale);
    window.addEventListener('orientationchange', applyDesktopScale);

    return () => {
      window.removeEventListener('resize', applyDesktopScale);
      window.removeEventListener('orientationchange', applyDesktopScale);
    };
  }, [pathname]);

  return null;
}
