'use client';

import { useState, useEffect, useCallback } from 'react';
import { financialApi, type StockData, type CryptoData, type MarketData } from '@/services/financialApi';

export interface UseFinancialDataOptions {
  refreshInterval?: number; // in milliseconds
  enabled?: boolean;
}

// Hook for stock data
export function useStockData(symbol: string, options: UseFinancialDataOptions = {}) {
  const { refreshInterval = 60000, enabled = true } = options; // Default 1 minute refresh
  const [data, setData] = useState<StockData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!symbol || !enabled) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const stockData = await financialApi.getStockQuote(symbol);
      setData(stockData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch stock data');
    } finally {
      setLoading(false);
    }
  }, [symbol, enabled]);

  useEffect(() => {
    fetchData();
    
    if (refreshInterval && enabled) {
      const interval = setInterval(fetchData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [fetchData, refreshInterval, enabled]);

  return { data, loading, error, refetch: fetchData };
}

// Hook for cryptocurrency data
export function useCryptoData(symbol: string, options: UseFinancialDataOptions = {}) {
  const { refreshInterval = 60000, enabled = true } = options;
  const [data, setData] = useState<CryptoData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!symbol || !enabled) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const cryptoData = await financialApi.getCryptoQuote(symbol);
      setData(cryptoData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch crypto data');
    } finally {
      setLoading(false);
    }
  }, [symbol, enabled]);

  useEffect(() => {
    fetchData();
    
    if (refreshInterval && enabled) {
      const interval = setInterval(fetchData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [fetchData, refreshInterval, enabled]);

  return { data, loading, error, refetch: fetchData };
}

// Hook for market overview data
export function useMarketData(options: UseFinancialDataOptions = {}) {
  const { refreshInterval = 300000, enabled = true } = options; // Default 5 minutes for market data
  const [data, setData] = useState<MarketData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!enabled) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const marketData = await financialApi.getMarketOverview();
      setData(marketData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch market data');
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    fetchData();
    
    if (refreshInterval && enabled) {
      const interval = setInterval(fetchData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [fetchData, refreshInterval, enabled]);

  return { data, loading, error, refetch: fetchData };
}

// Hook for multiple stocks
export function useMultipleStocks(symbols: string[], options: UseFinancialDataOptions = {}) {
  const { refreshInterval = 60000, enabled = true } = options;
  const [data, setData] = useState<Record<string, StockData>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!symbols.length || !enabled) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const promises = symbols.map(symbol => financialApi.getStockQuote(symbol));
      const results = await Promise.allSettled(promises);
      
      const newData: Record<string, StockData> = {};
      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          newData[symbols[index]] = result.value;
        }
      });
      
      setData(newData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch stock data');
    } finally {
      setLoading(false);
    }
  }, [symbols, enabled]);

  useEffect(() => {
    fetchData();
    
    if (refreshInterval && enabled) {
      const interval = setInterval(fetchData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [fetchData, refreshInterval, enabled]);

  return { data, loading, error, refetch: fetchData };
}

// Custom hook for widget-specific data fetching
export function useWidgetData(widget: { type: string; config: Record<string, unknown> }, options: UseFinancialDataOptions = {}) {
  const { type, config } = widget;
  
  // Stock widget
  const stockData = useStockData(
    type === 'stock' ? (config?.symbol as string) || '' : '',
    { ...options, enabled: type === 'stock' && !!config?.symbol }
  );
  
  // Crypto widget
  const cryptoData = useCryptoData(
    type === 'crypto' ? (config?.symbol as string) || '' : '',
    { ...options, enabled: type === 'crypto' && !!config?.symbol }
  );
  
  // Market overview widget
  const marketData = useMarketData({
    ...options,
    enabled: type === 'market-overview'
  });
  
  // Portfolio widget (multiple stocks)
  const portfolioSymbols = type === 'portfolio' ? (config?.symbols as string[]) || [] : [];
  const portfolioData = useMultipleStocks(
    portfolioSymbols,
    { ...options, enabled: type === 'portfolio' && portfolioSymbols.length > 0 }
  );
  
  // Return appropriate data based on widget type
  switch (type) {
    case 'stock':
      return stockData;
    case 'crypto':
      return cryptoData;
    case 'market-overview':
      return marketData;
    case 'portfolio':
      return { ...portfolioData, data: Object.values(portfolioData.data) };
    default:
      return { data: null, loading: false, error: null, refetch: () => {} };
  }
}
