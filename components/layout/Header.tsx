'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { WalletButton } from './WalletButton';
import { Badge } from '@/components/ui/Badge';

const NAV = [
  { label: 'App', href: '/app' },
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'How It Works', href: '/how-it-works' },
  { label: 'Docs', href: '/docs' },
] as const;

export function Header() {
  const path = usePathname();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/5 glass">
      <div className="container-app flex h-14 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <Image
            src="/logo.png"
            alt="DelegateX"
            width={32}
            height={32}
            className="rounded-lg"
            priority
          />
          <span className="text-sm font-bold tracking-tightest text-white">
            DELEGATE
          </span>
        </Link>

        {/* Nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {NAV.map((item) => {
            const active = path === item.href || path.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'rounded-md px-3 py-1.5 text-sm transition-colors',
                  active
                    ? 'bg-white/5 font-medium text-white'
                    : 'text-muted hover:text-white'
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Right */}
        <div className="flex items-center gap-3">
          {path.startsWith('/app') && (
            <Badge tone="orange" dot pulse>
              DEMO MODE
            </Badge>
          )}
          <WalletButton />
        </div>
      </div>
    </header>
  );
}
