import type { Dispatch, SetStateAction } from 'react'

export type Theme = 'dark' | 'light' | 'system'
export type ThemeProviderProps = {
  children: React.ReactNode
  initialTheme?: Theme
}
export type ThemeProviderState = {
  theme: Theme
  setTheme: Dispatch<SetStateAction<Theme>>
}
