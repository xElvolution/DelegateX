'use client';

import { useCallback, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { PermissionCard } from '@/components/app/PermissionCard';
import { TaskInput } from '@/components/app/TaskInput';
import { AgentTree } from '@/components/app/AgentTree';
import { LiveFeed } from '@/components/app/LiveFeed';
import { ResultDisplay } from '@/components/app/ResultDisplay';
import { BudgetMeter } from '@/components/app/BudgetMeter';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useDemo } from '@/hooks/useDemo';
import { formatUSDC, truncateAddress } from '@/lib/utils';
import type { DemoPhase } from '@/agent/demo';

export default function AppPage() {
  const router = useRouter();
  const { state, permission, running, start, stop, reset } = useDemo();
  const [permissionGranted, setPermissionGranted] = useState(true); // demo starts with permission

  const handleGrant = useCallback(() => setPermissionGranted(true), []);
  const handleRevoke = useCallback(() => {
    setPermissionGranted(false);
    reset();
  }, [reset]);

  const handleSubmit = useCallback(
    (_prompt: string) => {
      if (!permissionGranted) return;
      start();
    },
    [permissionGranted, start]
  );

  const handleNewTask = useCallback(() => {
    reset();
  }, [reset]);

  const isIdle = state.phase === 'IDLE';
  const isComplete = state.phase === 'COMPLETE';
  const isRunning =
    state.phase === 'PLANNING' ||
    state.phase === 'SPAWNING' ||
    state.phase === 'RUNNING' ||
    state.phase === 'COMPLETING';

  const recentPayments = useMemo(() => {
    return state.events
      .filter((e) => e.type === 'PAYMENT_MADE' && e.amount)
      .slice(0, 5)
      .map((e) => ({
        recipient: e.recipient ?? 'Unknown',
        amount: e.amount!,
        timeAgo: 'just now',
        oneShotTx: e.oneShotTx,
      }));
  }, [state.events]);

  const oneShotPayments = useMemo(() => {
    return state.events
      .filter((e) => e.type === 'PAYMENT_MADE' && e.oneShotTx && e.amount)
      .map((e) => ({
        recipient: e.recipient ?? 'Unknown',
        amount: e.amount!,
        txHash: e.oneShotTx!,
      }));
  }, [state.events]);

  const activeAgentCount = state.agents.filter((a) => a.status === 'ACTIVE').length;

  const planningText =
    state.phase === 'PLANNING'
      ? state.currentStep === 0
        ? 'Planning with Venice AI...'
        : 'Breaking task into 4 subtasks'
      : undefined;

  return (
    <div className="flex min-h-screen flex-col bg-bg">
      <Header />

      {/* Demo banner */}
      <div className="border-b border-primary/10 bg-primary/[0.03] px-4 py-2 text-center">
        <span className="text-xs text-muted">
          Demo Mode — Agents pay via 1Shot relayer API. No wallet required.{' '}
          {!running && isIdle && (
            <button
              onClick={start}
              className="ml-1 font-semibold text-primary underline underline-offset-2 transition-colors hover:text-white"
            >
              Start Demo
            </button>
          )}
          {running && (
            <button
              onClick={reset}
              className="ml-1 font-semibold text-muted underline underline-offset-2 transition-colors hover:text-white"
            >
              Reset
            </button>
          )}
        </span>
      </div>

      {/* Three-column layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* LEFT PANEL — Permission */}
        <aside className="hidden w-[280px] shrink-0 overflow-y-auto border-r border-white/5 p-4 lg:block">
          <h2 className="mb-4 text-[11px] font-semibold uppercase tracking-widest text-muted">
            Your Permission
          </h2>
          <PermissionCard
            permission={permissionGranted ? permission : null}
            onGrant={handleGrant}
            onRevoke={handleRevoke}
            recentPayments={recentPayments}
          />
        </aside>

        {/* CENTER — Task Interface */}
        <main className="flex flex-1 flex-col overflow-y-auto p-6">
          {/* Idle: show task input */}
          {isIdle && (
            <div className="mx-auto w-full max-w-2xl pt-8">
              <TaskInput
                onSubmit={handleSubmit}
                disabled={!permissionGranted}
                estimatedCost={permissionGranted ? undefined : undefined}
              />
            </div>
          )}

          {/* Running: show agent tree */}
          {isRunning && (
            <div className="flex flex-1 flex-col items-center justify-center">
              <AgentTree
                agents={state.agents}
                phase={state.phase as DemoPhase}
                remainingBudget={permission.remaining}
                planningText={planningText}
              />

              {/* Payment feed below tree */}
              {state.events.filter((e) => e.type === 'PAYMENT_MADE').length > 0 && (
                <div className="mx-auto mt-6 w-full max-w-md">
                  <div className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted">
                    Live Payments · 1Shot Relayer
                  </div>
                  <div className="space-y-1">
                    {state.events
                      .filter((e) => e.type === 'PAYMENT_MADE')
                      .slice(0, 6)
                      .map((e) => (
                        <div
                          key={e.id}
                          className="rounded border border-info/10 bg-info/5 px-2 py-1 text-[11px]"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-info">→ {e.recipient}</span>
                            <span className="mono text-white/70">
                              {formatUSDC(e.amount ?? 0)} via 1Shot
                            </span>
                          </div>
                          {e.oneShotTx && (
                            <div className="mono mt-0.5 text-[10px] text-muted">
                              {truncateAddress(e.oneShotTx, 6)}
                            </div>
                          )}
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Complete: show result */}
          {isComplete && state.task && (
            <div className="flex flex-1 items-center justify-center">
              <ResultDisplay
                task={state.task}
                onNewTask={handleNewTask}
                onViewDashboard={() => router.push('/dashboard')}
                oneShotPayments={oneShotPayments}
              />
            </div>
          )}
        </main>

        {/* RIGHT PANEL — Agent Dashboard */}
        <aside className="hidden w-[320px] shrink-0 overflow-y-auto border-l border-white/5 p-4 xl:block">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-[11px] font-semibold uppercase tracking-widest text-muted">
              Agent Activity
            </h2>
            {activeAgentCount > 0 && (
              <Badge tone="green" dot pulse size="sm">
                {activeAgentCount} active
              </Badge>
            )}
          </div>

          <LiveFeed events={state.events} />

          {/* Budget overview */}
          {permissionGranted && (
            <div className="mt-6 border-t border-white/5 pt-4">
              <BudgetMeter
                spent={permission.spent}
                total={permission.maxAmount}
              />
            </div>
          )}

          {/* Signatures counter */}
          <div className="mt-6 rounded-xl border border-primary/20 bg-primary/5 p-5 text-center">
            <div className="mono text-4xl font-black text-primary">0</div>
            <div className="mt-1 text-xs text-muted">
              transactions signed by you
            </div>
            <div className="text-[10px] text-muted">this session</div>
          </div>
        </aside>
      </div>
    </div>
  );
}
