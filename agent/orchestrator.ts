import type { Permission } from '@/types';
import { planTask } from './planner';
import { executeTask, type TaskResult, type AgentUpdate } from './executor';

export interface OrchestratorParams {
  prompt: string;
  userAddress: string;
  permission: Permission;
  taskId: string;
  onProgress: (update: AgentUpdate) => void;
}

export async function runTask(params: OrchestratorParams): Promise<TaskResult> {
  const plan = await planTask(params.prompt, params.permission.remaining, params.userAddress);

  const result = await executeTask({
    prompt: params.prompt,
    plan,
    onProgress: params.onProgress,
  });

  return result;
}
