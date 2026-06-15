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
  grantTxHash?: string; // on-chain DelegateCore.grantPermission tx
}

export interface OnchainPayment {
  id: string;
  taskId: string;
  amount: number;
  recipient: string;
  txHash: string;
  via: 'ONESHOT' | 'VIEM';
  createdAt: number;
}

export interface AgentSummary {
  id: string;
  taskId: string;
  taskPrompt?: string;
  agentType: string;
  budget: number;
  spent: number;
  status: 'ACTIVE' | 'COMPLETE' | 'ERROR';
  lastAction?: string;
  txHash?: string; // on-chain SubAgentRegistry registration, if any
  createdAt: number;
}

export type ActivityKind = 'PERMISSION_GRANT' | 'PAYMENT' | 'AGENT_REGISTER';

export interface ActivityItem {
  id: string;
  kind: ActivityKind;
  label: string;
  detail?: string;
  amount?: number;
  txHash?: string;
  createdAt: number;
}

export interface TaskDetail {
  id: string;
  prompt: string;
  status: TaskStatus;
  result?: string;
  totalCost: number;
  agentCount: number;
  duration?: number;
  createdAt: number;
  completedAt?: number;
  agents: AgentSummary[];
  payments: OnchainPayment[];
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
  | 'ONESHOT_RELAY'
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
