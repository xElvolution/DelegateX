// Permission helpers
import type { Permission, AllowedContract } from '@/types';

export const USDC_ADDRESS = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';

export const DEFAULT_CONTRACTS: AllowedContract[] = [
  { name: 'Venice AI API', address: '0xVenice', enabled: true },
  { name: 'DeFiLlama', address: '0xDeFiLlama', enabled: true },
  { name: 'Uniswap v3', address: '0xUniswap', enabled: true },
  { name: 'Aave v3', address: '0xAave', enabled: true },
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
