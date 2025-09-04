// Enhanced API service for financial data
// Primary: Alpha Vantage API | Fallback: Yahoo Finance API
// Features: Data Mapping, Intelligent Caching, Request Deduplication

import { dataMappingService, type ApiResponseSchema, type MappingTemplate, type TransformationRule } from './dataMapping';
import { stockCache, marketCache, cacheUtils } from './intelligentCache';

export interface StockData {
  symbol: string;
  name?: string;
  price: number;
  change: number;
  changePercent: number;
  volume?: number;
  marketCap?: number;
  high52Week?: number;
  low52Week?: number;
  dayHigh?: number;
  dayLow?: number;
  openPrice?: number;
  previousClose?: number;
  timestamp: Date;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: Date;
}

export interface CryptoData {
  symbol: string;
  name?: string;
  price: number;
  change: number;
  changePercent: number;
  volume?: number;
  marketCap?: number;
  timestamp: Date;
}

export interface MarketData {
  indices: {
    [key: string]: {
      value: number;
      change: number;
      changePercent: number;
    };
  };
  timestamp: Date;
}

class FinancialApiService {
  private alphaVantageRequestCount = 0;
  private alphaVantageResetTime = Date.now() + 60000; // Reset every minute
  private readonly ALPHA_VANTAGE_RATE_LIMIT = 4; // Conservative: 4 requests per minute
  private alphaVantageBlocked = false;
  private alphaVantageBlockedUntil = 0;

