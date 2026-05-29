import { createContext, useContext } from 'react';

interface ThemeContextValue {
  isDark: boolean;
}

export const ThemeContext = createContext<ThemeContextValue>({ isDark: false });

export function useTheme() {
  return useContext(ThemeContext);
}
