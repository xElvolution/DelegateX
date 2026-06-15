import { createConfig, http } from 'wagmi';
import { mainnet, sepolia, baseSepolia } from 'wagmi/chains';
import { injected, walletConnect } from '@wagmi/connectors';

const chainId = Number(process.env.NEXT_PUBLIC_CHAIN_ID || '84532');

const chains =
  chainId === 1
    ? ([mainnet] as const)
    : chainId === 11155111
      ? ([sepolia] as const)
      : ([baseSepolia] as const);

const projectId =
  process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ||
  process.env.NEXT_PUBLIC_METAMASK_PROJECT_ID ||
  '';

const connectors = [
  injected({ target: 'metaMask' }),
  ...(projectId
    ? [
        walletConnect({
          projectId,
          metadata: {
            name: 'DELEGATE',
            description: 'One permission. Infinite agents.',
            url: 'https://delegate.app',
            icons: ['https://delegate.app/logo.png'],
          },
        }),
      ]
    : []),
];

export const wagmiConfig = createConfig({
  chains,
  connectors,
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
    [baseSepolia.id]: http('https://sepolia.base.org'),
  },
  ssr: true,
});
