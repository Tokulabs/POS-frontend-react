/** @type {import('tailwindcss').Config} */
export const darkMode = ['class']
export const content = [
  './src/**/*.{js,jsx,ts,tsx}',
  './node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}',
]
// tailwind.config.js
export const theme = {
  extend: {
    colors: {
      // Tus colores personalizados
      green: { 1: '#269962' },
      gray: { 1: '#b2bec3', 2: '#757575' },
      red: { 1: '#E62C37' },

      // Variables requeridas por shadcn (AGREGA ESTO)
      border: 'hsl(var(--border))',
      input: 'hsl(var(--input))',
      ring: 'hsl(var(--ring))',
      background: 'hsl(var(--background))',
      foreground: 'hsl(var(--foreground))',
      primary: {
        DEFAULT: 'hsl(var(--primary))',
        foreground: 'hsl(var(--primary-foreground))',
      },
      secondary: {
        DEFAULT: 'hsl(var(--secondary))',
        foreground: 'hsl(var(--secondary-foreground))',
      },
      destructive: {
        DEFAULT: 'hsl(var(--destructive))',
        foreground: 'hsl(var(--destructive-foreground))',
      },
      muted: {
        DEFAULT: 'hsl(var(--muted))',
        foreground: 'hsl(var(--muted-foreground))',
      },
      accent: {
        DEFAULT: 'hsl(var(--accent))',
        foreground: 'hsl(var(--accent-foreground))',
      },
    },
    borderRadius: {
      lg: 'var(--radius)',
      md: 'calc(var(--radius) - 2px)',
      sm: 'calc(var(--radius) - 4px)',
    },
    keyframes: {
      'accordion-down': {
        from: {
          height: '0',
        },
        to: {
          height: 'var(--radix-accordion-content-height)',
        },
      },
      'accordion-up': {
        from: {
          height: 'var(--radix-accordion-content-height)',
        },
        to: {
          height: '0',
        },
      },
    },
    animation: {
      'accordion-down': 'accordion-down 0.2s ease-out',
      'accordion-up': 'accordion-up 0.2s ease-out',
    },
    gridTemplateColumns: {
      13: 'repeat(13, minmax(0, 1fr))',
    },
  },
}
export const plugins = [require('tailwind-scrollbar-hide'), require('tailwindcss-animate')]
export const corePlugins = {
  preflight: true, // Necesario pero lo compensaremos
}
