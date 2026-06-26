/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  safelist: [
    'bg-gold', 'bg-ice', 'bg-violet',
    'text-gold', 'text-ice', 'text-violet',
    'border-gold', 'border-ice', 'border-violet',
    'bg-green-400', 'bg-green-500',
    'bg-yellow-400', 'bg-yellow-500',
    'bg-red-400', 'bg-red-500',
    'pulse-green', 'pulse-yellow', 'pulse-red',
    'glass-card', 'card-hover', 'kpi-value', 'topbar-glass', 'aurora-bg',
    'orb-1', 'orb-2', 'orb-3', 'scan-line',
  ],
  theme: {
    extend: {
      colors: {
        void:      '#080A0F',
        surface:   '#0D1019',
        edge:      '#1C1F28',
        gold:      '#C9A84C',
        'gold-bright': '#E8C97A',
        ice:       '#A8C4D4',
        violet:    '#7B5EA7',
        'text-main': '#E8EAF0',
        muted:     '#5A6070',
      },
      fontFamily: {
        syne:      ['Syne', 'sans-serif'],
        inter:     ['Inter', 'sans-serif'],
        jetbrains: ['"JetBrains Mono"', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-up':    'fadeUp 0.5s ease-out forwards',
        'drift':      'drift-1 18s ease-in-out infinite alternate',
      },
      keyframes: {
        fadeUp: {
          '0%':   { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      backgroundImage: {
        'gold-gradient':   'linear-gradient(135deg, #C9A84C, #E8C97A)',
        'aurora-gradient': 'radial-gradient(ellipse at 30% 20%, rgba(201,168,76,0.12) 0%, rgba(123,94,167,0.08) 50%, transparent 70%)',
      },
      boxShadow: {
        'gold-sm': '0 4px 16px rgba(201,168,76,0.2)',
        'gold-md': '0 8px 32px rgba(201,168,76,0.25)',
        'gold-lg': '0 16px 48px rgba(201,168,76,0.3)',
        'glass':   '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)',
      },
    },
  },
  plugins: [],
}
