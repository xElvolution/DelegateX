import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  padding?: 'sm' | 'md' | 'lg' | 'none';
  glow?: 'orange' | 'purple' | 'green' | 'none';
}

const paddings = {
  none: '',
  sm: 'p-4',
  md: 'p-5',
  lg: 'p-6 md:p-8',
};

const glows = {
  none: '',
  orange: 'shadow-glow',
  purple: 'shadow-glow-purple',
  green: 'shadow-glow-green',
};

export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  { className, hover = false, padding = 'md', glow = 'none', children, ...props },
  ref
) {
  return (
    <div
      ref={ref}
      className={cn(
        'card-surface',
        paddings[padding],
        glows[glow],
        hover && 'card-hover',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});
