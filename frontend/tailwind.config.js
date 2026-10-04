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
        // Core Palette Tokens
        cream: {
          DEFAULT: '#F2EDE2', // Primary background — warm, not stark white
          2: '#E9E0CC',       // Secondary surface — cards, process block, form fields
          surface: '#F2EDE2',
          card: '#E9E0CC',
          light: '#FAF7F2',
          border: '#DDD4C0',
        },
        ink: {
          DEFAULT: '#2A2A22', // Primary text, dark surfaces (nav-dark card, buttons)
          soft: '#5A5748',    // Secondary/body text — softer than pure ink
          dark: '#1C1C16',
          card: '#23231C',
          elevated: '#2F2F26',
        },
        rust: {
          DEFAULT: '#A6472B', // Primary accent — CTAs, eyebrow icon, price accents
          deep: '#7E351F',    // Hover state for rust, hero gradient depth
          hover: '#7E351F',
          light: '#F7ECE8',
          subtle: '#FAF0ED',
        },
        sage: {
          DEFAULT: '#78826B', // Secondary accent — used sparingly in illustrations
          light: '#EFF2EC',
          dark: '#555D4B',
        },
        wheat: {
          DEFAULT: '#C9A66B', // Tertiary accent — dish-card art, the "dot" icon in hero
          light: '#F7F0E4',
          dark: '#A48248',
        },

        // Semantic Compatibility Aliases
        espresso: {
          DEFAULT: '#2A2A22',
          pure: '#2A2A22',
          dark: '#1C1C16',
          card: '#23231C',
          elevated: '#2F2F26',
          light: '#3B3B30',
        },
        copper: {
          DEFAULT: '#7E351F',
          dark: '#2A2A22',
          border: '#DDD4C0',
          light: '#A6472B',
        },
        caramel: {
          DEFAULT: '#A6472B',
          hover: '#7E351F',
          active: '#5E2615',
          light: '#E9E0CC',
          subtle: '#F2EDE2',
        },
        oat: {
          DEFAULT: '#F2EDE2',
          light: '#FAF7F2',
          dark: '#E9E0CC',
          surface: '#F2EDE2',
          night: '#1A1A14',
        },
        terracotta: {
          DEFAULT: '#A6472B',
          hover: '#7E351F',
          light: '#F2EDE2',
          dark: '#C97257',
        },
        taupe: {
          DEFAULT: '#5A5748',
          light: '#78826B',
          muted: '#8D897A',
          dark: '#C4BFB2',
        },
        honey: {
          DEFAULT: '#C9A66B',
          light: '#F7F0E4',
          dark: '#A6472B',
        },
        matcha: {
          DEFAULT: '#78826B',
          light: '#EFF2EC',
          dark: '#555D4B',
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
        'glow-terracotta': '0 4px 14px rgba(35, 31, 32, 0.08)',
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

