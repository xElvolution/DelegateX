'use client';

import { useEffect, useState } from 'react';
import { CounterAnimation } from '@/components/animations/CounterAnimation';
import { cn } from '@/lib/utils';
import { useWallet } from '@/hooks/useWallet';

export function DashboardStats() {
  const { address } = useWallet();
  const [stats, setStats] = useState({
    tasksCompleted: 0,
    totalAgents: 0,
    totalSpent: 0,
    signatures: 0,
  });

  useEffect(() => {
    if (!address) return;
    fetch(`/api/tasks/history?address=${address}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.stats) setStats(d.stats);
      })
      .catch(() => {});
  }, [address]);

  const items = [
    { label: 'Tasks Completed', value: stats.tasksCompleted, prefix: '', special: false },
    { label: 'Total Agents Used', value: stats.totalAgents, prefix: '', special: false },
    { label: 'Total Spent (USDC)', value: stats.totalSpent, prefix: '$', special: false },
    { label: 'Your Signatures', value: stats.signatures, prefix: '', special: true },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {items.map((s) => (
        <div
          key={s.label}
          className={cn('card-surface p-5', s.special && 'border-primary/30 shadow-glow')}
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
