/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,jsx}",
    "./src/**/*.{js,jsx}",
    "./styles/**/*.{css}",
  ],
  theme: {
    extend: {
      /* --- Font families --- */
          fontFamily: {
              sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
              orbitron: ['var(--font-orbitron)', 'system-ui', 'sans-serif'],
          },

      /* --- Keyframes and animations --- */
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.8s ease-out forwards',
      },
    },
  },
  plugins: [],
}
