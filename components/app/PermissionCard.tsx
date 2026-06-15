'use client';

import { motion } from 'framer-motion';
import type { Permission } from '@/types';
import { cn, formatUSDC, formatCountdown, truncateAddress } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Progress';
import { Button } from '@/components/ui/Button';
import { useEffect, useState } from 'react';

export interface PermissionCardProps {
  permission: Permission | null;
  onGrant: () => void;
  onRevoke: () => void;
  recentPayments?: {
    recipient: string;
    amount: number;
    timeAgo: string;
    oneShotTx?: string;
  }[];
}

export function PermissionCard({
  permission,
  onGrant,
  onRevoke,
  recentPayments = [],
}: PermissionCardProps) {
  const [countdown, setCountdown] = useState('');

  useEffect(() => {
    if (!permission) return;
    const tick = () => setCountdown(formatCountdown(permission.expiry));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [permission?.expiry]);

  if (!permission) {
    return (
      <div className="card-surface flex flex-col items-center p-6 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
          <svg width="28" height="28" fill="none" viewBox="0 0 28 28">
            <path
              d="M17.5 12.25V9.625A3.625 3.625 0 0 0 13.875 6v0A3.625 3.625 0 0 0 10.25 9.625v2.625M13.875 16.625v1.75M11.375 22h5a2.625 2.625 0 0 0 2.625-2.625v-4.75A2.625 2.625 0 0 0 16.375 12h-5A2.625 2.625 0 0 0 8.75 14.625v4.75A2.625 2.625 0 0 0 11.375 22Z"
              stroke="#F6851B"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </div>
        <div className="mb-1 text-sm font-semibold">No permission granted</div>
        <p className="mb-5 text-xs text-muted">
          Grant DELEGATE a spending limit to start delegating tasks autonomously.
        </p>
        <Button fullWidth glow onClick={onGrant}>
          Grant Permission
        </Button>
      </div>
    );
  }

  const pct = (permission.remaining / permission.maxAmount) * 100;
  const isLow = pct < 20;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="card-surface p-4"
    >
      <div className="mb-3 flex items-center justify-between">
        <Badge tone="green" dot pulse>
          ACTIVE
        </Badge>
        <span className="mono text-[10px] text-muted">ERC-7715</span>
      </div>

      {/* Budget */}
      <div className="mb-1 text-xs text-muted">Budget</div>
      <div className="mb-2 text-sm font-semibold">
        {formatUSDC(permission.maxAmount)} {permission.tokenSymbol} / {permission.periodLabel}
      </div>

      <Progress
        value={permission.remaining}
        max={permission.maxAmount}
        variant={isLow ? 'red' : 'orange'}
        size="md"
        className="mb-1"
      />
      <div className="mono mb-4 text-xs text-muted">
        {formatUSDC(permission.remaining)} remaining
      </div>

      {/* Expiry */}
      <div className="mb-1 text-xs text-muted">Expires in</div>
      <div className="mono mb-4 text-sm font-semibold tracking-tight">{countdown}</div>

      {/* Allowed contracts */}
      <div className="mb-1 text-xs text-muted">Allowed Contracts</div>
      <ul className="mb-4 space-y-1">
        {permission.allowedContracts
          .filter((c) => c.enabled)
          .map((c) => (
            <li key={c.name} className="flex items-center gap-1.5 text-xs text-white/70">
              <span className="text-success">&#x2022;</span>
              {c.name}
            </li>
          ))}
      </ul>

      {/* Granted via */}
      <div className="mb-4 text-xs text-muted">
        Granted via <span className="text-white/70">ERC-7715 (MetaMask)</span>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Button variant="ghost" size="sm" className="flex-1">
          Modify
        </Button>
        <Button variant="danger" size="sm" className="flex-1" onClick={onRevoke}>
          Revoke
        </Button>
      </div>

      {/* Recent payments */}
      {recentPayments.length > 0 && (
        <div className="mt-4 border-t border-white/5 pt-3">
          <div className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted">
            Recent Payments
          </div>
          <div className="space-y-1">
            {recentPayments.map((p, i) => (
              <div key={i} className="text-[11px]">
                <div className="flex items-baseline justify-between">
                  <span className="text-muted">→ {p.recipient}</span>
                  <span className="mono text-white/70">-{formatUSDC(p.amount)}</span>
                </div>
                {p.oneShotTx && (
                  <div className="mono mt-0.5 text-[10px] text-info/70">
                    via 1Shot · {truncateAddress(p.oneShotTx, 4)}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
