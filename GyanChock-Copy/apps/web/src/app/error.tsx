'use client';

import { ServerErrorPage } from '@/components/system/SystemPages';

export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return <ServerErrorPage onRetry={reset} />;
}
