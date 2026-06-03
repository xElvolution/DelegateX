'use client';

import { cn, truncateAddress } from '@/lib/utils';
import { CopyButton } from './CopyButton';

export interface AddressChipProps {
  address: string;
  chars?: number;
  showCopy?: boolean;
  className?: string;
  size?: 'sm' | 'md';
}

export function AddressChip({
  address,
  chars = 4,
  showCopy = true,
  className,
  size = 'sm',
}: AddressChipProps) {
  return (
    <span
      className={cn(
        'mono inline-flex items-center gap-1 rounded-md border border-white/5 bg-white/5 px-2 py-1 text-xs',
        size === 'md' && 'px-2.5 py-1.5 text-sm',
        className
      )}
    >
      <span className="text-white/90">{truncateAddress(address, chars)}</span>
      {showCopy && <CopyButton value={address} label="Address" size="sm" />}
    </span>
  );
}
