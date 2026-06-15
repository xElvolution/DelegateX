'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  useAccount,
  useConnect,
  useDisconnect,
  usePublicClient,
  useSignMessage,
  useChainId,
} from 'wagmi';
import { createSiweMessage } from '@/lib/siwe';
import toast from 'react-hot-toast';

export function useWallet() {
  const { address, isConnected, isConnecting } = useAccount();
  const { connect, connectors, isPending: isConnectPending } = useConnect();
  const { disconnect } = useDisconnect();
  const { signMessageAsync } = useSignMessage();
  const chainId = useChainId();
  const publicClient = usePublicClient();
  const [authenticated, setAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);

  const checkSession = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/session');
      if (res.ok) {
        const data = await res.json();
        setAuthenticated(Boolean(data.authenticated));
        return data;
      }
    } catch {
      /* ignore */
    }
    setAuthenticated(false);
    return null;
  }, []);

  useEffect(() => {
    void checkSession();
  }, [checkSession, address]);

  const connectMetaMask = useCallback(async () => {
    const mm =
      connectors.find(
        (c) =>
          c.id === 'io.metamask' ||
          c.id === 'metaMask' ||
          c.name.toLowerCase().includes('metamask')
      ) ?? connectors[0];
    if (!mm) {
      toast.error('MetaMask connector unavailable');
      return;
    }
    connect({ connector: mm });
  }, [connect, connectors]);

  const signIn = useCallback(async () => {
    if (!address) return false;
    setAuthLoading(true);
    try {
      const nonceRes = await fetch('/api/auth/nonce');
      const { nonce } = await nonceRes.json();
      const message = createSiweMessage({
        address,
        chainId,
        nonce,
        domain: window.location.host,
        uri: window.location.origin,
      });
      const signature = await signMessageAsync({ message });
      const verifyRes = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, signature }),
      });
      if (!verifyRes.ok) throw new Error('Authentication failed');
      setAuthenticated(true);
      toast.success('Signed in with MetaMask');
      return true;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Sign-in failed');
      return false;
    } finally {
      setAuthLoading(false);
    }
  }, [address, chainId, signMessageAsync]);

  const signOut = useCallback(async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setAuthenticated(false);
    disconnect();
  }, [disconnect]);

  const connectAndSignIn = useCallback(async () => {
    if (!isConnected) {
      await connectMetaMask();
      return false;
    }
    return signIn();
  }, [connectMetaMask, isConnected, signIn]);

  useEffect(() => {
    if (isConnected && address && !authenticated && !authLoading) {
      void signIn();
    }
  }, [isConnected, address, authenticated, authLoading, signIn]);

  // Auto-faucet: after a successful sign-in, drip a tiny amount of Base Sepolia
  // ETH + 100 test USDC to brand-new wallets so they can sign grantPermission
  // without manually hunting a faucet. Server enforces one-shot per address and
  // skips the ETH drip when the wallet already has gas. Client-side
  // localStorage gate prevents duplicate calls across reloads.
  useEffect(() => {
    if (!authenticated || !address) return;
    if (typeof window === 'undefined') return;
    const key = `delegate:drip:${address.toLowerCase()}`;
    if (window.localStorage.getItem(key)) return;
    window.localStorage.setItem(key, '1');
    fetch('/api/faucet/drip', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ address }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data?.txHashes?.eth || data?.txHashes?.usdc) {
          toast.success(`Sent you 100 test USDC${data.txHashes.eth ? ' + 0.001 ETH' : ''} to get started`);
        }
      })
      .catch(() => {
        /* faucet is best-effort */
      });
  }, [authenticated, address]);

  return {
    address,
    isConnected,
    isConnecting: isConnecting || isConnectPending,
    authenticated,
    authLoading,
    chainId,
    publicClient,
    connectMetaMask,
    signIn,
    signOut,
    connectAndSignIn,
    checkSession,
  };
}
