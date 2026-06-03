'use client';

import { CounterAnimation } from '@/components/animations/CounterAnimation';
import { cn } from '@/lib/utils';

const STATS = [
  { label: 'Tasks Completed', value: 47, prefix: '', special: false },
  { label: 'Total Agents Used', value: 188, prefix: '', special: false },
  { label: 'Total Spent (USDC)', value: 4.73, prefix: '$', special: false },
  { label: 'Your Signatures', value: 1, prefix: '', special: true },
];

export function DashboardStats() {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {STATS.map((s) => (
        <div
          key={s.label}
          className={cn(
            'card-surface p-5',
            s.special && 'border-primary/30 shadow-glow'
          )}
        >
          <div className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-muted">
            {s.label}
          </div>
          <div
            className={cn(
              'mono text-2xl font-bold',
              s.special ? 'text-primary' : 'text-white'
            )}
          >
            <CounterAnimation
              to={s.value}
              prefix={s.prefix}
              decimals={s.value % 1 !== 0 ? 2 : 0}
            />
          </div>
          {s.special && (
            <div className="mt-1 text-[10px] text-muted">
              One permission. That&apos;s all you ever sign.
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
