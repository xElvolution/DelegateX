'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider as WagmiCoreProvider } from 'wagmi';
import { Web3AuthProvider, type Web3AuthContextConfig } from '@web3auth/modal/react';
import { WagmiProvider as Web3AuthWagmiProvider } from '@web3auth/modal/react/wagmi';
import { WEB3AUTH_NETWORK } from '@web3auth/modal';
import { useState, type ReactNode } from 'react';
import { wagmiConfig } from '@/lib/wagmi-config';

const WEB3AUTH_CLIENT_ID = process.env.NEXT_PUBLIC_WEB3AUTH_CLIENT_ID || '';

const WEB3AUTH_NET =
  process.env.NEXT_PUBLIC_WEB3AUTH_NETWORK === 'mainnet'
    ? WEB3AUTH_NETWORK.SAPPHIRE_MAINNET
    : WEB3AUTH_NETWORK.SAPPHIRE_DEVNET;

const web3AuthConfig: Web3AuthContextConfig = {
  web3AuthOptions: {
    clientId: WEB3AUTH_CLIENT_ID,
    web3AuthNetwork: WEB3AUTH_NET,
  },
};

/// When NEXT_PUBLIC_WEB3AUTH_CLIENT_ID is set, the app uses MetaMask Embedded
/// Wallets (social/email + MetaMask in one modal). Without it, falls back to
/// the injected MetaMask flow so local dev works before dashboard setup.
export function Web3Provider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  if (WEB3AUTH_CLIENT_ID) {
    return (
      <Web3AuthProvider config={web3AuthConfig}>
        <QueryClientProvider client={queryClient}>
          <Web3AuthWagmiProvider>{children}</Web3AuthWagmiProvider>
        </QueryClientProvider>
      </Web3AuthProvider>
    );
  }

  return (
    <WagmiCoreProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiCoreProvider>
  );
}

/// Whether the Embedded Wallets stack is active.
export const isEmbeddedWalletsActive = () => Boolean(WEB3AUTH_CLIENT_ID);
