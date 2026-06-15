'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Progress';
import { useWallet } from '@/hooks/useWallet';
import { formatUSDC, formatRelativeTime, truncateAddress } from '@/lib/utils';
import { txUrl } from '@/lib/contracts';
import type { AgentSummary } from '@/types';

const statusTone: Record<string, 'green' | 'blue' | 'red' | 'muted'> = {
  ACTIVE: 'green',
  COMPLETE: 'blue',
  ERROR: 'red',
};

export default function AgentsPage() {
  const { address } = useWallet();
  const [agents, setAgents] = useState<AgentSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!address) {
      setAgents([]);
      setLoading(false);
      return;
    }
    let active = true;
    const load = async () => {
      try {
        const res = await fetch(`/api/agents/list?address=${address}`);
        const data = await res.json();
        if (active) setAgents(data.agents ?? []);
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
  }, [address]);

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6">
        <h2 className="text-xl font-bold tracking-tighter">Agents</h2>
        <p className="mt-1 text-sm text-muted">
          Every sub-agent your delegation has spawned, with budget and on-chain registration.
        </p>
      </div>

      {!address ? (
        <div className="card-surface px-5 py-12 text-center text-sm text-muted">
          Connect MetaMask to see your agents.
        </div>
      ) : loading ? (
        <div className="card-surface px-5 py-12 text-center text-sm text-muted">Loading…</div>
      ) : agents.length === 0 ? (
        <div className="card-surface px-5 py-12 text-center text-sm text-muted">
          No agents yet. Run a task on the Delegate page to spawn your first swarm.
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {agents.map((a) => (
            <div key={a.id} className="card-surface p-4">
              <div className="mb-3 flex items-center justify-between">
                <Badge tone="muted">{a.agentType}</Badge>
                <Badge tone={statusTone[a.status] ?? 'muted'} dot>
                  {a.status}
                </Badge>
              </div>

              <div className="mb-1 flex items-center justify-between text-[11px] text-muted">
                <span>Spent</span>
                <span className="mono">{formatUSDC(a.spent)}</span>
              </div>
              <Progress
                value={a.spent}
                max={Math.max(a.budget, a.spent, 0.001)}
                variant="orange"
                size="sm"
              />

              <div className="mt-3 flex items-center justify-between text-[10px] text-muted">
                <span>{formatRelativeTime(a.createdAt)}</span>
                {a.txHash ? (
                  <a
                    href={txUrl(a.txHash)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mono text-info hover:underline"
                  >
                    {truncateAddress(a.txHash, 4)} ↗
                  </a>
                ) : (
                  <span>off-chain</span>
                )}
              </div>

              {a.taskId && (
                <Link
                  href={`/app/task/${a.taskId}`}
                  className="mt-3 block text-[11px] text-primary hover:underline"
                >
                  View task →
                </Link>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
