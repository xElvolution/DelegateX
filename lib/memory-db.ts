import type {
  Permission,
  TaskHistoryEntry,
  OnchainPayment,
  AgentSummary,
} from '@/types';
import { DEFAULT_CONTRACTS, USDC_ADDRESS } from '@/lib/permissions';
import { uid } from '@/lib/utils';

interface StoredAgent extends AgentSummary {
  userAddress: string;
}

interface StoredPermission extends Permission {
  userAddress: string;
}

interface StoredTask {
  id: string;
  userAddress: string;
  permissionId: string;
  prompt: string;
  status: string;
  result?: string;
  totalCost: number;
  agentCount: number;
  duration?: number;
  signatures: number;
  createdAt: number;
  completedAt?: number;
}

const permissions = new Map<string, StoredPermission>();
const tasks = new Map<string, StoredTask>();
const users = new Set<string>();
const payments: OnchainPayment[] = [];
const agents = new Map<string, StoredAgent>();
const dripped = new Set<string>();

export const memoryDb = {
  upsertUser(address: string) {
    users.add(address.toLowerCase());
    return address.toLowerCase();
  },

  createPermission(input: {
    userAddress: string;
    maxAmount: number;
    periodSeconds: number;
    expiry: number;
    allowedContracts: string[];
    erc7715Sig?: string;
    grantTxHash?: string;
  }): Permission {
    const id = `perm_${uid()}`;
    const permission: StoredPermission = {
      id,
      userAddress: input.userAddress.toLowerCase(),
      tokenSymbol: 'USDC',
      tokenAddress: USDC_ADDRESS,
      maxAmount: input.maxAmount,
      periodLabel: input.periodSeconds >= 86400 ? 'day' : 'hour',
      periodSeconds: input.periodSeconds,
      spent: 0,
      remaining: input.maxAmount,
      expiry: input.expiry,
      allowedContracts: DEFAULT_CONTRACTS.map((c) => ({
        ...c,
        enabled: input.allowedContracts.includes(c.name),
      })),
      status: 'ACTIVE',
      grantedAt: Date.now(),
      erc7715Sig: input.erc7715Sig,
      grantTxHash: input.grantTxHash,
    };
    permissions.set(id, permission);
    return permission;
  },

  recordPayment(input: {
    taskId: string;
    amount: number;
    recipient: string;
    txHash: string;
    via: 'ONESHOT' | 'VIEM';
  }): OnchainPayment {
    const payment: OnchainPayment = {
      id: `pay_${uid()}`,
      taskId: input.taskId,
      amount: input.amount,
      recipient: input.recipient,
      txHash: input.txHash,
      via: input.via,
      createdAt: Date.now(),
    };
    payments.unshift(payment);
    return payment;
  },

  getRecentPayments(limit = 20): OnchainPayment[] {
    return payments.slice(0, limit);
  },

  getPaymentsByTask(taskId: string): OnchainPayment[] {
    return payments.filter((p) => p.taskId === taskId);
  },

  createAgent(input: {
    userAddress: string;
    taskId: string;
    agentType: string;
    budget: number;
    txHash?: string;
  }): AgentSummary {
    const task = tasks.get(input.taskId);
    const agent: StoredAgent = {
      id: `sa_${uid()}`,
      userAddress: input.userAddress.toLowerCase(),
      taskId: input.taskId,
      taskPrompt: task?.prompt,
      agentType: input.agentType,
      budget: input.budget,
      spent: 0,
      status: 'ACTIVE',
      txHash: input.txHash,
      createdAt: Date.now(),
    };
    agents.set(agent.id, agent);
    return agent;
  },

  updateAgent(id: string, patch: Partial<StoredAgent>) {
    const a = agents.get(id);
    if (!a) return null;
    Object.assign(a, patch);
    return a;
  },

  getAgentsByUser(userAddress: string, limit = 50): AgentSummary[] {
    const addr = userAddress.toLowerCase();
    return [...agents.values()]
      .filter((a) => a.userAddress === addr)
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, limit);
  },

  getAgentsByTask(taskId: string): AgentSummary[] {
    return [...agents.values()]
      .filter((a) => a.taskId === taskId)
      .sort((a, b) => a.createdAt - b.createdAt);
  },

  getTaskById(id: string): StoredTask | null {
    return tasks.get(id) ?? null;
  },

  getAllAgentsRecent(limit = 50): AgentSummary[] {
    return [...agents.values()]
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, limit);
  },

  getAllPermissionsRecent(limit = 50): Permission[] {
    return [...permissions.values()]
      .sort((a, b) => b.grantedAt - a.grantedAt)
      .slice(0, limit);
  },

  hasBeenDripped(address: string): boolean {
    return dripped.has(address.toLowerCase());
  },

  markDripped(address: string) {
    dripped.add(address.toLowerCase());
  },

  dripCount(): number {
    return dripped.size;
  },

  getActivePermissions(userAddress: string): Permission[] {
    const addr = userAddress.toLowerCase();
    return [...permissions.values()].filter(
      (p) => p.userAddress === addr && p.status === 'ACTIVE' && p.expiry > Date.now()
    );
  },

  getPermission(id: string): Permission | null {
    const p = permissions.get(id);
    if (!p || p.status !== 'ACTIVE') return null;
    return p;
  },

  revokePermission(id: string, userAddress: string): boolean {
    const p = permissions.get(id);
    if (!p || p.userAddress !== userAddress.toLowerCase()) return false;
    p.status = 'REVOKED';
    return true;
  },

  updatePermissionSpend(id: string, spent: number) {
    const p = permissions.get(id);
    if (!p) return;
    p.spent = spent;
    p.remaining = Math.max(0, p.maxAmount - spent);
  },

  createTask(input: {
    userAddress: string;
    permissionId: string;
    prompt: string;
  }): StoredTask {
    const task: StoredTask = {
      id: `task_${uid()}`,
      userAddress: input.userAddress.toLowerCase(),
      permissionId: input.permissionId,
      prompt: input.prompt,
      status: 'PENDING',
      totalCost: 0,
      agentCount: 0,
      signatures: 0,
      createdAt: Date.now(),
    };
    tasks.set(task.id, task);
    return task;
  },

  updateTask(id: string, patch: Partial<StoredTask>) {
    const task = tasks.get(id);
    if (!task) return null;
    Object.assign(task, patch);
    return task;
  },

  getTask(id: string) {
    return tasks.get(id) ?? null;
  },

  getTaskHistory(userAddress: string): TaskHistoryEntry[] {
    const addr = userAddress.toLowerCase();
    return [...tasks.values()]
      .filter((t) => t.userAddress === addr)
      .sort((a, b) => b.createdAt - a.createdAt)
      .map((t) => ({
        id: t.id,
        date: t.createdAt,
        prompt: t.prompt,
        agentCount: t.agentCount,
        cost: t.totalCost,
        duration: t.duration ?? 0,
        signatures: t.signatures,
        status: t.status as TaskHistoryEntry['status'],
      }));
  },

  getDashboardStats(userAddress: string) {
    const history = memoryDb.getTaskHistory(userAddress);
    const completed = history.filter((t) => t.status === 'COMPLETE');
    return {
      tasksCompleted: completed.length,
      totalAgents: completed.reduce((s, t) => s + t.agentCount, 0),
      totalSpent: completed.reduce((s, t) => s + t.cost, 0),
      signatures: memoryDb.getActivePermissions(userAddress).length > 0 ? 1 : 0,
    };
  },
};
