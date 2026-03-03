/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        black: {
          900: '#010101',
          800: '#0a0a0c',
          700: '#111116',
        },
        emerald: {
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          glow: 'rgba(16,185,129,0.25)',
        },
        blue: {
          400: '#60a5fa',
          500: '#3b82f6',
          glow: 'rgba(96,165,250,0.25)',
        },
        glass: {
          white: 'rgba(255,255,255,0.04)',
          border: 'rgba(255,255,255,0.08)',
        },
      },
      backdropBlur: {
        xs: '4px',
        sm: '8px',
        md: '16px',
        lg: '24px',
        xl: '32px',
      },
      boxShadow: {
        'glass': '0 8px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)',
        'glass-hover': '0 16px 64px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.08)',
        'accent-glow': '0 0 24px var(--color-accent-glow)',
        'accent-glow-lg': '0 0 48px var(--color-accent-glow)',
      },
      animation: {
        'heartbeat': 'heartbeat 1.2s ease-in-out infinite',
        'grain': 'grain 0.8s steps(1) infinite',
        'blob-drift': 'blob-drift-1 18s ease-in-out infinite alternate',
        'spin-slow': 'spin 8s linear infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '24px',
        '4xl': '32px',
      },
    },
  },
  plugins: [],
};
