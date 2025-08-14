/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        jura: ['Jura', 'sans-serif'],
      },
      colors: {
        'extra-dark-blue': '#171646',
        'dark-blue': '#1F1D5C',
        'medium-blue': '#2B287D',
        'medium-ocean': '#3D3AA8',
        'light-blue': '#8295DC',
        'card-dark-blue': '#09183D',
      },
    },
  },
  plugins: [],
}
