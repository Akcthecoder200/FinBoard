"use client";

import { Widget } from "@/store/slices/widgetsSlice";
import { useWidgetData } from "@/hooks/useFinancialData";
import ChartWidget from "./ChartWidget";
import {
  formatCurrency,
  formatPercentage,
  type StockData,
  type CryptoData,
  type MarketData,
} from "@/services/financialApi";

interface WidgetCardProps {
  widget: Widget;
  onRemove: () => void;
}

// Type guards for different data types
const isStockData = (data: unknown): data is StockData => {
  return (
    typeof data === "object" &&
    data !== null &&
    "symbol" in data &&
    "price" in data &&
    "change" in data
  );
};

const isCryptoData = (data: unknown): data is CryptoData => {
  return (
    typeof data === "object" &&
    data !== null &&
    "symbol" in data &&
    "price" in data &&
    "change" in data
  );
};

const isMarketData = (data: unknown): data is MarketData => {
  return typeof data === "object" && data !== null && "indices" in data;
};

const isStockArray = (data: unknown): data is StockData[] => {
  return Array.isArray(data) && data.length > 0 && isStockData(data[0]);
};

export function WidgetCard({ widget, onRemove }: WidgetCardProps) {
  // Use our real data hook
  const { data, loading, error, refetch } = useWidgetData(
    {
      type: widget.type,
      config: widget.config || {},
    },
    {
      refreshInterval: 60000, // Refresh every minute
      enabled: true,
    }
  );

  const getWidgetIcon = (type: string) => {
    switch (type) {
      case "stock":
        return "📈";
      case "crypto":
        return "₿";
      case "market-overview":
        return "🌐";
      case "portfolio":
        return "💼";
      case "chart":
        return "📊";
      default:
        return "📋";
    }
  };

  const getWidgetDescription = (widget: Widget) => {
    switch (widget.type) {
      case "stock":
        return `Real-time stock data for ${
          (widget.config?.symbol as string) || "symbol"
        }`;
      case "crypto":
        return `Live cryptocurrency data for ${
          (widget.config?.symbol as string) || "symbol"
        }`;
      case "market-overview":
        return `Market indices and sector performance overview`;
      case "portfolio":
        const symbols = widget.config?.symbols as string[];
        return `Portfolio tracking ${symbols?.length || 0} symbols`;
      case "chart":
        return `Interactive chart for ${
          (widget.config?.symbol as string) || "symbol"
        }`;
      default:
        return "Custom financial widget";
    }
  };

  const renderStockData = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center py-6">
          <div className="text-red-500 text-sm mb-2">⚠️ {error}</div>
          <button
            onClick={refetch}
            className="text-xs text-primary hover:text-primary/80 underline"
          >
            Retry
          </button>
        </div>
      );
    }

    if (!data || !isStockData(data)) {
      return (
        <div className="text-center py-6 text-muted-foreground text-sm">
          No data available
        </div>
      );
    }

    const isPositive = data.change >= 0;

    return (
      <div className="text-center">
        <div className="flex items-center gap-2 mb-3 justify-center">
          <div
            className={`w-2 h-2 rounded-full ${
              isPositive ? "bg-green-500" : "bg-red-500"
            }`}
          ></div>
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Live Stock Data
          </span>
        </div>
        <div className="text-2xl font-bold text-foreground mb-2">
          {formatCurrency(data.price)}
        </div>
        <div
          className={`text-sm font-medium mb-4 ${
            isPositive ? "text-green-600" : "text-red-600"
          }`}
        >
          {isPositive ? "+" : ""}
          {formatCurrency(data.change)} ({formatPercentage(data.changePercent)})
        </div>
        {data.volume && (
          <div className="text-xs text-muted-foreground">
            Volume: {data.volume.toLocaleString()}
          </div>
        )}
      </div>
    );
  };

  const renderCryptoData = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center py-6">
          <div className="text-red-500 text-sm mb-2">⚠️ {error}</div>
          <button
            onClick={refetch}
            className="text-xs text-primary hover:text-primary/80 underline"
          >
            Retry
          </button>
        </div>
      );
    }

    if (!data || !isCryptoData(data)) {
      return (
        <div className="text-center py-6 text-muted-foreground text-sm">
          No data available
        </div>
      );
    }

    const isPositive = data.change >= 0;

    return (
      <div className="text-center">
        <div className="flex items-center gap-2 mb-3 justify-center">
          <div
            className={`w-2 h-2 rounded-full ${
              isPositive ? "bg-green-500" : "bg-red-500"
            }`}
          ></div>
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Live Crypto Data
          </span>
        </div>
        <div className="text-2xl font-bold text-foreground mb-2">
          {formatCurrency(data.price)}
        </div>
        <div
          className={`text-sm font-medium mb-4 ${
            isPositive ? "text-green-600" : "text-red-600"
          }`}
        >
          {isPositive ? "+" : ""}
          {formatCurrency(data.change)} ({formatPercentage(data.changePercent)})
        </div>
        {data.volume && (
          <div className="text-xs text-muted-foreground">
            24h Volume: {(data.volume / 1e9).toFixed(2)}B
          </div>
        )}
      </div>
    );
  };

  const renderMarketData = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center py-6">
          <div className="text-red-500 text-sm mb-2">⚠️ {error}</div>
          <button
            onClick={refetch}
            className="text-xs text-primary hover:text-primary/80 underline"
          >
            Retry
          </button>
        </div>
      );
    }

    if (!data || !isMarketData(data) || !data.indices) {
      return (
        <div className="text-center py-6 text-muted-foreground text-sm">
          No market data available
        </div>
      );
    }

    return (
      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Market Overview
          </span>
        </div>
        <div className="space-y-2">
          {Object.entries(data.indices).map(([key, indexData]) => {
            const index = indexData as {
              value: number;
              change: number;
              changePercent: number;
            };
            const isPositive = index.change >= 0;
            return (
              <div
                key={key}
                className="flex justify-between items-center text-sm bg-background/50 rounded-md px-3 py-2"
              >
                <span className="font-medium capitalize">
                  {key.replace(/([A-Z])/g, " $1").trim()}
                </span>
                <span className="font-mono">{index.value.toFixed(2)}</span>
                <span
                  className={`font-mono text-xs px-2 py-1 rounded ${
                    isPositive
                      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                      : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                  }`}
                >
                  {formatPercentage(index.changePercent)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderPortfolioData = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center py-6">
          <div className="text-red-500 text-sm mb-2">⚠️ {error}</div>
          <button
            onClick={refetch}
            className="text-xs text-primary hover:text-primary/80 underline"
          >
            Retry
          </button>
        </div>
      );
    }

    if (!data || !isStockArray(data) || data.length === 0) {
      return (
        <div className="text-center py-6 text-muted-foreground text-sm">
          No portfolio data available
        </div>
      );
    }

    return (
      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Portfolio
          </span>
        </div>
        <div className="space-y-2">
          {data.slice(0, 3).map((stock, index) => {
            const isPositive = stock.change >= 0;
            return (
              <div
                key={index}
                className="flex justify-between items-center text-sm bg-background/50 rounded-md px-3 py-2"
              >
                <span className="font-mono font-medium">{stock.symbol}</span>
                <span className="font-mono">{formatCurrency(stock.price)}</span>
                <span
                  className={`font-mono text-xs px-2 py-1 rounded ${
                    isPositive
                      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                      : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                  }`}
                >
                  {formatPercentage(stock.changePercent)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderWidgetContent = () => {
    switch (widget.type) {
      case "stock":
        return renderStockData();
      case "crypto":
        return renderCryptoData();
      case "market-overview":
        return renderMarketData();
      case "portfolio":
        return renderPortfolioData();
      case "chart":
        return (
          <ChartWidget
            symbol={(widget.config?.symbol as string) || "AAPL"}
            title={widget.title}
            chartType={(widget.config?.chartType as "line" | "area" | "volume") || "line"}
            timeRange={(widget.config?.timeRange as "1D" | "5D" | "1M" | "3M" | "6M" | "1Y") || "1D"}
            height={300}
            refreshInterval={60000}
          />
        );
      default:
        return (
          <div className="text-center py-6 text-muted-foreground text-sm">
            Unsupported widget type: {widget.type}
          </div>
        );
    }
  };

  return (
    <div className="group bg-card border border-border rounded-xl p-5 hover:shadow-xl hover:shadow-primary/5 hover:border-primary/20 transition-all duration-300">
      {/* Widget Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
            <span className="text-lg">{getWidgetIcon(widget.type)}</span>
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{widget.title}</h3>
            <p className="text-xs text-muted-foreground capitalize">
              {widget.type} widget
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={refetch}
            className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
            title="Refresh data"
            disabled={loading}
          >
            <svg
              className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </button>
          <button
            onClick={onRemove}
            className="p-1.5 text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            title="Remove widget"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Widget Description */}
      <div className="mb-4 px-1">
        <p className="text-sm text-muted-foreground leading-relaxed">
          {getWidgetDescription(widget)}
        </p>
      </div>

      {/* Widget Content */}
      <div className="bg-gradient-to-br from-secondary/30 to-secondary/10 rounded-lg p-4 min-h-[140px] border border-secondary/20">
        {renderWidgetContent()}
      </div>

      {/* Widget Footer */}
      <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-between">
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 bg-muted-foreground/50 rounded-full"></div>
            ID: {widget.id.split("-").pop()}
          </span>
          <span className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 bg-primary/60 rounded-full"></div>
            {widget.type}
          </span>
        </div>
        <div className="text-xs text-muted-foreground">
          <span
            className={`px-2 py-1 rounded-full ${
              error
                ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                : loading
                ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
            }`}
          >
            {error ? "Error" : loading ? "Loading..." : "Live"}
          </span>
        </div>
      </div>
    </div>
  );
}
