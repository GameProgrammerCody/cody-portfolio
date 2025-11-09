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
        sans: ['Inter', 'sans-serif'],       // default body text
        display: ['Orbitron', 'sans-serif'], // headings, logo, UI
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