  // Alpha Vantage API (Primary) - via Next.js API route with caching and mapping
  private async fetchAlphaVantage(
    symbol: string
  ): Promise<ApiResponse<StockData>> {
    // Check if Alpha Vantage is temporarily blocked
    if (this.alphaVantageBlocked && Date.now() < this.alphaVantageBlockedUntil) {
      throw new Error("Alpha Vantage temporarily blocked due to rate limits");
    }

    // Reset rate limit counter if time window has passed
    if (Date.now() > this.alphaVantageResetTime) {
      this.alphaVantageRequestCount = 0;
      this.alphaVantageResetTime = Date.now() + 60000;
      this.alphaVantageBlocked = false;
    }

    // Check rate limit for Alpha Vantage
    if (this.alphaVantageRequestCount >= this.ALPHA_VANTAGE_RATE_LIMIT) {
      console.warn("Alpha Vantage rate limit reached, blocking for 60 seconds");
      this.alphaVantageBlocked = true;
      this.alphaVantageBlockedUntil = Date.now() + 60000;
      throw new Error("Alpha Vantage rate limit exceeded, switching to Yahoo Finance");
    }

    try {
      this.alphaVantageRequestCount++;

      const url = `/api/stock-alpha-vantage/${symbol}`;
      const startTime = Date.now();
      
      const response = await fetch(url, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        signal: AbortSignal.timeout(8000), // 8 second timeout
      });

      const responseTime = Date.now() - startTime;
      const data = await response.json();

      // Analyze API response for data mapping
      const responseText = JSON.stringify(data);
      dataMappingService.analyzeApiResponse(
        'alpha-vantage',
        `/stock/${symbol}`,
        data,
        {
          responseSize: responseText.length,
          responseTime,
          statusCode: response.status
        }
      );

      // Handle rate limit responses specifically
      if (response.status === 429) {
        console.warn("Alpha Vantage rate limit hit, blocking requests");
        this.alphaVantageBlocked = true;
        this.alphaVantageBlockedUntil = Date.now() + 60000;
        throw new Error("Alpha Vantage rate limit exceeded");
      }

      if (!response.ok) {
        throw new Error(`Alpha Vantage API responded with ${response.status}: ${data.error || 'Unknown error'}`);
      }

      if (!data.success || !data.data) {
        throw new Error(data.error || "Alpha Vantage API returned unsuccessful response");
      }

      return {
        success: true,
        data: data.data,
        timestamp: new Date(),
      };
    } catch (error) {
      // If it's a rate limit error, don't count it against the rate limit
      if (error instanceof Error && error.message.includes('rate limit')) {
        this.alphaVantageRequestCount--; // Don't penalize for rate limit hits
      }
      
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch Alpha Vantage data",
        timestamp: new Date(),
      };
    }
  }

  // Yahoo Finance API (Fallback) - via Next.js API route with caching and mapping
  private async fetchYahooFinance(
    symbol: string
  ): Promise<ApiResponse<StockData>> {
    try {
      const url = `/api/stock/${symbol}`;
      const startTime = Date.now();
      
      const response = await fetch(url, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        signal: AbortSignal.timeout(10000), // 10 second timeout
      });

      const responseTime = Date.now() - startTime;

      if (!response.ok) {
        throw new Error(`Yahoo Finance API responded with ${response.status}`);
      }

      const data = await response.json();

      // Analyze API response for data mapping
      const responseText = JSON.stringify(data);
      dataMappingService.analyzeApiResponse(
        'yahoo-finance',
        `/stock/${symbol}`,
        data,
        {
          responseSize: responseText.length,
          responseTime,
          statusCode: response.status
        }
      );

      if (!data.success || !data.data) {
        throw new Error(
          data.error || "Yahoo Finance API returned unsuccessful response"
        );
      }

      return {
        success: true,
        data: data.data,
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch Yahoo Finance data",
        timestamp: new Date(),
      };
    }
  }

  // Generate mock data as last resort
  private generateMockStockData(symbol: string): StockData {
    const basePrice = Math.random() * 1000 + 50;
    const change = (Math.random() - 0.5) * 20;
    const changePercent = (change / basePrice) * 100;

    return {
      symbol: symbol.toUpperCase(),
      name: `${symbol.toUpperCase()} Company Inc.`,
      price: basePrice,
      change,
      changePercent,
      volume: Math.floor(Math.random() * 10000000),
      marketCap: Math.floor(Math.random() * 1000000000000),
      high52Week: basePrice * (1 + Math.random() * 0.5),
      low52Week: basePrice * (1 - Math.random() * 0.5),
      dayHigh: basePrice * (1 + Math.random() * 0.1),
      dayLow: basePrice * (1 - Math.random() * 0.1),
      openPrice: basePrice * (1 + (Math.random() - 0.5) * 0.05),
      previousClose: basePrice - change,
      timestamp: new Date(),
    };
  }

  // Generate mock crypto data
  private generateMockCryptoData(symbol: string): CryptoData {
    const basePrice = Math.random() * 50000 + 100;
    const change = (Math.random() - 0.5) * 2000;
    const changePercent = (change / basePrice) * 100;

    return {
      symbol: symbol.toUpperCase(),
      name: `${symbol.toUpperCase()} Cryptocurrency`,
      price: basePrice,
      change,
      changePercent,
      volume: Math.floor(Math.random() * 1000000000),
      marketCap: Math.floor(Math.random() * 500000000000),
      timestamp: new Date(),
    };
  }

  // Generate mock market data
  private generateMockMarketData(): MarketData {
    return {
      indices: {
        SP500: {
          value: 4500 + Math.random() * 200,
          change: (Math.random() - 0.5) * 50,
          changePercent: (Math.random() - 0.5) * 2,
        },
        NASDAQ: {
          value: 15000 + Math.random() * 500,
          change: (Math.random() - 0.5) * 100,
          changePercent: (Math.random() - 0.5) * 2,
        },
        DOW: {
          value: 35000 + Math.random() * 1000,
          change: (Math.random() - 0.5) * 200,
          changePercent: (Math.random() - 0.5) * 1.5,
        },
      },
      timestamp: new Date(),
    };
  }

  // Main method: Try Alpha Vantage first, fallback to Yahoo Finance, then mock data (with intelligent caching)
  async getStockQuote(symbol: string): Promise<StockData> {
    const cacheKey = cacheUtils.stockKey(symbol);
    const tags = cacheUtils.getTags('stock', symbol);

    return stockCache.get(
      cacheKey,
      async () => {
        try {
          // Skip Alpha Vantage if it's blocked due to rate limits
          if (!this.alphaVantageBlocked || Date.now() > this.alphaVantageBlockedUntil) {
            // Try Alpha Vantage first
            console.log(`Attempting to fetch ${symbol} from Alpha Vantage...`);
            const alphaVantageResponse = await this.fetchAlphaVantage(symbol);

            if (alphaVantageResponse.success && alphaVantageResponse.data) {
              console.log(`✅ Successfully fetched ${symbol} from Alpha Vantage`);
              return alphaVantageResponse.data;
            }
          } else {
            console.log(`⚠️ Alpha Vantage blocked due to rate limits, skipping to Yahoo Finance...`);
          }

          // Fallback to Yahoo Finance
          console.log(`⚠️ Alpha Vantage failed for ${symbol}, trying Yahoo Finance...`);
          const yahooResponse = await this.fetchYahooFinance(symbol);

          if (yahooResponse.success && yahooResponse.data) {
            console.log(`✅ Successfully fetched ${symbol} from Yahoo Finance`);
            return yahooResponse.data;
          }

          // Last resort: mock data
          console.warn(`⚠️ Both APIs failed for ${symbol}, using mock data`);
          return this.generateMockStockData(symbol);
        } catch (error) {
          console.warn(`❌ All APIs failed for ${symbol}, using mock data:`, error);
          return this.generateMockStockData(symbol);
        }
      },
      {
        ttl: 2 * 60 * 1000, // 2 minutes for real-time stock data
        tags
      }
    );
  }

  // Crypto quote method with caching
  async getCryptoQuote(symbol: string): Promise<CryptoData> {
    const cacheKey = cacheUtils.cryptoKey(symbol);
    const tags = cacheUtils.getTags('crypto', symbol);

    return stockCache.get(
      cacheKey,
      async () => {
        try {
          // For now, return mock data - could be extended to use real crypto APIs
          console.log(`Generating mock crypto data for ${symbol}`);
          return this.generateMockCryptoData(symbol);
        } catch (error) {
          console.warn(
            `❌ Failed to fetch crypto data for ${symbol}, using mock data:`,
            error
          );
          return this.generateMockCryptoData(symbol);
        }
      },
      {
        ttl: 5 * 60 * 1000, // 5 minutes for crypto data
        tags
      }
    );
  }

  // Market overview method with caching
  async getMarketOverview(): Promise<MarketData> {
    const cacheKey = cacheUtils.marketKey('overview');
    const tags = cacheUtils.getTags('market');

    return marketCache.get(
      cacheKey,
      async () => {
        try {
          // For now, return mock data - could be extended to use real market APIs
          console.log("Generating mock market overview data");
          return this.generateMockMarketData();
        } catch (error) {
          console.warn("❌ Failed to fetch market data, using mock data:", error);
          return this.generateMockMarketData();
        }
      },
      {
        ttl: 10 * 60 * 1000, // 10 minutes for market overview
        tags
      }
    );
  }

  // Fetch multiple stocks with conservative rate limiting
  async getMultipleStocks(symbols: string[]): Promise<StockData[]> {
    const results: StockData[] = [];

    // Process in smaller batches to respect rate limits
    const batchSize = 2; // Reduced from 3 to 2
    for (let i = 0; i < symbols.length; i += batchSize) {
      const batch = symbols.slice(i, i + batchSize);

      try {
        const batchPromises = batch.map((symbol) => this.getStockQuote(symbol));
        const batchResults = await Promise.all(batchPromises);
        results.push(...batchResults);

        // Longer delay between batches to respect rate limits
        if (i + batchSize < symbols.length) {
          await new Promise((resolve) => setTimeout(resolve, 1000)); // Increased to 1 second
        }
      } catch (error) {
        console.error("Batch processing error:", error);
        // Add mock data for failed batch
        batch.forEach((symbol) => {
          results.push(this.generateMockStockData(symbol));
        });
      }
    }

    return results;
  }

  // Get cache statistics for monitoring
  getCacheStats() {
    return {
      stock: stockCache.getStats(),
      market: marketCache.getStats()
    };
  }

  // Clear all caches
  clearAllCaches(): void {
    stockCache.clear();
    marketCache.clear();
    console.log('🗑️ All financial data caches cleared');
  }

  // Invalidate cache by symbol
  invalidateSymbol(symbol: string): void {
    const stockKey = cacheUtils.stockKey(symbol);
    const cryptoKey = cacheUtils.cryptoKey(symbol);
    
    stockCache.delete(stockKey);
    stockCache.delete(cryptoKey);
    
    console.log(`🗑️ Cache invalidated for symbol: ${symbol}`);
  }

  // Invalidate cache by tags
  invalidateByTags(tags: string[]): void {
    stockCache.invalidateByTags(tags);
    marketCache.invalidateByTags(tags);
    
    console.log(`🗑️ Cache invalidated by tags: ${tags.join(', ')}`);
  }

  // Get API response schemas for debugging
  getApiSchemas(): ApiResponseSchema[] {
    return dataMappingService.getSchemas();
  }

  // Get mapping templates
  getMappingTemplates(): MappingTemplate[] {
    return dataMappingService.getTemplates();
  }

  // Create custom mapping template
  createMappingTemplate(
    name: string,
    description: string,
    apiSource: string,
    mappings: Array<{
      sourceField: string;
      targetField: string;
      transformation?: TransformationRule;
      description?: string;
    }>
  ): MappingTemplate {
    return dataMappingService.createMappingTemplate(name, description, apiSource, mappings);
  }

  // Pre-warm cache with popular symbols
  async preWarmCache(symbols: string[] = ['AAPL', 'GOOGL', 'MSFT', 'TSLA', 'AMZN']): Promise<void> {
    console.log(`🔥 Pre-warming cache with popular symbols: ${symbols.join(', ')}`);
    
    const warmupData = symbols.map(symbol => ({
      key: cacheUtils.stockKey(symbol),
      fetcher: () => this.getStockQuote(symbol),
      ttl: 5 * 60 * 1000, // 5 minutes
      tags: cacheUtils.getTags('stock', symbol)
    }));

    await stockCache.warmUp(warmupData);
  }
}

// Create and export the service instance
export const financialApi = new FinancialApiService();

// Utility functions
export function formatCurrency(value: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatPercentage(value: number): string {
  const sign = value >= 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
}

export function formatLargeNumber(value: number): string {
  if (value >= 1e12) return `$${(value / 1e12).toFixed(1)}T`;
  if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}B`;
  if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
  if (value >= 1e3) return `$${(value / 1e3).toFixed(1)}K`;
  return `$${value.toFixed(0)}`;
}
