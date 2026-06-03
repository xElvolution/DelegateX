'use client';

import { motion, AnimatePresence } from 'framer-motion';
import type { SubAgent } from '@/types';
import type { DemoPhase } from '@/agent/demo';
import { AgentNode } from './AgentNode';
import { TypewriterText } from '@/components/animations/TypewriterText';
import { formatUSDC } from '@/lib/utils';

export interface AgentTreeProps {
  agents: SubAgent[];
  phase: DemoPhase;
  remainingBudget: number;
  planningText?: string;
}

export function AgentTree({
  agents,
  phase,
  remainingBudget,
  planningText,
}: AgentTreeProps) {
  const isPlanning = phase === 'PLANNING';
  const isRunning = phase === 'RUNNING' || phase === 'SPAWNING';

  return (
    <div className="flex flex-col items-center gap-6 py-4">
      {/* Orchestrator node */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-64 rounded-xl border border-primary/30 bg-primary/5 p-4 text-center"
      >
        <div className="mb-1 text-xs font-bold text-primary">DELEGATE</div>
        <div className="text-[11px] text-muted">Orchestrator</div>

        {isPlanning && planningText && (
          <div className="mt-2 text-xs text-white/70">
            <TypewriterText text={planningText} speed={25} />
          </div>
        )}

        <div className="mono mt-2 text-[10px] text-muted">
          Budget: {formatUSDC(remainingBudget)} remaining
        </div>

        {(isPlanning || isRunning) && (
          <div className="absolute -inset-px -z-10 rounded-xl bg-primary/15 blur-lg" />
        )}
      </motion.div>

      {/* Connector line */}
      {agents.length > 0 && (
        <svg
          width="2"
          height="24"
          className="text-primary/30"
          aria-hidden
        >
          <line
            x1="1"
            y1="0"
            x2="1"
            y2="24"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeDasharray="3 3"
          />
        </svg>
      )}

      {/* Horizontal connector */}
      {agents.length > 1 && (
        <svg
          width={Math.min(agents.length * 176, 720)}
          height="2"
          className="text-primary/20"
          aria-hidden
        >
          <line
            x1="0"
            y1="1"
            x2="100%"
            y2="1"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeDasharray="3 3"
          />
        </svg>
      )}

      {/* Agent nodes */}
      <div className="flex flex-wrap items-start justify-center gap-4">
        <AnimatePresence mode="popLayout">
          {agents.map((agent, i) => (
            <div key={agent.id} className="flex flex-col items-center gap-2">
              {/* Vertical stub from horizontal line */}
              {agents.length > 1 && (
                <svg width="2" height="16" className="text-secondary/30" aria-hidden>
                  <line
                    x1="1"
                    y1="0"
                    x2="1"
                    y2="16"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeDasharray="3 3"
                  />
                </svg>
              )}
              <AgentNode agent={agent} index={i} />
            </div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
