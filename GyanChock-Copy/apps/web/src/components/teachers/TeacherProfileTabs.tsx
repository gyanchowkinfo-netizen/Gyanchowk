'use client';

import { User, BookOpen, Star, Trophy, MessageSquare } from 'lucide-react';

export type ProfileTabId = 'about' | 'courses' | 'reviews' | 'achievements' | 'qa';

interface TabItem {
  id: ProfileTabId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const TABS: TabItem[] = [
  { id: 'about', label: 'About', icon: User },
  { id: 'courses', label: 'Courses', icon: BookOpen },
  { id: 'reviews', label: 'Reviews', icon: Star },
  { id: 'achievements', label: 'Achievements', icon: Trophy },
  { id: 'qa', label: 'Q&A', icon: MessageSquare },
];

export function TeacherProfileTabs({
  activeTab,
  onTabChange,
}: {
  activeTab: ProfileTabId;
  onTabChange: (tab: ProfileTabId) => void;
}) {
  return (
    <nav
      aria-label="Teacher profile sections"
      className="my-6 border-b border-[#E8E2D6] pb-2"
    >
      <div className="no-scrollbar flex items-center gap-2 overflow-x-auto px-1 py-1">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={`group flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all shrink-0 ${
                isActive
                  ? 'bg-[#1C1815] text-white shadow-sm'
                  : 'bg-transparent text-[#61584F] hover:bg-[#EFEAE1] hover:text-[#1C1815]'
              }`}
            >
              <Icon
                className={`h-4 w-4 transition-colors ${
                  isActive ? 'text-amber-400' : 'text-[#8C8377] group-hover:text-[#1C1815]'
                }`}
              />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
