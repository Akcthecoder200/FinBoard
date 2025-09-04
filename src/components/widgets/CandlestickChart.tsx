import React, { useState, useEffect, useCallback } from "react";
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
  Bar,
  ComposedChart,
  Cell,
} from "recharts";
import { financialApi, StockData } from "../../services/financialApi";

interface CandlestickChartProps {
  symbol: string;
  title?: string;
  chartType?: "line" | "area" | "candlestick" | "volume";
  timeRange?: "1D" | "5D" | "1M" | "3M" | "6M" | "1Y";
  height?: number;
  refreshInterval?: number;
  showAnnotations?: boolean;
}

interface OHLCDataPoint {
  timestamp: string;
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
  price: number; // for compatibility
}

interface Annotation {
  id: string;
  x: number;
  y: number;
  text: string;
  type: "note" | "alert" | "trend";
}

// Custom tooltip for OHLC data
const CandlestickTooltip: React.FC<{
  active?: boolean;
  payload?: Array<{ payload: OHLCDataPoint }>;
  label?: string;
}> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload as OHLCDataPoint;
    return (
      <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
        <p className="text-sm font-medium mb-2">
          {label ? new Date(label).toLocaleString() : "N/A"}
        </p>
        <div className="space-y-1 text-xs">
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">Open:</span>
            <span className="font-mono">${data.open.toFixed(2)}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">High:</span>
            <span className="font-mono text-green-600">
              ${data.high.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">Low:</span>
            <span className="font-mono text-red-600">
              ${data.low.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">Close:</span>
            <span
              className={`font-mono ${
                data.close > data.open ? "text-green-600" : "text-red-600"
              }`}
            >
              ${data.close.toFixed(2)}
            </span>
          </div>
          {data.volume && (
            <div className="flex justify-between gap-4 pt-1 border-t">
              <span className="text-muted-foreground">Volume:</span>
              <span className="font-mono">
                {(data.volume / 1000000).toFixed(1)}M
              </span>
            </div>
          )}
        </div>
      </div>
    );
  }
  return null;
};

