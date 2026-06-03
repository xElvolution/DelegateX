import type { SubAgent, FeedEvent, Task, AgentType, TaskStatus } from '@/types';
import { uid } from '@/lib/utils';

export type DemoPhase =
  | 'IDLE'
  | 'PLANNING'
  | 'SPAWNING'
  | 'RUNNING'
  | 'COMPLETING'
  | 'COMPLETE';

export interface DemoState {
  phase: DemoPhase;
  task: Task | null;
  agents: SubAgent[];
  events: FeedEvent[];
  currentStep: number;
}

interface DemoStep {
  delay: number; // ms after previous step
  action: (
    state: DemoState,
    emit: (event: FeedEvent) => void
  ) => Partial<DemoState>;
}

const DEMO_PROMPT =
  'Research the top 3 DeFi yields on Ethereum and move $50 to the best one';

const DEMO_RESULT = `Found top yields:
- Compound USDC: 5.8% APY
- Aave USDC: 4.2% APY
- Curve 3pool: 3.9% APY

Moved $50 USDC to Compound (5.8% APY).
Transaction confirmed on Ethereum mainnet.`;

function makeAgent(
  type: AgentType,
  label: string,
  budget: number,
  parentId?: string
): SubAgent {
  return {
    id: uid(),
    type,
    label,
    status: 'WAITING',
    budget,
    spent: 0,
    parentId,
  };
}

function makeEvent(
  type: FeedEvent['type'],
  title: string,
  extra?: Partial<FeedEvent>
): FeedEvent {
  return {
    id: uid(),
    type,
    title,
    timestamp: Date.now(),
    ...extra,
  };
}

