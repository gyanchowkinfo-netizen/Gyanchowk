import type { Metadata } from 'next';
import { PanelShell } from '@/components/layout/PanelShell';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: 'Admin',
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <PanelShell role="admin">{children}</PanelShell>;
}