const CandlestickChart: React.FC<CandlestickChartProps> = ({
  symbol,
  title,
  chartType = "line",
  timeRange = "1D",
  height = 300,
  refreshInterval = 60000,
  showAnnotations = false,
}) => {
  const [data, setData] = useState<OHLCDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPrice, setCurrentPrice] = useState<StockData | null>(null);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);

  // Generate realistic OHLC data for demonstration
  const generateOHLCData = (symbol: string, range: string): OHLCDataPoint[] => {
    const dataPoints: OHLCDataPoint[] = [];
    const basePrice = 100 + Math.random() * 500;
    let currentPrice = basePrice;

    const pointsMap = {
      "1D": 24,
      "5D": 120,
      "1M": 30,
      "3M": 90,
      "6M": 180,
      "1Y": 365,
    };

    const numPoints = pointsMap[range as keyof typeof pointsMap] || 30;
    const now = new Date();

    for (let i = numPoints - 1; i >= 0; i--) {
      const timestamp = new Date(
        now.getTime() - i * ((24 * 60 * 60 * 1000) / (numPoints / 30))
      );

      // Generate realistic price movement
      const volatility = 0.02;
      const change = (Math.random() - 0.5) * 2 * volatility * currentPrice;
      const open = currentPrice;
      const close = Math.max(1, currentPrice + change);

      // Generate high and low around open/close
      const maxPrice = Math.max(open, close);
      const minPrice = Math.min(open, close);
      const high = maxPrice * (1 + Math.random() * 0.02);
      const low = minPrice * (1 - Math.random() * 0.02);

      const volume = Math.floor(Math.random() * 10000000) + 1000000;

      dataPoints.push({
        timestamp: timestamp.toISOString(),
        date: timestamp.toLocaleDateString(),
        open: Number(open.toFixed(2)),
        high: Number(high.toFixed(2)),
        low: Number(low.toFixed(2)),
        close: Number(close.toFixed(2)),
        price: Number(close.toFixed(2)),
        volume,
      });

      currentPrice = close;
    }

    return dataPoints.sort(
      (a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const stockData = await financialApi.getStockQuote(symbol);
      setCurrentPrice(stockData);

      const ohlcData = generateOHLCData(symbol, timeRange);

      // Update the latest data point with current price
      if (ohlcData.length > 0) {
        const lastPoint = ohlcData[ohlcData.length - 1];
        lastPoint.close = stockData.price;
        lastPoint.price = stockData.price;
        lastPoint.volume = stockData.volume || lastPoint.volume;
      }

      setData(ohlcData);
    } catch (err) {
      console.error("Chart data fetch error:", err);
      setError(
        err instanceof Error ? err.message : "Failed to fetch chart data"
      );

      const mockData = generateOHLCData(symbol, timeRange);
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
    if (timeRange === "1D") {
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    }
    return date.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  // const addAnnotation = (x: number, y: number, text: string = 'Note') => {
  //   const newAnnotation: Annotation = {
  //     id: `annotation-${Date.now()}`,
  //     x,
  //     y,
  //     text,
  //     type: 'note'
  //   };
  //   setAnnotations(prev => [...prev, newAnnotation]);
  // };

  const renderChart = () => {
    switch (chartType) {
      case "candlestick":
        return (
          <ComposedChart
            data={data}
            onMouseDown={(e) => {
              if (showAnnotations && e) {
                // Add annotation on click (simplified)
                console.log("Click position:", e);
                // addAnnotation(e.activeLabel, e.activePayload?.[0]?.value, 'Click annotation');
              }
            }}
          >
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis
              dataKey="timestamp"
              tickFormatter={formatXAxisTick}
              className="text-xs"
            />
            <YAxis
              domain={["dataMin - 5", "dataMax + 5"]}
              tickFormatter={formatCurrency}
              className="text-xs"
            />
            <Tooltip content={<CandlestickTooltip />} />
            <Bar
              dataKey={(entry: OHLCDataPoint) => [
                entry.low,
                entry.high - entry.low,
              ]}
              fill="#8884d8"
            />

            {/* Render annotations */}
            {showAnnotations &&
              annotations.map((annotation) => (
                <g key={annotation.id}>
                  <circle
                    cx={annotation.x}
                    cy={annotation.y}
                    r="4"
                    fill="#3b82f6"
                    stroke="#ffffff"
                    strokeWidth="2"
                  />
                  <text
                    x={annotation.x + 10}
                    y={annotation.y - 10}
                    className="text-xs fill-foreground"
                    style={{ fontSize: "12px" }}
                  >
                    {annotation.text}
                  </text>
                </g>
              ))}
          </ComposedChart>
        );

      case "area":
        return (
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis
              dataKey="timestamp"
              tickFormatter={formatXAxisTick}
              className="text-xs"
            />
            <YAxis
              domain={["dataMin - 5", "dataMax + 5"]}
              tickFormatter={formatCurrency}
              className="text-xs"
            />
            <Tooltip
              labelFormatter={(label) => new Date(label).toLocaleString()}
              formatter={(value: number) => [formatCurrency(value), "Price"]}
              contentStyle={{
                backgroundColor: "var(--background)",
                border: "1px solid var(--border)",
                borderRadius: "6px",
              }}
            />
            <Area
              type="monotone"
              dataKey="close"
              stroke="#3b82f6"
              fill="#3b82f6"
              fillOpacity={0.2}
              strokeWidth={2}
            />
          </AreaChart>
        );

      case "volume":
        return (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis
              dataKey="timestamp"
              tickFormatter={formatXAxisTick}
              className="text-xs"
            />
            <YAxis
              tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
              className="text-xs"
            />
            <Tooltip
              labelFormatter={(label) => new Date(label).toLocaleString()}
              formatter={(value: number) => [
                `${(value / 1000000).toFixed(1)}M`,
                "Volume",
              ]}
              contentStyle={{
                backgroundColor: "var(--background)",
                border: "1px solid var(--border)",
                borderRadius: "6px",
              }}
            />
            <Bar dataKey="volume">
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.close > entry.open ? "#10b981" : "#ef4444"}
                />
              ))}
            </Bar>
          </BarChart>
        );

      case "line":
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
              domain={["dataMin - 5", "dataMax + 5"]}
              tickFormatter={formatCurrency}
              className="text-xs"
            />
            <Tooltip
              labelFormatter={(label) => new Date(label).toLocaleString()}
              formatter={(value: number) => [formatCurrency(value), "Price"]}
              contentStyle={{
                backgroundColor: "var(--background)",
                border: "1px solid var(--border)",
                borderRadius: "6px",
              }}
            />
            <Line
              type="monotone"
              dataKey="close"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={false}
              activeDot={{
                r: 4,
                stroke: "#3b82f6",
                strokeWidth: 2,
                fill: "#fff",
              }}
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
              <span
                className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
                  currentPrice.change >= 0
                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                    : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                }`}
              >
                {currentPrice.change >= 0 ? "↑" : "↓"}
                {formatCurrency(Math.abs(currentPrice.change))}(
                {currentPrice.changePercent.toFixed(2)}%)
              </span>
            </div>
          )}
        </div>

        {error && <div className="text-sm text-destructive">{error}</div>}
      </div>

      {/* Chart */}
      <div style={{ height: height }}>
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </div>

      {/* Chart Controls */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t">
        <div className="flex gap-2">
          {(["line", "area", "candlestick", "volume"] as const).map((type) => (
            <button
              key={type}
              onClick={() => {
                // In a real implementation, this would update the chartType prop
                window.location.href = `${window.location.pathname}?chartType=${type}`;
              }}
              className={`px-3 py-1 text-xs rounded-md transition-colors ${
                chartType === type
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {type === "candlestick"
                ? "OHLC"
                : type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {chartType === "candlestick" && (
            <button
              onClick={() => setAnnotations([])}
              className="px-2 py-1 text-xs bg-secondary text-secondary-foreground rounded hover:bg-secondary/80"
            >
              Clear Annotations
            </button>
          )}
          <div className="text-xs text-muted-foreground">
            Last updated: {new Date().toLocaleTimeString()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandlestickChart;
