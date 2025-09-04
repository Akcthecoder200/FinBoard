// Simplified API service for financial data
// Primary: Alpha Vantage API | Fallback: Yahoo Finance API

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
  private readonly ALPHA_VANTAGE_RATE_LIMIT = 5; // 5 requests per minute

  // Alpha Vantage API (Primary) - via Next.js API route
  private async fetchAlphaVantage(
    symbol: string
  ): Promise<ApiResponse<StockData>> {
    // Check rate limit for Alpha Vantage
    if (this.alphaVantageRequestCount >= this.ALPHA_VANTAGE_RATE_LIMIT) {
      if (Date.now() < this.alphaVantageResetTime) {
        throw new Error(
          "Alpha Vantage rate limit exceeded, switching to Yahoo Finance"
        );
      } else {
        this.alphaVantageRequestCount = 0;
        this.alphaVantageResetTime = Date.now() + 60000;
      }
    }

    try {
      this.alphaVantageRequestCount++;

      const url = `/api/stock-alpha-vantage/${symbol}`;
      const response = await fetch(url, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        signal: AbortSignal.timeout(10000), // 10 second timeout
      });

      if (!response.ok) {
        throw new Error(`Alpha Vantage API responded with ${response.status}`);
      }

      const data = await response.json();

      if (!data.success || !data.data) {
        throw new Error(
          data.error || "Alpha Vantage API returned unsuccessful response"
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
            : "Failed to fetch Alpha Vantage data",
        timestamp: new Date(),
      };
    }
  }

  // Yahoo Finance API (Fallback) - via Next.js API route
  private async fetchYahooFinance(
    symbol: string
  ): Promise<ApiResponse<StockData>> {
    try {
      const url = `/api/stock/${symbol}`;
      const response = await fetch(url, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        signal: AbortSignal.timeout(10000), // 10 second timeout
      });

      if (!response.ok) {
        throw new Error(`Yahoo Finance API responded with ${response.status}`);
      }

      const data = await response.json();

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

  // Main method: Try Alpha Vantage first, fallback to Yahoo Finance, then mock data
  async getStockQuote(symbol: string): Promise<StockData> {
    try {
      // Try Alpha Vantage first
      console.log(`Attempting to fetch ${symbol} from Alpha Vantage...`);
      const alphaVantageResponse = await this.fetchAlphaVantage(symbol);

      if (alphaVantageResponse.success && alphaVantageResponse.data) {
        console.log(`✅ Successfully fetched ${symbol} from Alpha Vantage`);
        return alphaVantageResponse.data;
      }

      // Fallback to Yahoo Finance
      console.log(
        `⚠️ Alpha Vantage failed for ${symbol}, trying Yahoo Finance...`
      );
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
  }

  // Crypto quote method (simplified - returns mock data)
  async getCryptoQuote(symbol: string): Promise<CryptoData> {
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
  }

  // Market overview method (simplified - returns mock data)
  async getMarketOverview(): Promise<MarketData> {
    try {
      // For now, return mock data - could be extended to use real market APIs
      console.log("Generating mock market overview data");
      return this.generateMockMarketData();
    } catch (error) {
      console.warn("❌ Failed to fetch market data, using mock data:", error);
      return this.generateMockMarketData();
    }
  }

  // Fetch multiple stocks with rate limiting
  async getMultipleStocks(symbols: string[]): Promise<StockData[]> {
    const results: StockData[] = [];

    // Process in small batches to respect rate limits
    const batchSize = 3;
    for (let i = 0; i < symbols.length; i += batchSize) {
      const batch = symbols.slice(i, i + batchSize);

      try {
        const batchPromises = batch.map((symbol) => this.getStockQuote(symbol));
        const batchResults = await Promise.all(batchPromises);
        results.push(...batchResults);

        // Delay between batches to respect rate limits
        if (i + batchSize < symbols.length) {
          await new Promise((resolve) => setTimeout(resolve, 500));
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
