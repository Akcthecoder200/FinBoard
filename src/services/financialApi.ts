// API service for financial data integration
// Supports multiple data sources and standardized response format

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

export interface CryptoData {
  symbol: string;
  name?: string;
  price: number;
  change: number;
  changePercent: number;
  volume?: number;
  marketCap?: number;
  high24h?: number;
  low24h?: number;
  timestamp: Date;
}

export interface MarketData {
  indices: {
    sp500: { value: number; change: number; changePercent: number };
    nasdaq: { value: number; change: number; changePercent: number };
    dow: { value: number; change: number; changePercent: number };
  };
  sectors: Array<{
    name: string;
    change: number;
    changePercent: number;
  }>;
  timestamp: Date;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: Date;
}

export interface ApiConfig {
  baseUrl: string;
  apiKey?: string;
  rateLimitPerMinute?: number;
  timeout?: number;
}

// Predefined API configurations
export const API_CONFIGS = {
  // Alpha Vantage (free tier available)
  alphaVantage: {
    baseUrl: 'https://www.alphavantage.co/query',
    rateLimitPerMinute: 5,
    timeout: 10000,
    // Note: Requires API key - users can get free key from alphavantage.co
  },
  
  // Yahoo Finance Alternative (no key required)
  yahooFinance: {
    baseUrl: 'https://query1.finance.yahoo.com/v8/finance/chart',
    rateLimitPerMinute: 200,
    timeout: 10000,
  },
  
  // IEX Cloud (free tier available) 
  iexCloud: {
    baseUrl: 'https://cloud.iexapis.com/stable',
    rateLimitPerMinute: 100,
    timeout: 10000,
    // Note: Requires API key - users can get free key from iexcloud.io
  },
  
  // Finnhub (free tier available)
  finnhub: {
    baseUrl: 'https://finnhub.io/api/v1',
    rateLimitPerMinute: 60,
    timeout: 10000,
    // Note: Requires API key - users can get free key from finnhub.io
  },
  
  // Mock API for testing
  mockApi: {
    baseUrl: 'https://jsonplaceholder.typicode.com',
    rateLimitPerMinute: 1000,
    timeout: 5000,
  }
};

class FinancialApiService {
  private config: ApiConfig;
  private requestCount = 0;
  private resetTime = Date.now() + 60000; // Reset every minute

  constructor(config: ApiConfig) {
    this.config = config;
  }

