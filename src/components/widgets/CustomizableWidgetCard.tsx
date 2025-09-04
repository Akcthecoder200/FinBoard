// Enhanced Customizable Widget Card with Editable Titles
// Supports responsive design, loading states, and comprehensive error handling

"use client";

import React, { useState, useRef, useEffect } from "react";
import { Widget } from "../../store/slices/widgetsSlice";
import { useDispatch } from "react-redux";
import { updateWidget } from "../../store/slices/widgetsSlice";
import { useWidgetData } from "../../hooks/useFinancialData";
import ChartWidget from "./ChartWidget";
import TableWidget from "./TableWidget";
import PortfolioWidget from "./PortfolioWidget";

interface CustomizableWidgetCardProps {
  widget: Widget;
  onRemove: () => void;
  isDragging?: boolean;
  className?: string;
}

type DataType = {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume?: number;
  marketCap?: number;
};

type MarketDataType = {
  indices: Record<
    string,
    {
      value: number;
      change: number;
      changePercent: number;
    }
  >;
};

const CustomizableWidgetCard: React.FC<CustomizableWidgetCardProps> = ({
  widget,
  onRemove,
  isDragging = false,
  className = "",
}) => {
  const dispatch = useDispatch();
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState(widget.title);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const titleInputRef = useRef<HTMLInputElement>(null);

  // Use the existing useWidgetData hook for consistency
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

  // Widget data object for compatibility
  const widgetData = {
    data,
    loading,
    error,
    lastUpdated: new Date(),
    refetch,
    cached: false,
  };

  // Focus title input when editing starts
  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, [isEditingTitle]);

  // Handle title edit
  const handleTitleEdit = () => {
    setTempTitle(widget.title);
    setIsEditingTitle(true);
  };

  const handleTitleSave = () => {
    if (tempTitle.trim() && tempTitle !== widget.title) {
      dispatch(
        updateWidget({
          ...widget,
          title: tempTitle.trim(),
        })
      );
    }
    setIsEditingTitle(false);
  };

  const handleTitleCancel = () => {
    setTempTitle(widget.title);
    setIsEditingTitle(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleTitleSave();
    } else if (e.key === "Escape") {
      handleTitleCancel();
    }
  };

  // Get widget icon
  const getWidgetIcon = (type: string) => {
    const icons: Record<string, string> = {
      stock: "📈",
      crypto: "₿",
      "market-overview": "🌐",
      portfolio: "💼",
      chart: "📊",
      table: "📋",
    };
    return icons[type] || "📋";
  };

  // Get status indicator
  const getStatusIndicator = () => {
    if (widgetData.error) {
      return {
        color: "bg-red-500",
        text: "Error",
        pulse: false,
      };
    }
    if (widgetData.loading) {
      return {
        color: "bg-yellow-500",
        text: "Loading",
        pulse: true,
      };
    }
    if ("cached" in widgetData && widgetData.cached) {
      return {
        color: "bg-blue-500",
        text: "Cached",
        pulse: false,
      };
    }
    return {
      color: "bg-green-500",
      text: "Live",
      pulse: true,
    };
  };

  const status = getStatusIndicator();

  // Render loading state
  const renderLoadingState = () => (
    <div className="flex flex-col items-center justify-center h-32 space-y-3">
      <div className="relative">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <div className="absolute inset-0 rounded-full h-8 w-8 border-r-2 border-primary/30 animate-ping"></div>
      </div>
      <div className="text-sm text-muted-foreground animate-pulse">
        Loading {widget.type} data...
      </div>
    </div>
  );

  // Render error state
  const renderErrorState = () => (
    <div className="flex flex-col items-center justify-center h-32 space-y-3">
      <div className="flex items-center justify-center w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full">
        <span className="text-red-600 dark:text-red-400 text-xl">⚠️</span>
      </div>
      <div className="text-center space-y-2">
        <div className="text-sm font-medium text-red-600 dark:text-red-400">
          Failed to load data
        </div>
        <div className="text-xs text-muted-foreground max-w-xs">
          {widgetData.error}
        </div>
        <button
          onClick={() => widgetData.refetch()}
          className="inline-flex items-center gap-1 px-3 py-1 text-xs bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-md hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
        >
          <span className="w-3 h-3">🔄</span>
          Retry
        </button>
      </div>
    </div>
  );

  // Render empty state
  const renderEmptyState = () => (
    <div className="flex flex-col items-center justify-center h-32 space-y-3">
      <div className="flex items-center justify-center w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full">
        <span className="text-gray-400 text-xl">📭</span>
      </div>
      <div className="text-center">
        <div className="text-sm font-medium text-muted-foreground">
          No data available
        </div>
        <div className="text-xs text-muted-foreground/60 mt-1">
          Check your configuration or try refreshing
        </div>
      </div>
    </div>
  );

  // Render stock data
  const renderStockData = () => {
    const data = widgetData.data as DataType;
    if (!data) return renderEmptyState();

    const isPositive = data.change >= 0;

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full ${
              isPositive ? "bg-green-500" : "bg-red-500"
            }`}
          ></div>
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            {data.symbol} • Live Stock Data
          </span>
        </div>

        <div className="space-y-2">
          <div className="text-3xl font-bold text-foreground">
            ${data.price.toFixed(2)}
          </div>
          <div
            className={`text-lg font-semibold ${
              isPositive ? "text-green-600" : "text-red-600"
            }`}
          >
            {isPositive ? "+" : ""}${data.change.toFixed(2)} (
            {isPositive ? "+" : ""}
            {data.changePercent.toFixed(2)}%)
          </div>
        </div>

        {(data.volume || data.marketCap) && (
          <div className="grid grid-cols-2 gap-4 pt-3 border-t border-border">
            {data.volume && (
              <div>
                <div className="text-xs text-muted-foreground">Volume</div>
                <div className="text-sm font-medium">
                  {(data.volume / 1e6).toFixed(1)}M
                </div>
              </div>
            )}
            {data.marketCap && (
              <div>
                <div className="text-xs text-muted-foreground">Market Cap</div>
                <div className="text-sm font-medium">
                  ${(data.marketCap / 1e9).toFixed(1)}B
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // Render market data
  const renderMarketData = () => {
    const data = widgetData.data as MarketDataType;
    if (!data?.indices) return renderEmptyState();

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Market Overview
          </span>
        </div>

        <div className="space-y-3">
          {Object.entries(data.indices)
            .slice(0, 3)
            .map(([key, indexData]) => {
              const isPositive = indexData.change >= 0;
              return (
                <div
                  key={key}
                  className="flex items-center justify-between p-3 bg-secondary/20 rounded-lg"
                >
                  <div>
                    <div className="font-medium text-sm">
                      {key.replace(/([A-Z])/g, " $1").trim()}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {indexData.value.toFixed(2)}
                    </div>
                  </div>
                  <div
                    className={`text-right ${
                      isPositive ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    <div className="text-sm font-medium">
                      {isPositive ? "+" : ""}
                      {indexData.changePercent.toFixed(2)}%
                    </div>
                    <div className="text-xs">
                      {isPositive ? "+" : ""}
                      {indexData.change.toFixed(2)}
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    );
  };

  // Render widget content based on type
  const renderWidgetContent = () => {
    // Handle loading state
    if (widgetData.loading) {
      return renderLoadingState();
    }

    // Handle error state
    if (widgetData.error) {
      return renderErrorState();
    }

    // Render content based on widget type
    switch (widget.type) {
      case "stock":
        return renderStockData();
      case "crypto":
        return renderStockData(); // Crypto uses same format as stock
      case "market-overview":
        return renderMarketData();
      case "chart":
        return (
          <ChartWidget
            symbol={(widget.config?.symbol as string) || "AAPL"}
            title={widget.title}
            chartType={
              (widget.config?.chartType as "line" | "area" | "volume") || "line"
            }
            timeRange={
              (widget.config?.timeRange as
                | "1D"
                | "5D"
                | "1M"
                | "3M"
                | "6M"
                | "1Y") || "1D"
            }
            height={300}
            refreshInterval={60000}
          />
        );
      case "table":
        return (
          <TableWidget
            symbols={
              (widget.config?.symbols as string[]) || ["AAPL", "GOOGL", "MSFT"]
            }
            height={(widget.config?.height as number) || 400}
            pageSize={(widget.config?.pageSize as number) || 10}
            showFilters={(widget.config?.showFilters as boolean) ?? true}
            title={widget.title}
          />
        );
      case "portfolio":
        return (
          <PortfolioWidget
            portfolioId={(widget.config?.portfolioId as string) || "default"}
            showDetailed={(widget.config?.showDetailed as boolean) ?? true}
          />
        );
      default:
        return (
          <div className="text-center py-6 text-muted-foreground text-sm">
            Widget type &quot;{widget.type}&quot; not supported
          </div>
        );
    }
  };

  const cardClasses = `
    group relative bg-card border border-border rounded-xl p-6 
    hover:shadow-xl hover:shadow-primary/5 hover:border-primary/20 
    transition-all duration-300 ${isDragging ? "opacity-50 scale-95" : ""} 
    ${isFullscreen ? "fixed inset-4 z-50 overflow-auto" : ""} 
    ${className}
  `;

  return (
    <div className={cardClasses}>
      {/* Widget Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors flex-shrink-0">
            <span className="text-lg">{getWidgetIcon(widget.type)}</span>
          </div>

          <div className="flex-1 min-w-0">
            {isEditingTitle ? (
              <input
                ref={titleInputRef}
                value={tempTitle}
                onChange={(e) => setTempTitle(e.target.value)}
                onBlur={handleTitleSave}
                onKeyDown={handleKeyPress}
                className="text-lg font-semibold bg-transparent border-b-2 border-primary focus:outline-none w-full"
                maxLength={50}
              />
            ) : (
              <h3
                className="text-lg font-semibold text-foreground cursor-pointer hover:text-primary transition-colors truncate"
                onClick={handleTitleEdit}
                title="Click to edit title"
              >
                {widget.title}
              </h3>
            )}
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-muted-foreground capitalize">
                {widget.type.replace("-", " ")} widget
              </span>
              <div className="flex items-center gap-1">
                <div
                  className={`w-1.5 h-1.5 rounded-full ${status.color} ${
                    status.pulse ? "animate-pulse" : ""
                  }`}
                ></div>
                <span className="text-xs text-muted-foreground">
                  {status.text}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {/* Refresh Button */}
          <button
            onClick={() => widgetData.refetch()}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
            title="Refresh data"
            disabled={widgetData.loading}
          >
            <svg
              className={`w-4 h-4 ${widgetData.loading ? "animate-spin" : ""}`}
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

          {/* Fullscreen Button */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
            title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isFullscreen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
                />
              )}
            </svg>
          </button>

          {/* Settings Button */}
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
            title="Widget settings"
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
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </button>

          {/* Remove Button */}
          <button
            onClick={onRemove}
            className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
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

      {/* Widget Content */}
      <div className="min-h-[200px]">{renderWidgetContent()}</div>

      {/* Fullscreen Overlay */}
      {isFullscreen && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsFullscreen(false)}
        />
      )}
    </div>
  );
};

export default CustomizableWidgetCard;
