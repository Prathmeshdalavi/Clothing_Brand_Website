/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        pastel: { DEFAULT: '#B8DCE8', 100: '#E6F2F7', 200: '#D3E8F0', 300: '#B8DCE8', 400: '#94C6D8' },
        navy: { DEFAULT: '#243B53', 700: '#1B2E42', 600: '#2F4A68', 500: '#486581' },
        ivory: '#FAF9F6',
        charcoal: '#222222',
        mist: '#E9ECEF',
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 1px 2px rgba(36,59,83,.05), 0 8px 24px -8px rgba(36,59,83,.12)',
        lift: '0 2px 4px rgba(36,59,83,.06), 0 18px 40px -12px rgba(36,59,83,.22)',
      },
      keyframes: {
        marquee: { '0%': { transform: 'translateX(0)' }, '100%': { transform: 'translateX(-50%)' } },
        spin360: { to: { transform: 'rotate(360deg)' } },
      },
      animation: { marquee: 'marquee 40s linear infinite' },
    },
  },
  plugins: [],
}
