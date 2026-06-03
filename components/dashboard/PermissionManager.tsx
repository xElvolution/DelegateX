'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Progress } from '@/components/ui/Progress';
import { formatCountdown } from '@/lib/utils';

const MOCK_PERMISSIONS = [
  {
    id: '1',
    token: 'USDC',
    max: '$10 / hour',
    spent: 2.57,
    total: 10,
    expires: Date.now() + 23 * 3600_000 + 14 * 60_000,
    contracts: 4,
    active: true,
  },
];

export function PermissionManager() {
  const [perms, setPerms] = useState(MOCK_PERMISSIONS);

  const handleRevoke = (id: string) => {
    setPerms((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <div className="card-surface overflow-hidden">
      <div className="border-b border-white/5 px-5 py-4">
        <h3 className="text-sm font-semibold">Active Permissions</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/5 text-[10px] uppercase tracking-widest text-muted">
              <th className="px-5 py-3 text-left font-semibold">Token</th>
              <th className="px-5 py-3 text-left font-semibold">Max/Period</th>
              <th className="px-5 py-3 text-left font-semibold">Spent</th>
              <th className="px-5 py-3 text-left font-semibold">Expires</th>
              <th className="px-5 py-3 text-left font-semibold">Contracts</th>
              <th className="px-5 py-3 text-right font-semibold">Action</th>
            </tr>
          </thead>
          <tbody>
            {perms.map((p) => (
              <tr key={p.id} className="border-b border-white/[0.03]">
                <td className="px-5 py-3">
                  <Badge tone="blue">{p.token}</Badge>
                </td>
                <td className="mono px-5 py-3 text-xs">{p.max}</td>
                <td className="px-5 py-3">
                  <Progress
                    value={p.spent}
                    max={p.total}
                    variant="orange"
                    size="sm"
                    className="w-24"
                  />
                </td>
                <td className="mono px-5 py-3 text-xs text-muted">
                  {formatCountdown(p.expires)}
                </td>
                <td className="px-5 py-3">
                  <Badge tone="muted">{p.contracts} contracts</Badge>
                </td>
                <td className="px-5 py-3 text-right">
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleRevoke(p.id)}
                  >
                    Revoke
                  </Button>
                </td>
              </tr>
            ))}
            {perms.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-8 text-center text-xs text-muted">
                  No active permissions.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
