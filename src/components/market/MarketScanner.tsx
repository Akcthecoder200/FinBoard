import React, { useState, useEffect, useCallback } from "react";
import { financialApi } from "../../services/financialApi";

interface MarketScannerProps {
  height?: number;
  maxResults?: number;
  refreshInterval?: number;
}

interface ScanResult {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap?: number;
  pe?: number;
  rsi?: number;
  signal: "BUY" | "SELL" | "HOLD" | "STRONG_BUY" | "STRONG_SELL";
  confidence: number;
  lastUpdated: string;
}

interface ScanCriteria {
  minVolume: number;
  maxPrice: number;
  minPrice: number;
  changeThreshold: number;
  rsiOverbought: number;
  rsiOversold: number;
  sectors: string[];
}

const MarketScanner: React.FC<MarketScannerProps> = ({
  height = 600,
  maxResults = 50,
  refreshInterval = 30000, // 30 seconds
}) => {
  const [scanResults, setScanResults] = useState<ScanResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [scanCriteria, setScanCriteria] = useState<ScanCriteria>({
    minVolume: 1000000,
    maxPrice: 1000,
    minPrice: 1,
    changeThreshold: 3,
    rsiOverbought: 70,
    rsiOversold: 30,
    sectors: ["Technology", "Healthcare", "Finance"],
  });
  const [selectedScan, setSelectedScan] = useState<
    "gainer" | "loser" | "volume" | "breakout" | "custom"
  >("gainer");
  const [sortBy, setSortBy] = useState<"change" | "volume" | "signal">(
    "change"
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Popular stocks for scanning (updated with valid symbols)
  const SCAN_UNIVERSE = React.useMemo(
    () => [
      "AAPL",
      "GOOGL",
      "MSFT",
      "AMZN",
      "TSLA",
      "NVDA",
      "META",
      "NFLX",
      "AMD",
      "CRM",
      "UBER",
      "SPOT",
      "ZM",
      "PYPL",
      "ROKU",
      "TWLO",
      "OKTA",
      "SNOW",
      "PLTR",
      "COIN",
      "HOOD",
      "RBLX",
      "UPST",
      "SOFI",
      "LCID",
      "RIVN",
      "F",
      "GM",
      "NIO",
      "BABA",
      "JD",
      "PDD",
      "TME",
      "BILI",
      "IQ",
      "BIDU",
      "WB",
      "TAL",
      "INTC",
      "BA",
      "CAT",
      "DE",
      "MMM",
      "GE",
      "HON",
      "LMT",
      "RTX",
      "UPS",
      "FDX",
    ],
    []
  );

  // Generate signals based on technical indicators
  const generateSignal = (
    price: number,
    change: number,
    changePercent: number,
    volume: number,
    rsi?: number
  ): { signal: ScanResult["signal"]; confidence: number } => {
    let score = 0;
    let confidence = 0;

    // Price momentum scoring
    if (changePercent > 5) score += 2;
    else if (changePercent > 2) score += 1;
    else if (changePercent < -5) score -= 2;
    else if (changePercent < -2) score -= 1;

    // Volume scoring
    if (volume > 2000000) score += 1;
    if (volume > 5000000) score += 1;

    // RSI scoring
    if (rsi) {
      if (rsi > 70) score -= 1; // Overbought
      if (rsi < 30) score += 1; // Oversold
      confidence += 20;
    }

    // Base confidence on available data
    confidence += Math.abs(changePercent) * 5;
    confidence += Math.min(volume / 1000000, 10) * 3;
    confidence = Math.min(confidence, 100);

    // Determine signal
    if (score >= 3) return { signal: "STRONG_BUY", confidence };
    if (score >= 2) return { signal: "BUY", confidence };
    if (score <= -3) return { signal: "STRONG_SELL", confidence };
    if (score <= -2) return { signal: "SELL", confidence };
    return { signal: "HOLD", confidence };
  };

  // Mock RSI calculation for demonstration
  const mockRSI = () => Math.random() * 100;

  const performScan = useCallback(async () => {
    setLoading(true);
    try {
      const results: ScanResult[] = [];

      // Scan a subset of symbols based on scan type
      let symbolsToScan = SCAN_UNIVERSE;

      if (selectedScan === "volume") {
        symbolsToScan = SCAN_UNIVERSE.slice(0, 20); // Focus on most liquid stocks
      } else if (selectedScan === "breakout") {
        symbolsToScan = SCAN_UNIVERSE.slice(10, 30); // Mix of growth stocks
      }

      // Limit concurrent requests to reduce API load
      const batchSize = 3; // Reduced from 5 to 3
      for (
        let i = 0;
        i < symbolsToScan.length && results.length < maxResults;
        i += batchSize
      ) {
        const batch = symbolsToScan.slice(i, i + batchSize);

        try {
          const batchPromises = batch.map(async (symbol) => {
            try {
              const data = await financialApi.getStockQuote(symbol);

              // Skip if API returned an error
              if (
                !data ||
                typeof data.price !== "number" ||
                isNaN(data.price)
              ) {
                return null;
              }

              const rsi = mockRSI();
              const { signal, confidence } = generateSignal(
                data.price,
                data.change,
                data.changePercent,
                data.volume || 1000000,
                rsi
              );

              return {
                symbol,
                name: data.name || symbol,
                price: data.price,
                change: data.change,
                changePercent: data.changePercent,
                volume:
                  data.volume || Math.floor(Math.random() * 5000000) + 1000000,
                rsi,
                signal,
                confidence,
                lastUpdated: new Date().toISOString(),
              } as ScanResult;
            } catch {
              // Silently skip failed symbols instead of logging each error
              return null;
            }
          });

          const batchResults = await Promise.all(batchPromises);
          results.push(
            ...batchResults.filter(
              (result): result is ScanResult => result !== null
            )
          );

          // Longer delay between batches to avoid rate limiting
          if (i + batchSize < symbolsToScan.length) {
            await new Promise((resolve) => setTimeout(resolve, 500)); // Increased from 200ms to 500ms
          }
        } catch (error) {
          console.error("Batch scan error:", error);
        }
      }

      // Filter results based on scan criteria
      const filteredResults = results.filter((result) => {
        if (selectedScan === "gainer") return result.changePercent > 1;
        if (selectedScan === "loser") return result.changePercent < -1;
        if (selectedScan === "volume")
          return result.volume > scanCriteria.minVolume;
        if (selectedScan === "breakout")
          return Math.abs(result.changePercent) > 2;
        return true; // custom or default
      });

      // Sort results
      filteredResults.sort((a, b) => {
        let comparison = 0;

        if (sortBy === "change") {
          comparison = Math.abs(b.changePercent) - Math.abs(a.changePercent);
        } else if (sortBy === "volume") {
          comparison = b.volume - a.volume;
        } else if (sortBy === "signal") {
          const signalOrder = {
            STRONG_BUY: 5,
            BUY: 4,
            HOLD: 3,
            SELL: 2,
            STRONG_SELL: 1,
          };
          comparison = signalOrder[b.signal] - signalOrder[a.signal];
        }

        return sortOrder === "desc" ? comparison : -comparison;
      });

      setScanResults(filteredResults.slice(0, maxResults));
    } catch (error) {
      console.error("Market scan failed:", error);
    } finally {
      setLoading(false);
    }
  }, [
    selectedScan,
    scanCriteria,
    maxResults,
    sortBy,
    sortOrder,
    SCAN_UNIVERSE,
  ]);

  useEffect(() => {
    performScan();

    const interval = setInterval(performScan, refreshInterval);
    return () => clearInterval(interval);
  }, [performScan, refreshInterval]);

  const getSignalColor = (signal: ScanResult["signal"]) => {
    switch (signal) {
      case "STRONG_BUY":
        return "text-green-600 bg-green-100";
      case "BUY":
        return "text-green-500 bg-green-50";
      case "HOLD":
        return "text-gray-500 bg-gray-100";
      case "SELL":
        return "text-red-500 bg-red-50";
      case "STRONG_SELL":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-500 bg-gray-100";
    }
  };

  const getChangeColor = (change: number) => {
    return change >= 0 ? "text-green-600" : "text-red-600";
  };

  return (
    <div className="w-full bg-card rounded-lg border p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold">Market Scanner</h3>
          <p className="text-sm text-muted-foreground">
            Real-time market opportunities and alerts
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={performScan}
            disabled={loading}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {loading ? "Scanning..." : "Refresh Scan"}
          </button>
        </div>
      </div>

      {/* Scan Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Scan Type Selection */}
        <div className="space-y-4">
          <h4 className="font-medium">Scan Type</h4>
          <div className="grid grid-cols-2 gap-2">
            {[
              { key: "gainer", name: "Top Gainers", icon: "📈" },
              { key: "loser", name: "Top Losers", icon: "📉" },
              { key: "volume", name: "High Volume", icon: "📊" },
              { key: "breakout", name: "Breakouts", icon: "🚀" },
            ].map((scan) => (
              <button
                key={scan.key}
                onClick={() => setSelectedScan(scan.key as typeof selectedScan)}
                className={`p-3 text-left rounded-lg border transition-colors ${
                  selectedScan === scan.key
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background hover:bg-muted border-border"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span>{scan.icon}</span>
                  <span className="text-sm font-medium">{scan.name}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Sort Controls */}
        <div className="space-y-4">
          <h4 className="font-medium">Sort & Filter</h4>
          <div className="space-y-3">
            <div className="flex gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="flex-1 px-3 py-2 border border-border rounded-md bg-background text-foreground"
              >
                <option value="change">% Change</option>
                <option value="volume">Volume</option>
                <option value="signal">Signal Strength</option>
              </select>
              <select
                value={sortOrder}
                onChange={(e) =>
                  setSortOrder(e.target.value as typeof sortOrder)
                }
                className="px-3 py-2 border border-border rounded-md bg-background text-foreground"
              >
                <option value="desc">High to Low</option>
                <option value="asc">Low to High</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <label className="block text-muted-foreground mb-1">
                  Min Volume
                </label>
                <input
                  type="number"
                  value={scanCriteria.minVolume}
                  onChange={(e) =>
                    setScanCriteria((prev) => ({
                      ...prev,
                      minVolume: Number(e.target.value),
                    }))
                  }
                  className="w-full px-2 py-1 border border-border rounded bg-background text-foreground"
                  placeholder="1000000"
                />
              </div>
              <div>
                <label className="block text-muted-foreground mb-1">
                  Change %
                </label>
                <input
                  type="number"
                  value={scanCriteria.changeThreshold}
                  onChange={(e) =>
                    setScanCriteria((prev) => ({
                      ...prev,
                      changeThreshold: Number(e.target.value),
                    }))
                  }
                  className="w-full px-2 py-1 border border-border rounded bg-background text-foreground"
                  placeholder="3"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Results Table */}
      <div className="border rounded-lg overflow-hidden">
        <div className="bg-muted/50 px-4 py-3 border-b flex items-center justify-between">
          <h4 className="font-medium">Scan Results ({scanResults.length})</h4>
          <span className="text-xs text-muted-foreground">
            Last updated:{" "}
            {scanResults[0]?.lastUpdated
              ? new Date(scanResults[0].lastUpdated).toLocaleTimeString()
              : "Never"}
          </span>
        </div>

        <div style={{ height: height - 200, overflowY: "auto" }}>
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="text-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
                <p className="text-sm text-muted-foreground">
                  Scanning markets...
                </p>
              </div>
            </div>
          ) : scanResults.length === 0 ? (
            <div className="flex items-center justify-center h-32">
              <p className="text-muted-foreground">
                No results found. Try adjusting your scan criteria.
              </p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-muted/30 sticky top-0">
                <tr className="text-left text-xs">
                  <th className="px-4 py-3">Symbol</th>
                  <th className="px-4 py-3">Price</th>
                  <th className="px-4 py-3">Change</th>
                  <th className="px-4 py-3">% Change</th>
                  <th className="px-4 py-3">Volume</th>
                  <th className="px-4 py-3">RSI</th>
                  <th className="px-4 py-3">Signal</th>
                  <th className="px-4 py-3">Confidence</th>
                </tr>
              </thead>
              <tbody>
                {scanResults.map((result, index) => (
                  <tr
                    key={result.symbol}
                    className={`border-b border-border hover:bg-muted/30 transition-colors ${
                      index % 2 === 0 ? "bg-background" : "bg-muted/10"
                    }`}
                  >
                    <td className="px-4 py-3">
                      <div>
                        <div className="font-medium text-foreground">
                          {result.symbol}
                        </div>
                        <div className="text-xs text-muted-foreground truncate max-w-32">
                          {result.name}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-foreground">
                      ${result.price.toFixed(2)}
                    </td>
                    <td
                      className={`px-4 py-3 font-mono ${getChangeColor(
                        result.change
                      )}`}
                    >
                      {result.change >= 0 ? "+" : ""}${result.change.toFixed(2)}
                    </td>
                    <td
                      className={`px-4 py-3 font-mono font-medium ${getChangeColor(
                        result.change
                      )}`}
                    >
                      {result.changePercent >= 0 ? "+" : ""}
                      {result.changePercent.toFixed(2)}%
                    </td>
                    <td className="px-4 py-3 font-mono text-muted-foreground text-xs">
                      {(result.volume / 1000000).toFixed(1)}M
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`font-mono text-xs ${
                          (result.rsi || 0) > 70
                            ? "text-red-500"
                            : (result.rsi || 0) < 30
                            ? "text-green-500"
                            : "text-muted-foreground"
                        }`}
                      >
                        {result.rsi?.toFixed(0) || "--"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getSignalColor(
                          result.signal
                        )}`}
                      >
                        {result.signal.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-12 bg-muted rounded-full h-1.5">
                          <div
                            className="bg-primary h-1.5 rounded-full transition-all duration-300"
                            style={{ width: `${result.confidence}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-muted-foreground font-mono">
                          {result.confidence.toFixed(0)}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
          <div className="text-green-600 text-sm font-medium">
            Strong Signals
          </div>
          <div className="text-xl font-bold text-green-700">
            {scanResults.filter((r) => r.signal.includes("STRONG")).length}
          </div>
        </div>
        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
          <div className="text-blue-600 text-sm font-medium">High Volume</div>
          <div className="text-xl font-bold text-blue-700">
            {scanResults.filter((r) => r.volume > 2000000).length}
          </div>
        </div>
        <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg">
          <div className="text-purple-600 text-sm font-medium">Breakouts</div>
          <div className="text-xl font-bold text-purple-700">
            {scanResults.filter((r) => Math.abs(r.changePercent) > 5).length}
          </div>
        </div>
        <div className="bg-orange-50 dark:bg-orange-900/20 p-3 rounded-lg">
          <div className="text-orange-600 text-sm font-medium">
            Avg Confidence
          </div>
          <div className="text-xl font-bold text-orange-700">
            {scanResults.length > 0
              ? (
                  scanResults.reduce((sum, r) => sum + r.confidence, 0) /
                  scanResults.length
                ).toFixed(0)
              : 0}
            %
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketScanner;