  private async makeRequest<T>(url: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    try {
      // Rate limiting check
      if (this.requestCount >= (this.config.rateLimitPerMinute || 100)) {
        if (Date.now() < this.resetTime) {
          throw new Error('Rate limit exceeded. Please wait before making more requests.');
        } else {
          this.requestCount = 0;
          this.resetTime = Date.now() + 60000;
        }
      }

      this.requestCount++;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.config.timeout || 10000);

      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      return {
        success: true,
        data,
        timestamp: new Date(),
      };
    } catch (error) {
      console.error('API request failed:', error);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        timestamp: new Date(),
      };
    }
  }

  // Yahoo Finance implementation via Next.js API route (CORS-free)
  async fetchYahooFinance(symbol: string): Promise<ApiResponse<StockData>> {
    const url = `/api/stock/${symbol}`;
    
    try {
      const response = await this.makeRequest(url);
      
      if (!response.success || !response.data) {
        return response as ApiResponse<StockData>;
      }

      const apiResponse = response.data as { success: boolean; data: StockData; error?: string };
      
      if (!apiResponse.success) {
        throw new Error(apiResponse.error || 'API returned unsuccessful response');
      }

      return {
        success: true,
        data: apiResponse.data,
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch Yahoo Finance data',
        timestamp: new Date(),
      };
    }
  }

  // Mock API for development/testing
  async fetchMockData(symbol: string): Promise<ApiResponse<StockData>> {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));

      // Generate realistic mock data
      const basePrice = Math.random() * 1000 + 50;
      const change = (Math.random() - 0.5) * 20;
      const changePercent = (change / basePrice) * 100;

      const stockData: StockData = {
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

      return {
        success: true,
        data: stockData,
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Mock API error',
        timestamp: new Date(),
      };
    }
  }

  // Generic fetch method that can be extended for other APIs
  async fetchStockData(symbol: string, apiType: 'yahoo' | 'mock' = 'mock'): Promise<ApiResponse<StockData>> {
    switch (apiType) {
      case 'yahoo':
        return this.fetchYahooFinance(symbol);
      case 'mock':
      default:
        return this.fetchMockData(symbol);
    }
  }

  // Fetch multiple stocks
  async fetchMultipleStocks(symbols: string[], apiType: 'yahoo' | 'mock' = 'mock'): Promise<ApiResponse<StockData[]>> {
    try {
      const promises = symbols.map(symbol => this.fetchStockData(symbol, apiType));
      const results = await Promise.allSettled(promises);
      
      const successfulResults: StockData[] = [];
      const errors: string[] = [];

      results.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value.success) {
          successfulResults.push(result.value.data!);
        } else {
          const error = result.status === 'rejected' 
            ? result.reason?.message || 'Unknown error'
            : result.value.error || 'API error';
          errors.push(`${symbols[index]}: ${error}`);
        }
      });

      if (successfulResults.length === 0) {
        return {
          success: false,
          error: `All requests failed: ${errors.join(', ')}`,
          timestamp: new Date(),
        };
      }

      return {
        success: true,
        data: successfulResults,
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch multiple stocks',
        timestamp: new Date(),
      };
    }
  }

  // Public API methods that hooks will use
  async getStockQuote(symbol: string): Promise<StockData> {
    const apiType = this.config.baseUrl?.includes('mock') ? 'mock' : 'yahoo';
    const response = await this.fetchStockData(symbol, apiType);
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to fetch stock data');
    }
    return response.data;
  }

  async getCryptoQuote(symbol: string): Promise<CryptoData> {
    // Use API route for crypto data
    try {
      const response = await this.makeRequest('/api/crypto');
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to fetch crypto data');
      }
      
      const apiResponse = response.data as { success: boolean; data: CryptoData[]; error?: string };
      if (!apiResponse.success) {
        throw new Error(apiResponse.error || 'API returned unsuccessful response');
      }
      
      // Find the specific crypto or return the first one
      const crypto = apiResponse.data.find(c => c.symbol.toUpperCase() === symbol.toUpperCase()) || apiResponse.data[0];
      if (crypto) {
        return crypto;
      } else {
        throw new Error(`Crypto ${symbol} not found`);
      }
    } catch (error) {
      // Fallback to mock data
      console.warn('Failed to fetch crypto data from API, using mock data:', error);
      return this.generateMockCryptoData(symbol);
    }
  }

  async getMarketOverview(): Promise<MarketData> {
    // Use API route for market data
    try {
      const response = await this.makeRequest('/api/market');
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to fetch market data');
      }
      
      const apiResponse = response.data as { success: boolean; data: MarketData; error?: string };
      if (!apiResponse.success) {
        throw new Error(apiResponse.error || 'API returned unsuccessful response');
      }
      
      return apiResponse.data;
    } catch (error) {
      // Fallback to mock data
      console.warn('Failed to fetch market data from API, using mock data:', error);
      return this.generateMockMarketData();
    }
  }

  async getMultipleStocks(symbols: string[]): Promise<StockData[]> {
    const apiType = this.config.baseUrl?.includes('mock') ? 'mock' : 'yahoo';
    const response = await this.fetchMultipleStocks(symbols, apiType);
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to fetch multiple stocks');
    }
    return response.data;
  }

  // Mock data generators
  private generateMockCryptoData(symbol: string): CryptoData {
    const basePrice = Math.random() * 50000 + 1000;
    const change = (Math.random() - 0.5) * basePrice * 0.1;
    const changePercent = (change / basePrice) * 100;

    return {
      symbol: symbol.toUpperCase(),
      name: `${symbol.charAt(0).toUpperCase() + symbol.slice(1)} Coin`,
      price: basePrice,
      change,
      changePercent,
      volume: Math.random() * 1000000000,
      marketCap: basePrice * 21000000,
      high24h: basePrice + Math.random() * basePrice * 0.05,
      low24h: basePrice - Math.random() * basePrice * 0.05,
      timestamp: new Date(),
    };
  }

  private generateMockMarketData(): MarketData {
    return {
      indices: {
        sp500: {
          value: 4200 + Math.random() * 400,
          change: (Math.random() - 0.5) * 100,
          changePercent: (Math.random() - 0.5) * 3,
        },
        nasdaq: {
          value: 13000 + Math.random() * 1000,
          change: (Math.random() - 0.5) * 200,
          changePercent: (Math.random() - 0.5) * 4,
        },
        dow: {
          value: 34000 + Math.random() * 2000,
          change: (Math.random() - 0.5) * 300,
          changePercent: (Math.random() - 0.5) * 2,
        },
      },
      sectors: [
        { name: 'Technology', change: (Math.random() - 0.5) * 50, changePercent: (Math.random() - 0.5) * 3 },
        { name: 'Healthcare', change: (Math.random() - 0.5) * 30, changePercent: (Math.random() - 0.5) * 2 },
        { name: 'Financial', change: (Math.random() - 0.5) * 40, changePercent: (Math.random() - 0.5) * 2.5 },
        { name: 'Energy', change: (Math.random() - 0.5) * 60, changePercent: (Math.random() - 0.5) * 4 },
        { name: 'Consumer', change: (Math.random() - 0.5) * 35, changePercent: (Math.random() - 0.5) * 2.2 },
      ],
      timestamp: new Date(),
    };
  }
}

// Factory function to create API service instances
export function createApiService(configName: keyof typeof API_CONFIGS, apiKey?: string): FinancialApiService {
  const config: ApiConfig = { ...API_CONFIGS[configName] };
  if (apiKey) {
    config.apiKey = apiKey;
  }
  return new FinancialApiService(config);
}

// Default service instance for easy use
export const defaultApiService = createApiService('yahooFinance');

// Main API service for easy import
export const financialApi = defaultApiService;

// Utility function to format currency
export function formatCurrency(value: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

// Utility function to format percentage
export function formatPercentage(value: number): string {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
}

// Utility function to format large numbers
export function formatLargeNumber(value: number): string {
  if (value >= 1e12) return `$${(value / 1e12).toFixed(1)}T`;
  if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}B`;
  if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
  if (value >= 1e3) return `$${(value / 1e3).toFixed(1)}K`;
  return `$${value.toFixed(0)}`;
}
