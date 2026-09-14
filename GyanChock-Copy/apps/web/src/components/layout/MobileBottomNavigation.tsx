'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, GraduationCap, Home, LayoutDashboard, User } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { isAppPanelPath } from '@/lib/paths';

export function MobileBottomNavigation() {
  const pathname = usePathname();
  const { user } = useAuth();
  if (isAppPanelPath(pathname)) {
    const dash = user?.role === 'admin' ? '/admin' : user?.role === 'teacher' ? '/teacher' : '/student';
    const items = [
      { href: dash, label: 'Home', icon: LayoutDashboard },
      { href: `${dash === '/student' ? '/student/courses' : dash === '/teacher' ? '/teacher/courses' : '/admin/courses'}`, label: 'Courses', icon: BookOpen },
      { href: `${dash}/notifications`, label: 'Alerts', icon: User },
    ];
    return (
      <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-3 border-t border-gc-line bg-gc-navy/95 p-2 backdrop-blur lg:hidden">
        {items.map((it) => {
          const Icon = it.icon;
          const active = pathname === it.href;
          return (
            <Link key={it.href} href={it.href} className={`flex flex-col items-center gap-1 py-1 text-[11px] ${active ? 'text-gc-gold' : 'text-gc-mute'}`}>
              <Icon size={18} />
              {it.label}
            </Link>
          );
        })}
      </nav>
    );
  }
  const items = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/courses', label: 'Courses', icon: BookOpen },
    { href: '/batches', label: 'Batches', icon: GraduationCap },
    { href: user ? (user.role === 'admin' ? '/admin' : user.role === 'teacher' ? '/teacher' : '/student') : '/login', label: user ? 'App' : 'Login', icon: User },
  ];
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-4 border-t border-gc-line bg-gc-navy/95 p-2 pb-3 backdrop-blur lg:hidden">
      {items.map((it) => {
        const Icon = it.icon;
        const active = pathname === it.href;
        return (
          <Link key={it.href} href={it.href} className={`flex flex-col items-center gap-1 py-1 text-[11px] ${active ? 'text-gc-gold' : 'text-gc-mute'}`}>
            <Icon size={18} />
            {it.label}
          </Link>
        );
      })}
    </nav>
  );
}
