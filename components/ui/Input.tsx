import { forwardRef, type InputHTMLAttributes, type TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'prefix'> {
  error?: string;
  hint?: string;
  label?: string;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, error, hint, label, prefix, suffix, id, ...props },
  ref
) {
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="mb-1.5 block text-xs font-medium text-muted">
          {label}
        </label>
      )}
      <div
        className={cn(
          'flex h-11 w-full items-center rounded-[10px] border bg-surface/60 px-3 transition-colors',
          error
            ? 'border-danger/50 focus-within:border-danger'
            : 'border-white/10 focus-within:border-primary',
          className
        )}
      >
        {prefix && <span className="mr-2 text-muted">{prefix}</span>}
        <input
          ref={ref}
          id={id}
          className="h-full w-full bg-transparent text-sm text-white placeholder:text-muted focus:outline-none"
          {...props}
        />
        {suffix && <span className="ml-2 text-muted">{suffix}</span>}
      </div>
      {(hint || error) && (
        <p className={cn('mt-1.5 text-xs', error ? 'text-danger' : 'text-muted')}>
          {error || hint}
        </p>
      )}
    </div>
  );
});

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
  hint?: string;
  label?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { className, error, hint, label, id, ...props },
  ref
) {
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="mb-1.5 block text-xs font-medium text-muted">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        id={id}
        className={cn(
          'w-full resize-none rounded-[12px] border bg-surface/60 px-5 py-4 text-sm text-white placeholder:text-muted focus:outline-none transition-colors',
          error
            ? 'border-danger/50 focus:border-danger'
            : 'border-white/10 focus:border-primary',
          className
        )}
        {...props}
      />
      {(hint || error) && (
        <p className={cn('mt-1.5 text-xs', error ? 'text-danger' : 'text-muted')}>
          {error || hint}
        </p>
      )}
    </div>
  );
});
