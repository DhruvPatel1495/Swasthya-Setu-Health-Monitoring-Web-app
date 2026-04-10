/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#0a0f1c',
          card: '#111827',
          border: '#1f2937'
        },
        primary: {
          DEFAULT: '#00f2fe',
          dark: '#0284c7'
        },
        accent: {
          DEFAULT: '#8b5cf6',
          dark: '#6d28d9'
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
