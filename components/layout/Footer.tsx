import Link from 'next/link';

const LINKS = [
  { label: 'Open App', href: '/app' },
  { label: 'How It Works', href: '/#how-it-works' },
];

const TECH = ['MetaMask SDK', 'Venice AI', '1Shot', 'x402'];

export function Footer() {
  return (
    <footer className="border-t border-white/5 bg-bg py-12">
      <div className="container-app">
        <div className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary-dark text-xs font-black text-white">
                D
              </span>
              <span className="text-sm font-bold tracking-tightest">DELEGATE</span>
            </div>
            <p className="mt-3 max-w-xs text-sm text-muted">
              Autonomous wallet intelligence, powered by MetaMask Smart Accounts Kit.
            </p>
          </div>

          <nav className="flex flex-wrap gap-6">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-sm text-muted transition-colors hover:text-white"
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-2 text-xs text-muted">
          <span>Built with</span>
          {TECH.map((t, i) => (
            <span key={t}>
              <span className="text-white/70">{t}</span>
              {i < TECH.length - 1 && <span className="mx-1.5 text-white/20">&times;</span>}
            </span>
          ))}
        </div>

        <div className="mt-6 border-t border-white/5 pt-6 text-center text-xs text-muted">
          Submitted to MetaMask Smart Accounts Kit &times; 1Shot API &times; Venice AI Dev Cook Off
        </div>
      </div>
    </footer>
  );
}
