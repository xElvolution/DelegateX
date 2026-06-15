'use client';

import { useCallback, useEffect, useState } from 'react';
import type { Permission } from '@/types';
import { useWallet } from '@/hooks/useWallet';
import { useWalletClient, usePublicClient } from 'wagmi';
import { requestErc7715Permission } from '@/lib/metamask';
import {
  CONTRACTS,
  DELEGATE_CORE_ABI,
  allowedContractAddresses,
  contractsConfigured,
} from '@/lib/contracts';
import { USDC_ADDRESS } from '@/lib/permissions';
import toast from 'react-hot-toast';
import type { PermissionConfig } from '@/components/app/PermissionModal';

export function usePermission() {
  const { address, authenticated, chainId } = useWallet();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(false);
  const [granting, setGranting] = useState(false);

  const activePermission = permissions.find((p) => p.status === 'ACTIVE') ?? null;

  const refresh = useCallback(async () => {
    if (!address) {
      setPermissions([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/permissions/active?address=${address}`);
      const data = await res.json();
      setPermissions(data.permissions ?? []);
    } catch {
      toast.error('Failed to load permissions');
    } finally {
      setLoading(false);
    }
  }, [address]);

  useEffect(() => {
    void refresh();
  }, [refresh, authenticated]);

  const grantPermission = useCallback(
    async (config: PermissionConfig) => {
      if (!address || !walletClient || !publicClient) {
        toast.error('Connect MetaMask first');
        return null;
      }

      setGranting(true);
      try {
        const expiry = Date.now() + config.duration * 1000;
        let erc7715Sig: string | undefined;
        let grantTxHash: string | undefined;

        // 1. Real on-chain permission: user signs DelegateCore.grantPermission.
        //    This is the verifiable "permission" tx on Basescan.
        if (contractsConfigured()) {
          try {
            const hash = await walletClient.writeContract({
              address: CONTRACTS.delegateCore,
              abi: DELEGATE_CORE_ABI,
              functionName: 'grantPermission',
              args: [
                USDC_ADDRESS as `0x${string}`,
                BigInt(Math.round(config.budget * 1e6)),
                BigInt(config.duration),
                BigInt(Math.floor(expiry / 1000)),
                allowedContractAddresses(),
              ],
            });
            const toastId = toast.loading('Confirming permission on Base Sepolia...');
            await publicClient.waitForTransactionReceipt({ hash });
            toast.dismiss(toastId);
            grantTxHash = hash;
          } catch (err) {
            console.warn('[grantPermission onchain]', err);
            toast('On-chain grant rejected or failed — saving off-chain', { icon: '⚠️' });
          }
        }

        // 2. ERC-7715 delegation request (optional, MetaMask Smart Accounts).
        try {
          const result = await requestErc7715Permission({
            budget: config.budget,
            periodSeconds: config.duration,
            expiry,
            walletClient,
            publicClient,
            chainId,
          });
          erc7715Sig = result.signature;
        } catch (err) {
          console.warn('[erc7715]', err);
        }

        const res = await fetch('/api/permissions/grant', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            address,
            token: 'USDC',
            maxAmount: config.budget,
            period: config.duration,
            expiry,
            allowedContracts: config.contracts,
            erc7715Sig,
            grantTxHash,
          }),
        });

        if (!res.ok) throw new Error('Failed to store permission');
        const data = await res.json();
        toast.success('Permission granted');
        await refresh();
        return data.permission as Permission;
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Grant failed');
        return null;
      } finally {
        setGranting(false);
      }
    },
    [address, walletClient, publicClient, chainId, refresh]
  );

  const revokePermission = useCallback(
    async (permissionId: string) => {
      if (!address) return false;
      try {
        const res = await fetch('/api/permissions/revoke', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ permissionId, address }),
        });
        if (!res.ok) throw new Error('Revoke failed');
        toast.success('Permission revoked');
        await refresh();
        return true;
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Revoke failed');
        return false;
      }
    },
    [address, refresh]
  );

  return {
    permissions,
    activePermission,
    loading,
    granting,
    refresh,
    grantPermission,
    revokePermission,
  };
}
