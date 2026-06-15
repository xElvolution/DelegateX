'use client';

import Link from 'next/link';
import { ScrollReveal } from '@/components/animations/ScrollReveal';
import { MagneticButton } from '@/components/animations/MagneticButton';

export function CTA() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.12] via-transparent to-secondary/[0.12]" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

      <div className="container-app relative py-24 text-center">
        <ScrollReveal>
          <h2 className="mb-4 text-3xl font-bold tracking-tighter md:text-5xl">
            Start delegating.
          </h2>
          <p className="mx-auto mb-10 max-w-md text-sm text-muted">
            Connect your wallet. Grant one permission.
            <br />
            Watch your agents work.
          </p>
          <Link href="/app">
            <MagneticButton
              as="div"
              className="inline-flex h-14 cursor-pointer items-center justify-center rounded-[12px] bg-gradient-to-br from-primary to-primary-dark px-10 text-base font-bold text-white shadow-glow transition-shadow hover:shadow-glow-lg"
            >
              Open App
            </MagneticButton>
          </Link>
        </ScrollReveal>
      </div>
    </section>
  );
}
