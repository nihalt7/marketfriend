/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#070a0f',
        foreground: '#f8fafc',
        card: {
          DEFAULT: '#0d131f',
          foreground: '#f8fafc',
          border: '#1e293b'
        },
        bullish: {
          DEFAULT: '#10b981', // emerald-500
          light: '#34d399',
          glow: 'rgba(16, 185, 129, 0.25)',
          dark: '#064e3b'
        },
        bearish: {
          DEFAULT: '#ef4444', // rose-500
          light: '#f87171',
          glow: 'rgba(239, 68, 68, 0.25)',
          dark: '#7f1d1d'
        },
        warning: {
          DEFAULT: '#f59e0b', // amber-500
          glow: 'rgba(245, 158, 11, 0.25)'
        },
        terminal: {
          darker: '#05070b',
          dark: '#0b0f17',
          panel: '#101622',
          border: '#1a2333',
          borderLight: '#243047',
          accent: '#38bdf8',
          accentGlow: 'rgba(56, 189, 248, 0.15)',
          muted: '#94a3b8'
        }
      },
      fontFamily: {
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'Liberation Mono', 'Courier New', 'monospace'],
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif']
      }
    },
  },
  plugins: [],
}

