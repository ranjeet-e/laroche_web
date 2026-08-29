/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        oat: {
          DEFAULT: '#FAF7F2',
          light: '#FDFBF8',
          dark: '#F0EAE1',
          surface: '#FFFFFF',
        },
        espresso: {
          DEFAULT: '#1A1615',
          light: '#2E2725',
          muted: '#4A403D',
        },
        taupe: {
          DEFAULT: '#706E6B',
          light: '#9E9C98',
          muted: '#B8B6B2',
        },
        terracotta: {
          DEFAULT: '#E76F51',
          hover: '#D65D3F',
          light: '#FFF0EB',
        },
        honey: {
          DEFAULT: '#D4A373',
          light: '#FAEDCD',
          dark: '#B98B5C',
        },
        matcha: {
          DEFAULT: '#2D6A4F',
          light: '#E8F5E9',
          dark: '#1B4332',
        },
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['"Playfair Display"', 'Georgia', 'serif'],
      },
      boxShadow: {
        'warm-sm': '0 2px 8px rgba(26, 22, 21, 0.04)',
        'warm-md': '0 4px 16px rgba(26, 22, 21, 0.06)',
        'warm-lg': '0 10px 30px rgba(26, 22, 21, 0.08), 0 2px 8px rgba(26, 22, 21, 0.04)',
        'warm-xl': '0 20px 40px rgba(26, 22, 21, 0.12), 0 4px 12px rgba(26, 22, 21, 0.04)',
        'glow-terracotta': '0 4px 20px rgba(231, 111, 81, 0.35)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
    },
  },
  plugins: [],
};
