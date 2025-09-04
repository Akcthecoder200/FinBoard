import React, { useState, useEffect, useCallback } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar
} from 'recharts';
import { financialApi, StockData } from '../../services/financialApi';

interface ChartWidgetProps {
  symbol: string;
  title?: string;
  chartType?: 'line' | 'area' | 'candlestick' | 'volume';
  timeRange?: '1D' | '5D' | '1M' | '3M' | '6M' | '1Y';
  height?: number;
  refreshInterval?: number;
}

interface ChartDataPoint {
  timestamp: string;
  date: string;
  price: number;
  volume?: number;
  high?: number;
  low?: number;
  open?: number;
  close?: number;
}

const ChartWidget: React.FC<ChartWidgetProps> = ({
  symbol,
  title,
  chartType = 'line',
  timeRange = '1D',
  height = 300,
  refreshInterval = 60000 // 1 minute
}) => {
  const [data, setData] = useState<ChartDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPrice, setCurrentPrice] = useState<StockData | null>(null);

  // Generate mock historical data for demonstration
  const generateMockHistoricalData = (symbol: string, range: string): ChartDataPoint[] => {
    const dataPoints: ChartDataPoint[] = [];
    const basePrice = 100 + Math.random() * 500; // Random base price
    let currentPrice = basePrice;
    
    // Determine number of data points based on time range
    const pointsMap = {
      '1D': 24,   // Hourly data
      '5D': 120,  // Every 2 hours for 5 days
      '1M': 30,   // Daily data for 1 month
      '3M': 90,   // Daily data for 3 months
      '6M': 180,  // Daily data for 6 months
      '1Y': 365   // Daily data for 1 year
    };
    
    const numPoints = pointsMap[range as keyof typeof pointsMap] || 30;
    const now = new Date();
    
    for (let i = numPoints - 1; i >= 0; i--) {
      const timestamp = new Date(now.getTime() - i * (24 * 60 * 60 * 1000 / (numPoints / 30)));
      
      // Generate realistic price movement
      const volatility = 0.02; // 2% daily volatility
      const change = (Math.random() - 0.5) * 2 * volatility * currentPrice;
      currentPrice = Math.max(1, currentPrice + change);
      
      const high = currentPrice * (1 + Math.random() * 0.02);
      const low = currentPrice * (1 - Math.random() * 0.02);
      const open = low + Math.random() * (high - low);
      const close = currentPrice;
      const volume = Math.floor(Math.random() * 10000000) + 1000000;
      
      dataPoints.push({
        timestamp: timestamp.toISOString(),
        date: timestamp.toLocaleDateString(),
        price: Number(close.toFixed(2)),
        volume,
        high: Number(high.toFixed(2)),
        low: Number(low.toFixed(2)),
        open: Number(open.toFixed(2)),
        close: Number(close.toFixed(2))
      });
    }
    
    return dataPoints.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch current stock data
      const stockData = await financialApi.getStockQuote(symbol);
      setCurrentPrice(stockData);
      
      // Generate historical data (in a real app, this would come from an API)
      const historicalData = generateMockHistoricalData(symbol, timeRange);
      
      // Update the latest data point with current price
      if (historicalData.length > 0) {
        const lastPoint = historicalData[historicalData.length - 1];
        lastPoint.price = stockData.price;
        lastPoint.close = stockData.price;
        lastPoint.volume = stockData.volume || lastPoint.volume;
      }
      
      setData(historicalData);
    } catch (err) {
      console.error('Chart data fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch chart data');
      
      // Fallback to mock data
      const mockData = generateMockHistoricalData(symbol, timeRange);
      setData(mockData);
    } finally {
      setLoading(false);
    }
  }, [symbol, timeRange]);

  useEffect(() => {
    fetchData();
    
    const interval = setInterval(fetchData, refreshInterval);
    return () => clearInterval(interval);
  }, [fetchData, refreshInterval]);

  const formatXAxisTick = (tickItem: string) => {
    const date = new Date(tickItem);
    if (timeRange === '1D') {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const formatTooltipLabel = (label: string) => {
    const date = new Date(label);
    return date.toLocaleString();
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatVolume = (value: number) => {
    if (value >= 1e9) return `${(value / 1e9).toFixed(1)}B`;
    if (value >= 1e6) return `${(value / 1e6).toFixed(1)}M`;
    if (value >= 1e3) return `${(value / 1e3).toFixed(1)}K`;
    return value.toString();
  };

  const renderChart = () => {
    switch (chartType) {
      case 'area':
        return (
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis 
              dataKey="timestamp" 
              tickFormatter={formatXAxisTick}
              className="text-xs"
            />
            <YAxis 
              domain={['dataMin - 5', 'dataMax + 5']}
              tickFormatter={formatCurrency}
              className="text-xs"
            />
            <Tooltip 
              labelFormatter={formatTooltipLabel}
              formatter={(value: number) => [formatCurrency(value), 'Price']}
              contentStyle={{
                backgroundColor: 'var(--background)',
                border: '1px solid var(--border)',
                borderRadius: '6px'
              }}
            />
            <Area 
              type="monotone" 
              dataKey="price" 
              stroke="#3b82f6" 
              fill="#3b82f6" 
              fillOpacity={0.2}
              strokeWidth={2}
            />
          </AreaChart>
        );
        
      case 'volume':
        return (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis 
              dataKey="timestamp" 
              tickFormatter={formatXAxisTick}
              className="text-xs"
            />
            <YAxis 
              tickFormatter={formatVolume}
              className="text-xs"
            />
            <Tooltip 
              labelFormatter={formatTooltipLabel}
              formatter={(value: number) => [formatVolume(value), 'Volume']}
              contentStyle={{
                backgroundColor: 'var(--background)',
                border: '1px solid var(--border)',
                borderRadius: '6px'
              }}
            />
            <Bar 
              dataKey="volume" 
              fill="#10b981"
              opacity={0.8}
            />
          </BarChart>
        );
        
      case 'line':
      default:
        return (
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis 
              dataKey="timestamp" 
              tickFormatter={formatXAxisTick}
              className="text-xs"
            />
            <YAxis 
              domain={['dataMin - 5', 'dataMax + 5']}
              tickFormatter={formatCurrency}
              className="text-xs"
            />
            <Tooltip 
              labelFormatter={formatTooltipLabel}
              formatter={(value: number) => [formatCurrency(value), 'Price']}
              contentStyle={{
                backgroundColor: 'var(--background)',
                border: '1px solid var(--border)',
                borderRadius: '6px'
              }}
            />
            <Line 
              type="monotone" 
              dataKey="price" 
              stroke="#3b82f6" 
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, stroke: '#3b82f6', strokeWidth: 2, fill: '#fff' }}
            />
          </LineChart>
        );
    }
  };

  if (loading) {
    return (
      <div className="w-full h-80 flex items-center justify-center bg-card rounded-lg border">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-muted-foreground">Loading chart data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-card rounded-lg border p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold">
            {title || `${symbol} Chart`}
          </h3>
          {currentPrice && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-2xl font-bold">
                {formatCurrency(currentPrice.price)}
              </span>
              <span className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
                currentPrice.change >= 0 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                  : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
              }`}>
                {currentPrice.change >= 0 ? '↑' : '↓'}
                {formatCurrency(Math.abs(currentPrice.change))} 
                ({currentPrice.changePercent.toFixed(2)}%)
              </span>
            </div>
          )}
        </div>
        
        {error && (
          <div className="text-sm text-destructive">
            {error}
          </div>
        )}
      </div>

      {/* Chart */}
      <div style={{ height: height }}>
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </div>

      {/* Chart Type Selector */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t">
        <div className="flex gap-2">
          {(['line', 'area', 'volume'] as const).map((type) => (
            <button
              key={type}
              onClick={() => chartType !== type && window.location.reload()} // Simple refresh for demo
              className={`px-3 py-1 text-xs rounded-md transition-colors ${
                chartType === type
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>
        
        <div className="text-xs text-muted-foreground">
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
};

export default ChartWidget;
