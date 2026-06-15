// Permission helpers
import type { Permission, AllowedContract } from '@/types';
import { CONTRACTS } from '@/lib/contracts';

// The spendable test token (deployed MockUSDC on Base Sepolia). Falls back to a
// zero address until contracts are deployed and env is filled.
export const USDC_ADDRESS =
  process.env.NEXT_PUBLIC_MOCK_USDC_ADDRESS ||
  '0x0000000000000000000000000000000000000000';

// Real, deployed contracts an agent is allowed to interact with. Addresses come
// from the deployed stack so the on-chain `allowedContracts` array is valid.
export const DEFAULT_CONTRACTS: AllowedContract[] = [
  { name: 'X402 Verifier (payments)', address: CONTRACTS.x402Verifier, enabled: true },
  { name: 'MockUSDC (token)', address: CONTRACTS.mockUsdc, enabled: true },
  { name: 'SubAgent Registry', address: CONTRACTS.subAgentRegistry, enabled: true },
];

export function isPermissionActive(p: Permission): boolean {
  if (!p.status || p.status !== 'ACTIVE') return false;
  if (Date.now() > p.expiry) return false;
  if (p.remaining <= 0) return false;
  return true;
}

export function calculateRemainingBudget(p: Permission): number {
  return Math.max(0, p.maxAmount - p.spent);
}
