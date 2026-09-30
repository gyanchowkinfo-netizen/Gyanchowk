'use client';

import React, { useState } from 'react';
import {
  ChevronDown,
  Layers,
  FileText,
  PlayCircle,
  CheckCircle2,
} from 'lucide-react';
import type { CourseDetail } from '@/lib/types';
import { cn } from '@/lib/utils';

interface Chapter {
  _id: string;
  name: string;
}

interface Lesson {
  _id: string;
  title: string;
  isDemo?: boolean;
  chapter?: string;
  video?: string;
}

interface CourseCurriculumSectionProps {
  course: CourseDetail;
  chapters?: Chapter[];
  lessons?: Lesson[];
  onPreviewLesson?: (lesson: Lesson) => void;
}

export function CourseCurriculumSection({
  course,
  chapters = [],
  lessons = [],
  onPreviewLesson,
}: CourseCurriculumSectionProps) {
  // If course has customized dynamic curriculum modules, use those
  // Otherwise if chapters exist, adapt chapters
  // Otherwise provide modern structured default modules
  const hasCustomCurriculum = Boolean(course.curriculum?.length);

  const defaultModules = [
    {
      moduleTitle: 'Module 01: Core Foundations & Mechanics',
      moduleSubtitle: 'Units, Kinematics, Laws of Motion, Work Energy & Power',
      topics: [
        'Vectors, Dimensional Analysis & Measurements',
        'Kinematics in 1D & 2D Motion',
        'Newton’s Laws of Motion & Friction Dynamics',
        'Work, Energy, Power & Circular Dynamics',
      ],
    },
    {
      moduleTitle: 'Module 02: Advanced Concepts & Thermodynamics',
      moduleSubtitle: 'System of Particles, Rotational Motion & Thermal Physics',
      topics: [
        'Center of Mass, Momentum & Collisions',
        'Rotational Dynamics & Moment of Inertia',
        'Kinetic Theory of Gases & Laws of Thermodynamics',
        'Heat Transfer, Calorimetry & Thermal Expansion',
      ],
    },
    {
      moduleTitle: 'Module 03: Electromagnetism & Modern Physics',
      moduleSubtitle: 'Electrostatics, Magnetism, Optics & Quantum Theory',
      topics: [
        'Electric Charges, Fields & Gauss’s Law',
        'Current Electricity & Magnetic Effects of Current',
        'Electromagnetic Induction & Alternating Current',
        'Wave Optics, Ray Optics & Dual Nature of Matter',
      ],
    },
  ];

  const modules = hasCustomCurriculum
    ? course.curriculum!
    : chapters.length > 0
    ? chapters.map((ch, idx) => {
        const chLessons = lessons.filter((l) => String(l.chapter) === String(ch._id));
        return {
          moduleTitle: `Module ${String(idx + 1).padStart(2, '0')}: ${ch.name}`,
          moduleSubtitle: `${chLessons.length} Lessons included`,
          topics: chLessons.map((l) => l.title),
        };
      })
    : defaultModules;

  // Track expanded state of each module (default first module expanded)
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleModule = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const totalTopics = modules.reduce((acc, m) => acc + m.topics.length, 0);

  return (
    <div className="space-y-8">
      {/* Course Structure Section */}
      <section id="structure" className="scroll-mt-28">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Syllabus & Course Structure
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-slate-500">
              {modules.length} Modules • {totalTopics} Topics • Comprehensive Step-by-Step Coverage
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setOpenIndex(openIndex !== null ? null : 0)}
              className="rounded-lg border border-slate-200/80 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              {openIndex !== null ? 'Collapse All' : 'Expand Module'}
            </button>
          </div>
        </div>

        {/* Modules Accordion */}
        <div id="syllabus" className="scroll-mt-28 space-y-3">
          {modules.map((mod, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className={cn(
                  'overflow-hidden rounded-2xl border transition-all duration-200 bg-white',
                  isOpen
                    ? 'border-slate-300 shadow-sm ring-1 ring-slate-900/5'
                    : 'border-slate-200/80 hover:border-slate-300 shadow-2xs',
                )}
              >
                {/* Module Header Bar */}
                <button
                  type="button"
                  onClick={() => toggleModule(idx)}
                  className="flex w-full items-center justify-between gap-4 p-4 sm:p-5 text-left transition hover:bg-slate-50/60"
                  aria-expanded={isOpen}
                >
                  <div className="flex items-start gap-3.5 min-w-0">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-700 border border-amber-200/60 font-bold text-xs">
                      <Layers className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm sm:text-base font-bold text-slate-900 truncate">
                        {mod.moduleTitle}
                      </h3>
                      {mod.moduleSubtitle && (
                        <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                          {mod.moduleSubtitle}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-600 hidden sm:inline-block">
                      {mod.topics.length} Topics
                    </span>
                    <div
                      className={cn(
                        'flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition-transform duration-200',
                        isOpen && 'rotate-180 bg-slate-900 text-white',
                      )}
                    >
                      <ChevronDown className="h-4 w-4" />
                    </div>
                  </div>
                </button>

                {/* Module Body Content */}
                {isOpen && (
                  <div className="border-t border-slate-100 bg-slate-50/40 p-4 sm:p-5">
                    <div className="grid gap-2.5 sm:grid-cols-2">
                      {mod.topics.map((topic, tIdx) => {
                        // Check if corresponding lesson with demo exists
                        const matchingLesson = lessons.find(
                          (l) => l.title.trim().toLowerCase() === topic.trim().toLowerCase(),
                        );
                        const hasDemo = Boolean(matchingLesson?.isDemo && matchingLesson?.video);

                        return (
                          <div
                            key={tIdx}
                            className="flex items-center justify-between gap-3 rounded-xl border border-slate-200/70 bg-white px-3.5 py-2.5 text-xs sm:text-sm text-slate-700 shadow-2xs"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                              <span className="font-medium truncate">{topic}</span>
                            </div>

                            {hasDemo && onPreviewLesson && matchingLesson && (
                              <button
                                type="button"
                                onClick={() => onPreviewLesson(matchingLesson)}
                                className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-bold text-amber-900 hover:bg-amber-200 transition"
                              >
                                <PlayCircle className="h-3.5 w-3.5" />
                                <span>Free Demo</span>
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
