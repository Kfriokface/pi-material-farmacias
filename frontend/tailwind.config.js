/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0e8d39',
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#0e8d39',
          600: '#0c7a32',
          700: '#0a662a',
          800: '#085222',
          900: '#064319',
        },
        'brand-dark': '#231f20',
      },
      fontFamily: {
        sans: ['Century Gothic', 'sans-serif'],
      },
    },
  },
  plugins: [],
}