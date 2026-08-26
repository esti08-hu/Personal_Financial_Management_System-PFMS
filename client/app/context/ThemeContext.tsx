"use client"

import React, { createContext, useContext } from 'react'
import { useTheme as useNextTheme } from 'next-themes'

type Theme = 'dark' | 'light'

interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export const GlacierThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { theme: nextTheme, setTheme: setNextTheme } = useNextTheme()

  const theme: Theme = (nextTheme === 'light' ? 'light' : 'dark')

  const toggleTheme = () => {
    setNextTheme(theme === 'dark' ? 'light' : 'dark')
  }

  const setTheme = (t: Theme) => {
    setNextTheme(t)
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
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
