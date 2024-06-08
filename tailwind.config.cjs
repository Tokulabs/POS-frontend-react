/** @type {import('tailwindcss').Config} */

module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      gridTemplateColumns: {
        13: 'repeat(13, minmax(0, 1fr))',
      },
      colors: {
        green: {
          1: '#269962',
        },
        gray: {
          1: '#b2bec3',
          2: '#757575',
        },
        background: {
          main: '#E5E5E5',
        },
        red: {
          1: '#E62C37',
        },
      },
    },
  },
  plugins: [require('tailwind-scrollbar-hide')],
  corePlugins: {
    preflight: false,
  },
}
