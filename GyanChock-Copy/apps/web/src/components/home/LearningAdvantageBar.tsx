'use client';

import { Building2, CircleHelp, ClipboardCheck, Radio } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export type LearningAdvantage = {
  id: string;
  icon: LucideIcon;
  value: string;
  description: string;
};

export const learningAdvantages: LearningAdvantage[] = [
  {
    id: 'live-classes',
    icon: Radio,
    value: 'Daily Live',
    description: 'Interactive Classes',
  },
  {
    id: 'tests',
    icon: ClipboardCheck,
    value: '10 Million+',
    description: 'Tests, Sample Papers & Notes',
  },
  {
    id: 'doubt-solving',
    icon: CircleHelp,
    value: '24 × 7',
    description: 'Doubt Solving Sessions',
  },
  {
    id: 'centres',
    icon: Building2,
    value: '100+',
    description: 'Offline Centres',
  },
];

export function LearningAdvantageBar() {
  return (
    <section className="gc-advantage-section" aria-label="Learning advantages">
      <div className="gc-container">
        <ul className="gc-advantage-card">
          {learningAdvantages.map((item, index) => (
            <AdvantageItem key={item.id} item={item} showDivider={index < learningAdvantages.length - 1} />
          ))}
        </ul>
      </div>
    </section>
  );
}

function AdvantageItem({
  item,
  showDivider,
}: {
  item: LearningAdvantage;
  showDivider: boolean;
}) {
  const Icon = item.icon;
  return (
    <li className={`gc-advantage-item${showDivider ? ' gc-advantage-item-divider' : ''}`}>
      <span className="gc-advantage-icon" aria-hidden>
        <Icon size={22} strokeWidth={1.75} />
      </span>
      <p className="gc-advantage-value">{item.value}</p>
      <p className="gc-advantage-desc">{item.description}</p>
    </li>
  );
}
