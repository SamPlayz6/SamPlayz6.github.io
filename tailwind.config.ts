import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Portfolio colors
        portfolio: {
          bg: {
            light: '#ffffff',
            dark: '#1a1a1a',
          },
          nav: {
            light: '#f8f8f8',
            dark: '#252525',
          },
          text: {
            light: '#333333',
            dark: '#ffffff',
          },
          link: {
            light: '#0066cc',
            dark: '#7F9CF5',
          },
          section: {
            light: '#ffffff',
            dark: '#252525',
            alt: '#f0f0f0',
          },
        },
        // Dashboard quadrant colors
        quadrant: {
          relationships: '#FF6B6B',  // Warm orange/coral
          parkour: '#4ECDC4',        // Electric blue/cyan
          work: '#9B59B6',           // Purple/violet
          travel: '#F9CA24',         // Sunset gold
        },
        // Dashboard status colors
        status: {
          thriving: '#2ECC71',       // Green
          attention: '#F39C12',      // Yellow
          neglected: '#E74C3C',      // Red
        },
        // Dashboard base colors
        dashboard: {
          bg: '#1a1a2e',
          card: '#252540',
          text: {
            primary: '#ffffff',
            secondary: '#a0a0a0',
            muted: '#666666',
          },
        },
      },
      fontFamily: {
        kalam: ['var(--font-kalam)', 'cursive', 'sans-serif'],
        handlee: ['var(--font-handlee)', 'cursive'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
}

export default config
