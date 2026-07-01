/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        brand: {
          ink: '#030712',
          surface: '#07101F',
          elevated: '#0D1830',
          panel: '#142345',
          line: '#24314F',
          blue: '#1F80E0',
          cyan: '#00E0FF',
          gold: '#F5C542',
          green: '#12B981',
          red: '#FF5A66',
        },
      },
    },
  },
  plugins: [],
};
