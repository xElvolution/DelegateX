'use client';

import Link from 'next/link';
import { ScrollReveal } from '@/components/animations/ScrollReveal';
import { Button } from '@/components/ui/Button';

export function LivePreview() {
  return (
    <section className="relative border-t border-white/5 bg-surface py-24">
      <div className="container-app">
        <ScrollReveal>
          <h2 className="mb-2 text-center text-3xl font-bold tracking-tighter md:text-4xl">
            Watch it work.
          </h2>
          <p className="mx-auto mb-12 max-w-md text-center text-sm text-muted">
            A real task. Live agents. One permission.
          </p>
        </ScrollReveal>

        {/* Preview card */}
        <ScrollReveal delay={0.15}>
          <div className="mx-auto max-w-4xl overflow-hidden rounded-2xl border border-white/10 bg-card shadow-2xl">
            {/* Title bar */}
            <div className="flex items-center gap-2 border-b border-white/5 px-4 py-3">
              <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
              <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
              <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
              <span className="ml-4 text-xs text-muted">DELEGATE — Main App</span>
            </div>

            {/* Three columns */}
            <div className="grid grid-cols-12 divide-x divide-white/5">
              {/* Left - Permission */}
              <div className="col-span-3 p-4">
                <div className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted">
                  Permission
                </div>
                <div className="rounded-lg border border-success/20 bg-success/5 p-3">
                  <div className="flex items-center gap-1.5">
                    <span className="dot-active" />
                    <span className="text-[11px] font-semibold text-success">ACTIVE</span>
                  </div>
                  <div className="mt-2 text-xs text-white/70">$10 USDC / hour</div>
                  <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-white/5">
                    <div className="h-full w-[74%] rounded-full bg-primary" />
                  </div>
                  <div className="mt-0.5 text-[10px] text-muted">$7.43 remaining</div>
                </div>
              </div>

              {/* Center - Task */}
              <div className="col-span-6 p-4">
                <div className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-muted">
                  Task
                </div>
                <div className="rounded-lg border border-white/10 bg-surface/50 p-3">
                  <div className="mono text-xs text-white/80">
                    &quot;Research the top 3 DeFi yields on Ethereum and summarize
                    them&quot;
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-primary opacity-60" />
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map((n) => (
                      <div
                        key={n}
                        className="flex h-8 w-14 items-center justify-center rounded border border-secondary/30 bg-secondary/10 text-[9px] text-secondary"
                      >
                        Agent {n}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right - Feed */}
              <div className="col-span-3 p-4">
                <div className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted">
                  Activity
                </div>
                <div className="space-y-1.5">
                  {[
                    { c: 'border-l-primary', t: 'Agent A spawned' },
                    { c: 'border-l-info', t: '$0.001 → DeFiLlama' },
                    { c: 'border-l-success', t: 'Agent A complete' },
                    { c: 'border-l-primary', t: 'Agent B spawned' },
                  ].map((item, i) => (
                    <div
                      key={i}
                      className={`border-l-2 ${item.c} bg-white/[0.02] py-1 pl-2 text-[10px] text-white/60`}
                    >
                      {item.t}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>

        <div className="mt-8 flex justify-center">
          <Link href="/app">
            <Button glow>Try it yourself</Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
