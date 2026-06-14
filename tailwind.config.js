/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Essential for our theme toggle to work
  theme: {
    extend: {},
  },
  plugins: [],
}