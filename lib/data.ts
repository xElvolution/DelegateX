import { hasDatabase, prisma } from '@/lib/db';
import { memoryDb } from '@/lib/memory-db';
import type {
  Permission,
  TaskHistoryEntry,
  OnchainPayment,
  AgentSummary,
  ActivityItem,
  TaskDetail,
} from '@/types';
import { DEFAULT_CONTRACTS, USDC_ADDRESS } from '@/lib/permissions';

function toPermission(row: {
  id: string;
  tokenAddress: string;
  maxAmount: bigint;
  period: number;
  expiry: Date;
  allowedContracts: string[];
  active: boolean;
  erc7715Sig: string | null;
  grantTxHash?: string | null;
  createdAt: Date;
  tasks?: { totalCost: number }[];
}): Permission {
  const spent = row.tasks?.reduce((s, t) => s + t.totalCost, 0) ?? 0;
  const maxAmount = Number(row.maxAmount) / 1e6;
  return {
    id: row.id,
    tokenSymbol: 'USDC',
    tokenAddress: row.tokenAddress,
    maxAmount,
    periodLabel: row.period >= 86400 ? 'day' : 'hour',
    periodSeconds: row.period,
    spent,
    remaining: Math.max(0, maxAmount - spent),
    expiry: row.expiry.getTime(),
    allowedContracts: DEFAULT_CONTRACTS.map((c) => ({
      ...c,
      enabled: row.allowedContracts.includes(c.name),
    })),
    status: row.active ? 'ACTIVE' : 'REVOKED',
    grantedAt: row.createdAt.getTime(),
    erc7715Sig: row.erc7715Sig ?? undefined,
    grantTxHash: row.grantTxHash ?? undefined,
  };
}

export async function upsertUser(address: string) {
  const addr = address.toLowerCase();
  if (!hasDatabase()) {
    return memoryDb.upsertUser(addr);
  }
  await prisma.user.upsert({
    where: { address: addr },
    create: { address: addr },
    update: {},
  });
  return addr;
}

export async function createPermission(input: {
  userAddress: string;
  maxAmount: number;
  periodSeconds: number;
  expiry: number;
  allowedContracts: string[];
  erc7715Sig?: string;
  grantTxHash?: string;
}): Promise<Permission> {
  await upsertUser(input.userAddress);

  if (!hasDatabase()) {
    return memoryDb.createPermission(input);
  }

  const user = await prisma.user.findUniqueOrThrow({
    where: { address: input.userAddress.toLowerCase() },
  });

  const row = await prisma.permission.create({
    data: {
      userId: user.id,
      tokenAddress: USDC_ADDRESS,
      maxAmount: BigInt(Math.round(input.maxAmount * 1e6)),
      period: input.periodSeconds,
      expiry: new Date(input.expiry),
      allowedContracts: input.allowedContracts,
      erc7715Sig: input.erc7715Sig,
      grantTxHash: input.grantTxHash,
    },
  });

  return toPermission(row);
}

export async function getActivePermissions(userAddress: string): Promise<Permission[]> {
  if (!hasDatabase()) {
    return memoryDb.getActivePermissions(userAddress);
  }

  const user = await prisma.user.findUnique({
    where: { address: userAddress.toLowerCase() },
  });
  if (!user) return [];

  const rows = await prisma.permission.findMany({
    where: {
      userId: user.id,
      active: true,
      expiry: { gt: new Date() },
    },
    include: { tasks: { select: { totalCost: true } } },
    orderBy: { createdAt: 'desc' },
  });

  return rows.map(toPermission);
}

export async function getPermissionById(id: string): Promise<Permission | null> {
  if (!hasDatabase()) {
    return memoryDb.getPermission(id);
  }

  const row = await prisma.permission.findUnique({
    where: { id },
    include: { tasks: { select: { totalCost: true } } },
  });
  if (!row || !row.active) return null;
  return toPermission(row);
}

