'use client';

import { motion, AnimatePresence } from 'framer-motion';
import type { FeedEvent } from '@/types';
import { cn, formatRelativeTime, formatUSDC, truncateAddress } from '@/lib/utils';
import { txUrl } from '@/lib/contracts';
import { useEffect, useRef } from 'react';

const borderColors: Record<string, string> = {
  AGENT_SPAWNED: 'border-l-primary',
  ONESHOT_RELAY: 'border-l-secondary',
  PAYMENT_MADE: 'border-l-info',
  SUBTASK_COMPLETE: 'border-l-success',
  TASK_COMPLETE: 'border-l-success',
  PLANNING: 'border-l-secondary',
  ERROR: 'border-l-danger',
};

const icons: Record<string, string> = {
  AGENT_SPAWNED: '●',
  ONESHOT_RELAY: '⚡',
  PAYMENT_MADE: '→',
  SUBTASK_COMPLETE: '✓',
  TASK_COMPLETE: '✓',
  PLANNING: '◐',
  ERROR: '✗',
};

const iconColors: Record<string, string> = {
  AGENT_SPAWNED: 'text-primary',
  ONESHOT_RELAY: 'text-secondary',
  PAYMENT_MADE: 'text-info',
  SUBTASK_COMPLETE: 'text-success',
  TASK_COMPLETE: 'text-success',
  PLANNING: 'text-secondary',
  ERROR: 'text-danger',
};

const itemVariants = {
  hidden: { opacity: 0, x: 40, height: 0 },
  visible: {
    opacity: 1,
    x: 0,
    height: 'auto',
    transition: { type: 'spring', stiffness: 500, damping: 35 },
  },
  exit: { opacity: 0, x: -20, transition: { duration: 0.15 } },
};

export interface FeedItemProps {
  event: FeedEvent;
}

export function FeedItem({ event }: FeedItemProps) {
  return (
    <motion.div
      layout
      variants={itemVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className={cn(
        'border-l-2 bg-white/[0.02] px-3 py-2',
        borderColors[event.type]
      )}
    >
      <div className="flex items-start gap-2">
        <span className={cn('mt-0.5 text-xs', iconColors[event.type])}>
          {icons[event.type]}
        </span>
        <div className="min-w-0 flex-1">
          <div className="text-xs font-medium text-white">{event.title}</div>
          {event.detail && (
            <div className="mt-0.5 truncate text-[10px] text-muted">{event.detail}</div>
          )}
          {event.amount != null && event.type === 'PAYMENT_MADE' && (
            <div className="mono mt-0.5 text-[10px] text-info">
              {formatUSDC(event.amount)} USDC
            </div>
          )}
          {event.oneShotTx && (
            <a
              href={txUrl(event.oneShotTx)}
              target="_blank"
              rel="noopener noreferrer"
              className="mono mt-0.5 inline-flex items-center gap-1 text-[10px] text-info hover:underline"
            >
              {truncateAddress(event.oneShotTx, 6)} ↗ Basescan
            </a>
          )}
        </div>
        <span className="shrink-0 text-[10px] text-muted">
          {formatRelativeTime(event.timestamp)}
        </span>
      </div>
    </motion.div>
  );
}

export interface LiveFeedProps {
  events: FeedEvent[];
  maxItems?: number;
}

export function LiveFeed({ events, maxItems = 20 }: LiveFeedProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [events.length]);

  const visible = events.slice(0, maxItems);

  return (
    <div
      ref={scrollRef}
      className="no-scrollbar max-h-[400px] space-y-1 overflow-y-auto"
    >
      <AnimatePresence mode="popLayout">
        {visible.map((event) => (
          <FeedItem key={event.id} event={event} />
        ))}
      </AnimatePresence>
      {visible.length === 0 && (
        <div className="py-8 text-center text-xs text-muted">
          No activity yet. Start a task to see agents in action.
        </div>
      )}
    </div>
  );
}
