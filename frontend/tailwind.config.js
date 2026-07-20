/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Novaterra Apparel brand — from logo
        navy: {
          DEFAULT: '#0B1B33',
          50: '#E9ECF3',
          100: '#C9D2E4',
          200: '#9AACC9',
          300: '#6C86AE',
          400: '#3F6093',
          500: '#25406E',
          600: '#1A2F52',
          700: '#122340',
          800: '#0B1B33',
          900: '#060F1D',
        },
        gold: {
          DEFAULT: '#C9A227',
          50: '#FBF3DD',
          100: '#F6E7BA',
          200: '#EED28A',
          300: '#E5BD5C',
          400: '#D6AC3E',
          500: '#C9A227',
          600: '#A5811C',
          700: '#7C6115',
          800: '#54420E',
          900: '#2C2207',
        },
      },
      fontFamily: {
        display: ['"Playfair Display"', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
