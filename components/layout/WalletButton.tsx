'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { AddressChip } from '@/components/ui/AddressChip';

const DEMO_ADDR = '0x1234567890abcdef1234567890abcdef12345678';

export function WalletButton() {
  const [connected, setConnected] = useState(false);

  if (connected) {
    return (
      <div className="flex items-center gap-2">
        <AddressChip address={DEMO_ADDR} chars={4} />
        <Button variant="ghost" size="sm" onClick={() => setConnected(false)}>
          Disconnect
        </Button>
      </div>
    );
  }

  return (
    <Button variant="primary" size="sm" onClick={() => setConnected(true)}>
      Connect Wallet
    </Button>
  );
}
