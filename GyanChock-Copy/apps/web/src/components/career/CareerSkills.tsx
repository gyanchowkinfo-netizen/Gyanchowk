'use client';

import { Code2, Folders, Lightbulb, MessageSquare, Route, Search, Target, Users } from 'lucide-react';
import { PageContainer } from '@/components/layout/Page';
import { Reveal, StaggerContainer, StaggerItem, TiltCard } from '@/components/motion';

const skills = [
  { icon: Code2, title: 'Programming', body: 'Recorded lessons and assignments for applied coding practice.' },
  { icon: Lightbulb, title: 'Problem solving', body: 'Tests and ranked papers that measure how you think, not how long you watched.' },
  { icon: MessageSquare, title: 'Communication', body: 'Doubt threads and mentorship reviews that keep questions specific.' },
  { icon: Search, title: 'Analytical thinking', body: 'Analytics from real attempts so you can see gaps instead of guessing.' },
  { icon: Target, title: 'Technical skills', body: 'Study materials and structured batches built around a syllabus.' },
  { icon: Users, title: 'Interview skills', body: 'Career articles and faculty guidance for preparation — not fake mock scores.' },
  { icon: Folders, title: 'Project building', body: 'Assignments that ask you to ship work, then get it evaluated on the server.' },
  { icon: Route, title: 'Career planning', body: 'Roadmaps that connect recorded learning to a next step.' },
];

export function CareerSkills() {
  return (
    <section id="skills">
      <PageContainer>
        <Reveal>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gc-gold">Skills that move you forward</p>
        </Reveal>
        <Reveal delay={0.04}>
          <h2 className="mt-2 font-display text-3xl text-gc-black md:text-4xl">Practice the skills a career actually uses</h2>
        </Reveal>
        <Reveal delay={0.08}>
          <p className="mt-3 max-w-2xl text-sm text-gc-mute">
            These are capabilities of the Gyan Chowk learning stack. We do not display invented skill percentages.
          </p>
        </Reveal>
        <StaggerContainer className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {skills.map((skill) => {
            const Icon = skill.icon;
            return (
              <StaggerItem key={skill.title}>
                <TiltCard intensity={4}>
                  <article className="gc-card h-full p-5">
                    <Icon className="text-gc-gold" size={20} aria-hidden />
                    <h3 className="mt-3 font-display text-lg">{skill.title}</h3>
                    <p className="mt-2 text-sm text-gc-mute">{skill.body}</p>
                  </article>
                </TiltCard>
              </StaggerItem>
            );
          })}
        </StaggerContainer>
      </PageContainer>
    </section>
  );
}
