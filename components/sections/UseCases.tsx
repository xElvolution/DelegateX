'use client';

import { ScrollReveal } from '@/components/animations/ScrollReveal';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

const CASES = [
  {
    title: 'DeFi Research & Execution',
    prompt:
      'Research the top 3 DeFi yields on Ethereum and move $50 to the best one',
    agents: 4,
    cost: '$0.053',
    sigs: 1,
  },
  {
    title: 'Portfolio Monitoring',
    prompt:
      'Monitor my positions and alert me if any drop more than 10%',
    agents: 2,
    cost: 'ongoing',
    sigs: 1,
  },
  {
    title: 'Smart Batching',
    prompt:
      'Find the cheapest gas window today and batch my pending transactions',
    agents: 3,
    cost: '$0.02',
    sigs: 1,
  },
];

export function UseCases() {
  return (
    <section className="relative py-24">
      <div className="container-app">
        <ScrollReveal>
          <h2 className="mb-12 text-center text-3xl font-bold tracking-tighter md:text-4xl">
            What will you delegate?
          </h2>
        </ScrollReveal>

        <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-3">
          {CASES.map((c, i) => (
            <ScrollReveal key={c.title} delay={i * 0.1}>
              <Card hover padding="lg" className="flex flex-col">
                <h3 className="mb-4 text-base font-semibold">{c.title}</h3>
                <div className="mono mb-6 flex-1 rounded-lg border border-white/5 bg-surface/50 p-3 text-xs leading-relaxed text-white/70">
                  &quot;{c.prompt}&quot;
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone="purple">{c.agents} agents</Badge>
                  <Badge tone="muted">{c.cost}</Badge>
                  <Badge tone="orange">Signatures: {c.sigs}</Badge>
                </div>
              </Card>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
