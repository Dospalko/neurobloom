/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'neuro-dark': '#0F0F0F',
        'neuro-blue': '#4A9EFF',
        'neuro-purple': '#9B6AFF',
        'neuro-green': '#5FE88C',
        'neuro-pink': '#FF6B9D',
        'neuro-orange': '#FFB74A',
      },
      fontFamily: {
        'sans': ['Orbitron', 'system-ui', 'sans-serif'],
        'mono': ['Orbitron', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite',
        'delay-75': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite 75ms',
        'delay-150': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite 150ms',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        glow: {
          '0%, 100%': { opacity: '0.5' },
          '50%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
