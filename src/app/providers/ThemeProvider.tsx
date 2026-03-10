import { applyTheme, themes, type AgeGroupTheme, type ColorMode } from '@/config/theme';
import { useChildStore } from '@stores/childStore';
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';

interface ThemeContextValue {
  theme: AgeGroupTheme;
  colorMode: ColorMode;
  setTheme: (theme: AgeGroupTheme) => void;
  toggleColorMode: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setTheme] = useState<AgeGroupTheme>('cubs');
  const [colorMode, setColorMode] = useState<ColorMode>('light');
  const activeChild = useChildStore((s) => s.activeChild);

  const activeChildAgeGroup = activeChild?.ageGroup;

  // Aktif çocuğun yaş grubuna göre temayı güncelle
  useEffect(() => {
    if (activeChildAgeGroup) {
      setTheme(activeChildAgeGroup as AgeGroupTheme);
    }
  }, [activeChildAgeGroup]);

  // CSS custom properties'i DOM'a uygula
  useEffect(() => {
    const config = themes[theme][colorMode];
    applyTheme(config);
  }, [theme, colorMode]);

  const toggleColorMode = useCallback(() => {
    setColorMode((prev) => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, colorMode, setTheme, toggleColorMode }}>
      <div data-theme={theme} data-mode={colorMode} className="min-h-screen">
        {children}
      </div>
    </ThemeContext.Provider>
  );
}
