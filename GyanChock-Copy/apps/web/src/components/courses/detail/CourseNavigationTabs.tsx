'use client';

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

export interface TabItem {
  id: string;
  label: string;
}

const TABS: TabItem[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'learn', label: "What You'll Learn" },
  { id: 'includes', label: 'Includes' },
  { id: 'features', label: 'Features' },
  { id: 'structure', label: 'Course Structure' },
  { id: 'syllabus', label: 'Syllabus' },
  { id: 'instructors', label: 'Instructors' },
  { id: 'faqs', label: 'FAQs' },
];

export function CourseNavigationTabs() {
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 140;

      for (let i = TABS.length - 1; i >= 0; i--) {
        const el = document.getElementById(TABS[i].id);
        if (el && el.offsetTop <= scrollPosition) {
          setActiveTab(TABS[i].id);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    setActiveTab(id);
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -90;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <div className="sticky top-16 z-20 border-b border-slate-200/90 bg-white/95 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <nav
          className="flex space-x-2 sm:space-x-4 overflow-x-auto py-2.5 no-scrollbar text-xs sm:text-sm font-semibold"
          aria-label="Course Sections Navigation"
        >
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => scrollToSection(tab.id)}
                className={cn(
                  'shrink-0 rounded-full px-4 py-1.5 transition-colors whitespace-nowrap',
                  isActive
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
                )}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
