'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { WalletButton } from './WalletButton';
import { Button } from '@/components/ui/Button';

const NAV = [
  { label: 'How It Works', href: '#how-it-works', anchor: true },
  { label: 'Tech', href: '#tech', anchor: false },
] as const;

function scrollTo(id: string) {
  document.getElementById(id.replace('#', ''))?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export function Header() {
  const path = usePathname();
  if (path !== '/') return null;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/5 glass">
      <div className="container-app flex h-14 items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <Image src="/logo.png" alt="DelegateX" width={32} height={32} className="rounded-lg" priority />
          <span className="text-sm font-bold tracking-tightest text-white">DELEGATE</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV.map((item) => (
            <button
              key={item.href}
              type="button"
              onClick={() => scrollTo(item.href)}
              className="rounded-md px-3 py-1.5 text-sm text-muted transition-colors hover:bg-white/5 hover:text-white"
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link href="/app" className="hidden sm:block">
            <Button variant="primary" size="sm">
              Open App
            </Button>
          </Link>
          <WalletButton />
        </div>
      </div>
    </header>
  );
}
