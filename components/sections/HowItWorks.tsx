'use client';

import { ScrollReveal } from '@/components/animations/ScrollReveal';
import { PermissionFlow } from '@/components/animations/PermissionFlow';

const STEPS = [
  {
    num: '01',
    icon: (
      <svg width="28" height="28" fill="none" viewBox="0 0 28 28">
        <path
          d="M17.5 12.25V9.625A3.625 3.625 0 0 0 13.875 6v0A3.625 3.625 0 0 0 10.25 9.625v2.625M13.875 16.625v1.75M11.375 22h5a2.625 2.625 0 0 0 2.625-2.625v-4.75A2.625 2.625 0 0 0 16.375 12h-5A2.625 2.625 0 0 0 8.75 14.625v4.75A2.625 2.625 0 0 0 11.375 22Z"
          stroke="#F6851B"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    ),
    title: 'Grant permission',
    tag: 'ERC-7715',
    desc: 'Tell DELEGATE what it can spend, on what contracts, for how long. One signature.',
  },
  {
    num: '02',
    icon: (
      <svg width="28" height="28" fill="none" viewBox="0 0 28 28">
        <path
          d="M7.875 14H20.125M7.875 9.625H15.75M7.875 18.375H12.25"
          stroke="#ffffff"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    ),
    title: 'Give it a task',
    tag: 'Natural language',
    desc: 'Type anything. Research yields, execute a swap, monitor your positions.',
  },
  {
    num: '03',
    icon: (
      <svg width="28" height="28" fill="none" viewBox="0 0 28 28">
        <circle cx="14" cy="9" r="2.5" stroke="#7C3AED" strokeWidth="1.5" />
        <circle cx="8" cy="19" r="2.5" stroke="#7C3AED" strokeWidth="1.5" />
        <circle cx="20" cy="19" r="2.5" stroke="#7C3AED" strokeWidth="1.5" />
        <path d="M14 11.5V16M10 17.5L12.5 13.5M18 17.5L15.5 13.5" stroke="#7C3AED" strokeWidth="1.2" />
      </svg>
    ),
    title: 'Sub-agents coordinate',
    tag: 'ERC-7710',
    desc: 'DELEGATE spawns specialized agents, each with a narrower permission slice, via ERC-7710 redelegation.',
  },
  {
    num: '04',
    icon: (
      <svg width="28" height="28" fill="none" viewBox="0 0 28 28">
        <path
          d="M7 14.5L11.5 19L21 9"
          stroke="#00FF87"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    title: 'Result delivered',
    tag: 'x402 + 1Shot',
    desc: 'Agents pay their own way via x402 and 1Shot. You get the result. You signed: 1 transaction.',
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="scroll-mt-16 relative py-24">
      <div className="container-app">
        <ScrollReveal>
          <h2 className="mb-4 text-center text-3xl font-bold tracking-tighter md:text-4xl">
            Four steps to autonomy.
          </h2>
        </ScrollReveal>

        {/* Flow line (desktop) */}
        <div className="relative mt-8 hidden md:block">
          <PermissionFlow className="mx-auto h-2 w-full max-w-3xl" />
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-4 md:gap-4">
          {STEPS.map((step, i) => (
            <ScrollReveal key={step.num} delay={i * 0.1}>
              <div className="card-surface card-hover flex flex-col p-5">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/5">
                    {step.icon}
                  </div>
                  <span className="mono text-[11px] text-muted">{step.num}</span>
                </div>
                <h3 className="mb-1 text-base font-semibold tracking-tight">
                  {step.title}
                </h3>
                <span className="mono mb-3 inline-block rounded border border-white/10 bg-white/5 px-1.5 py-0.5 text-[10px] text-muted">
                  {step.tag}
                </span>
                <p className="text-sm leading-relaxed text-muted">{step.desc}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
