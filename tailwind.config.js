// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'rs-dark-navy': '#111C24', // RGB 17-28-36 [cite: 94, 95]
        'rs-teal-green': '#126262', // RGB 18-98-98 [cite: 98, 99]
        'rs-light-teal': '#0E8285', // RGB 14-130-133 [cite: 107]
      },
      fontFamily: {
        // We'll add Gilroy here later
      },
    },
  },
  plugins: [],
};