'use client';

import { useCallback, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PermissionCard } from '@/components/app/PermissionCard';
import { PermissionModal } from '@/components/app/PermissionModal';
import { TaskInput } from '@/components/app/TaskInput';
import { AgentTree } from '@/components/app/AgentTree';
import { LiveFeed } from '@/components/app/LiveFeed';
import { ResultDisplay } from '@/components/app/ResultDisplay';
import { BudgetMeter } from '@/components/app/BudgetMeter';
import { Badge } from '@/components/ui/Badge';
import { useDemo } from '@/hooks/useDemo';
import { useWallet } from '@/hooks/useWallet';
import { usePermission } from '@/hooks/usePermission';
import { useTask } from '@/hooks/useTask';
import { formatUSDC } from '@/lib/utils';
import type { DemoPhase } from '@/agent/demo';
import type { Task } from '@/types';

const demoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

export function DelegateWorkspace() {
  const router = useRouter();
  const { address, authenticated } = useWallet();
  const { activePermission, grantPermission, revokePermission, granting } = usePermission();
  const live = useTask();
  const demo = useDemo();

  const [modalOpen, setModalOpen] = useState(false);
  const useLive = authenticated && Boolean(address);

  const state = useLive ? live : demo.state;
  const permission = useLive ? activePermission : demo.permission;
  const running = useLive ? live.running : demo.running;
  const start = demo.start;
  const reset = useLive ? live.reset : demo.reset;

  const handleGrant = useCallback(
    async (config: Parameters<typeof grantPermission>[0]) => {
      if (useLive) {
        await grantPermission(config);
      } else {
        demo.setPermissionGranted(true);
      }
    },
    [useLive, grantPermission, demo]
  );

  const handleRevoke = useCallback(async () => {
    if (useLive && activePermission) {
      await revokePermission(activePermission.id);
    } else {
      demo.setPermissionGranted(false);
      reset();
    }
  }, [useLive, activePermission, revokePermission, demo, reset]);

  const handleSubmit = useCallback(
    async (prompt: string) => {
      if (!permission) return;
      if (useLive && address) {
        await live.submitTask(prompt, permission.id, address);
      } else {
        start();
      }
    },
    [permission, useLive, address, live, start]
  );

  const handleNewTask = useCallback(() => reset(), [reset]);

  const isIdle = state.phase === 'IDLE' || (!running && !state.task);
  const isComplete = useLive ? live.task?.status === 'COMPLETE' : state.phase === 'COMPLETE';
  const isRunning = useLive
    ? live.running
    : state.phase === 'PLANNING' ||
      state.phase === 'SPAWNING' ||
      state.phase === 'RUNNING' ||
      state.phase === 'COMPLETING';

  const events = useLive ? live.events : state.events;
  const agents = useLive ? live.agents : state.agents;

  const recentPayments = useMemo(() => {
    return events
      .filter((e) => e.type === 'PAYMENT_MADE' && e.amount)
      .slice(0, 5)
      .map((e) => ({
        recipient: e.recipient ?? 'Unknown',
        amount: e.amount!,
        timeAgo: 'just now',
        oneShotTx: e.oneShotTx,
      }));
  }, [events]);

  const activeAgentCount = agents.filter((a) => a.status === 'ACTIVE').length;

  const planningText =
    state.phase === 'PLANNING' || (useLive && live.running && !live.agents.length)
      ? 'Planning with Venice AI...'
      : undefined;

  const resultTask: Task | null = useLive ? live.task : state.task;

  return (
    <div className="mx-auto max-w-7xl">
      {/* Demo controls */}
      {!useLive && demoMode && (
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <Badge tone="orange" dot pulse>
            Demo mode
          </Badge>
          {!running && isIdle && (
            <button
              onClick={start}
              className="text-xs font-semibold text-primary underline underline-offset-2 hover:text-white"
            >
              Start demo task
            </button>
          )}
          {running && (
            <button
              onClick={reset}
              className="text-xs text-muted underline underline-offset-2 hover:text-white"
            >
              Reset
            </button>
          )}
          <span className="text-xs text-muted">· Connect MetaMask for live agents</span>
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-card shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/5 px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-danger/60" />
            <span className="h-2.5 w-2.5 rounded-full bg-primary/60" />
            <span className="h-2.5 w-2.5 rounded-full bg-success/60" />
            <span className="ml-3 text-xs text-muted">Task workspace</span>
          </div>
          {activeAgentCount > 0 && (
            <Badge tone="green" dot pulse size="sm">
              {activeAgentCount} agents active
            </Badge>
          )}
        </div>

        <div className="grid min-h-[560px] lg:grid-cols-[260px_1fr_280px]">
          <aside className="border-b border-white/5 p-4 lg:border-b-0 lg:border-r">
            <h3 className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-muted">
              Your Permission
            </h3>
            <PermissionCard
              permission={permission}
              onGrant={() => setModalOpen(true)}
              onRevoke={() => void handleRevoke()}
              recentPayments={recentPayments}
            />
          </aside>

          <div className="flex flex-col border-b border-white/5 p-4 lg:border-b-0 lg:border-r">
            {isIdle && (
              <div className="flex flex-1 flex-col justify-center">
                {!useLive && !permission && (
                  <p className="mb-4 text-center text-xs text-muted">
                    Grant a permission or start the demo to delegate your first task.
                  </p>
                )}
                <TaskInput onSubmit={(p) => void handleSubmit(p)} disabled={!permission} />
              </div>
            )}

            {isRunning && (
              <div className="flex flex-1 flex-col items-center justify-center py-4">
                <AgentTree
                  agents={agents}
                  phase={(useLive ? 'RUNNING' : state.phase) as DemoPhase}
                  remainingBudget={permission?.remaining ?? 0}
                  planningText={planningText}
                />
                {events.filter((e) => e.type === 'PAYMENT_MADE').length > 0 && (
                  <div className="mt-4 w-full max-w-md">
                    <div className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted">
                      Live Payments
                    </div>
                    <div className="space-y-1">
                      {events
                        .filter((e) => e.type === 'PAYMENT_MADE')
                        .slice(0, 4)
                        .map((e) => (
                          <div
                            key={e.id}
                            className="mono flex items-center justify-between rounded border border-info/10 bg-info/5 px-2 py-1 text-[11px]"
                          >
                            <span className="text-info">→ {e.recipient}</span>
                            <span className="text-white/70">
                              {formatUSDC(e.amount ?? 0)} USDC
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {isComplete && resultTask && (
              <div className="flex flex-1 items-center justify-center py-4">
                <ResultDisplay
                  task={resultTask}
                  onNewTask={handleNewTask}
                  onViewDashboard={() => router.push('/app/dashboard')}
                  oneShotPayments={events
                    .filter((e) => e.type === 'PAYMENT_MADE' && e.oneShotTx)
                    .map((e) => ({
                      recipient: e.recipient ?? 'service',
                      amount: e.amount ?? 0,
                      txHash: e.oneShotTx as string,
                    }))}
                />
              </div>
            )}
          </div>

          <aside className="flex flex-col p-4">
            <h3 className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-muted">
              Agent Activity
            </h3>
            <LiveFeed events={events} />
            {permission && (
              <div className="mt-4 border-t border-white/5 pt-4">
                <BudgetMeter spent={permission.spent} total={permission.maxAmount} />
              </div>
            )}
            <div className="mt-4 rounded-xl border border-primary/20 bg-primary/5 p-4 text-center">
              <div className="mono text-3xl font-black text-primary">0</div>
              <div className="mt-1 text-[11px] text-muted">transactions signed by you</div>
            </div>
          </aside>
        </div>
      </div>

      <PermissionModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onGrant={(config) => void handleGrant(config).then(() => setModalOpen(false))}
        granting={granting}
      />
    </div>
  );
}
