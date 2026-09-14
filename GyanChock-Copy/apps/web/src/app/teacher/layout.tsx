import type { Metadata } from 'next';
import { PanelShell } from '@/components/layout/PanelShell';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: 'Teacher',
};

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  return <PanelShell role="teacher">{children}</PanelShell>;
}