export async function revokePermission(id: string, userAddress: string) {
  if (!hasDatabase()) {
    return memoryDb.revokePermission(id, userAddress);
  }

  const user = await prisma.user.findUnique({
    where: { address: userAddress.toLowerCase() },
  });
  if (!user) return false;

  const result = await prisma.permission.updateMany({
    where: { id, userId: user.id, active: true },
    data: { active: false, revokedAt: new Date() },
  });
  return result.count > 0;
}

export async function createTaskRecord(input: {
  userAddress: string;
  permissionId: string;
  prompt: string;
}) {
  await upsertUser(input.userAddress);

  if (!hasDatabase()) {
    return memoryDb.createTask(input);
  }

  const user = await prisma.user.findUniqueOrThrow({
    where: { address: input.userAddress.toLowerCase() },
  });

  const task = await prisma.task.create({
    data: {
      userId: user.id,
      permissionId: input.permissionId,
      prompt: input.prompt,
      status: 'PENDING',
    },
  });

  return {
    id: task.id,
    userAddress: input.userAddress.toLowerCase(),
    permissionId: task.permissionId,
    prompt: task.prompt,
    status: task.status,
    totalCost: task.totalCost,
    agentCount: task.agentCount,
    signatures: 0,
    createdAt: task.createdAt.getTime(),
  };
}

export async function updateTaskRecord(
  id: string,
  patch: {
    status?: string;
    result?: string;
    totalCost?: number;
    agentCount?: number;
    duration?: number;
    completedAt?: number;
  }
) {
  if (!hasDatabase()) {
    return memoryDb.updateTask(id, patch);
  }

  return prisma.task.update({
    where: { id },
    data: {
      status: patch.status,
      result: patch.result,
      totalCost: patch.totalCost,
      agentCount: patch.agentCount,
      duration: patch.duration,
      completedAt: patch.completedAt ? new Date(patch.completedAt) : undefined,
    },
  });
}

export async function recordPayment(input: {
  taskId: string;
  amount: number;
  recipient: string;
  txHash: string;
  via: 'ONESHOT' | 'VIEM';
}): Promise<OnchainPayment> {
  if (!hasDatabase()) {
    return memoryDb.recordPayment(input);
  }

  const row = await prisma.payment.create({
    data: {
      taskId: input.taskId,
      amount: input.amount,
      recipient: input.recipient,
      txHash: input.txHash,
      oneShotTx: input.via === 'ONESHOT' ? input.txHash : null,
      status: 'CONFIRMED',
    },
  });

  return {
    id: row.id,
    taskId: row.taskId,
    amount: row.amount,
    recipient: row.recipient,
    txHash: input.txHash,
    via: input.via,
    createdAt: row.createdAt.getTime(),
  };
}

export async function getRecentPayments(limit = 20): Promise<OnchainPayment[]> {
  if (!hasDatabase()) {
    return memoryDb.getRecentPayments(limit);
  }

  const rows = await prisma.payment.findMany({
    where: { txHash: { not: null } },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });

  return rows.map((r) => ({
    id: r.id,
    taskId: r.taskId,
    amount: r.amount,
    recipient: r.recipient,
    txHash: r.txHash as string,
    via: r.oneShotTx ? 'ONESHOT' : 'VIEM',
    createdAt: r.createdAt.getTime(),
  }));
}

export async function recordAgentSpawn(input: {
  userAddress: string;
  taskId: string;
  agentType: string;
  budget: number;
  txHash?: string;
}): Promise<AgentSummary> {
  if (!hasDatabase()) {
    return memoryDb.createAgent(input);
  }
  const row = await prisma.subAgent.create({
    data: {
      taskId: input.taskId,
      agentType: input.agentType,
      budget: input.budget,
      status: 'ACTIVE',
      registerTxHash: input.txHash,
    },
  });
  return {
    id: row.id,
    taskId: row.taskId,
    agentType: row.agentType,
    budget: row.budget,
    spent: row.spent,
    status: 'ACTIVE',
    txHash: input.txHash,
    createdAt: row.createdAt.getTime(),
  };
}

