// Client-side wagmi entry. Re-exports the server-safe chain primitives plus the
// wagmi config (which loads browser-only connectors — never import this from
// server code; use lib/chain.ts there instead).

export { publicClient, activeChain } from '@/lib/chain';
export { wagmiConfig } from '@/lib/wagmi-config';
