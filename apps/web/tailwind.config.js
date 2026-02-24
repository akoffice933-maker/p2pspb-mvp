/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#F0B90B',
        success: '#00C853',
        danger: '#FF1744',
        bgdark: '#0B0E11',
        card: '#1E2029',
      },
    },
  },
  plugins: [],
}
