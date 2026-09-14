'use client';

import { BookOpen, Compass, LineChart, Medal, Target, Users } from 'lucide-react';
import { PageContainer, SectionHeader } from '@/components/layout/Page';
import { AnimatedSection, StaggerContainer, StaggerItem } from '@/components/motion';

const features = [
  { icon: Medal, title: 'Expert educators', body: 'Only admin-approved teachers appear in this catalogue. Private emails and payouts stay hidden.' },
  { icon: Target, title: 'Exam-focused teaching', body: 'Faculty publish recorded paths for JEE, NEET, boards, government exams and career skills.' },
  { icon: BookOpen, title: 'Structured learning', body: 'Courses, batches, syllabus and study materials sit behind verified enrollment — not live-class FOMO.' },
  { icon: Users, title: 'Async doubt desk', body: 'Students raise doubts with images. Teachers answer on the record, without a live chat classroom.' },
  { icon: LineChart, title: 'Performance tracking', body: 'Tests, ranks and certificates are computed on the server after real attempts.' },
  { icon: Compass, title: 'Mentorship reviews', body: 'Goals and scheduled reviews exist as mentorship — never as live streaming.' },
];

export function TeacherExpertise() {
  return (
    <AnimatedSection>
      <PageContainer>
        <SectionHeader title="Why learn from Gyan Chowk teachers" />
        <StaggerContainer className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <StaggerItem key={f.title}>
                <article className="gc-card group h-full p-6 transition-transform duration-300 hover:-translate-y-1">
                  <Icon className="text-gc-gold transition-transform duration-300 group-hover:scale-105 group-hover:rotate-6" size={22} />
                  <h3 className="mt-4 font-display text-xl text-gc-black">{f.title}</h3>
                  <p className="mt-2 text-sm text-gc-mist">{f.body}</p>
                </article>
              </StaggerItem>
            );
          })}
        </StaggerContainer>
      </PageContainer>
    </AnimatedSection>
  );
}
