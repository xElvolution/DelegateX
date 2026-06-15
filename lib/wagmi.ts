import { createPublicClient, http } from 'viem';
import { mainnet, sepolia, baseSepolia } from 'viem/chains';

const chainId = Number(process.env.NEXT_PUBLIC_CHAIN_ID || '84532');

export const activeChain =
  chainId === 1 ? mainnet : chainId === 11155111 ? sepolia : baseSepolia;

const rpcUrl =
  process.env.NEXT_PUBLIC_RPC_URL ||
  (activeChain.id === baseSepolia.id ? 'https://sepolia.base.org' : undefined);

export const publicClient = createPublicClient({
  chain: activeChain,
  transport: http(rpcUrl),
});

export { wagmiConfig } from '@/lib/wagmi-config';
