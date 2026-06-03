import { type HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type Tone = 'default' | 'orange' | 'purple' | 'green' | 'red' | 'blue' | 'muted';
type Size = 'sm' | 'md';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
  size?: Size;
  dot?: boolean;
  pulse?: boolean;
}

const tones: Record<Tone, string> = {
  default: 'bg-white/5 text-white border-white/10',
  orange: 'bg-primary/10 text-primary border-primary/30',
  purple: 'bg-secondary/10 text-secondary border-secondary/30',
  green: 'bg-success/10 text-success border-success/30',
  red: 'bg-danger/10 text-danger border-danger/30',
  blue: 'bg-info/10 text-info border-info/30',
  muted: 'bg-white/3 text-muted border-white/5',
};

const dotColors: Record<Tone, string> = {
  default: 'bg-white',
  orange: 'bg-primary',
  purple: 'bg-secondary',
  green: 'bg-success',
  red: 'bg-danger',
  blue: 'bg-info',
  muted: 'bg-muted',
};

export function Badge({
  tone = 'default',
  size = 'sm',
  dot = false,
  pulse = false,
  className,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border font-medium tracking-tight',
        size === 'sm' ? 'h-6 px-2.5 text-[11px]' : 'h-7 px-3 text-xs',
        tones[tone],
        className
      )}
      {...props}
    >
      {dot && (
        <span className="relative inline-flex h-1.5 w-1.5">
          <span
            className={cn(
              'absolute inline-flex h-full w-full rounded-full opacity-75',
              dotColors[tone],
              pulse && 'animate-ping'
            )}
          />
          <span
            className={cn('relative inline-flex h-1.5 w-1.5 rounded-full', dotColors[tone])}
          />
        </span>
      )}
      {children}
    </span>
  );
}
