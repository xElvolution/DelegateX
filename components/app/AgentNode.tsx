'use client';

import { motion, AnimatePresence } from 'framer-motion';
import type { SubAgent } from '@/types';
import { cn, formatUSDC } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';

const statusColors: Record<string, string> = {
  WAITING: 'border-muted/30 bg-muted/5',
  ACTIVE: 'border-primary/40 bg-primary/5',
  COMPLETE: 'border-success/40 bg-success/5',
  ERROR: 'border-danger/40 bg-danger/5',
};

const statusDot: Record<string, string> = {
  WAITING: 'bg-muted',
  ACTIVE: 'bg-primary animate-pulse',
  COMPLETE: 'bg-success',
  ERROR: 'bg-danger',
};

const statusLabel: Record<string, string> = {
  WAITING: 'Waiting',
  ACTIVE: 'Active',
  COMPLETE: 'Complete',
  ERROR: 'Error',
};

const statusTone: Record<string, 'muted' | 'orange' | 'green' | 'red'> = {
  WAITING: 'muted',
  ACTIVE: 'orange',
  COMPLETE: 'green',
  ERROR: 'red',
};

export interface AgentNodeProps {
  agent: SubAgent;
  index: number;
}

const nodeVariants = {
  hidden: { opacity: 0, scale: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 25,
      delay: i * 0.1,
    },
  }),
  exit: { opacity: 0, scale: 0.8, transition: { duration: 0.2 } },
};

export function AgentNode({ agent, index }: AgentNodeProps) {
  return (
    <motion.div
      layout
      custom={index}
      variants={nodeVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className={cn(
        'relative w-40 rounded-xl border p-3 transition-colors',
        statusColors[agent.status]
      )}
    >
      {/* Status indicator */}
      <div className="mb-2 flex items-center justify-between">
        <Badge tone={statusTone[agent.status]} dot size="sm">
          {statusLabel[agent.status]}
        </Badge>
      </div>

      {/* Agent info */}
      <div className="mb-1 text-xs font-semibold text-white">{agent.label}</div>
      <div className="mono text-[10px] text-muted">
        {formatUSDC(agent.budget)} limit
      </div>

      {/* Spent */}
      {agent.spent > 0 && (
        <div className="mt-2">
          <div className="flex items-baseline justify-between text-[10px]">
            <span className="text-muted">Spent</span>
            <span className="mono text-white">{formatUSDC(agent.spent)}</span>
          </div>
          <div className="mt-0.5 h-0.5 w-full overflow-hidden rounded-full bg-white/5">
            <motion.div
              className="h-full rounded-full bg-primary"
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, (agent.spent / agent.budget) * 100)}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
        </div>
      )}

      {/* Last action */}
      {agent.lastAction && (
        <div className="mt-2 truncate text-[10px] text-muted">{agent.lastAction}</div>
      )}

      {/* Glow effect for active */}
      {agent.status === 'ACTIVE' && (
        <div className="absolute -inset-px -z-10 rounded-xl bg-primary/20 blur-md" />
      )}
    </motion.div>
  );
}
