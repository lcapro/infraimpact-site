/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f6ff',
          100: '#e2edff',
          200: '#c4d8ff',
          300: '#9ab9ff',
          400: '#6f93ff',
          500: '#3d63f1',
          600: '#2b4bcd',
          700: '#213aa4',
          800: '#1d3185',
          900: '#1d2c6d'
        }
      }
    },
  },
  plugins: [],
};
