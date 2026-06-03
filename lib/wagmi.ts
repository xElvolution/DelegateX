import { createPublicClient, http } from 'viem';
import { mainnet, sepolia } from 'viem/chains';

const chain = process.env.NEXT_PUBLIC_CHAIN_ID === '1' ? mainnet : sepolia;

export const publicClient = createPublicClient({
  chain,
  transport: http(),
});

export const wagmiConfig = {
  chains: [mainnet, sepolia],
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '',
};
