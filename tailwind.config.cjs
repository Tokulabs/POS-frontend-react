/** @type {import('tailwindcss').Config} */

module.exports = {
  darkMode: ['class'],
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
  	extend: {
  		gridTemplateColumns: {
  			'13': 'repeat(13, minmax(0, 1fr))'
  		},
  		colors: {
  			green: {
  				'1': '#269962'
  			},
  			gray: {
  				'1': '#b2bec3',
  				'2': '#757575'
  			},
  			background: {
  				main: '#E5E5E5'
  			},
  			red: {
  				'1': '#E62C37'
  			}
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		keyframes: {
  			'accordion-down': {
  				from: {
  					height: '0'
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)'
  				}
  			},
  			'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)'
  				},
  				to: {
  					height: '0'
  				}
  			}
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out'
  		}
  	}
  },
  plugins: [require('tailwind-scrollbar-hide'), require('tailwindcss-animate')],
  corePlugins: {
    preflight: false,
  },
}
