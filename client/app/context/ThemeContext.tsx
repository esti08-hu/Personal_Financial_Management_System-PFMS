"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'
import { useTheme as useNextTheme } from 'next-themes'

type Theme = 'dark' | 'light'

interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
  setTheme: (theme: Theme) => void
  mounted: boolean
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export const GlacierThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { setTheme: setNextTheme, resolvedTheme } = useNextTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const theme: Theme = (resolvedTheme === 'light' ? 'light' : 'dark')

  const toggleTheme = () => {
    const currentTheme = resolvedTheme || 'dark'
    setNextTheme(currentTheme === 'dark' ? 'light' : 'dark')
  }

  const setTheme = (t: Theme) => {
    setNextTheme(t)
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme, mounted }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useGlacierTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useGlacierTheme must be used within a GlacierThemeProvider')
  }
  return context
}
