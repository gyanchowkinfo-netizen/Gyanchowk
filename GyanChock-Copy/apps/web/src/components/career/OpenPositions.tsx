'use client';

import React, { useState, useMemo } from 'react';
import {
  Search,
  ChevronDown,
  ChevronRight,
  MapPin,
  Laptop,
  GraduationCap,
  Palette,
  Code2,
  Megaphone,
  Headphones,
  TrendingUp,
  Users2,
  Briefcase,
  X,
  RotateCcw,
} from 'lucide-react';
import type { CareerJob, CareerOpenPositionsHeaderConfig } from '@/lib/types';
import { CareerJobDetailsModal } from './CareerJobDetailsModal';

interface OpenPositionsProps {
  header: CareerOpenPositionsHeaderConfig;
  jobs: CareerJob[];
  departments: string[];
  locations: string[];
  loading?: boolean;
}

export function OpenPositions({
  header,
  jobs,
  departments,
  locations,
  loading = false,
}: OpenPositionsProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('All Departments');
  const [selectedLoc, setSelectedLoc] = useState('All Locations');
  const [selectedJob, setSelectedJob] = useState<CareerJob | null>(null);
  const [showAll, setShowAll] = useState(false);

  // Filtered list
  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      if (job.status !== 'published') return false;

      // Department filter
      if (selectedDept !== 'All Departments' && job.department !== selectedDept) {
        return false;
      }

      // Location filter
      if (selectedLoc !== 'All Locations' && !job.location.toLowerCase().includes(selectedLoc.toLowerCase())) {
        return false;
      }

      // Query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const inTitle = job.title.toLowerCase().includes(q);
        const inDept = job.department.toLowerCase().includes(q);
        const inLoc = job.location.toLowerCase().includes(q);
        const inSkills = job.skills?.some((s) => s.toLowerCase().includes(q));
        const inDesc = job.description?.toLowerCase().includes(q);
        if (!inTitle && !inDept && !inLoc && !inSkills && !inDesc) {
          return false;
        }
      }

      return true;
    });
  }, [jobs, selectedDept, selectedLoc, searchQuery]);

  const hasActiveFilters =
    searchQuery.trim().length > 0 ||
    selectedDept !== 'All Departments' ||
    selectedLoc !== 'All Locations';

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedDept('All Departments');
    setSelectedLoc('All Locations');
    setShowAll(false);
  };

  const displayedJobs = useMemo(() => {
    return showAll ? filteredJobs : filteredJobs.slice(0, 8);
  }, [filteredJobs, showAll]);

  const getJobIcon = (iconName?: string, deptName?: string) => {
    const key = (iconName || deptName || '').toLowerCase();
    if (key.includes('video') || key.includes('content') || key.includes('laptop')) {
      return <Laptop className="w-5 h-5 text-blue-700" />;
    }
    if (key.includes('academic') || key.includes('physics') || key.includes('expert') || key.includes('teacher')) {
      return <GraduationCap className="w-5 h-5 text-blue-700" />;
    }
    if (key.includes('design') || key.includes('ui') || key.includes('ux') || key.includes('palette')) {
      return <Palette className="w-5 h-5 text-blue-700" />;
    }
    if (key.includes('code') || key.includes('developer') || key.includes('engineering') || key.includes('tech')) {
      return <Code2 className="w-5 h-5 text-blue-700" />;
    }
    if (key.includes('marketing') || key.includes('growth') || key.includes('megaphone')) {
      return <Megaphone className="w-5 h-5 text-blue-700" />;
    }
    if (key.includes('support') || key.includes('customer') || key.includes('headphones') || key.includes('ops')) {
      return <Headphones className="w-5 h-5 text-blue-700" />;
    }
    if (key.includes('sales') || key.includes('business') || key.includes('bda') || key.includes('chart')) {
      return <TrendingUp className="w-5 h-5 text-blue-700" />;
    }
    if (key.includes('hr') || key.includes('people') || key.includes('talent') || key.includes('users')) {
      return <Users2 className="w-5 h-5 text-blue-700" />;
    }
    return <Briefcase className="w-5 h-5 text-blue-700" />;
  };

  if (!header || header.active === false) return null;

  return (
    <section id="open-positions" className="py-16 sm:py-20 bg-[#F8F6F0] border-b border-[#ECE6DE] relative scroll-mt-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-10 sm:mb-12">
          <div className="inline-flex items-center gap-2 mb-1">
            <span className="w-4 h-px bg-[#C4A05A]/50" aria-hidden="true" />
            <span className="text-[11px] sm:text-xs font-bold tracking-[0.2em] uppercase text-[#8C6228]">
              {header.eyebrow || 'OPEN POSITIONS'}
            </span>
            <span className="w-4 h-px bg-[#C4A05A]/50" aria-hidden="true" />
          </div>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-[2.65rem] font-normal sm:font-medium text-slate-900 tracking-tight">
            {header.heading || 'Find Your Next Opportunity'}
          </h2>
          <p className="text-base text-slate-600 leading-relaxed font-normal">
            {header.description ||
              'We are always looking for talented and passionate individuals to join our growing team.'}
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="max-w-4xl mx-auto mb-10">
          <div className="bg-white rounded-2xl p-2.5 sm:p-3 shadow-md border border-[#ECE6DE] flex flex-col md:flex-row items-stretch md:items-center gap-2.5">
            {/* Search Input */}
            <div className="relative flex-1 flex items-center">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search job title, department, or location..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 bg-transparent border-0 focus:ring-0 focus:outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="p-1 text-slate-400 hover:text-slate-600 mr-2"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Department Dropdown */}
            <div className="relative md:w-48 border-t md:border-t-0 md:border-l border-[#ECE6DE] pt-2 md:pt-0 md:pl-2">
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="w-full appearance-none bg-transparent py-2.5 pl-3 pr-8 rounded-xl text-xs sm:text-sm text-slate-700 font-medium focus:outline-none cursor-pointer"
              >
                <option value="All Departments">All Departments</option>
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Location Dropdown */}
            <div className="relative md:w-44 border-t md:border-t-0 md:border-l border-[#ECE6DE] pt-2 md:pt-0 md:pl-2">
              <select
                value={selectedLoc}
                onChange={(e) => setSelectedLoc(e.target.value)}
                className="w-full appearance-none bg-transparent py-2.5 pl-3 pr-8 rounded-xl text-xs sm:text-sm text-slate-700 font-medium focus:outline-none cursor-pointer"
              >
                <option value="All Locations">All Locations</option>
                {locations.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Search CTA / Reset Button */}
            <div className="flex items-center gap-2">
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  title="Reset Filters"
                  className="p-2.5 rounded-xl border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              )}
              <button
                type="button"
                className="px-6 py-2.5 rounded-xl bg-[#0c1a30] hover:bg-[#152a4e] text-white text-xs sm:text-sm font-semibold transition-colors shrink-0"
              >
                Search
              </button>
            </div>
          </div>

          {/* Active filter summary pill */}
          {hasActiveFilters && (
            <div className="mt-3 flex items-center justify-between text-xs text-slate-500 px-2">
              <span>
                Showing {filteredJobs.length} {filteredJobs.length === 1 ? 'position' : 'positions'}
              </span>
              <button
                type="button"
                onClick={clearFilters}
                className="text-blue-700 hover:underline font-medium"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>

        {/* Loading Skeleton */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-5xl mx-auto">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-24 bg-white rounded-2xl border border-[#ECE6DE] animate-pulse p-5 flex items-center gap-4"
              >
                <div className="w-12 h-12 rounded-xl bg-slate-100 shrink-0" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-slate-100 rounded-md w-3/4" />
                  <div className="h-3 bg-slate-100 rounded-md w-1/2" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredJobs.length === 0 && (
          <div className="bg-white max-w-2xl mx-auto rounded-3xl p-10 text-center border border-[#ECE6DE] shadow-sm space-y-4">
            <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center mx-auto">
              <Search className="w-5 h-5" />
            </div>
            <h3 className="font-display font-medium text-lg text-slate-900">
              {hasActiveFilters ? 'No positions match your search' : 'No open positions available right now'}
            </h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto">
              {hasActiveFilters
                ? 'Try tweaking your keywords or clear your department/location filters.'
                : 'Please check back later or send your open resume to our careers desk.'}
            </p>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-50 text-blue-700 text-xs font-semibold hover:bg-blue-100 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset search</span>
              </button>
            )}
          </div>
        )}

        {/* 2-Column Job Cards Grid */}
        {!loading && filteredJobs.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-5xl mx-auto">
            {displayedJobs.map((job) => (
              <div
                key={job._id || job.title}
                onClick={() => setSelectedJob(job)}
                className="group cursor-pointer bg-white border border-[#ECE6DE] hover:border-blue-400 rounded-2xl p-5 shadow-2xs hover:shadow-md transition-all duration-200 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4 min-w-0">
                  {/* Square Soft Blue Icon Badge */}
                  <div className="w-12 h-12 rounded-xl bg-blue-50/90 group-hover:bg-blue-100 border border-blue-100 flex items-center justify-center shrink-0 transition-colors">
                    {getJobIcon(job.icon, job.department)}
                  </div>

                  {/* Title & Department & Location */}
                  <div className="min-w-0 space-y-0.5">
                    <h3 className="font-display font-bold text-base sm:text-lg text-slate-900 group-hover:text-blue-700 transition-colors truncate">
                      {job.title}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium truncate">
                      {job.department}
                    </p>
                    <div className="flex items-center gap-1 text-[11px] sm:text-xs text-blue-700 font-medium pt-0.5">
                      <MapPin className="w-3 h-3 shrink-0" />
                      <span className="truncate">{job.location}</span>
                    </div>
                  </div>
                </div>

                {/* Right Arrow Icon */}
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-blue-500 group-hover:text-blue-700 group-hover:translate-x-1 transition-all shrink-0">
                  <ChevronRight className="w-5 h-5" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* View All Button below 8 cards */}
        {!loading && filteredJobs.length > 8 && (
          <div className="text-center mt-10">
            <button
              type="button"
              onClick={() => setShowAll((prev) => !prev)}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full border border-blue-200 bg-white hover:bg-blue-50 text-blue-700 hover:text-blue-900 text-sm font-bold shadow-2xs hover:shadow-md transition-all active:scale-95"
            >
              <span>{showAll ? 'Show Fewer Positions' : `View All Positions (${filteredJobs.length})`}</span>
              <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${showAll ? 'rotate-180' : ''}`} />
            </button>
          </div>
        )}

        {/* Bottom CTA when filters are active and total positions <= 8 */}
        {hasActiveFilters && filteredJobs.length <= 8 && (
          <div className="text-center mt-10">
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex items-center gap-2 text-sm font-semibold text-blue-700 hover:text-blue-800"
            >
              <span>View All Open Positions</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Job Details Modal */}
      <CareerJobDetailsModal
        job={selectedJob}
        onClose={() => setSelectedJob(null)}
      />
    </section>
  );
}
