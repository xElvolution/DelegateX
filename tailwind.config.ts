import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './hooks/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: '#0A0A0F',
        surface: '#111118',
        card: '#16161F',
        border: 'rgba(255,255,255,0.07)',
        'border-hover': 'rgba(255,255,255,0.14)',
        metamask: '#F6851B',
        primary: '#F6851B',
        'primary-dark': '#EA580C',
        secondary: '#7C3AED',
        'secondary-dark': '#6D28D9',
        success: '#00FF87',
        danger: '#FF4444',
        info: '#3B82F6',
        muted: '#6B7280',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
      },
      letterSpacing: {
        tightest: '-0.04em',
        tighter: '-0.02em',
      },
      boxShadow: {
        glow: '0 0 40px rgba(246,133,27,0.3)',
        'glow-lg': '0 0 80px rgba(246,133,27,0.4)',
        'glow-purple': '0 0 40px rgba(124,58,237,0.3)',
        'glow-green': '0 0 40px rgba(0,255,135,0.3)',
        card: '0 1px 2px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.04)',
      },
      maxWidth: {
        container: '1200px',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        shimmer: 'shimmer 2s linear infinite',
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        gradient: 'gradient 8s ease infinite',
        'spin-slow': 'spin 8s linear infinite',
        'ping-slow': 'ping 3s cubic-bezier(0, 0, 0.2, 1) infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        gradient: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #F6851B 0%, #EA580C 100%)',
        'gradient-accent': 'linear-gradient(135deg, #F6851B 0%, #7C3AED 100%)',
        'gradient-mesh':
          'radial-gradient(at 0% 0%, rgba(246,133,27,0.15) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(124,58,237,0.15) 0px, transparent 50%)',
        'grid-pattern':
          'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
      },
      backgroundSize: {
        grid: '60px 60px',
      },
    },
  },
  plugins: [],
};

export default config;