export function createDemoSteps(): DemoStep[] {
  const orchestratorId = uid();
  const agentA = makeAgent('DATA_FETCHER', 'Data Fetcher', 1, orchestratorId);
  const agentB = makeAgent('CHAIN_ANALYZER', 'Chain Analyzer', 1, orchestratorId);
  const agentC = makeAgent('AI_INFERENCE', 'Venice AI', 2, orchestratorId);
  const agentD = makeAgent('EXECUTOR', 'Executor', 5, orchestratorId);

  const steps: DemoStep[] = [
    // 0: Start planning
    {
      delay: 0,
      action: (state, emit) => {
        const task: Task = {
          id: uid(),
          prompt: DEMO_PROMPT,
          status: 'PLANNING',
          agents: [],
          totalCost: 0,
          signatures: 0,
          createdAt: Date.now(),
        };
        emit(
          makeEvent('PLANNING', 'Planning with Venice AI...', { taskId: task.id })
        );
        return { phase: 'PLANNING', task };
      },
    },
    // 1: Plan complete, about to spawn
    {
      delay: 3000,
      action: (state, emit) => {
        emit(
          makeEvent('PLANNING', 'Breaking task into 4 subtasks', {
            taskId: state.task?.id,
          })
        );
        return { phase: 'SPAWNING' };
      },
    },
    // 2: Spawn Agent A
    {
      delay: 2000,
      action: (state, emit) => {
        const a = { ...agentA, status: 'ACTIVE' as const, startedAt: Date.now() };
        emit(
          makeEvent('AGENT_SPAWNED', 'Agent A spawned', {
            taskId: state.task?.id,
            agentId: a.id,
            detail: `Data Fetcher | $${a.budget} budget`,
          })
        );
        return {
          agents: [...state.agents, a],
          task: state.task
            ? { ...state.task, status: 'RUNNING', agents: [...state.agents, a] }
            : null,
          phase: 'RUNNING',
        };
      },
    },
    // 3: Agent A pays DeFiLlama
    {
      delay: 2000,
      action: (state, emit) => {
        const amount = 0.001 + Math.random() * 0.001;
        emit(
          makeEvent('PAYMENT_MADE', `${amount.toFixed(4)} USDC → DeFiLlama`, {
            taskId: state.task?.id,
            agentId: agentA.id,
            amount,
            recipient: 'DeFiLlama API',
            oneShotTx: `0x${uid()}${uid()}`,
          })
        );
        const agents = state.agents.map((a) =>
          a.id === agentA.id ? { ...a, spent: a.spent + amount, lastAction: 'Fetching DeFi yield data' } : a
        );
        const totalCost = agents.reduce((s, a) => s + a.spent, 0);
        return {
          agents,
          task: state.task ? { ...state.task, agents, totalCost } : null,
        };
      },
    },
    // 4: Spawn Agent B
    {
      delay: 2000,
      action: (state, emit) => {
        const b = { ...agentB, status: 'ACTIVE' as const, startedAt: Date.now() };
        emit(
          makeEvent('AGENT_SPAWNED', 'Agent B spawned', {
            taskId: state.task?.id,
            agentId: b.id,
            detail: `Chain Analyzer | $${b.budget} budget`,
          })
        );
        return { agents: [...state.agents, b] };
      },
    },
    // 5: Agent B pays RPC
    {
      delay: 2000,
      action: (state, emit) => {
        const amount = 0.002 + Math.random() * 0.001;
        emit(
          makeEvent('PAYMENT_MADE', `${amount.toFixed(4)} USDC → Ethereum RPC`, {
            taskId: state.task?.id,
            agentId: agentB.id,
            amount,
            recipient: 'Ethereum RPC',
            oneShotTx: `0x${uid()}${uid()}`,
          })
        );
        const agents = state.agents.map((a) =>
          a.id === agentB.id ? { ...a, spent: a.spent + amount, lastAction: 'Reading on-chain rates' } : a
        );
        const totalCost = agents.reduce((s, a) => s + a.spent, 0);
        return { agents, task: state.task ? { ...state.task, agents, totalCost } : null };
      },
    },
    // 6: Spawn Agent C
    {
      delay: 2000,
      action: (state, emit) => {
        const c = { ...agentC, status: 'ACTIVE' as const, startedAt: Date.now() };
        emit(
          makeEvent('AGENT_SPAWNED', 'Agent C spawned', {
            taskId: state.task?.id,
            agentId: c.id,
            detail: `Venice AI | $${c.budget} budget`,
          })
        );
        return { agents: [...state.agents, c] };
      },
    },
    // 7: Agent C pays Venice
    {
      delay: 3000,
      action: (state, emit) => {
        const amount = 0.05 + Math.random() * 0.01;
        emit(
          makeEvent('PAYMENT_MADE', `${amount.toFixed(4)} USDC → Venice AI`, {
            taskId: state.task?.id,
            agentId: agentC.id,
            amount,
            recipient: 'Venice AI',
            oneShotTx: `0x${uid()}${uid()}`,
          })
        );
        const agents = state.agents.map((a) =>
          a.id === agentC.id ? { ...a, spent: a.spent + amount, lastAction: 'Synthesizing results with Llama 3.3' } : a
        );
        const totalCost = agents.reduce((s, a) => s + a.spent, 0);
        return { agents, task: state.task ? { ...state.task, agents, totalCost } : null };
      },
    },
    // 8: Spawn Agent D (waiting)
    {
      delay: 2000,
      action: (state, emit) => {
        const d = { ...agentD, status: 'WAITING' as const, startedAt: Date.now() };
        emit(
          makeEvent('AGENT_SPAWNED', 'Agent D spawned', {
            taskId: state.task?.id,
            agentId: d.id,
            detail: `Executor | $${d.budget} budget | Waiting`,
          })
        );
        return { agents: [...state.agents, d] };
      },
    },
    // 9: Agents A, B, C complete
    {
      delay: 2000,
      action: (state, emit) => {
        const completed = [agentA.id, agentB.id, agentC.id];
        emit(
          makeEvent('SUBTASK_COMPLETE', 'Agents A, B, C complete', {
            taskId: state.task?.id,
          })
        );
        const agents = state.agents.map((a) =>
          completed.includes(a.id) ? { ...a, status: 'COMPLETE' as const, completedAt: Date.now() } : a
        );
        return { agents };
      },
    },
    // 10: Agent D activates + pays
    {
      delay: 2000,
      action: (state, emit) => {
        const amount = 0.003 + Math.random() * 0.001;
        emit(
          makeEvent('PAYMENT_MADE', `${amount.toFixed(4)} USDC → Uniswap v3`, {
            taskId: state.task?.id,
            agentId: agentD.id,
            amount,
            recipient: 'Uniswap v3',
            oneShotTx: `0x${uid()}${uid()}`,
          })
        );
        const agents = state.agents.map((a) =>
          a.id === agentD.id
            ? { ...a, status: 'ACTIVE' as const, spent: a.spent + amount, lastAction: 'Executing swap via Uniswap' }
            : a
        );
        const totalCost = agents.reduce((s, a) => s + a.spent, 0);
        return { agents, task: state.task ? { ...state.task, agents, totalCost } : null };
      },
    },
    // 11: All done
    {
      delay: 3000,
      action: (state, emit) => {
        const agents = state.agents.map((a) => ({
          ...a,
          status: 'COMPLETE' as const,
          completedAt: Date.now(),
        }));
        const totalCost = agents.reduce((s, a) => s + a.spent, 0);
        const duration = Date.now() - (state.task?.createdAt ?? Date.now());
        const task: Task | null = state.task
          ? {
              ...state.task,
              status: 'COMPLETE',
              result: DEMO_RESULT,
              agents,
              totalCost,
              duration,
              completedAt: Date.now(),
            }
          : null;

        emit(
          makeEvent('TASK_COMPLETE', 'Task complete', {
            taskId: task?.id,
            detail: `Total: $${totalCost.toFixed(3)} USDC | ${agents.length} agents | ${((duration || 0) / 1000).toFixed(1)}s`,
          })
        );

        return { phase: 'COMPLETE', agents, task };
      },
    },
  ];

  return steps;
}

export function initialDemoState(): DemoState {
  return {
    phase: 'IDLE',
    task: null,
    agents: [],
    events: [],
    currentStep: -1,
  };
}
