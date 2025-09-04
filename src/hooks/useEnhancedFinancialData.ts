// Enhanced Financial Data Hook
// Integrates caching, data mapping, and error handling

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  financialApi,
  type StockData,
  type CryptoData,
  type MarketData,
} from "../services/financialApi";
import { stockCache, marketCache } from "../services/intelligentCache";
import {
  dataMappingService,
  type TransformationRule,
} from "../services/dataMapping";

export interface UseFinancialDataOptions {
  symbol?: string;
  autoRefresh?: boolean;
  refreshInterval?: number; // in milliseconds
  enableCache?: boolean;
  forceRefresh?: boolean;
}

export interface FinancialDataState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  cached: boolean;
  retryCount: number;
}

// Hook for stock data
export function useStockData(
  symbol: string,
  options: UseFinancialDataOptions = {}
) {
  const {
    autoRefresh = false,
    refreshInterval = 2 * 60 * 1000, // 2 minutes
    enableCache = true,
    forceRefresh = false,
  } = options;

  const [state, setState] = useState<FinancialDataState<StockData>>({
    data: null,
    loading: false,
    error: null,
    lastUpdated: null,
    cached: false,
    retryCount: 0,
  });

  const fetchStockData = useCallback(
    async (force = false) => {
      if (!symbol) return;

      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        let data: StockData;
        let cached = false;

        if (enableCache && !force && !forceRefresh) {
          // Try to get from cache first
          const cachedData = stockCache.getOnly<StockData>(
            `stock:${symbol.toUpperCase()}`
          );
          if (cachedData) {
            data = cachedData;
            cached = true;
          } else {
            data = await financialApi.getStockQuote(symbol);
          }
        } else {
          data = await financialApi.getStockQuote(symbol);
        }

        setState((prev) => ({
          ...prev,
          data,
          loading: false,
          error: null,
          lastUpdated: new Date(),
          cached,
          retryCount: 0,
        }));
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to fetch stock data";

        setState((prev) => ({
          ...prev,
          loading: false,
          error: errorMessage,
          retryCount: prev.retryCount + 1,
        }));
      }
    },
    [symbol, enableCache, forceRefresh]
  );

  const retry = useCallback(() => {
    fetchStockData(true);
  }, [fetchStockData]);

  const invalidateCache = useCallback(() => {
    if (symbol) {
      financialApi.invalidateSymbol(symbol);
      fetchStockData(true);
    }
  }, [symbol, fetchStockData]);

  // Auto-refresh functionality
  useEffect(() => {
    if (autoRefresh && refreshInterval > 0) {
      const interval = setInterval(() => {
        fetchStockData();
      }, refreshInterval);

      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval, fetchStockData]);

  // Initial data fetch
  useEffect(() => {
    fetchStockData();
  }, [fetchStockData]);

  return {
    ...state,
    refetch: fetchStockData,
    retry,
    invalidateCache,
  };
}

// Hook for multiple stocks
export function useMultipleStocks(symbols: string[]) {
  const [state, setState] = useState<{
    data: Record<string, StockData>;
    loading: boolean;
    error: string | null;
    lastUpdated: Date | null;
    progress: number;
  }>({
    data: {},
    loading: false,
    error: null,
    lastUpdated: null,
    progress: 0,
  });

  const fetchMultipleStocks = useCallback(async () => {
    if (symbols.length === 0) return;

    setState((prev) => ({ ...prev, loading: true, error: null, progress: 0 }));

    try {
      const stocksData = await financialApi.getMultipleStocks(symbols);

      const dataMap = stocksData.reduce((acc, stock) => {
        acc[stock.symbol] = stock;
        return acc;
      }, {} as Record<string, StockData>);

      setState((prev) => ({
        ...prev,
        data: dataMap,
        loading: false,
        error: null,
        lastUpdated: new Date(),
        progress: 100,
      }));
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to fetch multiple stocks";

      setState((prev) => ({
        ...prev,
        loading: false,
        error: errorMessage,
        progress: 0,
      }));
    }
  }, [symbols]);

  useEffect(() => {
    fetchMultipleStocks();
  }, [fetchMultipleStocks]);

  return {
    ...state,
    refetch: fetchMultipleStocks,
  };
}

// Hook for crypto data
export function useCryptoData(symbol: string) {
  const [state, setState] = useState<FinancialDataState<CryptoData>>({
    data: null,
    loading: false,
    error: null,
    lastUpdated: null,
    cached: false,
    retryCount: 0,
  });

  const fetchCryptoData = useCallback(async () => {
    if (!symbol) return;

    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const data = await financialApi.getCryptoQuote(symbol);

      setState((prev) => ({
        ...prev,
        data,
        loading: false,
        error: null,
        lastUpdated: new Date(),
        cached: false, // Crypto is currently mock data
        retryCount: 0,
      }));
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch crypto data";

      setState((prev) => ({
        ...prev,
        loading: false,
        error: errorMessage,
        retryCount: prev.retryCount + 1,
      }));
    }
  }, [symbol]);

  useEffect(() => {
    fetchCryptoData();
  }, [fetchCryptoData]);

  return {
    ...state,
    refetch: fetchCryptoData,
  };
}

