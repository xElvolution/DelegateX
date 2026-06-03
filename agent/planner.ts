import type { Subtask, TaskPlan } from '@/lib/venice';
import { planTask as veniceePlanTask } from '@/lib/venice';

export async function planTask(
  prompt: string,
  budget: number,
  _userAddress: string
): Promise<TaskPlan> {
  return veniceePlanTask(prompt, budget);
}

export type { TaskPlan, Subtask };
