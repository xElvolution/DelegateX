'use client';

import { Fragment, useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/Badge';
import { formatUSDC, formatDuration } from '@/lib/utils';
import type { TaskHistoryEntry } from '@/types';
import { useWallet } from '@/hooks/useWallet';

const statusBadge: Record<string, 'green' | 'orange' | 'red'> = {
  COMPLETE: 'green',
  RUNNING: 'orange',
  FAILED: 'red',
};

export function TaskHistory() {
  const { address } = useWallet();
  const [history, setHistory] = useState<TaskHistoryEntry[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    if (!address) return;
    fetch(`/api/tasks/history?address=${address}`)
      .then((r) => r.json())
      .then((d) => setHistory(d.tasks ?? []))
      .catch(() => {});
  }, [address]);

  return (
    <div className="card-surface overflow-hidden">
      <div className="border-b border-white/5 px-5 py-4">
        <h3 className="text-sm font-semibold">Task History</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/5 text-[10px] uppercase tracking-widest text-muted">
              <th className="px-5 py-3 text-left font-semibold">Date</th>
              <th className="px-5 py-3 text-left font-semibold">Task</th>
              <th className="px-5 py-3 text-left font-semibold">Agents</th>
              <th className="px-5 py-3 text-left font-semibold">Cost</th>
              <th className="px-5 py-3 text-left font-semibold">Duration</th>
              <th className="px-5 py-3 text-left font-semibold">Signatures</th>
              <th className="px-5 py-3 text-left font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {history.map((task) => (
              <Fragment key={task.id}>
                <tr
                  key={task.id}
                  className="cursor-pointer border-b border-white/[0.03] transition-colors hover:bg-white/[0.02]"
                  onClick={() => setExpanded(expanded === task.id ? null : task.id)}
                >
                  <td className="mono px-5 py-3 text-xs text-muted">
                    {new Date(task.date).toLocaleDateString()}
                  </td>
                  <td className="max-w-[200px] truncate px-5 py-3 text-xs">
                    {task.prompt}
                  </td>
                  <td className="mono px-5 py-3 text-xs">{task.agentCount}</td>
                  <td className="mono px-5 py-3 text-xs">{formatUSDC(task.cost)}</td>
                  <td className="mono px-5 py-3 text-xs">
                    {formatDuration(task.duration)}
                  </td>
                  <td className="mono px-5 py-3 text-xs text-primary">{task.signatures}</td>
                  <td className="px-5 py-3">
                    <Badge tone={statusBadge[task.status] ?? 'muted'}>{task.status}</Badge>
                  </td>
                </tr>
                <AnimatePresence>
                  {expanded === task.id && (
                    <tr key={`${task.id}-detail`}>
                      <td colSpan={7} className="bg-surface/30 px-5 py-4">
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                        >
                          <p className="text-xs text-white/80">{task.prompt}</p>
                          <Link
                            href={`/app/task/${task.id}`}
                            className="mt-2 inline-block text-[11px] text-primary hover:underline"
                          >
                            View full task, agents & on-chain payments →
                          </Link>
                        </motion.div>
                      </td>
                    </tr>
                  )}
                </AnimatePresence>
              </Fragment>
            ))}
            {history.length === 0 && (
              <tr>
                <td colSpan={7} className="px-5 py-8 text-center text-xs text-muted">
                  No tasks yet. Connect MetaMask and delegate your first task.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
