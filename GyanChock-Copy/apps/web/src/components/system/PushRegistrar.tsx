'use client';

import { useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { resubscribeWebPushIfGranted } from '@/lib/push';

export function PushRegistrar() {
  const user = useAuth((s) => s.user);
  useEffect(() => {
    if (!user) return;
    void resubscribeWebPushIfGranted();
  }, [user]);
  return null;
}
