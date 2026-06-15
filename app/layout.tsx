import type { Metadata, Viewport } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const mono = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-mono',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://delegate.app'),
  title: {
    default: 'DELEGATE — One permission. Infinite agents.',
    template: '%s · DELEGATE',
  },
  description:
    'Grant DELEGATE a spending limit. Watch AI agents coordinate, pay, and deliver. You sign once. They handle everything.',
  keywords: [
    'MetaMask Smart Accounts',
    'ERC-7715',
    'ERC-7710',
    'Venice AI',
    '1Shot',
    'x402',
    'autonomous agents',
    'Web3 AI',
  ],
  authors: [{ name: 'DELEGATE' }],
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.png', type: 'image/png' },
    ],
    apple: '/logo.png',
  },
  openGraph: {
    title: 'DELEGATE — One permission. Infinite agents.',
    description:
      'Autonomous wallet intelligence, powered by MetaMask Smart Accounts Kit.',
    url: 'https://delegate.app',
    siteName: 'DELEGATE',
    type: 'website',
    images: [{ url: '/og-image.png', width: 1024, height: 1024, alt: 'DelegateX' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DELEGATE',
    description: 'One permission. Infinite agents.',
  },
};

export const viewport: Viewport = {
  themeColor: '#0A0A0F',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${mono.variable}`}>
      <body className="min-h-screen bg-bg text-white antialiased">
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#16161F',
              color: '#fff',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: '12px',
              fontSize: '14px',
            },
            success: { iconTheme: { primary: '#00FF87', secondary: '#16161F' } },
            error: { iconTheme: { primary: '#FF4444', secondary: '#16161F' } },
          }}
        />
      </body>
    </html>
  );
}
