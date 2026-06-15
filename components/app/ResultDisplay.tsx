'use client';

import { motion } from 'framer-motion';
import type { Task } from '@/types';
import { formatUSDC, formatDuration, truncateAddress } from '@/lib/utils';
import { txUrl } from '@/lib/contracts';
import { Button } from '@/components/ui/Button';

export interface ResultDisplayProps {
  task: Task;
  onNewTask: () => void;
  onViewDashboard: () => void;
  oneShotPayments?: { recipient: string; amount: number; txHash: string }[];
}

const resultVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
  },
};

export function ResultDisplay({
  task,
  onNewTask,
  onViewDashboard,
  oneShotPayments = [],
}: ResultDisplayProps) {
  return (
    <motion.div
      variants={resultVariants}
      initial="hidden"
      animate="visible"
      className="card-surface mx-auto max-w-xl p-6"
    >
      {/* Header */}
      <div className="mb-4 flex items-center gap-2">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-success/15 text-sm text-success">
          &#x2713;
        </span>
        <span className="text-sm font-semibold text-success">Task Complete</span>
      </div>

      {/* Result text */}
      <div className="mono mb-6 whitespace-pre-wrap rounded-lg border border-white/5 bg-surface/50 p-4 text-sm leading-relaxed text-white/85">
        {task.result}
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-2 gap-3 border-t border-white/5 pt-4 md:grid-cols-4">
        <div>
          <div className="text-[10px] uppercase tracking-widest text-muted">
            Agents Used
          </div>
          <div className="mono mt-0.5 text-lg font-bold">{task.agents.length}</div>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-widest text-muted">
            Total Cost
          </div>
          <div className="mono mt-0.5 text-lg font-bold">
            {formatUSDC(task.totalCost)} USDC
          </div>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-widest text-muted">Duration</div>
          <div className="mono mt-0.5 text-lg font-bold">
            {task.duration ? formatDuration(task.duration) : '—'}
          </div>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-widest text-muted">
            You Signed
          </div>
          <SignatureHighlight value={task.signatures} />
        </div>
      </div>

      {oneShotPayments.length > 0 && (
        <div className="mb-6 border-t border-white/5 pt-4">
          <div className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted">
            On-chain payments (Base Sepolia)
          </div>
          <div className="space-y-1.5">
            {oneShotPayments.map((p, i) => (
              <a
                key={i}
                href={txUrl(p.txHash)}
                target="_blank"
                rel="noopener noreferrer"
                className="mono flex items-center justify-between rounded border border-info/10 bg-info/5 px-2 py-1.5 text-[11px] hover:border-info/30"
              >
                <span className="text-white/70">
                  {formatUSDC(p.amount)} → {truncateAddress(p.recipient, 4)}
                </span>
                <span className="text-info">{truncateAddress(p.txHash, 6)} ↗</span>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <Button variant="primary" glow onClick={onNewTask} className="flex-1">
          New Task
        </Button>
        <Button variant="ghost" onClick={onViewDashboard} className="flex-1">
          View in Dashboard
        </Button>
      </div>
    </motion.div>
  );
}

function SignatureHighlight({ value }: { value: number }) {
  return (
    <motion.div
      className="mono mt-0.5 text-lg font-bold text-primary"
      initial={{ scale: 1 }}
      animate={{
        scale: [1, 1.25, 1, 1.2, 1, 1.15, 1],
      }}
      transition={{ duration: 2, delay: 0.5, ease: 'easeInOut' }}
    >
      {value} transactions
    </motion.div>
  );
}
