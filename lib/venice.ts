import OpenAI from 'openai';

const venice = new OpenAI({
  apiKey: process.env.VENICE_API_KEY || 'demo',
  baseURL: 'https://api.venice.ai/api/v1',
});

export interface TaskPlan {
  subtasks: Subtask[];
  reasoning: string;
  estimatedCost: number;
  estimatedDuration: number;
}

export interface Subtask {
  id: string;
  type: 'DATA_FETCH' | 'AI_INFERENCE' | 'CHAIN_READ' | 'CHAIN_WRITE' | 'CALCULATION';
  description: string;
  budget: number;
  dependencies: string[];
  endpoint?: string;
  prompt?: string;
}

export interface SubtaskResult {
  id: string;
  data: unknown;
  cost: number;
  duration: number;
}

export async function planTask(
  userPrompt: string,
  availableBudget: number
): Promise<TaskPlan> {
  const response = await venice.chat.completions.create({
    model: 'llama-3.3-70b',
    messages: [
      {
        role: 'system',
        content: `You are DELEGATE's task planner. Break user requests into subtasks for autonomous agents. Each subtask should have a type, description, budget estimate, and dependencies. Respond in JSON.`,
      },
      {
        role: 'user',
        content: `Plan this task with a $${availableBudget} budget: "${userPrompt}"`,
      },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.3,
  });

  const content = response.choices[0]?.message?.content || '{}';
  return JSON.parse(content) as TaskPlan;
}

export async function executeSubtask(
  subtask: Subtask,
  context: Record<string, unknown>
): Promise<SubtaskResult> {
  const response = await venice.chat.completions.create({
    model: 'llama-3.3-70b',
    messages: [
      {
        role: 'system',
        content: `You are a specialized agent executing a subtask. Context: ${JSON.stringify(context)}`,
      },
      { role: 'user', content: subtask.description },
    ],
    temperature: 0.2,
  });

  return {
    id: subtask.id,
    data: response.choices[0]?.message?.content,
    cost: subtask.budget * 0.5,
    duration: 2000,
  };
}

export async function synthesizeResults(
  results: SubtaskResult[],
  originalPrompt: string
): Promise<string> {
  const response = await venice.chat.completions.create({
    model: 'llama-3.3-70b',
    messages: [
      {
        role: 'system',
        content: 'Synthesize the following subtask results into a clear, actionable response.',
      },
      {
        role: 'user',
        content: `Original request: "${originalPrompt}"\n\nResults:\n${JSON.stringify(results, null, 2)}`,
      },
    ],
    temperature: 0.4,
  });

  return response.choices[0]?.message?.content || 'Task completed.';
}

export { venice };
