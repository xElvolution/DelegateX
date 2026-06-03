'use client';

import { ScrollReveal } from '@/components/animations/ScrollReveal';
import { Card } from '@/components/ui/Card';

const TECH = [
  {
    name: 'MetaMask Smart Accounts Kit',
    desc: 'ERC-7715 + ERC-7710 permissions',
    color: '#F6851B',
    initials: 'MM',
  },
  {
    name: 'Venice AI',
    desc: 'Privacy-first Llama 3.3 70B inference',
    color: '#7C3AED',
    initials: 'VA',
  },
  {
    name: '1Shot Relayer',
    desc: 'Permissionless ERC-7710 relay',
    color: '#3B82F6',
    initials: '1S',
  },
  {
    name: 'x402 Protocol',
    desc: 'Machine-to-machine payments',
    color: '#00FF87',
    initials: 'x4',
  },
  {
    name: 'Ethereum',
    desc: 'Smart contract execution layer',
    color: '#627EEA',
    initials: 'ET',
  },
  {
    name: 'RainbowKit',
    desc: 'Seamless wallet connection',
    color: '#FF6B6B',
    initials: 'RK',
  },
];

export function TechStack() {
  return (
    <section className="relative py-24">
      <div className="container-app">
        <ScrollReveal>
          <h2 className="mb-12 text-center text-3xl font-bold tracking-tighter md:text-4xl">
            Built on the best.
          </h2>
        </ScrollReveal>

        <div className="mx-auto grid max-w-4xl gap-4 md:grid-cols-3">
          {TECH.map((t, i) => (
            <ScrollReveal key={t.name} delay={i * 0.07}>
              <Card hover className="flex items-start gap-4 p-5">
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-xs font-bold"
                  style={{
                    backgroundColor: `${t.color}15`,
                    color: t.color,
                    border: `1px solid ${t.color}30`,
                  }}
                >
                  {t.initials}
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">{t.name}</div>
                  <div className="mt-0.5 text-xs text-muted">{t.desc}</div>
                </div>
              </Card>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