export async function updateAgentProgress(
  id: string,
  patch: { spent?: number; status?: AgentSummary['status']; lastAction?: string }
) {
  if (!hasDatabase()) {
    return memoryDb.updateAgent(id, patch);
  }
  return prisma.subAgent.update({
    where: { id },
    data: {
      spent: patch.spent,
      status: patch.status,
      result: patch.lastAction,
      completedAt: patch.status && patch.status !== 'ACTIVE' ? new Date() : undefined,
    },
  });
}

export async function getAgentsForUser(userAddress: string): Promise<AgentSummary[]> {
  if (!hasDatabase()) {
    return memoryDb.getAgentsByUser(userAddress);
  }
  const user = await prisma.user.findUnique({
    where: { address: userAddress.toLowerCase() },
  });
  if (!user) return [];
  const rows = await prisma.subAgent.findMany({
    where: { task: { userId: user.id } },
    include: { task: { select: { prompt: true } } },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });
  return rows.map((a) => ({
    id: a.id,
    taskId: a.taskId,
    taskPrompt: a.task?.prompt,
    agentType: a.agentType,
    budget: a.budget,
    spent: a.spent,
    status: a.status as AgentSummary['status'],
    txHash: a.registerTxHash ?? undefined,
    createdAt: a.createdAt.getTime(),
  }));
}

export async function getTaskDetail(id: string): Promise<TaskDetail | null> {
  if (!hasDatabase()) {
    const task = memoryDb.getTaskById(id);
    if (!task) return null;
    return {
      id: task.id,
      prompt: task.prompt,
      status: task.status as TaskDetail['status'],
      result: task.result,
      totalCost: task.totalCost,
      agentCount: task.agentCount,
      duration: task.duration,
      createdAt: task.createdAt,
      completedAt: task.completedAt,
      agents: memoryDb.getAgentsByTask(id),
      payments: memoryDb.getPaymentsByTask(id),
    };
  }

  const task = await prisma.task.findUnique({
    where: { id },
    include: { agents: true, payments: true },
  });
  if (!task) return null;
  return {
    id: task.id,
    prompt: task.prompt,
    status: task.status as TaskDetail['status'],
    result: task.result ?? undefined,
    totalCost: task.totalCost,
    agentCount: task.agentCount,
    duration: task.duration ?? undefined,
    createdAt: task.createdAt.getTime(),
    completedAt: task.completedAt?.getTime(),
    agents: task.agents.map((a) => ({
      id: a.id,
      taskId: a.taskId,
      agentType: a.agentType,
      budget: a.budget,
      spent: a.spent,
      status: a.status as AgentSummary['status'],
      txHash: a.registerTxHash ?? undefined,
      createdAt: a.createdAt.getTime(),
    })),
    payments: task.payments
      .filter((p) => p.txHash)
      .map((p) => ({
        id: p.id,
        taskId: p.taskId,
        amount: p.amount,
        recipient: p.recipient,
        txHash: p.txHash as string,
        via: p.oneShotTx ? 'ONESHOT' : 'VIEM',
        createdAt: p.createdAt.getTime(),
      })),
  };
}

