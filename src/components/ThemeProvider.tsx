'use client';

import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  effectiveTheme: 'light' | 'dark';
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('system');
  const [mounted, setMounted] = useState(false);
  const [effectiveTheme, setEffectiveTheme] = useState<'light' | 'dark'>('light');

  // Handle hydration
  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('finboard-theme') as Theme;
    if (saved && (saved === 'light' || saved === 'dark' || saved === 'system')) {
      setTheme(saved);
    }
  }, []);

  // Save theme to localStorage
  useEffect(() => {
    if (mounted) {
      localStorage.setItem('finboard-theme', theme);
    }
  }, [theme, mounted]);

  // Calculate effective theme
  useEffect(() => {
    if (!mounted) return;

    let resolvedTheme: 'light' | 'dark' = 'light';
    
    if (theme === 'system') {
      resolvedTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } else {
      resolvedTheme = theme;
    }

    setEffectiveTheme(resolvedTheme);

    // Apply theme to document
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(resolvedTheme);
  }, [theme, mounted]);

  // Don't render until mounted to prevent hydration issues
  if (!mounted) {
    return <div suppressHydrationWarning>{children}</div>;
  }

  const contextValue: ThemeContextType = {
    theme,
    setTheme,
    effectiveTheme
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
