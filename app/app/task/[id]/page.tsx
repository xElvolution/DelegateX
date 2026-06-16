'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Progress';
import {
  formatUSDC,
  formatDuration,
  formatRelativeTime,
  truncateAddress,
} from '@/lib/utils';
import { txUrl } from '@/lib/contracts';
import type { TaskDetail } from '@/types';

const statusTone: Record<string, 'green' | 'blue' | 'red' | 'muted' | 'orange'> = {
  COMPLETE: 'green',
  RUNNING: 'blue',
  PLANNING: 'orange',
  PENDING: 'muted',
  FAILED: 'red',
};

export default function TaskDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [task, setTask] = useState<TaskDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) return;
    let active = true;
    const load = async () => {
      try {
        const res = await fetch(`/api/tasks/detail/${id}`);
        if (res.status === 404) {
          if (active) setNotFound(true);
          return;
        }
        const data = await res.json();
        if (active) setTask(data.task ?? null);
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
  }, [id]);

  return (
    <div className="mx-auto max-w-3xl">
      <button
        onClick={() => router.back()}
        className="mb-4 text-xs text-muted hover:text-white"
      >
        ← Back
      </button>

      {loading ? (
        <div className="card-surface px-5 py-12 text-center text-sm text-muted">Loading…</div>
      ) : notFound || !task ? (
        <div className="card-surface px-5 py-12 text-center text-sm text-muted">
          Task not found. It may have been cleared (in-memory store resets on restart).
        </div>
      ) : (
        <>
          <div className="card-surface mb-4 p-5">
            <div className="mb-3 flex items-center justify-between">
              <Badge tone={statusTone[task.status] ?? 'muted'} dot>
                {task.status}
              </Badge>
              <span className="text-[11px] text-muted">
                {formatRelativeTime(task.createdAt)}
              </span>
            </div>
            <h2 className="text-lg font-semibold tracking-tight">{task.prompt}</h2>

            <div className="mt-4 grid grid-cols-3 gap-3 border-t border-white/5 pt-4">
              <Stat label="Agents" value={String(task.agentCount || task.agents.length)} />
              <Stat label="Total cost" value={`${formatUSDC(task.totalCost)}`} />
              <Stat
                label="Duration"
                value={task.duration ? formatDuration(task.duration) : '-'}
              />
            </div>
          </div>

          {task.result && (
            <div className="card-surface mb-4 p-5">
              <div className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted">
                Result
              </div>
              <div className="mono whitespace-pre-wrap text-sm leading-relaxed text-white/85">
                {task.result}
              </div>
            </div>
          )}

          {task.agents.length > 0 && (
            <div className="card-surface mb-4 p-5">
              <div className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-muted">
                Sub-agents
              </div>
              <div className="space-y-2">
                {task.agents.map((a) => (
                  <div
                    key={a.id}
                    className="flex items-center justify-between rounded-lg border border-white/5 px-3 py-2"
                  >
                    <Badge tone="muted">{a.agentType}</Badge>
                    <div className="flex-1 px-4">
                      <Progress
                        value={a.spent}
                        max={Math.max(a.budget, a.spent, 0.001)}
                        variant="orange"
                        size="sm"
                      />
                    </div>
                    <span className="mono text-[11px] text-muted">{formatUSDC(a.spent)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {task.payments.length > 0 && (
            <div className="card-surface p-5">
              <div className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-muted">
                On-chain payments
              </div>
              <div className="space-y-1.5">
                {task.payments.map((p) => (
                  <a
                    key={p.id}
                    href={txUrl(p.txHash)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mono flex items-center justify-between rounded border border-info/10 bg-info/5 px-3 py-2 text-[11px] hover:border-info/30"
                  >
                    <span className="text-white/70">
                      {formatUSDC(p.amount)} → {truncateAddress(p.recipient, 4)}
                    </span>
                    <span className="text-info">
                      {p.via} · {truncateAddress(p.txHash, 5)} ↗
                    </span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-widest text-muted">{label}</div>
      <div className="mono mt-0.5 text-lg font-bold">{value}</div>
    </div>
  );
}
