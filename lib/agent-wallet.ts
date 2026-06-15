// Server-side agent wallet + unified spend dispatcher.
//
// relaySpend() makes a REAL MockUSDC transfer on Base Sepolia and returns a real
// tx hash. It prefers the 1Shot managed wallet when configured, and otherwise
// falls back to a viem wallet signing with AGENT_PRIVATE_KEY — so verifiable
// on-chain txs work even before the 1Shot dashboard is set up.

import { createWalletClient, http, parseUnits, keccak256, toHex } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { publicClient, activeChain } from '@/lib/wagmi';
import { CONTRACTS, MOCK_USDC_ABI, X402_VERIFIER_ABI } from '@/lib/contracts';
import { isOneShotConfigured, oneShotTransfer } from '@/lib/oneshot';

export interface SpendResult {
  txHash: string;
  via: 'ONESHOT' | 'VIEM';
}

const AGENT_KEY = (process.env.AGENT_PRIVATE_KEY || '') as `0x${string}`;
const RPC_URL =
  process.env.NEXT_PUBLIC_RPC_URL ||
  (activeChain.id === 84532 ? 'https://sepolia.base.org' : undefined);

// Default recipient for service payments: the on-chain payment verifier, which
// simply holds the transferred test USDC. Override with PAYMENT_SINK_ADDRESS.
const PAYMENT_SINK = (process.env.PAYMENT_SINK_ADDRESS ||
  CONTRACTS.x402Verifier) as `0x${string}`;

function getAgentAccount() {
  if (!AGENT_KEY) throw new Error('AGENT_PRIVATE_KEY not set');
  return privateKeyToAccount(AGENT_KEY);
}

export function agentAddress(): `0x${string}` | null {
  if (!AGENT_KEY) return null;
  return getAgentAccount().address;
}

function getAgentWallet() {
  return createWalletClient({
    account: getAgentAccount(),
    chain: activeChain,
    transport: http(RPC_URL),
  });
}

export function spendingEnabled() {
  return isOneShotConfigured() || Boolean(AGENT_KEY);
}

/// Make a real USDC transfer for `amountUsdc` (decimal USDC) to `to`.
export async function relaySpend(params: {
  amountUsdc: number;
  to?: string;
}): Promise<SpendResult> {
  const to = (params.to || PAYMENT_SINK) as `0x${string}`;
  const amount = parseUnits(params.amountUsdc.toFixed(6), 6);

  if (isOneShotConfigured()) {
    const res = await oneShotTransfer(to, amount);
    return { txHash: res.txHash, via: 'ONESHOT' };
  }

  // viem-direct fallback
  const wallet = getAgentWallet();
  const hash = await wallet.writeContract({
    address: CONTRACTS.mockUsdc,
    abi: MOCK_USDC_ABI,
    functionName: 'transfer',
    args: [to, amount],
  });
  await publicClient.waitForTransactionReceipt({ hash });
  return { txHash: hash, via: 'VIEM' };
}

/// Best-effort on-chain record of an x402 payment on the verifier contract.
/// Only runs on the viem-direct path (agent owns the verifier).
export async function recordPaymentOnchain(params: {
  payer: string;
  recipient: string;
  amountUsdc: number;
  resourceId: string;
}): Promise<string | null> {
  if (!AGENT_KEY) return null;
  try {
    const wallet = getAgentWallet();
    const paymentId = keccak256(
      toHex(`${params.resourceId}:${params.recipient}:${Date.now()}`)
    );
    const resourceId = keccak256(toHex(params.resourceId));
    const hash = await wallet.writeContract({
      address: CONTRACTS.x402Verifier,
      abi: X402_VERIFIER_ABI,
      functionName: 'recordPayment',
      args: [
        paymentId,
        params.payer as `0x${string}`,
        params.recipient as `0x${string}`,
        parseUnits(params.amountUsdc.toFixed(6), 6),
        resourceId,
      ],
    });
    return hash;
  } catch (err) {
    console.warn('[recordPaymentOnchain]', err);
    return null;
  }
}
