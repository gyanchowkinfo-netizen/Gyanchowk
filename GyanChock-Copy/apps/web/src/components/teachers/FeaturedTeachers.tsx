'use client';

import { PageContainer, SectionHeader } from '@/components/layout/Page';
import { AnimatedSection, StaggerContainer, StaggerItem } from '@/components/motion';
import { TeacherCard } from '@/components/public/TeacherCard';
import type { TeacherCardData } from '@/lib/types';

export function FeaturedTeachers({ teachers }: { teachers: TeacherCardData[] }) {
  if (!teachers.length) return null;
  return (
    <AnimatedSection>
      <PageContainer>
        <SectionHeader title="Featured teachers" />
        <p className="-mt-3 mb-6 max-w-2xl text-sm text-gc-mute">
          Learn from educators who bring experience, clarity and proven teaching expertise. This list is ranked from
          published course ratings and enrollments — not a promotional set.
        </p>
        <StaggerContainer className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {teachers.map((t) => (
            <StaggerItem key={t._id}>
              <TeacherCard teacher={t} featured />
            </StaggerItem>
          ))}
        </StaggerContainer>
      </PageContainer>
    </AnimatedSection>
  );
}
