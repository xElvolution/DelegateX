'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';

export interface TextSplitProps {
  text: string;
  className?: string;
  stagger?: number;
  delay?: number;
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span' | 'div';
  charClassName?: string;
}

export function TextSplit({
  text,
  className,
  stagger = 0.02,
  delay = 0,
  as: Tag = 'span',
  charClassName,
}: TextSplitProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const el = ref.current;
    if (!el) return;
    const chars = el.querySelectorAll('.split-char');
    const ctx = gsap.context(() => {
      gsap.from(chars, {
        y: 60,
        opacity: 0,
        rotateX: -30,
        duration: 0.9,
        ease: 'expo.out',
        stagger,
        delay,
      });
    }, el);
    return () => ctx.revert();
  }, [text, stagger, delay]);

  const words = text.split(' ');
  return (
    <Tag ref={ref as never} className={className} aria-label={text}>
      {words.map((word, wi) => (
        <span key={`${wi}-${word}`} className="inline-block whitespace-nowrap">
          {word.split('').map((ch, ci) => (
            <span
              key={`${wi}-${ci}`}
              aria-hidden
              className={`split-char ${charClassName ?? ''}`}
            >
              {ch}
            </span>
          ))}
          {wi < words.length - 1 && <span className="split-char">&nbsp;</span>}
        </span>
      ))}
    </Tag>
  );
}
