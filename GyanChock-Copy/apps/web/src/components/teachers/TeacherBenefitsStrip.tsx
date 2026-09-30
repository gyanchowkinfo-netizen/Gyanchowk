'use client';

import { UserCheck, BookOpen, MessageCircle, Clock } from 'lucide-react';

interface BenefitItem {
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  iconBg: string;
  iconColor: string;
}

const DEFAULT_BENEFITS: BenefitItem[] = [
  {
    title: 'Expert Guidance',
    subtitle: 'Learn from experienced educators',
    icon: UserCheck,
    iconBg: 'bg-amber-100/70',
    iconColor: 'text-amber-800',
  },
  {
    title: 'Flexible Learning',
    subtitle: 'Study at your own pace',
    icon: BookOpen,
    iconBg: 'bg-emerald-100/70',
    iconColor: 'text-emerald-800',
  },
  {
    title: 'Live Doubt Sessions',
    subtitle: 'Get your questions resolved',
    icon: MessageCircle,
    iconBg: 'bg-sky-100/70',
    iconColor: 'text-sky-800',
  },
  {
    title: 'Lifetime Access',
    subtitle: 'Learn anytime, anywhere',
    icon: Clock,
    iconBg: 'bg-purple-100/70',
    iconColor: 'text-purple-800',
  },
];

export function TeacherBenefitsStrip({
  benefits,
}: {
  benefits?: Array<{ title: string; subtitle?: string; icon?: string }>;
}) {
  return (
    <section className="mt-10 rounded-3xl border border-[#ECE5D8] bg-[#FAF8F5] p-5 sm:p-6 shadow-sm">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
        {DEFAULT_BENEFITS.map((item, idx) => {
          const Icon = item.icon;
          const customTitle = benefits?.[idx]?.title || item.title;
          const customSubtitle = benefits?.[idx]?.subtitle || item.subtitle;

          return (
            <div
              key={item.title}
              className="flex items-center gap-3.5 rounded-2xl bg-white/80 p-3.5 border border-[#EDE7DC] transition hover:bg-white hover:shadow-sm"
            >
              <div
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${item.iconBg} ${item.iconColor}`}
              >
                <Icon className="h-5 w-5" />
              </div>

              <div>
                <p className="text-xs font-bold text-[#1C1815]">{customTitle}</p>
                <p className="text-[11px] text-stone-500 leading-snug mt-0.5">{customSubtitle}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
