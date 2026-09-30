'use client';

import { Award, Clock, RotateCcw, Users } from 'lucide-react';

export function TrustBenefitsStrip() {
  const benefits = [
    {
      title: 'Learn from Experts',
      subtitle: 'Industry professionals',
      icon: Users,
      bg: 'bg-amber-100',
      color: 'text-amber-800',
    },
    {
      title: 'Self-Paced Learning',
      subtitle: 'Study at your own pace',
      icon: Clock,
      bg: 'bg-blue-100',
      color: 'text-blue-800',
    },
    {
      title: 'Lifetime Access',
      subtitle: 'Revisit anytime',
      icon: RotateCcw,
      bg: 'bg-emerald-100',
      color: 'text-emerald-800',
    },
    {
      title: 'Verified Certificates',
      subtitle: 'Boost your career',
      icon: Award,
      bg: 'bg-sky-100',
      color: 'text-sky-800',
    },
  ];

  return (
    <section className="my-12">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {benefits.map((b) => {
          const Icon = b.icon;
          return (
            <div
              key={b.title}
              className="flex items-center gap-3.5 rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm transition hover:border-slate-300 hover:shadow-md"
            >
              <div
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${b.bg} ${b.color}`}
              >
                <Icon size={20} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">{b.title}</h4>
                <p className="text-xs text-slate-500 font-medium">{b.subtitle}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
