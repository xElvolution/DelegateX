'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  createDemoSteps,
  initialDemoState,
  type DemoState,
  type DemoPhase,
} from '@/agent/demo';
import type { FeedEvent, Permission } from '@/types';

const DEMO_PERMISSION: Permission = {
  id: 'demo-perm',
  tokenSymbol: 'USDC',
  tokenAddress: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
  maxAmount: 10,
  periodLabel: 'hour',
  periodSeconds: 3600,
  spent: 0,
  remaining: 10,
  expiry: Date.now() + 24 * 60 * 60 * 1000,
  allowedContracts: [
    { name: 'Venice AI API', address: '0xVenice', enabled: true },
    { name: 'DeFiLlama', address: '0xDeFiLlama', enabled: true },
    { name: 'Uniswap v3', address: '0xUniswap', enabled: true },
    { name: 'Aave v3', address: '0xAave', enabled: true },
  ],
  status: 'ACTIVE',
  grantedAt: Date.now(),
  erc7715Sig: '0xdemo',
};

export function useDemo() {
  const [state, setState] = useState<DemoState>(initialDemoState());
  const [permission, setPermission] = useState<Permission>(DEMO_PERMISSION);
  const [running, setRunning] = useState(false);
  const stepsRef = useRef(createDemoSteps());
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const stateRef = useRef(state);
  stateRef.current = state;

  const emit = useCallback((event: FeedEvent) => {
    setState((prev) => ({
      ...prev,
      events: [event, ...prev.events].slice(0, 20),
    }));
  }, []);

  const start = useCallback(() => {
    const steps = createDemoSteps();
    stepsRef.current = steps;
    const fresh = initialDemoState();
    setState(fresh);
    stateRef.current = fresh;
    setRunning(true);

    let totalDelay = 0;
    steps.forEach((step, i) => {
      totalDelay += step.delay;
      const t = setTimeout(() => {
        setState((prev) => {
          const updates = step.action(prev, emit);
          const next = {
            ...prev,
            ...updates,
            currentStep: i,
            agents: updates.agents ?? prev.agents,
            events: prev.events,
          };
          stateRef.current = next;

          // update permission spent
          if (next.task) {
            setPermission((p) => ({
              ...p,
              spent: next.task?.totalCost ?? 0,
              remaining: p.maxAmount - (next.task?.totalCost ?? 0),
            }));
          }

          return next;
        });
      }, totalDelay);
      timersRef.current.push(t);
    });

    // Auto-restart after completion + 10s
    const restart = setTimeout(() => {
      setPermission(DEMO_PERMISSION);
      const fresh2 = initialDemoState();
      setState(fresh2);
      stateRef.current = fresh2;
      setRunning(false);
    }, totalDelay + 10000);
    timersRef.current.push(restart);
  }, [emit]);

  const stop = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    setRunning(false);
  }, []);

  const reset = useCallback(() => {
    stop();
    setState(initialDemoState());
    setPermission(DEMO_PERMISSION);
  }, [stop]);

  useEffect(() => {
    return () => {
      timersRef.current.forEach(clearTimeout);
    };
  }, []);

  return {
    state,
    permission,
    running,
    start,
    stop,
    reset,
    emit,
  };
}
