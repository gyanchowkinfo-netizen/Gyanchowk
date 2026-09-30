'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState, type ComponentType } from 'react';
import { BrandLogo } from '@/components/brand/BrandLogo';
import { PushRegistrar } from '@/components/system/PushRegistrar';
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
  Images,
  Info,
  IndianRupee,
  Layers,
  Shield,
  X,
} from 'lucide-react';

type Icon = ComponentType<{ size?: number; 'aria-hidden'?: boolean }>;
type NavItem = { href: string; label: string; icon: Icon };
type NavGroup = { label: string; items: NavItem[] };

const studentNav: NavGroup[] = [
  {
    label: 'Learn',
    items: [
      { href: '/student', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/student/courses', label: 'My courses', icon: BookOpen },
      { href: '/student/batches', label: 'My batches', icon: GraduationCap },
      { href: '/student/learning', label: 'Learning', icon: PlayCircle },
      { href: '/student/materials', label: 'Materials', icon: FileText },
    ],
  },
  {
    label: 'Practice',
    items: [
      { href: '/student/assignments', label: 'Assignments', icon: ClipboardList },
      { href: '/student/tests', label: 'Tests', icon: ClipboardList },
      { href: '/student/results', label: 'Results', icon: BarChart3 },
      { href: '/student/rankings', label: 'Rankings', icon: Trophy },
    ],
  },
  {
    label: 'Support',
    items: [
      { href: '/student/doubts', label: 'Doubts', icon: HelpCircle },
      { href: '/student/mentorship', label: 'Mentorship', icon: Users },
      { href: '/student/attendance', label: 'Attendance', icon: Users },
      { href: '/student/calendar', label: 'Calendar', icon: Calendar },
      { href: '/student/progress', label: 'Progress', icon: BarChart3 },
      { href: '/student/backlog', label: 'Backlog', icon: ClipboardList },
    ],
  },
  {
    label: 'Account',
    items: [
      { href: '/student/certificates', label: 'Certificates', icon: GraduationCap },
      { href: '/student/downloads', label: 'Downloads', icon: PlayCircle },
      { href: '/student/wallet', label: 'Wallet', icon: Wallet },
      { href: '/student/referrals', label: 'Referrals', icon: Users },
      { href: '/student/wishlist', label: 'Wishlist', icon: BookOpen },
      { href: '/student/payments', label: 'Payments', icon: IndianRupee },
      { href: '/student/notifications', label: 'Notifications', icon: Bell },
      { href: '/student/help', label: 'Help', icon: HelpCircle },
      { href: '/student/settings', label: 'Settings', icon: Settings },
    ],
  },
];

const teacherNav: NavGroup[] = [
  {
    label: 'Teaching',
    items: [
      { href: '/teacher', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/teacher/courses', label: 'Courses', icon: BookOpen },
      { href: '/teacher/batches', label: 'Batches', icon: GraduationCap },
      { href: '/teacher/videos', label: 'Videos', icon: PlayCircle },
      { href: '/teacher/materials', label: 'Materials', icon: FileText },
      { href: '/teacher/students', label: 'Students', icon: Users },
    ],
  },
  {
    label: 'Assessment',
    items: [
      { href: '/teacher/assignments', label: 'Assignments', icon: ClipboardList },
      { href: '/teacher/tests', label: 'Tests', icon: ClipboardList },
      { href: '/teacher/questions', label: 'Question bank', icon: HelpCircle },
      { href: '/teacher/attendance', label: 'Attendance', icon: Users },
    ],
  },
  {
    label: 'Support',
    items: [
      { href: '/teacher/doubts', label: 'Doubts', icon: HelpCircle },
      { href: '/teacher/mentorship', label: 'Mentorship', icon: Users },
      { href: '/teacher/notifications', label: 'Notifications', icon: Bell },
    ],
  },
  {
    label: 'Business',
    items: [
      { href: '/teacher/analytics', label: 'Analytics', icon: BarChart3 },
      { href: '/teacher/earnings', label: 'Earnings', icon: IndianRupee },
      { href: '/teacher/payouts', label: 'Payouts', icon: Wallet },
      { href: '/teacher/settings', label: 'Settings', icon: Settings },
    ],
  },
];

const adminNav: NavGroup[] = [
  {
    label: 'Overview',
    items: [
      { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/admin/reports', label: 'Reports', icon: BarChart3 },
      { href: '/admin/audit-logs', label: 'Audit logs', icon: Shield },
    ],
  },
  {
    label: 'People',
    items: [
      { href: '/admin/students', label: 'Students', icon: Users },
      { href: '/admin/teachers', label: 'Teachers', icon: GraduationCap },
      { href: '/admin/admins', label: 'Admins', icon: Shield },
      { href: '/admin/users', label: 'Users', icon: Users },
    ],
  },
  {
    label: 'Catalogue',
    items: [
      { href: '/admin/catalogue-courses', label: 'Catalogue Courses', icon: LayoutDashboard },
      { href: '/admin/courses', label: 'Courses', icon: BookOpen },
      { href: '/admin/batches', label: 'Batches', icon: GraduationCap },
      { href: '/admin/videos', label: 'Videos', icon: PlayCircle },
      { href: '/admin/materials', label: 'Materials', icon: FileText },
    ],
  },
  {
    label: 'Learning',
    items: [
      { href: '/admin/assignments', label: 'Assignments', icon: ClipboardList },
      { href: '/admin/tests', label: 'Tests', icon: ClipboardList },
      { href: '/admin/questions', label: 'Questions', icon: HelpCircle },
      { href: '/admin/doubts', label: 'Doubts', icon: HelpCircle },
      { href: '/admin/mentorship', label: 'Mentorship', icon: Users },
      { href: '/admin/attendance', label: 'Attendance', icon: Users },
    ],
  },
  {
    label: 'Finance',
    items: [
      { href: '/admin/payments', label: 'Payments', icon: IndianRupee },
      { href: '/admin/refunds', label: 'Refunds', icon: IndianRupee },
      { href: '/admin/coupons', label: 'Coupons', icon: Wallet },
      { href: '/admin/offers', label: 'Offers', icon: Wallet },
      { href: '/admin/wallet', label: 'Wallets', icon: Wallet },
      { href: '/admin/referrals', label: 'Referrals', icon: Users },
      { href: '/admin/payouts', label: 'Payouts', icon: IndianRupee },
    ],
  },
  {
    label: 'Ops',
    items: [
      { href: '/admin/reviews', label: 'Reviews', icon: FileText },
      { href: '/admin/cms', label: 'CMS', icon: FileText },
      { href: '/admin/about-page', label: 'About Page', icon: Info },
      { href: '/admin/teachers-page', label: 'Teachers Page', icon: GraduationCap },
      { href: '/admin/learning-stack', label: 'Why Gyan Chowk', icon: Layers },
      { href: '/admin/homepage-cards', label: 'Homepage Cards', icon: LayoutDashboard },
      { href: '/admin/banners', label: 'Banners', icon: Images },
      { href: '/admin/career', label: 'Career', icon: GraduationCap },
      { href: '/admin/notifications', label: 'Notifications', icon: Bell },
      { href: '/admin/settings', label: 'Settings', icon: Settings },
      { href: '/admin/security', label: 'Security', icon: Shield },
    ],
  },
];

function flatten(groups: NavGroup[]) {
  return groups.flatMap((g) => g.items);
}

function NavLinks({ groups, pathname, onNavigate }: { groups: NavGroup[]; pathname: string; onNavigate?: () => void }) {
  return (
    <nav className="mt-6 space-y-5" aria-label="Panel navigation">
      {groups.map((group) => (
        <div key={group.label}>
          <p className="px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-gc-mute">{group.label}</p>
          <div className="mt-1.5 space-y-0.5">
            {group.items.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href || (item.href.split('/').length > 2 && pathname.startsWith(`${item.href}/`));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onNavigate}
                  className={`flex items-center gap-2 rounded-[10px] px-3 py-2 text-sm transition-colors duration-150 ${
                    active ? 'bg-gc-black text-white' : 'text-gc-mist hover:bg-[color:var(--gyan-primary-soft)] hover:text-gc-black'
                  }`}
                >
                  <Icon size={16} aria-hidden />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}

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
  const groups = role === 'admin' ? adminNav : role === 'teacher' ? teacherNav : studentNav;
  const nav = flatten(groups);
  const [mobileNav, setMobileNav] = useState(false);
  const [headerReady, setHeaderReady] = useState(false);
  const current = nav.find((item) => item.href !== `/${role}` && pathname.startsWith(item.href)) ?? nav.find((item) => item.href === pathname);

  useEffect(() => {
    setHeaderReady(true);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    setMobileNav(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileNav ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileNav]);

  useEffect(() => {
    if (!loading && !user) router.replace('/login');
    if (!loading && user && user.role !== role && !(role === 'admin' && user.role === 'admin')) {
      if (user.role === 'admin') router.replace('/admin');
      else if (user.role === 'teacher') router.replace('/teacher');
      else router.replace('/student');
    }
  }, [loading, user, role, router]);

  return (
    <div className="min-h-screen bg-[color:var(--gyan-background)] text-gc-black">
      <PushRegistrar />
      <aside className="fixed inset-y-0 left-0 hidden w-[272px] overflow-y-auto border-r border-gc-line bg-[color:var(--gyan-surface)] p-4 lg:block">
        <BrandLogo />
        <p className="mt-3 px-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-gc-mute">{role} workspace</p>
        <NavLinks groups={groups} pathname={pathname} />
      </aside>
      <div className="lg:pl-[272px]">
        <header className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-gc-line bg-[color:var(--gyan-background)]/90 px-4 py-3 backdrop-blur">
          <div className="flex min-w-0 items-center gap-3">
            {headerReady ? (
              <button
                type="button"
                className="gc-btn-ghost h-10 w-10 shrink-0 px-0 lg:hidden"
                aria-label="Open menu"
                onClick={() => setMobileNav(true)}
              >
                <Menu size={18} />
              </button>
            ) : (
              <span className="inline-flex h-10 w-10 shrink-0 lg:hidden" aria-hidden />
            )}
            <p className="truncate font-display text-sm font-semibold text-gc-black">{user?.name ?? '…'}</p>
          </div>
          {headerReady ? (
            <button
              type="button"
              className="gc-btn-ghost h-10 px-3"
              aria-label="Log out"
              onClick={async () => {
                await logout();
                router.push('/');
              }}
            >
              <LogOut size={16} aria-hidden />
              <span className="hidden sm:inline">Logout</span>
            </button>
          ) : (
            <span className="inline-flex h-10 min-w-[5.5rem] items-center px-3 sm:min-w-[6.5rem]" aria-hidden />
          )}
        </header>
        <main className="p-4 pb-24 md:p-8 lg:pb-8">
          <nav aria-label="Breadcrumb" className="mb-5 text-xs text-gc-mute">
            <ol className="flex flex-wrap items-center gap-1">
              <li>
                <Link href={`/${role}`} className="hover:text-gc-blue">
                  {role[0].toUpperCase()}
                  {role.slice(1)}
                </Link>
              </li>
              {pathname !== `/${role}` ? (
                <>
                  <li aria-hidden>/</li>
                  <li className="text-gc-black">{current?.label ?? 'Page'}</li>
                </>
              ) : null}
            </ol>
          </nav>
          {children}
        </main>
      </div>
      {mobileNav ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-[color:var(--gyan-primary-dark)]/40"
            aria-label="Close menu"
            onClick={() => setMobileNav(false)}
          />
          <aside className="absolute inset-y-0 left-0 flex w-[min(100%,20rem)] flex-col overflow-y-auto bg-white p-4 shadow-lg">
            <div className="flex items-center justify-between gap-3">
              <BrandLogo />
              <button
                type="button"
                className="gc-btn-ghost h-10 w-10 px-0"
                aria-label="Close menu"
                onClick={() => setMobileNav(false)}
              >
                <X size={18} />
              </button>
            </div>
            <NavLinks groups={groups} pathname={pathname} onNavigate={() => setMobileNav(false)} />
          </aside>
        </div>
      ) : null}
    </div>
  );
}
