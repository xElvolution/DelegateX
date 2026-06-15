// Central wiring for the on-chain DELEGATE stack (Base Sepolia).
// Addresses come from env (filled after `forge script Deploy`); ABIs are trimmed
// to the functions the app actually calls.

export const CHAIN_ID = Number(process.env.NEXT_PUBLIC_CHAIN_ID || '84532');

export const BASESCAN_URL =
  CHAIN_ID === 84532
    ? 'https://sepolia.basescan.org'
    : CHAIN_ID === 11155111
      ? 'https://sepolia.etherscan.io'
      : 'https://etherscan.io';

export function txUrl(hash: string) {
  return `${BASESCAN_URL}/tx/${hash}`;
}

export function addressUrl(address: string) {
  return `${BASESCAN_URL}/address/${address}`;
}

const z = '0x0000000000000000000000000000000000000000' as const;

export const CONTRACTS = {
  mockUsdc: (process.env.NEXT_PUBLIC_MOCK_USDC_ADDRESS || z) as `0x${string}`,
  delegateCore: (process.env.NEXT_PUBLIC_DELEGATE_CORE_ADDRESS || z) as `0x${string}`,
  subAgentRegistry: (process.env.NEXT_PUBLIC_SUB_AGENT_REGISTRY_ADDRESS || z) as `0x${string}`,
  x402Verifier: (process.env.NEXT_PUBLIC_X402_VERIFIER_ADDRESS || z) as `0x${string}`,
};

export function contractsConfigured() {
  return Object.values(CONTRACTS).every((a) => a !== z);
}

// Addresses passed as the on-chain `allowedContracts` array when granting a
// permission. These are the contracts a sub-agent is allowed to interact with.
export function allowedContractAddresses(): `0x${string}`[] {
  return [CONTRACTS.mockUsdc, CONTRACTS.x402Verifier, CONTRACTS.subAgentRegistry].filter(
    (a) => a !== z
  );
}

export const DELEGATE_CORE_ABI = [
  {
    type: 'function',
    name: 'grantPermission',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'token', type: 'address' },
      { name: 'maxAmount', type: 'uint256' },
      { name: 'period', type: 'uint256' },
      { name: 'expiry', type: 'uint256' },
      { name: 'allowedContracts', type: 'address[]' },
    ],
    outputs: [],
  },
  {
    type: 'function',
    name: 'revokePermission',
    stateMutability: 'nonpayable',
    inputs: [],
    outputs: [],
  },
  {
    type: 'function',
    name: 'getRemainingBudget',
    stateMutability: 'view',
    inputs: [{ name: 'user', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'spawnSubAgent',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'taskId', type: 'bytes32' },
      { name: 'subAgent', type: 'address' },
      { name: 'token', type: 'address' },
      { name: 'budget', type: 'uint256' },
      { name: 'expiry', type: 'uint256' },
    ],
    outputs: [],
  },
] as const;

export const MOCK_USDC_ABI = [
  {
    type: 'function',
    name: 'transfer',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'bool' }],
  },
  {
    type: 'function',
    name: 'balanceOf',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'decimals',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint8' }],
  },
  {
    type: 'function',
    name: 'faucet',
    stateMutability: 'nonpayable',
    inputs: [],
    outputs: [],
  },
  {
    type: 'function',
    name: 'mint',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [],
  },
] as const;

export const SUB_AGENT_REGISTRY_ABI = [
  {
    type: 'function',
    name: 'registerAgent',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'agent', type: 'address' },
      { name: 'taskId', type: 'bytes32' },
      { name: 'owner', type: 'address' },
      { name: 'agentType', type: 'string' },
      { name: 'budget', type: 'uint256' },
    ],
    outputs: [],
  },
] as const;

export const X402_VERIFIER_ABI = [
  {
    type: 'function',
    name: 'recordPayment',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'paymentId', type: 'bytes32' },
      { name: 'payer', type: 'address' },
      { name: 'recipient', type: 'address' },
      { name: 'amount', type: 'uint256' },
      { name: 'resourceId', type: 'bytes32' },
    ],
    outputs: [],
  },
] as const;
