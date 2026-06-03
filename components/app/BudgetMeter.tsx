'use client';

import { motion } from 'framer-motion';
import { cn, formatUSDC } from '@/lib/utils';
import { Progress } from '@/components/ui/Progress';

export interface BudgetMeterProps {
  spent: number;
  total: number;
  className?: string;
}

export function BudgetMeter({ spent, total, className }: BudgetMeterProps) {
  const remaining = Math.max(0, total - spent);
  const pct = total > 0 ? (remaining / total) * 100 : 100;
  const isLow = pct < 20;

  return (
    <div className={cn('', className)}>
      <div className="mb-1 flex items-baseline justify-between">
        <span className="text-xs text-muted">Budget</span>
        <span className={cn('mono text-xs font-semibold', isLow ? 'text-danger' : 'text-white')}>
          {formatUSDC(remaining)} remaining
        </span>
      </div>
      <Progress value={remaining} max={total} variant={isLow ? 'red' : 'orange'} size="md" />
    </div>
  );
}
