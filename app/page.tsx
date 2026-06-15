'use client';

import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Hero } from '@/components/sections/Hero';
import { TheProblem } from '@/components/sections/TheProblem';
import { HowItWorks } from '@/components/sections/HowItWorks';
import { TechStack } from '@/components/sections/TechStack';
import { UseCases } from '@/components/sections/UseCases';
import { CTA } from '@/components/sections/CTA';

export default function LandingPage() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <TheProblem />
        <HowItWorks />
        <TechStack />
        <UseCases />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
