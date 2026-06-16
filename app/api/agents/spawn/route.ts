import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createWalletClient, http, parseUnits, keccak256, toHex } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { publicClient, activeChain } from '@/lib/chain';
import {
  CONTRACTS,
  SUB_AGENT_REGISTRY_ABI,
  contractsConfigured,
} from '@/lib/contracts';
import { uid } from '@/lib/utils';

const schema = z.object({
  taskId: z.string(),
  agentType: z.string(),
  budget: z.number().positive(),
  owner: z.string().optional(),
});

const AGENT_KEY = (process.env.AGENT_PRIVATE_KEY || '') as `0x${string}`;
const RPC_URL =
  process.env.NEXT_PUBLIC_RPC_URL ||
  (activeChain.id === 84532 ? 'https://sepolia.base.org' : undefined);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = schema.parse(body);

    const agentId = `agent_${uid()}`;
    let registerTx: string | undefined;

    // Real on-chain registration on SubAgentRegistry (owner-only -> viem path).
    if (AGENT_KEY && contractsConfigured()) {
      try {
        const account = privateKeyToAccount(AGENT_KEY);
        const wallet = createWalletClient({
          account,
          chain: activeChain,
          transport: http(RPC_URL),
        });
        // Deterministic pseudo-address for the sub-agent from its id.
        const agentAddr = `0x${keccak256(toHex(agentId)).slice(26)}` as `0x${string}`;
        const taskId32 = keccak256(toHex(data.taskId));
        registerTx = await wallet.writeContract({
          address: CONTRACTS.subAgentRegistry,
          abi: SUB_AGENT_REGISTRY_ABI,
          functionName: 'registerAgent',
          args: [
            agentAddr,
            taskId32,
            (data.owner || account.address) as `0x${string}`,
            data.agentType,
            parseUnits(data.budget.toFixed(6), 6),
          ],
        });
        await publicClient.waitForTransactionReceipt({ hash: registerTx as `0x${string}` });
      } catch (err) {
        console.warn('[agents/spawn registerAgent]', err);
      }
    }

    return NextResponse.json({
      agentId,
      taskId: data.taskId,
      type: data.agentType,
      budget: data.budget,
      status: 'ACTIVE',
      registerTx,
      spawnedAt: Date.now(),
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Invalid request' },
      { status: 400 }
    );
  }
}
