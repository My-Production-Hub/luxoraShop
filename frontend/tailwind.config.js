/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        luxora: {
          pink: '#FF2E93',
          'pink-hover': '#E01E7B',
          'pink-light': '#FFF0F6',
          gold: '#D4AF37',
          'gold-light': '#FDF4DC',
          'gold-dark': '#B38F24',
          dark: '#0A0A0C',
          card: '#141418',
          border: '#27272A'
        }
      },
      fontFamily: {
        serif: ['Playfair Display', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif']
      }
    },
  },
  plugins: [],
};
