import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ComposedChart,
  Bar,
} from "recharts";

interface TechnicalDataPoint {
  date: string;
  price: number;
  volume: number;
  sma5?: number;
  sma10?: number;
  sma20?: number;
  sma50?: number;
  ema12?: number;
  ema26?: number;
  macd?: number;
  macdSignal?: number;
  macdHistogram?: number;
  rsi?: number;
  bb_upper?: number;
  bb_middle?: number;
  bb_lower?: number;
  obv?: number;
}

interface TechnicalIndicatorsProps {
  symbol: string;
  height?: number;
  showIndicators?: string[];
  timeframe?: "1D" | "5D" | "1M" | "3M" | "6M" | "1Y";
}

const TechnicalIndicators: React.FC<TechnicalIndicatorsProps> = ({
  symbol,
  height = 600,
  showIndicators = ["SMA", "RSI", "MACD"],
  timeframe = "3M",
}) => {
  const [data, setData] = useState<TechnicalDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIndicators, setSelectedIndicators] =
    useState<string[]>(showIndicators);

  // Calculate Simple Moving Average
  const calculateSMA = (data: number[], period: number): number[] => {
    const sma: number[] = [];
    for (let i = 0; i < data.length; i++) {
      if (i < period - 1) {
        sma.push(NaN);
      } else {
        const sum = data
          .slice(i - period + 1, i + 1)
          .reduce((a, b) => a + b, 0);
        sma.push(sum / period);
      }
    }
    return sma;
  };

  // Calculate Exponential Moving Average
  const calculateEMA = (data: number[], period: number): number[] => {
    const ema: number[] = [];
    const multiplier = 2 / (period + 1);

    for (let i = 0; i < data.length; i++) {
      if (i === 0) {
        ema.push(data[i]);
      } else {
        ema.push(data[i] * multiplier + ema[i - 1] * (1 - multiplier));
      }
    }
    return ema;
  };

  // Calculate MACD
  const calculateMACD = useCallback((prices: number[]) => {
    const ema12 = calculateEMA(prices, 12);
    const ema26 = calculateEMA(prices, 26);
    const macd = ema12.map((val, i) => val - ema26[i]);
    const macdSignal = calculateEMA(macd, 9);
    const macdHistogram = macd.map((val, i) => val - macdSignal[i]);

    return { macd, macdSignal, macdHistogram };
  }, []);

  // Calculate RSI
  const calculateRSI = (prices: number[], period: number = 14): number[] => {
    const rsi: number[] = [];
    const gains: number[] = [];
    const losses: number[] = [];

    for (let i = 1; i < prices.length; i++) {
      const change = prices[i] - prices[i - 1];
      gains.push(change > 0 ? change : 0);
      losses.push(change < 0 ? Math.abs(change) : 0);
    }

    for (let i = 0; i < gains.length; i++) {
      if (i < period - 1) {
        rsi.push(NaN);
      } else {
        const avgGain =
          gains.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0) /
          period;
        const avgLoss =
          losses.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0) /
          period;

        if (avgLoss === 0) {
          rsi.push(100);
        } else {
          const rs = avgGain / avgLoss;
          rsi.push(100 - 100 / (1 + rs));
        }
      }
    }

    return [NaN, ...rsi]; // Add NaN for first price point
  };

  // Calculate Bollinger Bands
  const calculateBollingerBands = useCallback(
    (prices: number[], period: number = 20, multiplier: number = 2) => {
      const sma = calculateSMA(prices, period);
      const bands: { upper: number[]; middle: number[]; lower: number[] } = {
        upper: [],
        middle: [],
        lower: [],
      };

      for (let i = 0; i < prices.length; i++) {
        if (i < period - 1) {
          bands.upper.push(NaN);
          bands.middle.push(NaN);
          bands.lower.push(NaN);
        } else {
          const slice = prices.slice(i - period + 1, i + 1);
          const mean = sma[i];
          const variance =
            slice.reduce((sum, price) => sum + Math.pow(price - mean, 2), 0) /
            period;
          const stdDev = Math.sqrt(variance);

          bands.upper.push(mean + stdDev * multiplier);
          bands.middle.push(mean);
          bands.lower.push(mean - stdDev * multiplier);
        }
      }

      return bands;
    },
    []
  );

  // Calculate On-Balance Volume
  const calculateOBV = (prices: number[], volumes: number[]): number[] => {
    const obv: number[] = [volumes[0]];

    for (let i = 1; i < prices.length; i++) {
      if (prices[i] > prices[i - 1]) {
        obv.push(obv[i - 1] + volumes[i]);
      } else if (prices[i] < prices[i - 1]) {
        obv.push(obv[i - 1] - volumes[i]);
      } else {
        obv.push(obv[i - 1]);
      }
    }

    return obv;
  };

  // Generate enhanced market data with technical indicators
  const generateEnhancedData = useMemo(() => {
    const days =
      timeframe === "1D"
        ? 1
        : timeframe === "5D"
        ? 5
        : timeframe === "1M"
        ? 30
        : timeframe === "3M"
        ? 90
        : timeframe === "6M"
        ? 180
        : 365;

    const baseData: TechnicalDataPoint[] = [];
    const today = new Date();
    let basePrice = 150 + Math.random() * 100; // Random starting price

    // Generate base price and volume data
    for (let i = days; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);

      // Realistic price movement with trend and volatility
      const trend = 0.0002; // Slight upward trend
      const volatility = 0.02;
      const randomChange = (Math.random() - 0.5) * 2 * volatility + trend;
      basePrice *= 1 + randomChange;

      const volume = Math.floor(Math.random() * 2000000) + 500000;

      baseData.push({
        date: date.toISOString().split("T")[0],
        price: Number(basePrice.toFixed(2)),
        volume,
      });
    }

    // Calculate technical indicators
    const prices = baseData.map((d) => d.price);
    const volumes = baseData.map((d) => d.volume);

    const sma5 = calculateSMA(prices, 5);
    const sma10 = calculateSMA(prices, 10);
    const sma20 = calculateSMA(prices, 20);
    const sma50 = calculateSMA(prices, 50);

    const ema12 = calculateEMA(prices, 12);
    const ema26 = calculateEMA(prices, 26);

    const { macd, macdSignal, macdHistogram } = calculateMACD(prices);
    const rsi = calculateRSI(prices);
    const bollingerBands = calculateBollingerBands(prices);
    const obv = calculateOBV(prices, volumes);

    // Combine all data
    return baseData.map((item, index) => ({
      ...item,
      sma5: sma5[index],
      sma10: sma10[index],
      sma20: sma20[index],
      sma50: sma50[index],
      ema12: ema12[index],
      ema26: ema26[index],
      macd: macd[index],
      macdSignal: macdSignal[index],
      macdHistogram: macdHistogram[index],
      rsi: rsi[index],
      bb_upper: bollingerBands.upper[index],
      bb_middle: bollingerBands.middle[index],
      bb_lower: bollingerBands.lower[index],
      obv: obv[index],
    }));
  }, [timeframe, calculateMACD, calculateBollingerBands]);

  useEffect(() => {
    setLoading(true);
    // Simulate API call delay
    const timer = setTimeout(() => {
      setData(generateEnhancedData);
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [generateEnhancedData, symbol]);

  const availableIndicators = [
    { key: "SMA", name: "Simple Moving Averages", color: "#3b82f6" },
    { key: "EMA", name: "Exponential Moving Averages", color: "#10b981" },
    { key: "BOLLINGER", name: "Bollinger Bands", color: "#8b5cf6" },
    { key: "RSI", name: "Relative Strength Index", color: "#f59e0b" },
    { key: "MACD", name: "MACD", color: "#ef4444" },
    { key: "OBV", name: "On-Balance Volume", color: "#06b6d4" },
  ];

  const toggleIndicator = (indicator: string) => {
    setSelectedIndicators((prev) =>
      prev.includes(indicator)
        ? prev.filter((i) => i !== indicator)
        : [...prev, indicator]
    );
  };

  if (loading) {
    return (
      <div className="w-full bg-card rounded-lg border p-6">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            <p className="text-muted-foreground">
              Loading technical indicators for {symbol}...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-card rounded-lg border p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold">
            Technical Analysis - {symbol}
          </h3>
          <p className="text-sm text-muted-foreground">
            Advanced technical indicators and market analysis
          </p>
        </div>

        {/* Timeframe Selector */}
        <div className="flex gap-2">
          {(["1D", "5D", "1M", "3M", "6M", "1Y"] as const).map((tf) => (
            <button
              key={tf}
              onClick={() => {
                /* setTimeframe(tf) */
              }}
              className={`px-3 py-1 text-xs rounded-md transition-colors ${
                timeframe === tf
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* Indicator Toggles */}
      <div className="mb-6 p-4 bg-muted/30 rounded-lg">
        <h4 className="text-sm font-medium mb-3">Technical Indicators</h4>
        <div className="flex flex-wrap gap-2">
          {availableIndicators.map((indicator) => (
            <button
              key={indicator.key}
              onClick={() => toggleIndicator(indicator.key)}
              className={`px-3 py-1 text-xs rounded-md transition-colors border ${
                selectedIndicators.includes(indicator.key)
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background text-foreground border-border hover:bg-muted"
              }`}
            >
              <span
                className="inline-block w-2 h-2 rounded-full mr-2"
                style={{ backgroundColor: indicator.color }}
              ></span>
              {indicator.name}
            </button>
          ))}
        </div>
      </div>

      {/* Main Price Chart with Moving Averages */}
      <div className="mb-6">
        <h4 className="text-lg font-medium mb-3">Price & Moving Averages</h4>
        <div style={{ height: height * 0.4 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis
                dataKey="date"
                tickFormatter={(date) =>
                  new Date(date).toLocaleDateString([], {
                    month: "short",
                    day: "numeric",
                  })
                }
                className="text-xs"
              />
              <YAxis className="text-xs" />
              <Tooltip
                labelFormatter={(date) => new Date(date).toLocaleDateString()}
                formatter={(value: number) => [value?.toFixed(2), ""]}
                contentStyle={{
                  backgroundColor: "var(--background)",
                  border: "1px solid var(--border)",
                  borderRadius: "6px",
                }}
              />

              {/* Price Line */}
              <Line
                type="monotone"
                dataKey="price"
                stroke="#000"
                strokeWidth={2}
                name="Price"
                dot={false}
              />

              {/* Moving Averages */}
              {selectedIndicators.includes("SMA") && (
                <>
                  <Line
                    type="monotone"
                    dataKey="sma5"
                    stroke="#3b82f6"
                    strokeWidth={1}
                    name="SMA 5"
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="sma10"
                    stroke="#10b981"
                    strokeWidth={1}
                    name="SMA 10"
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="sma20"
                    stroke="#f59e0b"
                    strokeWidth={1}
                    name="SMA 20"
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="sma50"
                    stroke="#ef4444"
                    strokeWidth={1}
                    name="SMA 50"
                    dot={false}
                  />
                </>
              )}

              {selectedIndicators.includes("EMA") && (
                <>
                  <Line
                    type="monotone"
                    dataKey="ema12"
                    stroke="#8b5cf6"
                    strokeWidth={1}
                    strokeDasharray="5 5"
                    name="EMA 12"
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="ema26"
                    stroke="#06b6d4"
                    strokeWidth={1}
                    strokeDasharray="5 5"
                    name="EMA 26"
                    dot={false}
                  />
                </>
              )}

              {selectedIndicators.includes("BOLLINGER") && (
                <>
                  <Line
                    type="monotone"
                    dataKey="bb_upper"
                    stroke="#8b5cf6"
                    strokeWidth={1}
                    name="BB Upper"
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="bb_middle"
                    stroke="#8b5cf6"
                    strokeWidth={1}
                    name="BB Middle"
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="bb_lower"
                    stroke="#8b5cf6"
                    strokeWidth={1}
                    name="BB Lower"
                    dot={false}
                  />
                </>
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* RSI Chart */}
      {selectedIndicators.includes("RSI") && (
        <div className="mb-6">
          <h4 className="text-lg font-medium mb-3">
            Relative Strength Index (RSI)
          </h4>
          <div style={{ height: height * 0.25 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(date) =>
                    new Date(date).toLocaleDateString([], {
                      month: "short",
                      day: "numeric",
                    })
                  }
                  className="text-xs"
                />
                <YAxis domain={[0, 100]} className="text-xs" />
                <Tooltip
                  labelFormatter={(date) => new Date(date).toLocaleDateString()}
                  formatter={(value: number) => [value?.toFixed(2), "RSI"]}
                  contentStyle={{
                    backgroundColor: "var(--background)",
                    border: "1px solid var(--border)",
                    borderRadius: "6px",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="rsi"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  name="RSI"
                  dot={false}
                />
                {/* RSI Levels */}
                <Line
                  type="monotone"
                  dataKey={() => 70}
                  stroke="#ef4444"
                  strokeWidth={1}
                  strokeDasharray="2 2"
                  name="Overbought (70)"
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey={() => 30}
                  stroke="#10b981"
                  strokeWidth={1}
                  strokeDasharray="2 2"
                  name="Oversold (30)"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* MACD Chart */}
      {selectedIndicators.includes("MACD") && (
        <div className="mb-6">
          <h4 className="text-lg font-medium mb-3">MACD</h4>
          <div style={{ height: height * 0.25 }}>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={data}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(date) =>
                    new Date(date).toLocaleDateString([], {
                      month: "short",
                      day: "numeric",
                    })
                  }
                  className="text-xs"
                />
                <YAxis className="text-xs" />
                <Tooltip
                  labelFormatter={(date) => new Date(date).toLocaleDateString()}
                  formatter={(value: number, name: string) => [
                    value?.toFixed(4),
                    name,
                  ]}
                  contentStyle={{
                    backgroundColor: "var(--background)",
                    border: "1px solid var(--border)",
                    borderRadius: "6px",
                  }}
                />
                <Bar
                  dataKey="macdHistogram"
                  fill="#ef4444"
                  opacity={0.6}
                  name="MACD Histogram"
                />
                <Line
                  type="monotone"
                  dataKey="macd"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  name="MACD"
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="macdSignal"
                  stroke="#10b981"
                  strokeWidth={2}
                  name="Signal"
                  dot={false}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Volume Analysis */}
      {selectedIndicators.includes("OBV") && (
        <div>
          <h4 className="text-lg font-medium mb-3">Volume Analysis</h4>
          <div style={{ height: height * 0.25 }}>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={data}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(date) =>
                    new Date(date).toLocaleDateString([], {
                      month: "short",
                      day: "numeric",
                    })
                  }
                  className="text-xs"
                />
                <YAxis
                  yAxisId="volume"
                  orientation="left"
                  className="text-xs"
                />
                <YAxis yAxisId="obv" orientation="right" className="text-xs" />
                <Tooltip
                  labelFormatter={(date) => new Date(date).toLocaleDateString()}
                  formatter={(value: number, name: string) => [
                    name === "Volume"
                      ? value.toLocaleString()
                      : value?.toFixed(0),
                    name,
                  ]}
                  contentStyle={{
                    backgroundColor: "var(--background)",
                    border: "1px solid var(--border)",
                    borderRadius: "6px",
                  }}
                />
                <Bar
                  yAxisId="volume"
                  dataKey="volume"
                  fill="#06b6d4"
                  opacity={0.6}
                  name="Volume"
                />
                <Line
                  yAxisId="obv"
                  type="monotone"
                  dataKey="obv"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  name="OBV"
                  dot={false}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};

export default TechnicalIndicators;
