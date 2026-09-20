'use client';

import Link from 'next/link';
import { ArrowRight, GraduationCap } from 'lucide-react';
import { Reveal } from '@/components/motion';
import type { HomeTestSubscription } from '@/lib/types';
import { DEFAULT_HOME_TEST_SUBSCRIPTION } from './defaults';
import { TestSubscriptionBenefits } from './TestSubscriptionBenefits';
import { TestSubscriptionVisual } from './TestSubscriptionVisual';

function readyData(data: HomeTestSubscription): HomeTestSubscription {
  return {
    ...DEFAULT_HOME_TEST_SUBSCRIPTION,
    ...data,
    benefits: Array.isArray(data.benefits) ? data.benefits : DEFAULT_HOME_TEST_SUBSCRIPTION.benefits,
    heroImage: data.heroImage || DEFAULT_HOME_TEST_SUBSCRIPTION.heroImage,
    primaryButtonLink: data.primaryButtonLink || DEFAULT_HOME_TEST_SUBSCRIPTION.primaryButtonLink,
    primaryButtonText: data.primaryButtonText || DEFAULT_HOME_TEST_SUBSCRIPTION.primaryButtonText,
  };
}

export function TestSubscriptionSection({
  data,
  settled = false,
}: {
  data: HomeTestSubscription;
  settled?: boolean;
}) {
  if (settled && !data.isActive) return null;

  const section = readyData(data);

  return (
    <section className="gc-test-prime" aria-labelledby="test-prime-heading">
      <div className="gc-container gc-test-prime-inner">
        <Reveal className="gc-test-prime-copy">
          <p className="gc-test-prime-brand">
            <span className="gc-test-prime-brand-icon" aria-hidden>
              <GraduationCap size={16} strokeWidth={1.9} />
            </span>
            <span className="gc-test-prime-brand-label">{section.eyebrow || 'Test'}</span>
            {section.badgeLabel ? <span className="gc-test-prime-badge-pill">{section.badgeLabel}</span> : null}
          </p>
          <h2 id="test-prime-heading" className="gc-test-prime-title">
            <span>{section.title}</span>
            {section.highlightedTitle ? <em>{section.highlightedTitle}</em> : null}
          </h2>
          <p className="gc-test-prime-body">{section.description}</p>
        </Reveal>

        <Reveal className="gc-test-prime-visual-wrap" delay={0.08}>
          <TestSubscriptionVisual imageSrc={section.heroImage} imageAlt={section.heroImageAlt} />
        </Reveal>

        <TestSubscriptionBenefits benefits={section.benefits} />

        <Reveal className="gc-test-prime-actions" delay={0.12}>
          <Link href={section.primaryButtonLink} className="gc-btn-primary gc-test-prime-cta">
            {section.primaryButtonText}
            <ArrowRight size={16} aria-hidden className="gc-test-prime-cta-arrow" />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
