import { StaggerContainer, StaggerItem } from '@/components/motion';
import type { TestSubscriptionBenefit } from '@/lib/types';
import { testSubscriptionIcon } from './icons';

export function TestSubscriptionBenefits({ benefits }: { benefits?: TestSubscriptionBenefit[] }) {
  const items = (benefits ?? []).filter((item) => item.isActive && item.title.trim());
  if (!items.length) return null;

  return (
    <StaggerContainer className="gc-test-prime-benefits">
      {items.map((benefit) => {
        const Icon = testSubscriptionIcon(benefit.icon);
        return (
          <StaggerItem key={benefit.id || benefit.title}>
            <article className="gc-test-prime-benefit" data-variant={benefit.variant || 'blue'}>
              <span className="gc-test-prime-benefit-icon" aria-hidden>
                <Icon size={18} strokeWidth={1.75} />
              </span>
              {benefit.value ? <p className="gc-test-prime-benefit-value">{benefit.value}</p> : null}
              <h3 className="gc-test-prime-benefit-title">{benefit.title}</h3>
              <p className="gc-test-prime-benefit-body">{benefit.description}</p>
            </article>
          </StaggerItem>
        );
      })}
    </StaggerContainer>
  );
}
