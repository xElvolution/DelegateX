import { NextResponse } from 'next/server';
import { formatUnits } from 'viem';
import { publicClient } from '@/lib/chain';
import { CONTRACTS, MOCK_USDC_ABI, contractsConfigured } from '@/lib/contracts';
import { agentAddress } from '@/lib/agent-wallet';
import { isOneShotConfigured } from '@/lib/oneshot';

export async function GET() {
  const agent = agentAddress();
  let agentUsdc: string | null = null;

  if (agent && contractsConfigured()) {
    try {
      const [bal, dec] = await Promise.all([
        publicClient.readContract({
          address: CONTRACTS.mockUsdc,
          abi: MOCK_USDC_ABI,
          functionName: 'balanceOf',
          args: [agent],
        }),
        publicClient.readContract({
          address: CONTRACTS.mockUsdc,
          abi: MOCK_USDC_ABI,
          functionName: 'decimals',
        }),
      ]);
      agentUsdc = formatUnits(bal as bigint, Number(dec));
    } catch {
      /* ignore read errors */
    }
  }

  return NextResponse.json({
    agentAddress: agent,
    agentUsdc,
    contractsConfigured: contractsConfigured(),
    oneShotConfigured: isOneShotConfigured(),
    mockUsdc: CONTRACTS.mockUsdc,
  });
}
