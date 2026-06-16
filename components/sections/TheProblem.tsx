'use client';

import { ScrollReveal } from '@/components/animations/ScrollReveal';

const OLD_WAY = [
  'Agent wants data - sign tx',
  'Agent needs to swap - sign tx',
  'Agent wants to rebalance - sign tx',
];

const NEW_WAY = [
  'Grant one permission (sign once)',
  'Set your budget and rules',
  'Agents work autonomously forever',
];

export function TheProblem() {
  return (
    <section className="relative border-t border-white/5 bg-surface py-24">
      <div className="container-app">
        <div className="grid gap-12 md:grid-cols-2 md:gap-16">
          {/* Left - Old way */}
          <ScrollReveal>
            <div>
              <h3 className="mb-8 text-xs font-semibold uppercase tracking-widest text-muted">
                The old way
              </h3>
              <ul className="space-y-5">
                {OLD_WAY.map((t) => (
                  <li key={t} className="flex items-start gap-3">
                    <span className="mt-0.5 text-lg text-danger">&#x2717;</span>
                    <span className="text-sm text-white/80">{t}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-6 text-sm font-medium text-muted">
                Wallet becomes a notification machine.
              </p>
            </div>
          </ScrollReveal>

          {/* Right - New way */}
          <ScrollReveal delay={0.15}>
            <div className="rounded-xl border border-primary/10 bg-primary/[0.03] p-6">
              <h3 className="mb-8 text-xs font-semibold uppercase tracking-widest text-primary">
                With DELEGATE
              </h3>
              <ul className="space-y-5">
                {NEW_WAY.map((t) => (
                  <li key={t} className="flex items-start gap-3">
                    <span className="mt-0.5 text-lg text-success">&#x2713;</span>
                    <span className="text-sm text-white/90">{t}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-6 text-sm font-medium text-primary">
                Your wallet becomes an autonomous economy.
              </p>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
