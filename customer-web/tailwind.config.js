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
          card: '#FBF8F2',
          surface: '#FFFDF9',
        },
        espresso: {
          DEFAULT: '#2D1C12',
          light: '#3D2B1F',
          muted: '#7A6657',
        },
        olive: {
          deep: '#344D29',
          leaf: '#476839',
          sage: '#758E4F',
          tint: '#EBF0E6',
        },
        rattan: {
          gold: '#D49A3E',
          amber: '#B87B28',
          sand: '#E6D7BD',
        },
        border: {
          warm: '#C8B9A3',
          light: '#E2D7C5',
        }
      },
      fontFamily: {
        script: ['Cormorant Garamond', 'Georgia', 'serif'],
        heading: ['Playfair Display', 'Georgia', 'serif'],
        body: ['Plus Jakarta Sans', 'sans-serif'],
        malayalam: ['Noto Sans Malayalam', 'sans-serif'],
      },
      boxShadow: {
        'warm-sm': '0 2px 8px rgba(45, 28, 18, 0.05)',
        'warm-md': '0 6px 20px rgba(45, 28, 18, 0.08)',
        'warm-lg': '0 12px 36px rgba(45, 28, 18, 0.12)',
      }
    },
  },
  plugins: [],
}
