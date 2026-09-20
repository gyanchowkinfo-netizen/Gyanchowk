'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, Home, LayoutDashboard, User, Users } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { isAppPanelPath } from '@/lib/paths';
import { cn } from '@/lib/format';

export function MobileBottomNavigation() {
  const pathname = usePathname();
  const { user } = useAuth();
  if (isAppPanelPath(pathname)) {
    const dash = user?.role === 'admin' ? '/admin' : user?.role === 'teacher' ? '/teacher' : '/student';
    const items = [
      { href: dash, label: 'Home', icon: LayoutDashboard },
      { href: dash === '/student' ? '/student/courses' : dash === '/teacher' ? '/teacher/courses' : '/admin/courses', label: 'Courses', icon: BookOpen },
      { href: `${dash}/notifications`, label: 'Alerts', icon: User },
    ];
    return <Bar items={items} pathname={pathname} />;
  }
  const items = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/courses', label: 'Courses', icon: BookOpen },
    { href: '/teachers', label: 'Teachers', icon: Users },
    { href: user ? (user.role === 'admin' ? '/admin' : user.role === 'teacher' ? '/teacher' : '/student') : '/login', label: user ? 'App' : 'Login', icon: User },
  ];
  return <Bar items={items} pathname={pathname} />;
}

function Bar({ items, pathname }: { items: Array<{ href: string; label: string; icon: typeof Home }>; pathname: string }) {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 grid border-t border-gc-line bg-[color:var(--gyan-background)]/95 px-2 pt-1 backdrop-blur lg:hidden"
      style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))', gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}
    >
      {items.map((it) => {
        const Icon = it.icon;
        const active = pathname === it.href || (it.href !== '/' && pathname.startsWith(`${it.href}/`));
        return (
          <Link
            key={it.href}
            href={it.href}
            className={cn(
              'flex min-h-12 flex-col items-center justify-center gap-0.5 rounded-xl text-[11px] font-medium',
              active ? 'text-gc-black' : 'text-gc-mute',
            )}
          >
            <Icon size={18} />
            {it.label}
          </Link>
        );
      })}
    </nav>
  );
}
