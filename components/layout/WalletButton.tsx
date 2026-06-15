'use client';

import { Button } from '@/components/ui/Button';
import { AddressChip } from '@/components/ui/AddressChip';
import { useWallet } from '@/hooks/useWallet';
import { isEmbeddedWalletsActive } from '@/components/providers/Web3Provider';
import { EmbeddedWalletButton } from './EmbeddedWalletButton';

export function WalletButton() {
  // Path A: MetaMask Embedded Wallets unified modal (social + MetaMask).
  if (isEmbeddedWalletsActive()) {
    return <EmbeddedWalletButton />;
  }
  // Path B: classic injected-MetaMask flow.
  return <InjectedWalletButton />;
}

function InjectedWalletButton() {
  const {
    address,
    isConnected,
    isConnecting,
    authenticated,
    authLoading,
    connectMetaMask,
    signOut,
  } = useWallet();

  if (isConnected && address && authenticated) {
    return (
      <div className="flex items-center gap-2">
        <AddressChip address={address} chars={4} />
        <Button variant="ghost" size="sm" onClick={() => void signOut()}>
          Disconnect
        </Button>
      </div>
    );
  }

  return (
    <Button
      variant="primary"
      size="sm"
      loading={isConnecting || authLoading}
      onClick={() => void connectMetaMask()}
    >
      {isConnected && !authenticated ? 'Sign In' : 'Connect MetaMask'}
    </Button>
  );
}
