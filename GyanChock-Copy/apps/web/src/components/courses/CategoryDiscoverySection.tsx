'use client';

import {
  Briefcase,
  Cpu,
  BarChart3,
  Palette,
  Globe2,
  HeartPulse,
  ArrowRight,
  BookOpen,
} from 'lucide-react';

interface CategoryItem {
  name: string;
  count: number;
  icon: typeof Briefcase;
  bg: string;
  color: string;
}

const DEFAULT_CATEGORIES: CategoryItem[] = [
  { name: 'Career', count: 12, icon: Briefcase, bg: 'bg-amber-100', color: 'text-amber-800' },
  { name: 'Technology', count: 35, icon: Cpu, bg: 'bg-indigo-100', color: 'text-indigo-800' },
  { name: 'Business', count: 18, icon: BarChart3, bg: 'bg-orange-100', color: 'text-orange-800' },
  { name: 'Design', count: 24, icon: Palette, bg: 'bg-purple-100', color: 'text-purple-800' },
  { name: 'Languages', count: 17, icon: Globe2, bg: 'bg-rose-100', color: 'text-rose-800' },
  { name: 'Health & Fitness', count: 10, icon: HeartPulse, bg: 'bg-emerald-100', color: 'text-emerald-800' },
];

export function CategoryDiscoverySection({
  categories,
  selectedCategory,
  onSelectCategory,
}: {
  categories?: string[];
  selectedCategory?: string;
  onSelectCategory: (category: string) => void;
}) {
  // If backend meta categories exist, blend them
  const items: CategoryItem[] =
    categories && categories.length > 0
      ? categories.slice(0, 6).map((cat, idx) => {
          const fallback = DEFAULT_CATEGORIES[idx % DEFAULT_CATEGORIES.length];
          return {
            name: cat,
            count: 8 + (idx * 5) % 30,
            icon: fallback.icon || BookOpen,
            bg: fallback.bg,
            color: fallback.color,
          };
        })
      : DEFAULT_CATEGORIES;

  return (
    <section className="mt-8 mb-14">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="font-display text-2xl font-bold tracking-tight text-slate-900">
            Explore by Category
          </h3>
          <p className="mt-1 text-xs text-slate-500 font-medium">
            Find the right domain to accelerate your learning journey
          </p>
        </div>

        <button
          suppressHydrationWarning
          type="button"
          onClick={() => onSelectCategory('')}
          className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700 hover:text-slate-950 transition"
        >
          <span>View All</span>
          <ArrowRight size={14} />
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {items.map((cat) => {
          const Icon = cat.icon;
          const isSelected = selectedCategory === cat.name;

          return (
            <button
              suppressHydrationWarning
              key={cat.name}
              type="button"
              onClick={() => onSelectCategory(isSelected ? '' : cat.name)}
              className={`group flex flex-col justify-between rounded-2xl border p-4 text-left transition-all ${
                isSelected
                  ? 'border-slate-900 bg-slate-900 text-white shadow-md'
                  : 'border-slate-200/90 bg-white hover:border-slate-300 hover:shadow-md'
              }`}
            >
              <div className="flex items-center justify-between">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl transition ${
                    isSelected ? 'bg-white/20 text-white' : `${cat.bg} ${cat.color}`
                  }`}
                >
                  <Icon size={19} />
                </div>
                <ArrowRight
                  size={14}
                  className={`transition-transform duration-200 group-hover:translate-x-1 ${
                    isSelected ? 'text-white' : 'text-slate-300 group-hover:text-slate-700'
                  }`}
                />
              </div>

              <div className="mt-5">
                <h4
                  className={`text-sm font-bold truncate ${
                    isSelected ? 'text-white' : 'text-slate-900'
                  }`}
                >
                  {cat.name}
                </h4>
                <p
                  className={`text-xs mt-0.5 ${
                    isSelected ? 'text-slate-300' : 'text-slate-500'
                  }`}
                >
                  {cat.count} courses
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
