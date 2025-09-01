'use client';

import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { useState, useEffect } from 'react';

export default function Home() {
  const widgets = useSelector((state: RootState) => state.widgets.widgets);
  const [currentTheme, setCurrentTheme] = useState<'light' | 'dark' | 'system'>('system');
  const [mounted, setMounted] = useState(false);

  // Load saved theme on mount
  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem('finboard-theme') as 'light' | 'dark' | 'system';
    if (savedTheme && ['light', 'dark', 'system'].includes(savedTheme)) {
      setCurrentTheme(savedTheme);
      applyTheme(savedTheme);
    } else {
      applyTheme('system');
    }
  }, []);

  const applyTheme = (theme: 'light' | 'dark' | 'system') => {
    if (typeof window === 'undefined') return;
    
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    
    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }
  };

  const handleThemeChange = (theme: 'light' | 'dark' | 'system') => {
    setCurrentTheme(theme);
    applyTheme(theme);
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('finboard-theme', theme);
    }
  };

  // Get effective theme for display
  const getEffectiveTheme = () => {
    if (typeof window === 'undefined') return 'light'; // SSR fallback
    if (currentTheme === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return currentTheme;
  };

  // Don't render theme-dependent content until mounted to prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="min-h-screen p-8">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">FinBoard</h1>
          <div className="flex gap-2">
            <div className="px-3 py-1 rounded bg-secondary">Loading...</div>
          </div>
        </header>
        <main>
          <div className="bg-card p-6 rounded-lg border">
            <h2 className="text-xl font-semibold mb-4">Loading Dashboard...</h2>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">FinBoard</h1>
        <div className="flex gap-2">
          <button
            onClick={() => handleThemeChange('light')}
            className={`px-3 py-1 rounded transition-colors ${
              currentTheme === 'light' 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-secondary hover:bg-secondary/80'
            }`}
          >
            Light
          </button>
          <button
            onClick={() => handleThemeChange('dark')}
            className={`px-3 py-1 rounded transition-colors ${
              currentTheme === 'dark' 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-secondary hover:bg-secondary/80'
            }`}
          >
            Dark
          </button>
          <button
            onClick={() => handleThemeChange('system')}
            className={`px-3 py-1 rounded transition-colors ${
              currentTheme === 'system' 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-secondary hover:bg-secondary/80'
            }`}
          >
            System
          </button>
        </div>
      </header>

      <main>
        <div className="bg-card p-6 rounded-lg border">
          <h2 className="text-xl font-semibold mb-4">Dashboard Status</h2>
          <p className="text-card-foreground">
            Current theme: <span className="font-mono">{getEffectiveTheme()}</span>
          </p>
          <p className="text-card-foreground">
            Theme setting: <span className="font-mono">{currentTheme}</span>
          </p>
          <p className="text-card-foreground">
            Widgets count: <span className="font-mono">{widgets.length}</span>
          </p>
          <p className="text-green-600 mt-2">✅ Project setup complete!</p>
          <p className="text-blue-600 mt-1">🎨 Theme toggle is working!</p>
        </div>
      </main>
    </div>
  );
}
