/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        parchment: {
          DEFAULT: '#FAF6EE',
          deep: '#F3ECE0',
          card: '#FFFDF9',
        },
        espresso: {
          DEFAULT: '#2D1C12',
          light: '#3D2B1F',
          muted: '#7A6657',
        },
        olive: {
          deep: '#344D29',
          leaf: '#476839',
        },
        rattan: {
          gold: '#D49A3E',
        },
        border: {
          warm: '#E2D7C5',
        }
      },
      fontFamily: {
        heading: ['Cormorant Garamond', 'serif'],
        body: ['Plus Jakarta Sans', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
