'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';

export interface PermissionFlowProps {
  className?: string;
}

export function PermissionFlow({ className }: PermissionFlowProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const svg = svgRef.current;
    if (!svg) return;
    const paths = svg.querySelectorAll<SVGPathElement>('.flow-line');

    const ctx = gsap.context(() => {
      paths.forEach((p, i) => {
        const len = p.getTotalLength();
        p.style.strokeDasharray = `${len}`;
        p.style.strokeDashoffset = `${len}`;
      });

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              gsap.to(paths, {
                strokeDashoffset: 0,
                duration: 1.5,
                stagger: 0.15,
                ease: 'power2.inOut',
              });
              observer.disconnect();
            }
          });
        },
        { threshold: 0.3 }
      );
      observer.observe(svg);
    }, svg);

    return () => ctx.revert();
  }, []);

  return (
    <svg
      ref={svgRef}
      className={className}
      viewBox="0 0 1000 80"
      fill="none"
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id="flow-grad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#F6851B" />
          <stop offset="50%" stopColor="#EA580C" />
          <stop offset="100%" stopColor="#7C3AED" />
        </linearGradient>
      </defs>
      <path
        className="flow-line"
        d="M 0 40 L 1000 40"
        stroke="url(#flow-grad)"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
