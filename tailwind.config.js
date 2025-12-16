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
        'neuro-blue': '#00D4FF',      // Jasnejšia modrá
        'neuro-purple': '#B565FF',    // Jasnejšia fialová  
        'neuro-green': '#00FF88',     // Jasnejšia zelená
        'neuro-pink': '#FF6B9D',
        'neuro-orange': '#FFB74A',
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
        'mono': ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
        'display': ['Orbitron', 'sans-serif'], // Keeping Orbitron available just in case, but not default
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite',
        'delay-75': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite 75ms',
        'delay-150': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite 150ms',
        'gradient-x': 'gradient-x 8s ease infinite',
      },
      keyframes: {
        'gradient-x': {
          '0%, 100%': {
            'background-size': '200% 200%',
            'background-position': 'left center',
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'right center',
          },
        },
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
