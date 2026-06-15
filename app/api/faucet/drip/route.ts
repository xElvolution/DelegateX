import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createWalletClient, http, parseEther, parseUnits, isAddress } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { publicClient, activeChain } from '@/lib/wagmi';
import { CONTRACTS, MOCK_USDC_ABI, contractsConfigured } from '@/lib/contracts';
import { memoryDb } from '@/lib/memory-db';

const schema = z.object({
  address: z.string().refine(isAddress, 'invalid address'),
});

// Tunables: small drips, hard cap, low-balance guard.
const DRIP_ETH = parseEther('0.001'); // ~10 grantPermission txs of headroom
const DRIP_USDC = parseUnits('100', 6); // 100 test USDC
const MIN_ETH_TO_SKIP = parseEther('0.0005'); // already has gas? skip ETH part
const MAX_TOTAL_DRIPS = 200; // backstop for the deployer wallet

const PRIVATE_KEY = (process.env.PRIVATE_KEY || process.env.AGENT_PRIVATE_KEY || '') as `0x${string}`;
const RPC_URL =
  process.env.NEXT_PUBLIC_RPC_URL ||
  (activeChain.id === 84532 ? 'https://sepolia.base.org' : undefined);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { address } = schema.parse(body);
    const addr = address as `0x${string}`;

    if (!PRIVATE_KEY) {
      return NextResponse.json(
        { error: 'Faucet disabled (PRIVATE_KEY not set on server)' },
        { status: 503 }
      );
    }
    if (!contractsConfigured()) {
      return NextResponse.json(
        { error: 'Faucet disabled (contracts not deployed)' },
        { status: 503 }
      );
    }

    if (memoryDb.hasBeenDripped(address)) {
      return NextResponse.json({ skipped: 'already_dripped' });
    }
    if (memoryDb.dripCount() >= MAX_TOTAL_DRIPS) {
      return NextResponse.json({ skipped: 'global_cap_reached' });
    }

    const account = privateKeyToAccount(PRIVATE_KEY);
    const wallet = createWalletClient({
      account,
      chain: activeChain,
      transport: http(RPC_URL),
    });

    // Don't waste the deployer's ETH on a wallet that already has plenty.
    const balance = await publicClient.getBalance({ address: addr });
    let ethTx: `0x${string}` | undefined;
    if (balance < MIN_ETH_TO_SKIP) {
      ethTx = await wallet.sendTransaction({ to: addr, value: DRIP_ETH });
      await publicClient.waitForTransactionReceipt({ hash: ethTx });
    }

    const usdcTx = await wallet.writeContract({
      address: CONTRACTS.mockUsdc,
      abi: MOCK_USDC_ABI,
      functionName: 'mint',
      args: [addr, DRIP_USDC],
    });
    await publicClient.waitForTransactionReceipt({ hash: usdcTx });

    memoryDb.markDripped(address);

    return NextResponse.json({
      address: addr,
      txHashes: { eth: ethTx ?? null, usdc: usdcTx },
      dripped: {
        eth: ethTx ? '0.001' : '0 (sufficient balance)',
        usdc: '100',
      },
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Faucet failed' },
      { status: 400 }
    );
  }
}
