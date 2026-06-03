'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface ProgressProps {
  value: number;
  max?: number;
  variant?: 'orange' | 'green' | 'red' | 'gradient' | 'auto';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  label?: string;
  className?: string;
}

const sizes = {
  sm: 'h-1',
  md: 'h-2',
  lg: 'h-3',
};

const fills = {
  orange: 'bg-primary',
  green: 'bg-success',
  red: 'bg-danger',
  gradient: 'bg-gradient-to-r from-primary via-primary-dark to-secondary',
};

export function Progress({
  value,
  max = 100,
  variant = 'orange',
  size = 'md',
  showLabel = false,
  label,
  className,
}: ProgressProps) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  const auto = variant === 'auto' ? (pct < 20 ? 'red' : pct < 50 ? 'orange' : 'green') : variant;
  const fillClass = fills[auto as keyof typeof fills];

  return (
    <div className={cn('w-full', className)}>
      {(showLabel || label) && (
        <div className="mb-1.5 flex items-baseline justify-between text-xs text-muted">
          <span>{label}</span>
          <span className="mono">{Math.round(pct)}%</span>
        </div>
      )}
      <div
        className={cn(
          'relative w-full overflow-hidden rounded-full bg-white/5',
          sizes[size]
        )}
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <motion.div
          className={cn('absolute inset-y-0 left-0 rounded-full', fillClass)}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>
    </div>
  );
}
