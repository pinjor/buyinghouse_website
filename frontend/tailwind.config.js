/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Novaterra Apparel brand
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
        // Luxury Customizer Palette
        itailor: {
          dark: '#0A111C',       // Main deep dark navy/espresso workspace backdrop
          panel: '#111A29',      // Dark panel canvas container fill
          sidebar: '#0E1724',    // Left step sidebar fill
          card: '#162235',       // Swatch & Option tile background
          cardBorder: '#23334B', // Card border line
          gold: '#D4AF37',       // Metallic gold highlight accent
          goldLight: '#F3E5AB',  // Gold text label
          goldHover: '#E5BD5C',  // Active selected tile border glow
          cyan: '#2EB2E2',       // Action highlight CTA blue button
          cyanHover: '#229ECF',  // Action highlight CTA hover
          red: '#B82E2E',        // Promo / Badge accent
          cream: '#F4EFE6',      // Alabaster white text accent
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

