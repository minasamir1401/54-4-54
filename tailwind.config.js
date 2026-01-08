/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'deep-slate': {
          900: '#0E141B', // Main Background
          800: '#151D26', // Secondary Background
          700: '#1C2530', // Tertiary Background
          border: '#243041',
        },
        'ice-mint': {
          DEFAULT: '#7FFFD4', // Primary
          hover: '#B2FFF0',
          active: '#4EDFC2',
        },
        'text': {
          main: '#FFFFFF',
          secondary: '#C7D0DB',
          muted: '#8A94A6',
        },
        'rating': '#FACC15',
        'kids': {
          blue: '#4FC3F7',
          yellow: '#FFF176',
          green: '#81C784',
          pink: '#FF8A80',
          bg: '#FFFFFF',
        },
      },
      fontFamily: {
        outfit: ['Outfit', 'sans-serif'],
        cairo: ['Cairo', 'sans-serif'],
      },
      screens: {
        'xs': '475px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
      },
      spacing: {
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-left': 'env(safe-area-inset-left)',
        'safe-right': 'env(safe-area-inset-right)',
      },
    },
  },
  plugins: [],
}
