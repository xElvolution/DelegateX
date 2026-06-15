'use client';

import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/Badge';
import { formatUSDC, truncateAddress, formatRelativeTime } from '@/lib/utils';
import {
  CONTRACTS,
  contractsConfigured,
  addressUrl,
  txUrl,
  CHAIN_ID,
} from '@/lib/contracts';
import type { OnchainPayment } from '@/types';

const CONTRACT_ROWS: { label: string; address: string }[] = [
  { label: 'DelegateCore', address: CONTRACTS.delegateCore },
  { label: 'MockUSDC', address: CONTRACTS.mockUsdc },
  { label: 'SubAgentRegistry', address: CONTRACTS.subAgentRegistry },
  { label: 'X402PaymentVerifier', address: CONTRACTS.x402Verifier },
];

export function OnchainProof() {
  const [payments, setPayments] = useState<OnchainPayment[]>([]);
  const configured = contractsConfigured();

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const res = await fetch('/api/payments/recent');
        const data = await res.json();
        if (active) setPayments(data.payments ?? []);
      } catch {
        /* ignore */
      }
    };
    void load();
    const interval = setInterval(load, 5000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="card-surface overflow-hidden">
      <div className="flex items-center justify-between border-b border-white/5 px-5 py-4">
        <h3 className="text-sm font-semibold">On-chain proof</h3>
        <Badge tone={configured ? 'green' : 'muted'} dot>
          {CHAIN_ID === 84532 ? 'Base Sepolia' : `chain ${CHAIN_ID}`}
        </Badge>
      </div>

      <div className="grid gap-5 px-5 py-4 md:grid-cols-2">
        {/* Deployed contracts */}
        <div>
          <div className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted">
            Deployed contracts
          </div>
          <div className="space-y-1.5">
            {CONTRACT_ROWS.map((c) => (
              <div
                key={c.label}
                className="mono flex items-center justify-between text-[11px]"
              >
                <span className="text-white/70">{c.label}</span>
                {configured ? (
                  <a
                    href={addressUrl(c.address)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-info hover:underline"
                  >
                    {truncateAddress(c.address, 4)} ↗
                  </a>
                ) : (
                  <span className="text-muted">not deployed</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Recent real payments */}
        <div>
          <div className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted">
            Recent agent payments
          </div>
          {payments.length === 0 ? (
            <div className="text-[11px] text-muted">
              No on-chain payments yet. Run a task to see real transfers.
            </div>
          ) : (
            <div className="space-y-1.5">
              {payments.slice(0, 6).map((p) => (
                <a
                  key={p.id}
                  href={txUrl(p.txHash)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mono flex items-center justify-between rounded border border-info/10 bg-info/5 px-2 py-1.5 text-[11px] hover:border-info/30"
                >
                  <span className="text-white/70">{formatUSDC(p.amount)} USDC</span>
                  <span className="text-muted">{formatRelativeTime(p.createdAt)}</span>
                  <span className="text-info">{truncateAddress(p.txHash, 5)} ↗</span>
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
