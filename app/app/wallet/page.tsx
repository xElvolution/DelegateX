'use client';

import { useCallback, useEffect, useState } from 'react';
import { useWalletClient, usePublicClient } from 'wagmi';
import { formatUnits } from 'viem';
import toast from 'react-hot-toast';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useWallet } from '@/hooks/useWallet';
import { truncateAddress } from '@/lib/utils';
import {
  CONTRACTS,
  MOCK_USDC_ABI,
  contractsConfigured,
  addressUrl,
  txUrl,
  CHAIN_ID,
} from '@/lib/contracts';

interface WalletStatus {
  agentAddress: string | null;
  agentUsdc: string | null;
  contractsConfigured: boolean;
  oneShotConfigured: boolean;
  mockUsdc: string;
}

export default function WalletPage() {
  const { address } = useWallet();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const [status, setStatus] = useState<WalletStatus | null>(null);
  const [myUsdc, setMyUsdc] = useState<string | null>(null);
  const [minting, setMinting] = useState(false);

  const loadStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/wallet/status');
      setStatus(await res.json());
    } catch {
      /* ignore */
    }
  }, []);

  const loadMyBalance = useCallback(async () => {
    if (!address || !publicClient || !contractsConfigured()) return;
    try {
      const bal = await publicClient.readContract({
        address: CONTRACTS.mockUsdc,
        abi: MOCK_USDC_ABI,
        functionName: 'balanceOf',
        args: [address],
      });
      setMyUsdc(formatUnits(bal as bigint, 6));
    } catch {
      /* ignore */
    }
  }, [address, publicClient]);

  useEffect(() => {
    void loadStatus();
    void loadMyBalance();
  }, [loadStatus, loadMyBalance]);

  const handleFaucet = useCallback(async () => {
    if (!walletClient || !publicClient) {
      toast.error('Connect MetaMask first');
      return;
    }
    if (!contractsConfigured()) {
      toast.error('Contracts not deployed yet');
      return;
    }
    setMinting(true);
    const id = toast.loading('Minting 1,000 test USDC…');
    try {
      const hash = await walletClient.writeContract({
        address: CONTRACTS.mockUsdc,
        abi: MOCK_USDC_ABI,
        functionName: 'faucet',
      });
      await publicClient.waitForTransactionReceipt({ hash });
      toast.dismiss(id);
      toast.success(
        <a href={txUrl(hash)} target="_blank" rel="noopener noreferrer" className="underline">
          +1,000 USDC - view on Basescan ↗
        </a>,
        { duration: 6000 }
      );
      await loadMyBalance();
    } catch (err) {
      toast.dismiss(id);
      toast.error(err instanceof Error ? err.message.slice(0, 80) : 'Faucet failed');
    } finally {
      setMinting(false);
    }
  }, [walletClient, publicClient, loadMyBalance]);

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6">
        <h2 className="text-xl font-bold tracking-tighter">Wallet</h2>
        <p className="mt-1 text-sm text-muted">
          Balances, test-USDC faucet, and relayer status on Base Sepolia.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {/* Your wallet */}
        <div className="card-surface p-5">
          <div className="mb-1 text-[10px] uppercase tracking-widest text-muted">Your wallet</div>
          <div className="mono text-sm">
            {address ? truncateAddress(address, 6) : 'Not connected'}
          </div>
          <div className="mt-4 text-[10px] uppercase tracking-widest text-muted">
            Test USDC balance
          </div>
          <div className="mono text-2xl font-bold">{myUsdc ?? '-'}</div>
          <Button
            variant="primary"
            glow
            className="mt-4 w-full"
            onClick={() => void handleFaucet()}
            disabled={minting || !address}
          >
            {minting ? 'Minting…' : 'Get 1,000 test USDC'}
          </Button>
        </div>

        {/* Agent wallet */}
        <div className="card-surface p-5">
          <div className="mb-1 text-[10px] uppercase tracking-widest text-muted">
            Agent wallet (spender)
          </div>
          <div className="mono text-sm">
            {status?.agentAddress ? (
              <a
                href={addressUrl(status.agentAddress)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-info hover:underline"
              >
                {truncateAddress(status.agentAddress, 6)} ↗
              </a>
            ) : (
              'Not configured'
            )}
          </div>
          <div className="mt-4 text-[10px] uppercase tracking-widest text-muted">
            Agent USDC balance
          </div>
          <div className="mono text-2xl font-bold">{status?.agentUsdc ?? '-'}</div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Badge tone={status?.contractsConfigured ? 'green' : 'muted'} dot>
              {status?.contractsConfigured ? 'Contracts live' : 'Not deployed'}
            </Badge>
            <Badge tone={status?.oneShotConfigured ? 'green' : 'muted'} dot>
              {status?.oneShotConfigured ? '1Shot relayer' : 'viem fallback'}
            </Badge>
            <Badge tone="blue">{CHAIN_ID === 84532 ? 'Base Sepolia' : `chain ${CHAIN_ID}`}</Badge>
          </div>
        </div>
      </div>

      {!contractsConfigured() && (
        <div className="card-surface mt-4 p-5 text-sm text-muted">
          Contracts aren’t deployed yet. Run the deploy step in{' '}
          <span className="mono text-white/80">DEPLOY.md</span> and fill the addresses in{' '}
          <span className="mono text-white/80">.env.local</span> to enable the faucet and live
          balances.
        </div>
      )}
    </div>
  );
}
