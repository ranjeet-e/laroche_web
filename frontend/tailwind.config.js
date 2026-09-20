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
        // Cafe Core Palette
        espresso: {
          DEFAULT: '#231F20', // Espresso / Near Black
          pure: '#231F20',
          dark: '#1A1718',    // Deep dark background
          card: '#2B2421',    // Dark mode card
          elevated: '#362E2A',
          light: '#3C3430',
        },
        copper: {
          DEFAULT: '#4A3B32', // Burnt Copper / Dark Chocolate
          dark: '#3A2E26',
          border: '#4A3B32',
          light: '#5E4B40',
        },
        caramel: {
          DEFAULT: '#9F7A60', // Warm Taupe / Caramel
          hover: '#87644C',
          active: '#74533C',
          light: '#E8D8CD',
          subtle: '#F4ECE6',
        },
        cream: {
          DEFAULT: '#F5EBE6', // Sandy Beige / Pale Cream
          surface: '#FFFFFF',
          card: '#FFFFFF',
          border: '#E5D7D0',
          darkBorder: '#4A3B32',
        },
        // Semantic Compatibility Aliases
        oat: {
          DEFAULT: '#F5EBE6',
          light: '#FAF5F2',
          dark: '#EDE0D8',
          surface: '#FFFFFF',
          night: '#1A1718',
        },
        terracotta: {
          DEFAULT: '#9F7A60',
          hover: '#87644C',
          light: '#F5EBE6',
          dark: '#B48D71',
        },
        taupe: {
          DEFAULT: '#6B5B52',
          light: '#8F7E75',
          muted: '#B0A198',
          dark: '#C5B4A8',
        },
        honey: {
          DEFAULT: '#9F7A60',
          light: '#F5EBE6',
          dark: '#87644C',
        },
        matcha: {
          DEFAULT: '#3E6B48',
          light: '#EAF3EC',
          dark: '#2A4E33',
        },
      },
      fontFamily: {
        sans: ['"Inter"', 'system-ui', '-apple-system', 'sans-serif'],
        body: ['"Inter"', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['"Fraunces"', 'Georgia', 'serif'],
        serif: ['"Fraunces"', 'Georgia', 'serif'],
        price: ['"Fraunces"', 'Georgia', 'serif'],
      },
      fontSize: {
        'hero': ['clamp(2.6rem, 5vw + 1rem, 4.4rem)', { lineHeight: '1.12', letterSpacing: '-0.02em' }],
        'section-head': ['clamp(1.9rem, 3vw + 0.5rem, 2.6rem)', { lineHeight: '1.2', letterSpacing: '-0.015em' }],
        'card-title': ['clamp(1.08rem, 1.2vw + 0.5rem, 1.5rem)', { lineHeight: '1.3', letterSpacing: '-0.01em' }],
      },
      boxShadow: {
        'warm-sm': '0 2px 8px rgba(35, 31, 32, 0.04)',
        'warm-md': '0 4px 16px rgba(35, 31, 32, 0.07)',
        'warm-lg': '0 10px 30px rgba(35, 31, 32, 0.09), 0 2px 8px rgba(35, 31, 32, 0.04)',
        'warm-xl': '0 20px 40px rgba(35, 31, 32, 0.12), 0 4px 12px rgba(35, 31, 32, 0.04)',
        'glow-terracotta': '0 4px 20px rgba(159, 122, 96, 0.35)',
        'dark-card': '0 4px 24px rgba(0, 0, 0, 0.4), 0 1px 4px rgba(0, 0, 0, 0.3)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
    },
  },
  plugins: [],
};

