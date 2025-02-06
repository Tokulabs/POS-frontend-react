/** @type {import('tailwindcss').Config} */

module.exports = {
  darkMode: ['class'],
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      gridTemplateColumns: {
        13: 'repeat(13, minmax(0, 1fr))',
      },

      // keyframes: { // remove it
      // 	'caret-blink': {
      // 	  '0%,70%,100%': { opacity: '1' },
      // 	  '20%,50%': { opacity: '0' },
      // 	},
      // },
      // animation: { // remove it
      // 	'caret-blink': 'caret-blink 1.25s ease-out infinite',
      // },
      colors: {
        green: {
          1: '#269962',
        },
        gray: {
          1: '#b2bec3',
          2: '#757575',
        },
        // 	background: 'hsl(var(--background))', remove it
        // 	red: {
        // 		'1': '#E62C37'
        // 	},
        // 	foreground: 'hsl(var(--foreground))',
        // 	card: {
        // 		DEFAULT: 'hsl(var(--card))',
        // 		foreground: 'hsl(var(--card-foreground))'
        // 	},
        // 	popover: {
        // 		DEFAULT: 'hsl(var(--popover))',
        // 		foreground: 'hsl(var(--popover-foreground))'
        // 	},
        // 	primary: {
        // 		DEFAULT: 'hsl(var(--primary))',
        // 		foreground: 'hsl(var(--primary-foreground))'
        // 	},
        // 	secondary: {
        // 		DEFAULT: 'hsl(var(--secondary))',
        // 		foreground: 'hsl(var(--secondary-foreground))'
        // 	},
        // 	muted: {
        // 		DEFAULT: 'hsl(var(--muted))',
        // 		foreground: 'hsl(var(--muted-foreground))'
        // 	},
        // 	accent: {
        // 		DEFAULT: 'hsl(var(--accent))',
        // 		foreground: 'hsl(var(--accent-foreground))'
        // 	},
        // 	destructive: {
        // 		DEFAULT: 'hsl(var(--destructive))',
        // 		foreground: 'hsl(var(--destructive-foreground))'
        // 	},
        // 	border: 'hsl(var(--border))',
        // 	input: 'hsl(var(--input))',
        // 	ring: 'hsl(var(--ring))',
        // 	chart: {
        // 		'1': 'hsl(var(--chart-1))',
        // 		'2': 'hsl(var(--chart-2))',
        // 		'3': 'hsl(var(--chart-3))',
        // 		'4': 'hsl(var(--chart-4))',
        // 		'5': 'hsl(var(--chart-5))'
        // 	}
        // },
        // borderRadius: {
        // 	lg: 'var(--radius)',
        // 	md: 'calc(var(--radius) - 2px)',
        // 	sm: 'calc(var(--radius) - 4px)'
      },
    },
  },
  plugins: [require('tailwind-scrollbar-hide'), require('tailwindcss-animate')],
  corePlugins: {
    preflight: false,
  },
}
