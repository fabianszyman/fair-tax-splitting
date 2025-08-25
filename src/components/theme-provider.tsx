import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'

type Theme = 'light' | 'dark' | 'system'

type ThemeContextValue = {
  theme: Theme
  resolvedTheme: 'light' | 'dark'
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = 'ui-theme',
}: {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
}) {
  const mediaQuery = useRef<MediaQueryList | null>(null)
  const getSystem = useCallback(() => {
    if (typeof window === 'undefined') return 'light' as const
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }, [])

  const readStored = useCallback((): Theme => {
    if (typeof window === 'undefined') return defaultTheme
    const stored = window.localStorage.getItem(storageKey) as Theme | null
    return stored ?? defaultTheme
  }, [defaultTheme, storageKey])

  const [theme, setThemeState] = useState<Theme>(() => readStored())
  const resolvedTheme = theme === 'system' ? getSystem() : theme

  const applyClass = useCallback(
    (current: 'light' | 'dark') => {
      const root = document.documentElement
      root.classList.toggle('dark', current === 'dark')
    },
    []
  )

  const setTheme = useCallback(
    (next: Theme) => {
      setThemeState(next)
      try {
        window.localStorage.setItem(storageKey, next)
      } catch {}
    },
    [storageKey]
  )

  useEffect(() => {
    if (typeof window === 'undefined') return
    applyClass(resolvedTheme)
  }, [applyClass, resolvedTheme])

  useEffect(() => {
    if (typeof window === 'undefined') return
    mediaQuery.current = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = () => {
      if (theme === 'system') applyClass(getSystem())
    }
    mediaQuery.current.addEventListener('change', handler)
    return () => mediaQuery.current?.removeEventListener('change', handler)
  }, [applyClass, getSystem, theme])

  const value = useMemo<ThemeContextValue>(
    () => ({ theme, resolvedTheme, setTheme }),
    [theme, resolvedTheme]
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}


