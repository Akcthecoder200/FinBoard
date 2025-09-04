'use client';

import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { WidgetContainer } from '@/components/widgets/WidgetContainer';
import PortfolioWidget from '@/components/widgets/PortfolioWidget';
import AnnotatedChart from '@/components/charts/AnnotatedChart';
import TechnicalIndicators from '@/components/charts/TechnicalIndicators';
import MarketScanner from '@/components/market/MarketScanner';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import { useWidgetPersistence } from '@/hooks/useWidgetPersistence';
import { useState, useEffect } from 'react';

// Import console utilities to suppress noise in development
import '@/utils/consoleUtils';

interface ChartAnnotation {
  id: string;
  type: 'line' | 'area' | 'point' | 'text';
  x?: number | string;
  y?: number;
  x1?: number | string;
  y1?: number;
  x2?: number | string;
  y2?: number;
  color: string;
  label?: string;
  description?: string;
  timestamp: number;
}

// Sample data for demo charts
const generateSampleData = () => {
  const data = [];
  const today = new Date();
  
  for (let i = 30; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    // Generate realistic stock price movement
    const basePrice = 150;
    const volatility = 0.02;
    const trend = 0.001;
    const randomChange = (Math.random() - 0.5) * 2 * volatility + trend;
    const price = basePrice * (1 + randomChange * i / 10);
    
    data.push({
      date: date.toISOString().split('T')[0],
      price: Number(price.toFixed(2)),
      volume: Math.floor(Math.random() * 1000000) + 500000
    });
  }
  
  return data;
};

export default function Home() {
  const widgets = useSelector((state: RootState) => state.widgets.widgets);
  const [currentTheme, setCurrentTheme] = useState<'light' | 'dark' | 'system'>('system');
  const [mounted, setMounted] = useState(false);
  const [annotations, setAnnotations] = useState<ChartAnnotation[]>([]);
  const [sampleData] = useState(() => generateSampleData());

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

          {/* Advanced Features Section */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
            {/* Portfolio Performance Widget */}
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4">Portfolio Performance & P&L</h3>
              <PortfolioWidget 
                holdings={[
                  { symbol: 'AAPL', quantity: 10, avgCost: 150 },
                  { symbol: 'GOOGL', quantity: 5, avgCost: 2800 },
                  { symbol: 'MSFT', quantity: 8, avgCost: 320 },
                  { symbol: 'TSLA', quantity: 3, avgCost: 800 },
                  { symbol: 'NVDA', quantity: 4, avgCost: 400 }
                ]}
                height={500}
                showDetailed={true}
              />
            </div>

            {/* Interactive Chart with Annotations */}
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4">Interactive Chart with Annotations</h3>
              <AnnotatedChart
                data={sampleData}
                dataKey="price"
                xKey="date"
                height={500}
                enableDrawing={true}
                showGrid={true}
                showTooltip={true}
                annotations={annotations}
                onAnnotationAdd={(annotation) => setAnnotations(prev => [...prev, annotation])}
                onAnnotationUpdate={(annotation) => setAnnotations(prev => 
                  prev.map(ann => ann.id === annotation.id ? annotation : ann)
                )}
                onAnnotationDelete={(annotationId) => setAnnotations(prev => 
                  prev.filter(ann => ann.id !== annotationId)
                )}
              />
            </div>
          </div>

          {/* Professional Trading Tools */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
            {/* Technical Analysis */}
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4">Advanced Technical Analysis</h3>
              <ErrorBoundary fallback={
                <div className="p-4 border border-amber-200 rounded-lg bg-amber-50">
                  <p className="text-amber-800">Technical Analysis component is temporarily unavailable.</p>
                </div>
              }>
                <TechnicalIndicators
                  symbol="AAPL"
                  height={600}
                  showIndicators={['SMA', 'RSI', 'MACD']}
                  timeframe="3M"
                />
              </ErrorBoundary>
            </div>

            {/* Market Scanner */}
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4">Real-time Market Scanner</h3>
              <ErrorBoundary fallback={
                <div className="p-4 border border-amber-200 rounded-lg bg-amber-50">
                  <p className="text-amber-800">Market Scanner is temporarily unavailable.</p>
                </div>
              }>
                <MarketScanner
                  height={600}
                  maxResults={30}
                  refreshInterval={30000}
                />
              </ErrorBoundary>
            </div>
          </div>

          {/* Features Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-6">
            <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 p-6 rounded-lg border border-blue-500/20">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center text-white text-xl">
                  📊
                </div>
                <div className="ml-4">
                  <h4 className="font-semibold text-foreground">Candlestick Charts</h4>
                  <p className="text-sm text-muted-foreground">Professional OHLC visualization</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Advanced candlestick charts with OHLC data and real-time updates.
              </p>
            </div>

            <div className="bg-gradient-to-br from-green-500/10 to-green-600/10 p-6 rounded-lg border border-green-500/20">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center text-white text-xl">
                  💼
                </div>
                <div className="ml-4">
                  <h4 className="font-semibold text-foreground">Portfolio Tracking</h4>
                  <p className="text-sm text-muted-foreground">Complete P&L analysis</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Real-time P&L calculations and performance analytics.
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 p-6 rounded-lg border border-purple-500/20">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center text-white text-xl">
                  ✏️
                </div>
                <div className="ml-4">
                  <h4 className="font-semibold text-foreground">Chart Annotations</h4>
                  <p className="text-sm text-muted-foreground">Interactive drawing tools</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Add annotations and trend lines directly on charts.
              </p>
            </div>

            <div className="bg-gradient-to-br from-orange-500/10 to-orange-600/10 p-6 rounded-lg border border-orange-500/20">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center text-white text-xl">
                  📈
                </div>
                <div className="ml-4">
                  <h4 className="font-semibold text-foreground">Technical Analysis</h4>
                  <p className="text-sm text-muted-foreground">Advanced indicators</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                RSI, MACD, Bollinger Bands, and moving averages.
              </p>
            </div>

            <div className="bg-gradient-to-br from-red-500/10 to-red-600/10 p-6 rounded-lg border border-red-500/20">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center text-white text-xl">
                  🔍
                </div>
                <div className="ml-4">
                  <h4 className="font-semibold text-foreground">Market Scanner</h4>
                  <p className="text-sm text-muted-foreground">Real-time opportunities</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Scan markets for gainers, losers, and breakouts.
              </p>
            </div>
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
