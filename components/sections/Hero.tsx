'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { AgentNetwork } from '@/components/animations/AgentNetwork';
import { TextSplit } from '@/components/animations/TextSplit';
import { CounterAnimation } from '@/components/animations/CounterAnimation';
import { MagneticButton } from '@/components/animations/MagneticButton';
import { Badge } from '@/components/ui/Badge';

const STATS = [
  { label: 'Tasks Completed', value: 2847, prefix: '', suffix: '', decimals: 0 },
  { label: 'Total Agents Spawned', value: 11388, prefix: '', suffix: '', decimals: 0 },
  { label: 'USDC Processed', value: 47293, prefix: '$', suffix: '', decimals: 0 },
  { label: 'Avg Signatures Per Task', value: 1, prefix: '', suffix: '', decimals: 0 },
];

function scrollToHowItWorks() {
  document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export function Hero() {
  return (
    <section className="relative flex min-h-[85vh] flex-col items-center justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="grid-bg absolute inset-0" />
        <AgentNetwork className="absolute inset-0 h-full w-full opacity-50" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-bg" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center px-6 text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Badge tone="orange" dot size="md" className="mb-8">
            MetaMask Smart Accounts Kit
          </Badge>
        </motion.div>

        {/* Headline */}
        <div className="mb-6">
          <TextSplit
            text="One permission."
            as="h1"
            className="block text-[clamp(3.5rem,9vw,7rem)] font-bold leading-[0.95] tracking-tightest text-white"
            stagger={0.02}
          />
          <TextSplit
            text="Infinite agents."
            as="h1"
            className="block text-[clamp(3.5rem,9vw,7rem)] font-bold leading-[0.95] tracking-tightest text-gradient"
            stagger={0.02}
            delay={0.3}
          />
        </div>

        {/* Subheadline */}
        <motion.p
          className="mb-10 max-w-[540px] text-[clamp(1rem,2vw,1.2rem)] leading-relaxed text-muted"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.7 }}
        >
          Grant DELEGATE a spending limit.
          <br />
          Watch AI agents coordinate, pay, and deliver.
          <br />
          You sign once. They handle everything.
        </motion.p>

        {/* CTAs */}
        <motion.div
          className="flex flex-wrap items-center justify-center gap-4"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.9 }}
        >
          <Link href="/app">
            <MagneticButton
              as="div"
              className="inline-flex h-12 cursor-pointer items-center justify-center rounded-[10px] bg-gradient-to-br from-primary to-primary-dark px-8 text-sm font-bold text-white shadow-glow transition-shadow hover:shadow-glow-lg"
            >
              Open App
            </MagneticButton>
          </Link>
          <MagneticButton
            as="button"
            onClick={scrollToHowItWorks}
            className="inline-flex h-12 cursor-pointer items-center justify-center rounded-[10px] border border-white/10 bg-transparent px-8 text-sm font-medium text-white transition-colors hover:border-white/25 hover:bg-white/5"
          >
            How It Works
          </MagneticButton>
        </motion.div>
      </div>

      {/* Stats bar */}
      <motion.div
        className="absolute inset-x-0 bottom-0 z-10 border-t border-white/5 glass"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 1.2 }}
      >
        <div className="container-app grid grid-cols-2 gap-4 py-5 md:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.label} className="text-center">
              <div className="mono text-xl font-bold tracking-tight text-white md:text-2xl">
                <CounterAnimation
                  to={s.value}
                  prefix={s.prefix}
                  suffix={s.suffix}
                  decimals={s.decimals}
                  format={
                    s.value > 999
                      ? (n) =>
                          `${s.prefix}${n.toLocaleString('en-US', {
                            maximumFractionDigits: 0,
                          })}${s.suffix}`
                      : undefined
                  }
                />
              </div>
              <div className="mt-0.5 text-xs text-muted">{s.label}</div>
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
