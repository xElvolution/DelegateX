'use client';

import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success' | 'outline';
type Size = 'sm' | 'md' | 'lg' | 'xl';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  glow?: boolean;
  fullWidth?: boolean;
}

const sizes: Record<Size, string> = {
  sm: 'h-8 px-3 text-xs',
  md: 'h-10 px-4 text-sm',
  lg: 'h-12 px-6 text-sm',
  xl: 'h-14 px-8 text-base',
};

const variants: Record<Variant, string> = {
  primary:
    'bg-gradient-to-br from-[#F6851B] to-[#EA580C] text-white font-bold hover:brightness-110 active:brightness-95 disabled:opacity-50',
  secondary:
    'bg-secondary text-white font-semibold hover:brightness-110 active:brightness-95 disabled:opacity-50',
  ghost:
    'bg-transparent text-white border border-white/10 hover:border-white/25 hover:bg-white/5',
  outline:
    'bg-transparent text-white border border-white/20 hover:border-primary hover:text-primary',
  danger:
    'bg-danger/15 text-danger border border-danger/30 hover:bg-danger/25 hover:border-danger/50',
  success:
    'bg-success/15 text-success border border-success/30 hover:bg-success/25 hover:border-success/50',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    className,
    variant = 'primary',
    size = 'md',
    loading = false,
    glow = false,
    fullWidth = false,
    disabled,
    children,
    ...props
  },
  ref
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-[10px] transition-all duration-200 disabled:cursor-not-allowed',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-bg',
        sizes[size],
        variants[variant],
        glow && variant === 'primary' && 'shadow-glow hover:shadow-glow-lg',
        fullWidth && 'w-full',
        className
      )}
      {...props}
    >
      {loading ? (
        <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent" />
      ) : (
        children
      )}
    </button>
  );
});
