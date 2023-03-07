/** @type {import('tailwindcss').Config} */

module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        green: {
          1: '#269962',
        },
        gray: {
          1: '#b2bec3',
        },
        background: {
          main: '#E5E5E5',
        },
      },
    },
  },
  plugins: [],
  corePlugins: {
    preflight: false,
  },
}
