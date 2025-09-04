// API Integration Demo Component
// Showcases Dynamic Data Mapping and Intelligent Caching features

"use client";

import React, { useState } from "react";
import {
  useStockData,
  useMultipleStocks,
  useCacheManagement,
  useDataMapping,
  usePreWarmCache,
  useFinancialUtils,
} from "../hooks/useEnhancedFinancialData";

const ApiIntegrationDemo: React.FC = () => {
  const [selectedSymbol, setSelectedSymbol] = useState("AAPL");
  const [watchlistSymbols] = useState([
    "AAPL",
    "GOOGL",
    "MSFT",
    "TSLA",
    "AMZN",
  ]);

  // Enhanced hooks
  const stockData = useStockData(selectedSymbol, {
    autoRefresh: true,
    refreshInterval: 60000, // 1 minute
  });

  const multipleStocks = useMultipleStocks(watchlistSymbols);
  const cacheManagement = useCacheManagement();
  const dataMapping = useDataMapping();
  const preWarmCache = usePreWarmCache();
  const utils = useFinancialUtils();

  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">🚀 API Integration System</h1>
        <p className="text-blue-100">
          Advanced features: Dynamic Data Mapping, Intelligent Caching, Request
          Deduplication
        </p>
      </div>

      {/* Quick Controls */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Stock Symbol
          </label>
          <select
            value={selectedSymbol}
            onChange={(e) => setSelectedSymbol(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {watchlistSymbols.map((symbol) => (
              <option key={symbol} value={symbol}>
                {symbol}
              </option>
            ))}
          </select>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <button
            onClick={() => stockData.invalidateCache()}
            className="w-full px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            🔄 Force Refresh
          </button>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <button
            onClick={() => preWarmCache.preWarmCache()}
            disabled={preWarmCache.isWarming}
            className="w-full px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
          >
            {preWarmCache.isWarming ? "🔥 Warming..." : "🔥 Pre-warm Cache"}
          </button>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="w-full px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            ⚙️ {showAdvanced ? "Hide" : "Show"} Advanced
          </button>
        </div>
      </div>

      {/* Current Stock Data */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            📈 Current Stock: {selectedSymbol}
          </h2>
          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
            <span>
              Status:{" "}
              {stockData.loading
                ? "🔄 Loading"
                : stockData.cached
                ? "💾 Cached"
                : "🌐 Live"}
            </span>
            {stockData.lastUpdated && (
              <span>
                Last Updated: {stockData.lastUpdated.toLocaleTimeString()}
              </span>
            )}
            {stockData.retryCount > 0 && (
              <span className="text-orange-600">
                Retries: {stockData.retryCount}
              </span>
            )}
          </div>
        </div>

        <div className="p-6">
          {stockData.loading && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Loading stock data...</span>
            </div>
          )}

          {stockData.error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <span className="text-red-400">❌</span>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error</h3>
                  <p className="mt-1 text-sm text-red-700">{stockData.error}</p>
                  <button
                    onClick={stockData.retry}
                    className="mt-2 text-sm bg-red-100 text-red-800 px-3 py-1 rounded hover:bg-red-200"
                  >
                    Retry
                  </button>
                </div>
              </div>
            </div>
          )}

          {stockData.data && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {utils.formatCurrency(stockData.data.price)}
                </div>
                <div className="text-sm text-gray-600">Current Price</div>
              </div>
              <div className="text-center">
                <div
                  className={`text-2xl font-bold ${
                    stockData.data.change >= 0
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {utils.formatPercentage(stockData.data.changePercent)}
                </div>
                <div className="text-sm text-gray-600">Change %</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {stockData.data.volume
                    ? utils.formatLargeNumber(stockData.data.volume)
                    : "N/A"}
                </div>
                <div className="text-sm text-gray-600">Volume</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {stockData.data.marketCap
                    ? utils.formatLargeNumber(stockData.data.marketCap)
                    : "N/A"}
                </div>
                <div className="text-sm text-gray-600">Market Cap</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Watchlist */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">📊 Watchlist</h2>
          <p className="text-sm text-gray-600 mt-1">
            Status:{" "}
            {multipleStocks.loading
              ? "Loading..."
              : `${Object.keys(multipleStocks.data).length} stocks loaded`}
          </p>
        </div>

        <div className="p-6">
          {multipleStocks.loading && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Loading watchlist...</span>
            </div>
          )}

          {multipleStocks.error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-red-700">{multipleStocks.error}</p>
            </div>
          )}

          {!multipleStocks.loading &&
            Object.keys(multipleStocks.data).length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {Object.values(multipleStocks.data).map((stock) => (
                  <div
                    key={stock.symbol}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                      selectedSymbol === stock.symbol
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => setSelectedSymbol(stock.symbol)}
                  >
                    <div className="font-semibold text-gray-900">
                      {stock.symbol}
                    </div>
                    <div className="text-lg font-bold text-gray-900 mt-1">
                      {utils.formatCurrency(stock.price)}
                    </div>
                    <div
                      className={`text-sm ${
                        stock.change >= 0 ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {utils.formatPercentage(stock.changePercent)}
                    </div>
                  </div>
                ))}
              </div>
            )}
        </div>
      </div>

      {/* Advanced Features */}
      {showAdvanced && (
        <div className="space-y-6">
          {/* Cache Management */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                💾 Cache Management
              </h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {cacheManagement.cacheStats.stock.totalEntries}
                  </div>
                  <div className="text-sm text-blue-800">
                    Stock Cache Entries
                  </div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {cacheManagement.cacheStats.stock.hitRate.toFixed(1)}%
                  </div>
                  <div className="text-sm text-green-800">Cache Hit Rate</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {Math.round(
                      cacheManagement.cacheStats.stock.totalSize / 1024
                    )}
                    KB
                  </div>
                  <div className="text-sm text-purple-800">Cache Size</div>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">
                    {cacheManagement.cacheStats.market.totalEntries}
                  </div>
                  <div className="text-sm text-orange-800">
                    Market Cache Entries
                  </div>
                </div>
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={cacheManagement.refreshStats}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  🔄 Refresh Stats
                </button>
                <button
                  onClick={cacheManagement.clearAllCaches}
                  className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                >
                  🗑️ Clear All Caches
                </button>
                <button
                  onClick={() => cacheManagement.invalidateByTags(["stock"])}
                  className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600"
                >
                  🏷️ Invalidate Stock Cache
                </button>
              </div>
            </div>
          </div>

          {/* Data Mapping */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                🗺️ Data Mapping
              </h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">
                    API Schemas
                  </h3>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {dataMapping.schemas.map((schema, index) => (
                      <div
                        key={index}
                        className="bg-gray-50 p-3 rounded border"
                      >
                        <div className="font-medium text-gray-900">
                          {schema.apiSource}: {schema.endpoint}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          {schema.fields.length} fields •{" "}
                          {schema.metadata.statusCode} status •
                          {schema.metadata.responseTime}ms
                        </div>
                      </div>
                    ))}
                    {dataMapping.schemas.length === 0 && (
                      <p className="text-gray-500 italic">
                        No schemas discovered yet. Try fetching some data!
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">
                    Mapping Templates
                  </h3>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {dataMapping.templates.map((template) => (
                      <div
                        key={template.id}
                        className="bg-gray-50 p-3 rounded border"
                      >
                        <div className="font-medium text-gray-900">
                          {template.name}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          {template.description}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {template.mappings.length} mappings • Created{" "}
                          {template.createdAt.toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                    {dataMapping.templates.length === 0 && (
                      <p className="text-gray-500 italic">
                        No templates created yet.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApiIntegrationDemo;
