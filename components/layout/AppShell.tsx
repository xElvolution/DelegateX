'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { WalletButton } from './WalletButton';
import { Badge } from '@/components/ui/Badge';
import { useWallet } from '@/hooks/useWallet';

const APP_MENU = [
  {
    label: 'Delegate',
    href: '/app',
    description: 'Run tasks',
    icon: (
      <svg width="18" height="18" fill="none" viewBox="0 0 18 18">
        <path
          d="M3 5.5h12M3 9h8M3 12.5h10"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    label: 'Agents',
    href: '/app/agents',
    description: 'The swarm',
    icon: (
      <svg width="18" height="18" fill="none" viewBox="0 0 18 18">
        <circle cx="9" cy="4" r="2.2" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="4" cy="13" r="2.2" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="14" cy="13" r="2.2" stroke="currentColor" strokeWidth="1.5" />
        <path d="M8 6 5 11M10 6l3 5" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    label: 'Activity',
    href: '/app/activity',
    description: 'On-chain feed',
    icon: (
      <svg width="18" height="18" fill="none" viewBox="0 0 18 18">
        <path
          d="M2 9h3l2-5 4 10 2-5h3"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    label: 'Wallet',
    href: '/app/wallet',
    description: 'Balances & faucet',
    icon: (
      <svg width="18" height="18" fill="none" viewBox="0 0 18 18">
        <rect x="2" y="4" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.5" />
        <path d="M12 9h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    label: 'Dashboard',
    href: '/app/dashboard',
    description: 'History & stats',
    icon: (
      <svg width="18" height="18" fill="none" viewBox="0 0 18 18">
        <rect x="2" y="2" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" />
        <rect x="10" y="2" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" />
        <rect x="2" y="10" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" />
        <rect x="10" y="10" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
] as const;

const demoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

export function AppShell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const { authenticated } = useWallet();

  const pageTitle =
    path === '/app/dashboard'
      ? 'Dashboard'
      : path.startsWith('/app/agents')
        ? 'Agents'
        : path.startsWith('/app/activity')
          ? 'Activity'
          : path.startsWith('/app/wallet')
            ? 'Wallet'
            : path.startsWith('/app/task')
              ? 'Task'
              : 'Delegate';

  return (
    <div className="flex min-h-screen bg-bg">
      {/* Sidebar */}
      <aside className="hidden w-[220px] shrink-0 flex-col border-r border-white/5 bg-surface/50 lg:flex">
        <div className="border-b border-white/5 p-4">
          <Link href="/app" className="flex items-center gap-2.5">
            <Image src="/logo.png" alt="DELEGATE" width={28} height={28} className="rounded-md" />
            <span className="text-sm font-bold tracking-tightest">DELEGATE</span>
          </Link>
          <p className="mt-2 text-[10px] uppercase tracking-widest text-muted">App</p>
        </div>

        <nav className="flex-1 space-y-1 p-3">
          {APP_MENU.map((item) => {
            const active =
              item.href === '/app'
                ? path === '/app'
                : path.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors',
                  active
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted hover:bg-white/5 hover:text-white'
                )}
              >
                <span className={active ? 'text-primary' : 'text-white/50'}>{item.icon}</span>
                <div>
                  <div className="text-sm font-medium">{item.label}</div>
                  <div className="text-[10px] text-muted">{item.description}</div>
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="space-y-2 border-t border-white/5 p-3">
          <Link
            href="/"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-muted transition-colors hover:bg-white/5 hover:text-white"
          >
            ← Back to website
          </Link>
        </div>
      </aside>

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-white/5 bg-bg/80 px-4 backdrop-blur-xl lg:px-6">
          <div className="flex items-center gap-3">
            {/* Mobile menu links */}
            <div className="flex gap-1 lg:hidden">
              {APP_MENU.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'rounded-md px-2.5 py-1 text-xs font-medium',
                    (item.href === '/app' ? path === '/app' : path.startsWith(item.href))
                      ? 'bg-primary/15 text-primary'
                      : 'text-muted'
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </div>
            <h1 className="hidden text-sm font-semibold tracking-tight lg:block">{pageTitle}</h1>
            {demoMode && !authenticated && (
              <Badge tone="orange" dot pulse size="sm">
                Demo
              </Badge>
            )}
            {authenticated && (
              <Badge tone="green" dot size="sm">
                Live
              </Badge>
            )}
          </div>
          <WalletButton />
        </header>

        <main className="flex-1 overflow-auto p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
