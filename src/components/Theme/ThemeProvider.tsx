import { FC, PropsWithChildren, useEffect } from 'react'
import { useThemeStore } from '@/store/useThemeStore'

export const ThemeProvider: FC<PropsWithChildren> = ({ children }) => {
  const { theme, setResolvedTheme } = useThemeStore()

  useEffect(() => {
    const root = window.document.documentElement

    const applyTheme = () => {
      root.classList.remove('light', 'dark')

      if (theme === 'system') {
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light'
        root.classList.add(systemTheme)
        setResolvedTheme(systemTheme)
      } else {
        root.classList.add(theme)
        setResolvedTheme(theme)
      }
    }

    applyTheme()

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = () => {
      if (theme === 'system') {
        applyTheme()
      }
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [theme, setResolvedTheme])

  return <>{children}</>
}
