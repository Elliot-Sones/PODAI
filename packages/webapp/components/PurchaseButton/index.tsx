'use client';

import { Button } from '@/components/ui/button';
import { Plan, Subscription } from 'podverse-utils';

export function PurchaseButton({
  plan,
  existingPlan,
  existingSubscription,
  className,
}: {
  plan: Plan;
  existingPlan: Plan;
  existingSubscription?: Subscription;
  className?: string;
}) {
  // Stripe billing has been disabled - this is now a no-op button
  return (
    <Button variant="secondary" className={className} disabled>
      Free access
    </Button>
  );
}
