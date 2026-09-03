/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
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
          night: '#14100E',
        },
        espresso: {
          DEFAULT: '#1A1615',
          light: '#2E2725',
          muted: '#4A403D',
          dark: '#1F1916',
          card: '#29211D',
        },
        taupe: {
          DEFAULT: '#706E6B',
          light: '#9E9C98',
          muted: '#B8B6B2',
          dark: '#A89B91',
        },
        terracotta: {
          DEFAULT: '#E76F51',
          hover: '#D65D3F',
          light: '#FFF0EB',
          dark: '#E07A5F',
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
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['"Outfit"', '"Plus Jakarta Sans"', 'sans-serif'],
        serif: ['"Outfit"', '"Plus Jakarta Sans"', 'sans-serif'],
      },
      boxShadow: {
        'warm-sm': '0 2px 8px rgba(26, 22, 21, 0.04)',
        'warm-md': '0 4px 16px rgba(26, 22, 21, 0.06)',
        'warm-lg': '0 10px 30px rgba(26, 22, 21, 0.08), 0 2px 8px rgba(26, 22, 21, 0.04)',
        'warm-xl': '0 20px 40px rgba(26, 22, 21, 0.12), 0 4px 12px rgba(26, 22, 21, 0.04)',
        'glow-terracotta': '0 4px 20px rgba(231, 111, 81, 0.35)',
        'dark-card': '0 4px 20px rgba(0, 0, 0, 0.35), 0 1px 3px rgba(0, 0, 0, 0.2)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
    },
  },
  plugins: [],
};

