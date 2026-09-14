'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, type ReactNode } from 'react';
import { I18nProvider } from '@/i18n/provider';
import { ToastViewport } from '@/components/ui/Overlay';
import { useEffect } from 'react';
import { hydrateCompare } from '@/lib/compare';
import { MotionProvider } from '@/components/motion';

export function Providers({ children }: { children: ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: { queries: { staleTime: 20_000, refetchOnWindowFocus: false, retry: 1 } },
      }),
  );
  useEffect(() => {
    hydrateCompare();
  }, []);
  return (
    <I18nProvider>
      <QueryClientProvider client={client}>
        <MotionProvider>
          {children}
          <ToastViewport />
        </MotionProvider>
      </QueryClientProvider>
    </I18nProvider>
  );
}
