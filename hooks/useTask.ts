'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { FeedEvent, SubAgent, Task } from '@/types';
import { uid } from '@/lib/utils';
import toast from 'react-hot-toast';

const AGENT_LABELS: Record<string, string> = {
  DATA_FETCH: 'Data Fetcher',
  DATA_FETCHER: 'Data Fetcher',
  CHAIN_READ: 'Chain Analyzer',
  CHAIN_ANALYZER: 'Chain Analyzer',
  CHAIN_WRITE: 'Executor',
  AI_INFERENCE: 'Venice AI',
  EXECUTOR: 'Executor',
  CALCULATION: 'Calculator',
};

function agentFromEvent(event: FeedEvent, agents: SubAgent[]): SubAgent[] {
  if (event.type !== 'AGENT_SPAWNED' || !event.agentId) return agents;
  if (agents.some((a) => a.id === event.agentId)) return agents;

  return [
    ...agents,
    {
      id: event.agentId,
      type: (event.detail?.split('|')[0]?.trim() as SubAgent['type']) || 'DATA_FETCHER',
      label: event.detail?.split('|')[0]?.trim() || AGENT_LABELS[event.detail ?? ''] || 'Agent',
      status: 'ACTIVE',
      budget: 1,
      spent: 0,
      startedAt: event.timestamp,
    },
  ];
}

function applyEvent(agents: SubAgent[], event: FeedEvent): SubAgent[] {
  let next = agentFromEvent(event, agents);

  if (event.type === 'PAYMENT_MADE' && event.agentId) {
    next = next.map((a) =>
      a.id === event.agentId
        ? {
            ...a,
            spent: a.spent + (event.amount ?? 0),
            lastAction: event.recipient ? `Paid ${event.recipient}` : a.lastAction,
          }
        : a
    );
  }

  if (event.type === 'SUBTASK_COMPLETE' && event.agentId) {
    next = next.map((a) =>
      a.id === event.agentId
        ? { ...a, status: 'COMPLETE', completedAt: event.timestamp }
        : a
    );
  }

  if (event.type === 'TASK_COMPLETE') {
    next = next.map((a) => ({
      ...a,
      status: 'COMPLETE' as const,
      completedAt: event.timestamp,
    }));
  }

  return next;
}

export function useTask() {
  const [task, setTask] = useState<Task | null>(null);
  const [agents, setAgents] = useState<SubAgent[]>([]);
  const [events, setEvents] = useState<FeedEvent[]>([]);
  const [running, setRunning] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  const pushEvent = useCallback((event: FeedEvent) => {
    setEvents((prev) => [event, ...prev].slice(0, 20));
    setAgents((prev) => applyEvent(prev, event));
  }, []);

  const connectWs = useCallback(
    (taskId: string) => {
      const base = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001';
      const ws = new WebSocket(`${base}/${taskId}`);
      wsRef.current = ws;

      ws.onmessage = (msg) => {
        try {
          const payload = JSON.parse(msg.data) as Omit<FeedEvent, 'type'> & {
            type: string;
            message?: string;
          };
          if (payload.type === 'CONNECTED') return;

          const event: FeedEvent = {
            id: payload.id || uid(),
            type: payload.type as FeedEvent['type'],
            taskId: payload.taskId || taskId,
            agentId: payload.agentId,
            title: payload.title || payload.type,
            detail: payload.detail || payload.message,
            amount: payload.amount,
            recipient: payload.recipient,
            oneShotTx: payload.oneShotTx,
            timestamp: payload.timestamp || Date.now(),
          };

          pushEvent(event);

          if (event.type === 'TASK_COMPLETE') {
            setTask((prev) =>
              prev
                ? {
                    ...prev,
                    status: 'COMPLETE',
                    result: event.detail || event.title,
                    totalCost: event.amount ?? prev.totalCost,
                    completedAt: Date.now(),
                    duration: Date.now() - prev.createdAt,
                  }
                : prev
            );
            setAgents((prev) =>
              prev.map((a) => ({
                ...a,
                status: 'COMPLETE' as const,
                completedAt: Date.now(),
              }))
            );
            setRunning(false);
          }
        } catch {
          /* ignore malformed */
        }
      };

      ws.onerror = () => toast.error('WebSocket connection error');
      ws.onclose = () => {
        wsRef.current = null;
      };
    },
    [pushEvent]
  );

  const submitTask = useCallback(
    async (prompt: string, permissionId: string, address: string) => {
      setRunning(true);
      setAgents([]);
      setEvents([]);

      try {
        const res = await fetch('/api/tasks/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt, permissionId, address }),
        });

        if (!res.ok) throw new Error('Failed to create task');
        const data = await res.json();

        const newTask: Task = {
          id: data.taskId,
          prompt,
          status: 'PLANNING',
          agents: [],
          totalCost: 0,
          signatures: 0,
          createdAt: Date.now(),
        };
        setTask(newTask);
        connectWs(data.taskId);
        return newTask;
      } catch (err) {
        setRunning(false);
        toast.error(err instanceof Error ? err.message : 'Task failed');
        return null;
      }
    },
    [connectWs]
  );

  const reset = useCallback(() => {
    wsRef.current?.close();
    wsRef.current = null;
    setTask(null);
    setAgents([]);
    setEvents([]);
    setRunning(false);
  }, []);

  useEffect(() => () => wsRef.current?.close(), []);

  const phase =
    !task ? 'IDLE' :
    task.status === 'COMPLETE' ? 'COMPLETE' :
    running ? 'RUNNING' : 'IDLE';

  return {
    task,
    agents,
    events,
    running,
    phase,
    submitTask,
    reset,
  };
}