// Hook for market overview
export function useMarketData(options: UseFinancialDataOptions = {}) {
  const {
    autoRefresh = false,
    refreshInterval = 10 * 60 * 1000, // 10 minutes
    enableCache = true,
  } = options;

  const [state, setState] = useState<FinancialDataState<MarketData>>({
    data: null,
    loading: false,
    error: null,
    lastUpdated: null,
    cached: false,
    retryCount: 0,
  });

  const fetchMarketData = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      let data: MarketData;
      let cached = false;

      if (enableCache) {
        const cachedData = marketCache.getOnly<MarketData>("market:overview");
        if (cachedData) {
          data = cachedData;
          cached = true;
        } else {
          data = await financialApi.getMarketOverview();
        }
      } else {
        data = await financialApi.getMarketOverview();
      }

      setState((prev) => ({
        ...prev,
        data,
        loading: false,
        error: null,
        lastUpdated: new Date(),
        cached,
        retryCount: 0,
      }));
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch market data";

      setState((prev) => ({
        ...prev,
        loading: false,
        error: errorMessage,
        retryCount: prev.retryCount + 1,
      }));
    }
  }, [enableCache]);

  // Auto-refresh functionality
  useEffect(() => {
    if (autoRefresh && refreshInterval > 0) {
      const interval = setInterval(() => {
        fetchMarketData();
      }, refreshInterval);

      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval, fetchMarketData]);

  useEffect(() => {
    fetchMarketData();
  }, [fetchMarketData]);

  return {
    ...state,
    refetch: fetchMarketData,
  };
}

// Hook for cache management
export function useCacheManagement() {
  const [cacheStats, setCacheStats] = useState(() =>
    financialApi.getCacheStats()
  );

  const refreshStats = useCallback(() => {
    setCacheStats(financialApi.getCacheStats());
  }, []);

  const clearAllCaches = useCallback(() => {
    financialApi.clearAllCaches();
    refreshStats();
  }, [refreshStats]);

  const invalidateSymbol = useCallback(
    (symbol: string) => {
      financialApi.invalidateSymbol(symbol);
      refreshStats();
    },
    [refreshStats]
  );

  const invalidateByTags = useCallback(
    (tags: string[]) => {
      financialApi.invalidateByTags(tags);
      refreshStats();
    },
    [refreshStats]
  );

  // Auto-refresh stats every 30 seconds
  useEffect(() => {
    const interval = setInterval(refreshStats, 30000);
    return () => clearInterval(interval);
  }, [refreshStats]);

  return {
    cacheStats,
    refreshStats,
    clearAllCaches,
    invalidateSymbol,
    invalidateByTags,
  };
}

// Hook for data mapping management
export function useDataMapping() {
  const [schemas, setSchemas] = useState(() => dataMappingService.getSchemas());
  const [templates, setTemplates] = useState(() =>
    dataMappingService.getTemplates()
  );

  const refreshSchemas = useCallback(() => {
    setSchemas(dataMappingService.getSchemas());
  }, []);

  const refreshTemplates = useCallback(() => {
    setTemplates(dataMappingService.getTemplates());
  }, []);

  const createTemplate = useCallback(
    (
      name: string,
      description: string,
      apiSource: string,
      mappings: Array<{
        sourceField: string;
        targetField: string;
        transformation?: TransformationRule;
        description?: string;
      }>
    ) => {
      const template = financialApi.createMappingTemplate(
        name,
        description,
        apiSource,
        mappings
      );
      refreshTemplates();
      return template;
    },
    [refreshTemplates]
  );

  return {
    schemas,
    templates,
    refreshSchemas,
    refreshTemplates,
    createTemplate,
  };
}

// Utility hook for pre-warming cache
export function usePreWarmCache() {
  const [isWarming, setIsWarming] = useState(false);
  const [warmupProgress, setWarmupProgress] = useState(0);

  const preWarmCache = useCallback(async (symbols?: string[]) => {
    setIsWarming(true);
    setWarmupProgress(0);

    try {
      await financialApi.preWarmCache(symbols);
      setWarmupProgress(100);
    } catch (error) {
      console.error("Failed to pre-warm cache:", error);
    } finally {
      setIsWarming(false);
    }
  }, []);

  return {
    isWarming,
    warmupProgress,
    preWarmCache,
  };
}

// Utility functions for formatting and calculations
export const useFinancialUtils = () => {
  return useMemo(
    () => ({
      formatCurrency: (value: number, currency = "USD") =>
        new Intl.NumberFormat("en-US", {
          style: "currency",
          currency,
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(value),

      formatPercentage: (value: number) => {
        const sign = value >= 0 ? "+" : "";
        return `${sign}${value.toFixed(2)}%`;
      },

      formatLargeNumber: (value: number) => {
        if (value >= 1e12) return `$${(value / 1e12).toFixed(1)}T`;
        if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}B`;
        if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
        if (value >= 1e3) return `$${(value / 1e3).toFixed(1)}K`;
        return `$${value.toFixed(0)}`;
      },

      calculateChange: (current: number, previous: number) => ({
        absolute: current - previous,
        percentage: ((current - previous) / previous) * 100,
      }),

      isMarketOpen: () => {
        const now = new Date();
        const day = now.getDay();
        const hour = now.getHours();

        // Monday to Friday (1-5), 9:30 AM to 4:00 PM EST
        return day >= 1 && day <= 5 && hour >= 9 && hour < 16;
      },
    }),
    []
  );
};
