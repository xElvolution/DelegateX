import { runTask } from '@/agent/orchestrator';
import { broadcastTaskEvent } from '@/lib/broadcast';
import {
  getPermissionById,
  updateTaskRecord,
  recordPayment,
  recordAgentSpawn,
  updateAgentProgress,
} from '@/lib/data';
import { isOneShotConfigured } from '@/lib/oneshot';
import type { FeedEvent, Permission } from '@/types';
import { uid } from '@/lib/utils';
import type { AgentUpdate } from '@/agent/executor';

function toFeedEvent(taskId: string, update: AgentUpdate): FeedEvent {
  const base = {
    id: uid(),
    taskId,
    timestamp: update.timestamp,
    agentId: update.agentId,
  };

  switch (update.type) {
    case 'AGENT_SPAWNED':
      return {
        ...base,
        type: 'AGENT_SPAWNED',
        title: `${update.agentType ?? 'Agent'} spawned`,
        detail: update.agentType,
      };
    case 'PAYMENT_MADE':
      return {
        ...base,
        type: 'PAYMENT_MADE',
        title: `Payment ${update.amount?.toFixed(4)} USDC`,
        amount: update.amount,
        recipient: update.message,
        oneShotTx: update.oneShotTx,
      };
    case 'SUBTASK_COMPLETE':
      return {
        ...base,
        type: 'SUBTASK_COMPLETE',
        title: 'Subtask complete',
        detail: update.message,
      };
    case 'TASK_COMPLETE':
      return {
        ...base,
        type: 'TASK_COMPLETE',
        title: 'Task complete',
        detail: update.message,
        amount: update.amount,
      };
    case 'ERROR':
      return {
        ...base,
        type: 'ERROR',
        title: update.message ?? 'Error',
      };
    default:
      return {
        ...base,
        type: 'PLANNING',
        title: update.message ?? 'Planning',
      };
  }
}

export async function executeTaskPipeline(params: {
  taskId: string;
  prompt: string;
  userAddress: string;
  permissionId: string;
}) {
  const permission = await getPermissionById(params.permissionId);
  if (!permission) {
    throw new Error('Permission not found or inactive');
  }

  await updateTaskRecord(params.taskId, { status: 'PLANNING' });

  const planningEvent: FeedEvent = {
    id: uid(),
    type: 'PLANNING',
    taskId: params.taskId,
    title: 'Planning with Venice AI...',
    timestamp: Date.now(),
  };
  await broadcastTaskEvent(params.taskId, planningEvent);

  // Map executor subtask ids -> persisted agent record ids.
  const agentMap = new Map<string, string>();

  const onProgress = async (update: AgentUpdate) => {
    const event = toFeedEvent(params.taskId, update);
    await broadcastTaskEvent(params.taskId, event);

    try {
      if (update.type === 'AGENT_SPAWNED' && update.agentId) {
        const agent = await recordAgentSpawn({
          userAddress: params.userAddress,
          taskId: params.taskId,
          agentType: update.agentType ?? 'AGENT',
          budget: 0,
        });
        agentMap.set(update.agentId, agent.id);
      }

      if (update.type === 'PAYMENT_MADE') {
        // Persist real on-chain payments for the proof panel + history.
        if (update.oneShotTx) {
          await recordPayment({
            taskId: params.taskId,
            amount: update.amount ?? 0,
            recipient: update.message ?? 'service',
            txHash: update.oneShotTx,
            via: isOneShotConfigured() ? 'ONESHOT' : 'VIEM',
          });
        }
        const agentId = update.agentId && agentMap.get(update.agentId);
        if (agentId) {
          await updateAgentProgress(agentId, { spent: update.amount ?? 0 });
        }
      }

      if (update.type === 'SUBTASK_COMPLETE' && update.agentId) {
        const agentId = agentMap.get(update.agentId);
        if (agentId) {
          await updateAgentProgress(agentId, {
            status: 'COMPLETE',
            lastAction: update.message,
          });
        }
      }
    } catch (err) {
      console.warn('[persist agent/payment]', err);
    }
  };

  try {
    const result = await runTask({
      prompt: params.prompt,
      userAddress: params.userAddress,
      permission: permission as Permission,
      taskId: params.taskId,
      onProgress: (update) => {
        void onProgress(update);
      },
    });

    await updateTaskRecord(params.taskId, {
      status: 'COMPLETE',
      result: result.summary,
      totalCost: result.totalCost,
      agentCount: result.agentCount,
      duration: result.duration,
      completedAt: Date.now(),
    });

    await broadcastTaskEvent(params.taskId, {
      id: uid(),
      type: 'TASK_COMPLETE',
      taskId: params.taskId,
      title: 'Task complete',
      detail: result.summary,
      amount: result.totalCost,
      timestamp: Date.now(),
    });
  } catch (err) {
    await updateTaskRecord(params.taskId, { status: 'FAILED' });
    await broadcastTaskEvent(params.taskId, {
      id: uid(),
      type: 'ERROR',
      taskId: params.taskId,
      title: err instanceof Error ? err.message : 'Task failed',
      timestamp: Date.now(),
    });
  }
}
