/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eef1fb',
          100: '#d6dbf5',
          200: '#aab3ea',
          300: '#7d8adf',
          400: '#4a56c9',
          500: '#1c2694',
          600: '#02084b', // brand color — buttons, links, accents
          700: '#020640', // hover state
          800: '#010433',
          900: '#010226',
        },
      },
    },
  },
  plugins: [],
};