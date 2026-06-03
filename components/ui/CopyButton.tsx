'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

export interface CopyButtonProps {
  value: string;
  label?: string;
  size?: 'sm' | 'md';
  className?: string;
}

export function CopyButton({ value, label, size = 'sm', className }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      toast.success(label ? `${label} copied` : 'Copied');
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error('Copy failed');
    }
  };

  return (
    <button
      type="button"
      onClick={onCopy}
      className={cn(
        'inline-flex items-center justify-center rounded-md text-muted transition-colors hover:bg-white/5 hover:text-white',
        size === 'sm' ? 'h-6 w-6' : 'h-8 w-8',
        className
      )}
      aria-label="Copy to clipboard"
    >
      {copied ? (
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path
            d="M1.5 6L4.5 9L10.5 3"
            stroke="#00FF87"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ) : (
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <rect
            x="3"
            y="3"
            width="7"
            height="7"
            rx="1.2"
            stroke="currentColor"
            strokeWidth="1.2"
          />
          <path
            d="M2 7.5V2.5C2 1.95 2.45 1.5 3 1.5H8"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
        </svg>
      )}
    </button>
  );
}
