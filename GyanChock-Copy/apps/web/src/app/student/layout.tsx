import type { Metadata } from 'next';
import { PanelShell } from '@/components/layout/PanelShell';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: 'Student',
};

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return <PanelShell role="student">{children}</PanelShell>;
}
