// Core domain types

export type PermissionStatus = 'ACTIVE' | 'EXPIRED' | 'REVOKED';

export interface Permission {
  id: string;
  tokenSymbol: string;
  tokenAddress: string;
  maxAmount: number; // USDC, decimal
  periodLabel: string; // "hour", "day", "week"
  periodSeconds: number;
  spent: number;
  remaining: number;
  expiry: number; // ms epoch
  allowedContracts: AllowedContract[];
  status: PermissionStatus;
  grantedAt: number;
  erc7715Sig?: string;
}

export interface AllowedContract {
  name: string;
  address: string;
  enabled: boolean;
}

export type AgentStatus = 'WAITING' | 'ACTIVE' | 'COMPLETE' | 'ERROR';

export type AgentType =
  | 'ORCHESTRATOR'
  | 'DATA_FETCHER'
  | 'CHAIN_ANALYZER'
  | 'AI_INFERENCE'
  | 'EXECUTOR';

export interface SubAgent {
  id: string;
  type: AgentType;
  label: string;
  status: AgentStatus;
  budget: number;
  spent: number;
  lastAction?: string;
  startedAt?: number;
  completedAt?: number;
  parentId?: string;
}

export type TaskStatus = 'PENDING' | 'PLANNING' | 'RUNNING' | 'COMPLETE' | 'FAILED';

export interface Task {
  id: string;
  prompt: string;
  status: TaskStatus;
  result?: string;
  agents: SubAgent[];
  totalCost: number;
  duration?: number;
  signatures: number;
  createdAt: number;
  completedAt?: number;
}

export type FeedEventType =
  | 'AGENT_SPAWNED'
  | 'PAYMENT_MADE'
  | 'SUBTASK_COMPLETE'
  | 'TASK_COMPLETE'
  | 'PLANNING'
  | 'ERROR';

export interface FeedEvent {
  id: string;
  type: FeedEventType;
  taskId?: string;
  agentId?: string;
  title: string;
  detail?: string;
  amount?: number;
  recipient?: string;
  oneShotTx?: string;
  timestamp: number;
}

export interface TaskHistoryEntry {
  id: string;
  date: number;
  prompt: string;
  agentCount: number;
  cost: number;
  duration: number;
  signatures: number;
  status: TaskStatus;
}

export interface SpendingPoint {
  date: string;
  amount: number;
}
