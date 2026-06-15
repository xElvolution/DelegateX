'use client';

import { useEffect, useMemo, useState } from 'react';
import { Badge } from '@/components/ui/Badge';
import { cn, formatRelativeTime, truncateAddress, formatUSDC } from '@/lib/utils';
import { txUrl, BASESCAN_URL } from '@/lib/contracts';
import type { ActivityItem, ActivityKind } from '@/types';

const FILTERS: { label: string; kind: ActivityKind | 'ALL' }[] = [
  { label: 'All', kind: 'ALL' },
  { label: 'Payments', kind: 'PAYMENT' },
  { label: 'Permissions', kind: 'PERMISSION_GRANT' },
  { label: 'Agents', kind: 'AGENT_REGISTER' },
];

const kindMeta: Record<ActivityKind, { color: string; icon: string }> = {
  PAYMENT: { color: 'text-info', icon: '→' },
  PERMISSION_GRANT: { color: 'text-primary', icon: '✓' },
  AGENT_REGISTER: { color: 'text-success', icon: '●' },
};

export default function ActivityPage() {
  const [items, setItems] = useState<ActivityItem[]>([]);
  const [filter, setFilter] = useState<ActivityKind | 'ALL'>('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const res = await fetch('/api/activity');
        const data = await res.json();
        if (active) setItems(data.items ?? []);
      } finally {
        if (active) setLoading(false);
      }
    };
    void load();
    const interval = setInterval(load, 4000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  const visible = useMemo(
    () => (filter === 'ALL' ? items : items.filter((i) => i.kind === filter)),
    [items, filter]
  );

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tighter">Activity</h2>
          <p className="mt-1 text-sm text-muted">
            Live on-chain feed. Every item links to Base Sepolia.
          </p>
        </div>
        <a
          href={BASESCAN_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-info hover:underline"
        >
          Basescan ↗
        </a>
      </div>

      <div className="mb-4 flex gap-1.5">
        {FILTERS.map((f) => (
          <button
            key={f.kind}
            onClick={() => setFilter(f.kind)}
            className={cn(
              'rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
              filter === f.kind
                ? 'bg-primary/15 text-primary'
                : 'text-muted hover:bg-white/5 hover:text-white'
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="card-surface divide-y divide-white/5">
        {loading ? (
          <div className="px-5 py-12 text-center text-sm text-muted">Loading…</div>
        ) : visible.length === 0 ? (
          <div className="px-5 py-12 text-center text-sm text-muted">
            No on-chain activity yet. Grant a permission or run a task.
          </div>
        ) : (
          visible.map((item) => {
            const meta = kindMeta[item.kind];
            return (
              <div key={item.id} className="flex items-center gap-3 px-5 py-3">
                <span className={cn('text-sm', meta.color)}>{meta.icon}</span>
                <div className="min-w-0 flex-1">
                  <div className="text-sm text-white">{item.label}</div>
                  {item.detail && (
                    <div className="truncate text-[11px] text-muted">{item.detail}</div>
                  )}
                </div>
                {item.amount != null && (
                  <span className="mono text-xs text-info">{formatUSDC(item.amount)}</span>
                )}
                <span className="text-[10px] text-muted">{formatRelativeTime(item.createdAt)}</span>
                {item.txHash ? (
                  <a
                    href={txUrl(item.txHash)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mono text-[11px] text-info hover:underline"
                  >
                    {truncateAddress(item.txHash, 4)} ↗
                  </a>
                ) : (
                  <Badge tone="muted" size="sm">
                    off-chain
                  </Badge>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
