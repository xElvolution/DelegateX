'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/Badge';
import { cn, formatUSDC, formatDuration } from '@/lib/utils';
import type { TaskHistoryEntry } from '@/types';

const MOCK_HISTORY: TaskHistoryEntry[] = [
  {
    id: '1',
    date: Date.now() - 3600_000,
    prompt: 'Research the top 3 DeFi yields on Ethereum and move $50 to the best one',
    agentCount: 4,
    cost: 0.056,
    duration: 35_000,
    signatures: 0,
    status: 'COMPLETE',
  },
  {
    id: '2',
    date: Date.now() - 7200_000,
    prompt: 'Check if my Aave position is at liquidation risk',
    agentCount: 2,
    cost: 0.012,
    duration: 8_000,
    signatures: 0,
    status: 'COMPLETE',
  },
  {
    id: '3',
    date: Date.now() - 10800_000,
    prompt: 'Find best gas window and batch my pending transactions',
    agentCount: 3,
    cost: 0.024,
    duration: 22_000,
    signatures: 0,
    status: 'COMPLETE',
  },
  {
    id: '4',
    date: Date.now() - 86400_000,
    prompt: 'Summarize my wallet activity this week',
    agentCount: 2,
    cost: 0.008,
    duration: 5_000,
    signatures: 0,
    status: 'COMPLETE',
  },
];

const statusBadge: Record<string, 'green' | 'orange' | 'red'> = {
  COMPLETE: 'green',
  RUNNING: 'orange',
  FAILED: 'red',
};

export function TaskHistory() {
  const [expanded, setExpanded] = useState<string | null>(null);

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
            {MOCK_HISTORY.map((task) => (
              <>
                <tr
                  key={task.id}
                  className={cn(
                    'cursor-pointer border-b border-white/[0.03] transition-colors hover:bg-white/[0.02]',
                    expanded === task.id && 'bg-white/[0.02]'
                  )}
                  onClick={() =>
                    setExpanded(expanded === task.id ? null : task.id)
                  }
                >
                  <td className="mono px-5 py-3 text-xs text-muted">
                    {new Date(task.date).toLocaleString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </td>
                  <td className="max-w-[200px] truncate px-5 py-3 text-xs">
                    {task.prompt}
                  </td>
                  <td className="mono px-5 py-3 text-xs">{task.agentCount}</td>
                  <td className="mono px-5 py-3 text-xs">
                    {formatUSDC(task.cost)}
                  </td>
                  <td className="mono px-5 py-3 text-xs">
                    {formatDuration(task.duration)}
                  </td>
                  <td className="px-5 py-3">
                    <span className="mono text-xs font-bold text-primary">
                      {task.signatures}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <Badge tone={statusBadge[task.status] ?? 'muted'} size="sm">
                      {task.status}
                    </Badge>
                  </td>
                </tr>
                <AnimatePresence>
                  {expanded === task.id && (
                    <tr key={`${task.id}-detail`}>
                      <td colSpan={7} className="bg-surface/30 px-5">
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="py-4">
                            <div className="mb-2 text-xs text-muted">
                              Full prompt
                            </div>
                            <div className="mono mb-4 rounded-lg border border-white/5 bg-card p-3 text-xs text-white/80">
                              {task.prompt}
                            </div>
                            <div className="flex gap-6 text-xs text-muted">
                              <div>
                                Agents: <span className="text-white">{task.agentCount}</span>
                              </div>
                              <div>
                                Cost: <span className="text-white">{formatUSDC(task.cost)} USDC</span>
                              </div>
                              <div>
                                Duration: <span className="text-white">{formatDuration(task.duration)}</span>
                              </div>
                              <div>
                                Relayed via: <span className="text-info">1Shot</span>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      </td>
                    </tr>
                  )}
                </AnimatePresence>
              </>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
