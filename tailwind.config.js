// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}', // For files in the 'pages' directory (if you use it)
    './components/**/*.{js,ts,jsx,tsx,mdx}', // For files in the 'components' directory
    './app/**/*.{js,ts,jsx,tsx,mdx}', // For files in the 'app' directory (where your pages are now)
    // You can add more paths here if you create other folders for Tailwind-reliant files
  ],
  theme: {
    extend: {
      colors: {
        'rs-dark-navy': '#111C24',
        'rs-teal-green': '#126262',
        'rs-light-teal': '#0E8285',
      },
      fontFamily: {
        // gilroy: ['Gilroy', 'sans-serif'],
      },
    },
  },
  plugins: [],
};