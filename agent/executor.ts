import type { Subtask, SubtaskResult, TaskPlan } from '@/lib/venice';
import { executeSubtask, synthesizeResults } from '@/lib/venice';
import type { FeedEvent } from '@/types';

export interface AgentUpdate {
  type:
    | 'AGENT_SPAWNED'
    | 'PAYMENT_MADE'
    | 'SUBTASK_COMPLETE'
    | 'TASK_COMPLETE'
    | 'ERROR'
    | 'PLANNING';
  agentId?: string;
  agentType?: string;
  amount?: number;
  message?: string;
  oneShotTx?: string;
  timestamp: number;
}

export interface ExecuteParams {
  prompt: string;
  plan: TaskPlan;
  onProgress: (update: AgentUpdate) => void;
}

export interface TaskResult {
  summary: string;
  totalCost: number;
  duration: number;
  agentCount: number;
}

export async function executeTask(params: ExecuteParams): Promise<TaskResult> {
  const start = Date.now();
  const results: SubtaskResult[] = [];

  // Build dependency map
  const completed = new Set<string>();
  const pending = new Set(params.plan.subtasks.map((s) => s.id));

  while (pending.size > 0) {
    const ready = params.plan.subtasks.filter(
      (s) =>
        pending.has(s.id) &&
        s.dependencies.every((d) => completed.has(d))
    );

    if (ready.length === 0) {
      throw new Error('Circular dependency in task plan');
    }

    const batch = await Promise.all(
      ready.map(async (subtask) => {
        params.onProgress({
          type: 'AGENT_SPAWNED',
          agentId: subtask.id,
          agentType: subtask.type,
          message: subtask.description,
          timestamp: Date.now(),
        });

        const result = await executeSubtask(subtask, {});

        params.onProgress({
          type: 'PAYMENT_MADE',
          agentId: subtask.id,
          amount: result.cost,
          message: subtask.type === 'DATA_FETCH' ? 'DeFiLlama API' : subtask.type === 'AI_INFERENCE' ? 'Venice AI' : subtask.type === 'CHAIN_WRITE' ? 'Uniswap v3' : 'Ethereum RPC',
          oneShotTx: result.oneShotTx,
          timestamp: Date.now(),
        });

        params.onProgress({
          type: 'SUBTASK_COMPLETE',
          agentId: subtask.id,
          message: typeof result.data === 'string' ? result.data.slice(0, 120) : 'Complete',
          timestamp: Date.now(),
        });

        return result;
      })
    );

    for (const r of batch) {
      results.push(r);
      pending.delete(r.id);
      completed.add(r.id);
    }
  }

  const summary = await synthesizeResults(results, params.prompt);
  const duration = Date.now() - start;
  const totalCost = results.reduce((sum, r) => sum + r.cost, 0);

  params.onProgress({
    type: 'TASK_COMPLETE',
    message: summary,
    amount: totalCost,
    timestamp: Date.now(),
  });

  return {
    summary,
    totalCost,
    duration,
    agentCount: results.length,
  };
}
