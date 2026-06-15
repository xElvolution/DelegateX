'use client';

import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Progress } from '@/components/ui/Progress';
import { formatCountdown, formatUSDC, truncateAddress } from '@/lib/utils';
import { txUrl } from '@/lib/contracts';
import { useWallet } from '@/hooks/useWallet';
import { usePermission } from '@/hooks/usePermission';
import type { Permission } from '@/types';

export function PermissionManager() {
  const { address } = useWallet();
  const { permissions, revokePermission } = usePermission();
  const [local, setLocal] = useState<Permission[]>([]);

  useEffect(() => {
    setLocal(permissions);
  }, [permissions]);

  const handleRevoke = async (id: string) => {
    const ok = await revokePermission(id);
    if (ok) setLocal((prev) => prev.filter((p) => p.id !== id));
  };

  if (!address) {
    return (
      <div className="card-surface px-5 py-8 text-center text-xs text-muted">
        Connect MetaMask to manage permissions.
      </div>
    );
  }

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
              <th className="px-5 py-3 text-left font-semibold">Grant Tx</th>
              <th className="px-5 py-3 text-right font-semibold">Action</th>
            </tr>
          </thead>
          <tbody>
            {local.map((p) => (
              <tr key={p.id} className="border-b border-white/[0.03]">
                <td className="px-5 py-3">
                  <Badge tone="blue">{p.tokenSymbol}</Badge>
                </td>
                <td className="mono px-5 py-3 text-xs">
                  {formatUSDC(p.maxAmount)} / {p.periodLabel}
                </td>
                <td className="px-5 py-3">
                  <Progress
                    value={p.spent}
                    max={p.maxAmount}
                    variant="orange"
                    size="sm"
                    className="w-24"
                  />
                </td>
                <td className="mono px-5 py-3 text-xs text-muted">
                  {formatCountdown(p.expiry)}
                </td>
                <td className="px-5 py-3">
                  <Badge tone="muted">
                    {p.allowedContracts.filter((c) => c.enabled).length} contracts
                  </Badge>
                </td>
                <td className="mono px-5 py-3 text-xs">
                  {p.grantTxHash ? (
                    <a
                      href={txUrl(p.grantTxHash)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-info hover:underline"
                    >
                      {truncateAddress(p.grantTxHash, 5)} ↗
                    </a>
                  ) : (
                    <span className="text-muted">off-chain</span>
                  )}
                </td>
                <td className="px-5 py-3 text-right">
                  <Button variant="danger" size="sm" onClick={() => void handleRevoke(p.id)}>
                    Revoke
                  </Button>
                </td>
              </tr>
            ))}
            {local.length === 0 && (
              <tr>
                <td colSpan={7} className="px-5 py-8 text-center text-xs text-muted">
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
