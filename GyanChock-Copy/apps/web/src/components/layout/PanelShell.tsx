'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { BrandLogo } from '@/components/brand/BrandLogo';
import { useAuth } from '@/lib/auth';
import {
  Bell,
  BookOpen,
  Calendar,
  ClipboardList,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  Trophy,
  Users,
  Wallet,
  PlayCircle,
  HelpCircle,
  BarChart3,
  FileText,
  IndianRupee,
  Shield,
} from 'lucide-react';

const studentNav = [
  { href: '/student', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/student/courses', label: 'My courses', icon: BookOpen },
  { href: '/student/batches', label: 'My batches', icon: GraduationCap },
  { href: '/student/learning', label: 'Learning', icon: PlayCircle },
  { href: '/student/materials', label: 'Materials', icon: FileText },
  { href: '/student/assignments', label: 'Assignments', icon: ClipboardList },
  { href: '/student/tests', label: 'Tests', icon: ClipboardList },
  { href: '/student/results', label: 'Results', icon: BarChart3 },
  { href: '/student/rankings', label: 'Rankings', icon: Trophy },
  { href: '/student/doubts', label: 'Doubts', icon: HelpCircle },
  { href: '/student/mentorship', label: 'Mentorship', icon: Users },
  { href: '/student/attendance', label: 'Attendance', icon: Users },
  { href: '/student/calendar', label: 'Calendar', icon: Calendar },
  { href: '/student/progress', label: 'Progress', icon: BarChart3 },
  { href: '/student/backlog', label: 'Backlog', icon: ClipboardList },
  { href: '/student/certificates', label: 'Certificates', icon: GraduationCap },
  { href: '/student/wallet', label: 'Wallet', icon: Wallet },
  { href: '/student/referrals', label: 'Referrals', icon: Users },
  { href: '/student/wishlist', label: 'Wishlist', icon: BookOpen },
  { href: '/student/payments', label: 'Payments', icon: IndianRupee },
  { href: '/student/notifications', label: 'Notifications', icon: Bell },
  { href: '/student/help', label: 'Help', icon: HelpCircle },
  { href: '/student/settings', label: 'Settings', icon: Settings },
];

const teacherNav = [
  { href: '/teacher', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/teacher/courses', label: 'Courses', icon: BookOpen },
  { href: '/teacher/batches', label: 'Batches', icon: GraduationCap },
  { href: '/teacher/videos', label: 'Videos', icon: PlayCircle },
  { href: '/teacher/materials', label: 'Materials', icon: FileText },
  { href: '/teacher/assignments', label: 'Assignments', icon: ClipboardList },
  { href: '/teacher/tests', label: 'Tests', icon: ClipboardList },
  { href: '/teacher/questions', label: 'Question bank', icon: HelpCircle },
  { href: '/teacher/doubts', label: 'Doubts', icon: HelpCircle },
  { href: '/teacher/mentorship', label: 'Mentorship', icon: Users },
  { href: '/teacher/attendance', label: 'Attendance', icon: Users },
  { href: '/teacher/students', label: 'Students', icon: Users },
  { href: '/teacher/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/teacher/earnings', label: 'Earnings', icon: IndianRupee },
  { href: '/teacher/payouts', label: 'Payouts', icon: Wallet },
  { href: '/teacher/notifications', label: 'Notifications', icon: Bell },
  { href: '/teacher/settings', label: 'Settings', icon: Settings },
];

const adminNav = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/students', label: 'Students', icon: Users },
  { href: '/admin/teachers', label: 'Teachers', icon: GraduationCap },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/courses', label: 'Courses', icon: BookOpen },
  { href: '/admin/batches', label: 'Batches', icon: GraduationCap },
  { href: '/admin/videos', label: 'Videos', icon: PlayCircle },
  { href: '/admin/materials', label: 'Materials', icon: FileText },
  { href: '/admin/assignments', label: 'Assignments', icon: ClipboardList },
  { href: '/admin/tests', label: 'Tests', icon: ClipboardList },
  { href: '/admin/questions', label: 'Questions', icon: HelpCircle },
  { href: '/admin/doubts', label: 'Doubts', icon: HelpCircle },
  { href: '/admin/mentorship', label: 'Mentorship', icon: Users },
  { href: '/admin/attendance', label: 'Attendance', icon: Users },
  { href: '/admin/payments', label: 'Payments', icon: IndianRupee },
  { href: '/admin/refunds', label: 'Refunds', icon: IndianRupee },
  { href: '/admin/coupons', label: 'Coupons', icon: Wallet },
  { href: '/admin/offers', label: 'Offers', icon: Wallet },
  { href: '/admin/wallet', label: 'Wallets', icon: Wallet },
  { href: '/admin/referrals', label: 'Referrals', icon: Users },
  { href: '/admin/reviews', label: 'Reviews', icon: FileText },
  { href: '/admin/payouts', label: 'Payouts', icon: IndianRupee },
  { href: '/admin/cms', label: 'CMS', icon: FileText },
  { href: '/admin/career', label: 'Career', icon: GraduationCap },
  { href: '/admin/notifications', label: 'Notifications', icon: Bell },
  { href: '/admin/reports', label: 'Reports', icon: BarChart3 },
  { href: '/admin/audit-logs', label: 'Audit logs', icon: Shield },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
  { href: '/admin/security', label: 'Security', icon: Shield },
];

export function PanelShell({
  role,
  children,
}: {
  role: 'student' | 'teacher' | 'admin';
  children: React.ReactNode;
}) {
  const { user, loading, refresh, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const nav = role === 'admin' ? adminNav : role === 'teacher' ? teacherNav : studentNav;
  const [mobileNav, setMobileNav] = useState(false);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    if (!loading && !user) router.replace('/login');
    if (!loading && user && user.role !== role && !(role === 'admin' && user.role === 'admin')) {
      if (user.role === 'admin') router.replace('/admin');
      else if (user.role === 'teacher') router.replace('/teacher');
      else router.replace('/student');
    }
  }, [loading, user, role, router]);

  return (
    <div className="min-h-screen bg-gyan-background text-gc-black">
      <aside className="fixed inset-y-0 left-0 hidden w-64 overflow-y-auto border-r border-gc-line bg-gc-navy p-4 lg:block">
        <BrandLogo />
        <p className="mt-3 text-[10px] uppercase tracking-[0.25em] text-gc-gold">{role} panel</p>
        <nav className="mt-6 space-y-1">
          {nav.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors duration-200 ${
                  active ? 'bg-gc-blue text-white' : 'text-gc-mist hover:bg-gc-ink hover:text-gc-gold'
                }`}
              >
                <Icon size={16} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-gc-line bg-gyan-background/80 px-4 py-3 backdrop-blur">
          <div className="flex items-center gap-3">
            <button className="gc-btn-ghost lg:hidden" aria-label="Open menu" onClick={() => setMobileNav(true)}>
              <Menu size={18} />
            </button>
            <p className="font-display text-sm text-gc-gold">{user?.name ?? '…'}</p>
          </div>
          <button
            className="gc-btn-ghost"
            onClick={async () => {
              await logout();
              router.push('/');
            }}
          >
            <LogOut size={16} /> Logout
          </button>
        </header>
        <main className="p-4 pb-24 md:p-8 lg:pb-8">{children}</main>
      </div>
      {mobileNav ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button className="absolute inset-0 bg-black/60" aria-label="Close menu" onClick={() => setMobileNav(false)} />
          <aside className="absolute inset-y-0 left-0 w-72 overflow-y-auto bg-gc-navy p-4">
            <BrandLogo />
            <nav className="mt-4 space-y-1">
              {nav.map((item) => (
                <Link key={item.href} href={item.href} className="block rounded-lg px-3 py-2 text-sm text-gc-mist" onClick={() => setMobileNav(false)}>
                  {item.label}
                </Link>
              ))}
            </nav>
          </aside>
        </div>
      ) : null}
    </div>
  );
}
