'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import gsap from 'gsap';

export interface MagneticButtonProps {
  children: ReactNode;
  className?: string;
  strength?: number;
  as?: 'a' | 'button' | 'div';
  href?: string;
  onClick?: (e: React.MouseEvent) => void;
}

export function MagneticButton({
  children,
  className,
  strength = 0.3,
  as: Tag = 'button',
  href,
  onClick,
}: MagneticButtonProps) {
  const ref = useRef<HTMLElement>(null);
  const inner = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const el = ref.current;
    const innerEl = inner.current;
    if (!el || !innerEl) return;

    const xTo = gsap.quickTo(el, 'x', { duration: 0.6, ease: 'elastic.out(1, 0.4)' });
    const yTo = gsap.quickTo(el, 'y', { duration: 0.6, ease: 'elastic.out(1, 0.4)' });
    const xInner = gsap.quickTo(innerEl, 'x', {
      duration: 0.6,
      ease: 'elastic.out(1, 0.4)',
    });
    const yInner = gsap.quickTo(innerEl, 'y', {
      duration: 0.6,
      ease: 'elastic.out(1, 0.4)',
    });

    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      xTo(x * strength);
      yTo(y * strength);
      xInner(x * strength * 0.5);
      yInner(y * strength * 0.5);
    };
    const onLeave = () => {
      xTo(0);
      yTo(0);
      xInner(0);
      yInner(0);
    };

    el.addEventListener('mousemove', onMove);
    el.addEventListener('mouseleave', onLeave);
    return () => {
      el.removeEventListener('mousemove', onMove);
      el.removeEventListener('mouseleave', onLeave);
    };
  }, [strength]);

  if (Tag === 'a') {
    return (
      <a
        ref={ref as unknown as React.Ref<HTMLAnchorElement>}
        className={className}
        onClick={onClick}
        href={href}
      >
        <span ref={inner} className="inline-flex items-center justify-center">
          {children}
        </span>
      </a>
    );
  }
  if (Tag === 'div') {
    return (
      <div
        ref={ref as unknown as React.Ref<HTMLDivElement>}
        className={className}
        onClick={onClick}
      >
        <span ref={inner} className="inline-flex items-center justify-center">
          {children}
        </span>
      </div>
    );
  }
  return (
    <button
      ref={ref as unknown as React.Ref<HTMLButtonElement>}
      className={className}
      onClick={onClick}
    >
      <span ref={inner} className="inline-flex items-center justify-center">
        {children}
      </span>
    </button>
  );
}