export async function getActivity(limit = 40): Promise<ActivityItem[]> {
  const items: ActivityItem[] = [];

  if (!hasDatabase()) {
    for (const p of memoryDb.getRecentPayments(limit)) {
      items.push({
        id: p.id,
        kind: 'PAYMENT',
        label: `Agent paid ${p.amount.toFixed(4)} USDC`,
        detail: p.recipient,
        amount: p.amount,
        txHash: p.txHash,
        createdAt: p.createdAt,
      });
    }
    for (const perm of memoryDb.getAllPermissionsRecent(limit)) {
      items.push({
        id: `grant_${perm.id}`,
        kind: 'PERMISSION_GRANT',
        label: `Permission granted: ${perm.maxAmount} USDC / ${perm.periodLabel}`,
        txHash: perm.grantTxHash,
        createdAt: perm.grantedAt,
      });
    }
    for (const a of memoryDb.getAllAgentsRecent(limit)) {
      if (!a.txHash) continue;
      items.push({
        id: `reg_${a.id}`,
        kind: 'AGENT_REGISTER',
        label: `${a.agentType} agent registered`,
        txHash: a.txHash,
        createdAt: a.createdAt,
      });
    }
  } else {
    const [pays, perms, regs] = await Promise.all([
      prisma.payment.findMany({
        where: { txHash: { not: null } },
        orderBy: { createdAt: 'desc' },
        take: limit,
      }),
      prisma.permission.findMany({
        where: { grantTxHash: { not: null } },
        orderBy: { createdAt: 'desc' },
        take: limit,
      }),
      prisma.subAgent.findMany({
        where: { registerTxHash: { not: null } },
        orderBy: { createdAt: 'desc' },
        take: limit,
      }),
    ]);
    for (const p of pays) {
      items.push({
        id: p.id,
        kind: 'PAYMENT',
        label: `Agent paid ${p.amount.toFixed(4)} USDC`,
        detail: p.recipient,
        amount: p.amount,
        txHash: p.txHash ?? undefined,
        createdAt: p.createdAt.getTime(),
      });
    }
    for (const perm of perms) {
      items.push({
        id: `grant_${perm.id}`,
        kind: 'PERMISSION_GRANT',
        label: `Permission granted: ${Number(perm.maxAmount) / 1e6} USDC`,
        txHash: perm.grantTxHash ?? undefined,
        createdAt: perm.createdAt.getTime(),
      });
    }
    for (const a of regs) {
      items.push({
        id: `reg_${a.id}`,
        kind: 'AGENT_REGISTER',
        label: `${a.agentType} agent registered`,
        txHash: a.registerTxHash ?? undefined,
        createdAt: a.createdAt.getTime(),
      });
    }
  }

  return items.sort((a, b) => b.createdAt - a.createdAt).slice(0, limit);
}

export async function getTaskHistory(userAddress: string): Promise<TaskHistoryEntry[]> {
  if (!hasDatabase()) {
    return memoryDb.getTaskHistory(userAddress);
  }

  const user = await prisma.user.findUnique({
    where: { address: userAddress.toLowerCase() },
  });
  if (!user) return [];

  const rows = await prisma.task.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  return rows.map((t) => ({
    id: t.id,
    date: t.createdAt.getTime(),
    prompt: t.prompt,
    agentCount: t.agentCount,
    cost: t.totalCost,
    duration: t.duration ?? 0,
    signatures: 0,
    status: t.status as TaskHistoryEntry['status'],
  }));
}

export async function getDashboardStats(userAddress: string) {
  if (!hasDatabase()) {
    return memoryDb.getDashboardStats(userAddress);
  }

  const user = await prisma.user.findUnique({
    where: { address: userAddress.toLowerCase() },
  });
  if (!user) {
    return { tasksCompleted: 0, totalAgents: 0, totalSpent: 0, signatures: 0 };
  }

  const [completed, permissions] = await Promise.all([
    prisma.task.findMany({
      where: { userId: user.id, status: 'COMPLETE' },
      select: { agentCount: true, totalCost: true },
    }),
    prisma.permission.count({
      where: { userId: user.id, active: true, expiry: { gt: new Date() } },
    }),
  ]);

  return {
    tasksCompleted: completed.length,
    totalAgents: completed.reduce((s, t) => s + t.agentCount, 0),
    totalSpent: completed.reduce((s, t) => s + t.totalCost, 0),
    signatures: permissions > 0 ? 1 : 0,
  };
}
