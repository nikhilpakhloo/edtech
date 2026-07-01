/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        brand: {
          ink: '#05070D',
          surface: '#10141F',
          elevated: '#171D2A',
          line: '#2B3445',
          blue: '#4F8CFF',
          green: '#12B981',
          red: '#FF5A66',
        },
      },
    },
  },
  plugins: [],
};
