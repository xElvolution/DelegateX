'use client';

import { useWeb3AuthConnect, useWeb3AuthDisconnect } from '@web3auth/modal/react';
import { useAccount } from 'wagmi';
import { Button } from '@/components/ui/Button';
import { AddressChip } from '@/components/ui/AddressChip';
import { useWallet } from '@/hooks/useWallet';

/// Sign-in button when MetaMask Embedded Wallets is active. The connect modal
/// is the unified Embedded Wallets modal: Google / X / Facebook / Email / Phone
/// / MetaMask / All Wallets - all in one place.
export function EmbeddedWalletButton() {
  const { connect, loading: connecting } = useWeb3AuthConnect();
  const { disconnect } = useWeb3AuthDisconnect();
  const { address, isConnected } = useAccount();
  const { authenticated, authLoading, signOut } = useWallet();

  const handleDisconnect = async () => {
    await signOut().catch(() => {});
    await disconnect().catch(() => {});
  };

  if (isConnected && address && authenticated) {
    return (
      <div className="flex items-center gap-2">
        <AddressChip address={address} chars={4} />
        <Button variant="ghost" size="sm" onClick={() => void handleDisconnect()}>
          Disconnect
        </Button>
      </div>
    );
  }

  return (
    <Button
      variant="primary"
      size="sm"
      loading={connecting || authLoading}
      onClick={() => void connect()}
    >
      {isConnected && !authenticated ? 'Sign In' : 'Sign in'}
    </Button>
  );
}
