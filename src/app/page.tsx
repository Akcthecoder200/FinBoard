'use client';

import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { WidgetContainer } from '@/components/widgets/WidgetContainer';
import { useWidgetPersistence } from '@/hooks/useWidgetPersistence';
import { useState, useEffect } from 'react';

export default function Home() {
  const widgets = useSelector((state: RootState) => state.widgets.widgets);
  const [currentTheme, setCurrentTheme] = useState<'light' | 'dark' | 'system'>('system');
  const [mounted, setMounted] = useState(false);

  // Initialize widget persistence
  useWidgetPersistence();

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
    if (typeof window === 'undefined') return 'light';
    if (currentTheme === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return currentTheme;
  };

  // Don't render theme-dependent content until mounted
  if (!mounted) {
    return (
      <div className="flex h-screen bg-background">
        <div className="w-64 bg-card border-r border-border p-4">
          <div className="h-8 bg-secondary rounded animate-pulse"></div>
        </div>
        <div className="flex-1 p-6">
          <div className="h-8 bg-secondary rounded animate-pulse mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="h-48 bg-secondary rounded animate-pulse"></div>
            <div className="h-48 bg-secondary rounded animate-pulse"></div>
            <div className="h-48 bg-secondary rounded animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className="w-64 bg-card border-r border-border flex flex-col">
        <div className="p-6 border-b border-border">
          <h1 className="text-2xl font-bold text-foreground">FinBoard</h1>
          <p className="text-sm text-muted-foreground">Finance Dashboard</p>
        </div>
        
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            <li>
              <a href="#" className="flex items-center px-3 py-2 text-foreground bg-primary/10 rounded-lg">
                <span className="w-5 h-5 mr-3">📊</span>
                Dashboard
              </a>
            </li>
            <li>
              <a href="#" className="flex items-center px-3 py-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg">
                <span className="w-5 h-5 mr-3">💰</span>
                Portfolio
              </a>
            </li>
            <li>
              <a href="#" className="flex items-center px-3 py-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg">
                <span className="w-5 h-5 mr-3">📈</span>
                Markets
              </a>
            </li>
            <li>
              <a href="#" className="flex items-center px-3 py-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg">
                <span className="w-5 h-5 mr-3">📰</span>
                News
              </a>
            </li>
            <li>
              <a href="#" className="flex items-center px-3 py-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg">
                <span className="w-5 h-5 mr-3">⚙️</span>
                Settings
              </a>
            </li>
          </ul>
        </nav>

        <div className="p-4 border-t border-border">
          <div className="text-sm text-muted-foreground mb-2">Theme</div>
          <div className="flex gap-1">
            <button
              onClick={() => handleThemeChange('light')}
              className={`px-2 py-1 text-xs rounded transition-colors ${
                currentTheme === 'light' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-secondary hover:bg-secondary/80'
              }`}
            >
              Light
            </button>
            <button
              onClick={() => handleThemeChange('dark')}
              className={`px-2 py-1 text-xs rounded transition-colors ${
                currentTheme === 'dark' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-secondary hover:bg-secondary/80'
              }`}
            >
              Dark
            </button>
            <button
              onClick={() => handleThemeChange('system')}
              className={`px-2 py-1 text-xs rounded transition-colors ${
                currentTheme === 'system' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-secondary hover:bg-secondary/80'
              }`}
            >
              Auto
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-card border-b border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-foreground">Dashboard Overview</h2>
              <p className="text-sm text-muted-foreground">Monitor your financial portfolio</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm text-muted-foreground">
                Theme: <span className="font-mono">{getEffectiveTheme()}</span>
              </div>
              <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
                + Add Widget
              </button>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 overflow-auto p-6">
          {/* Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-card p-6 rounded-lg border border-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Balance</p>
                  <p className="text-2xl font-bold text-foreground">$24,532.50</p>
                </div>
                <div className="text-green-500">📈</div>
              </div>
              <p className="text-sm text-green-500 mt-2">+2.5% from yesterday</p>
            </div>

            <div className="bg-card p-6 rounded-lg border border-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Today&apos;s Gain</p>
                  <p className="text-2xl font-bold text-green-500">+$342.15</p>
                </div>
                <div className="text-green-500">💰</div>
              </div>
              <p className="text-sm text-green-500 mt-2">+1.4% gain</p>
            </div>

            <div className="bg-card p-6 rounded-lg border border-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Investments</p>
                  <p className="text-2xl font-bold text-foreground">12</p>
                </div>
                <div className="text-blue-500">🏢</div>
              </div>
              <p className="text-sm text-muted-foreground mt-2">Across 5 sectors</p>
            </div>

            <div className="bg-card p-6 rounded-lg border border-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Widgets</p>
                  <p className="text-2xl font-bold text-foreground">{widgets.length}</p>
                </div>
                <div className="text-purple-500">⚡</div>
              </div>
              <p className="text-sm text-muted-foreground mt-2">Dashboard widgets</p>
            </div>
          </div>

          {/* Widgets Section */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">Dashboard Widgets</h3>
              <span className="text-sm text-muted-foreground">Customize your dashboard</span>
            </div>
            <WidgetContainer />
          </div>

          {/* Status Card */}
          <div className="bg-card p-6 rounded-lg border border-border">
            <h3 className="text-lg font-semibold text-foreground mb-4">System Status</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-muted-foreground">
                  Current theme: <span className="font-mono text-foreground">{getEffectiveTheme()}</span>
                </p>
                <p className="text-muted-foreground">
                  Theme setting: <span className="font-mono text-foreground">{currentTheme}</span>
                </p>
                <p className="text-muted-foreground">
                  Widgets count: <span className="font-mono text-foreground">{widgets.length}</span>
                </p>
              </div>
              <div>
                <p className="text-green-600 font-medium">✅ Project setup complete!</p>
                <p className="text-blue-600 font-medium">🎨 Theme toggle working!</p>
                <p className="text-purple-600 font-medium">🏗️ Dashboard layout ready!</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
