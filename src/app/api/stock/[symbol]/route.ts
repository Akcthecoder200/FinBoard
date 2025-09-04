import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ symbol: string }> }
) {
  const { symbol } = await params;

  try {
    // Clean and format symbol for Yahoo Finance
    let formattedSymbol = symbol.toUpperCase();
    
    // Handle special cases for symbol formatting
    if (formattedSymbol.includes(' ')) {
      // Replace spaces with appropriate formatting for Yahoo Finance
      formattedSymbol = formattedSymbol.replace(/\s+/g, '-');
    }
    
    // Use Yahoo Finance API as a proxy
    const yahooUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${formattedSymbol}`;
    
    const response = await fetch(yahooUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    if (!response.ok) {
      throw new Error(`Yahoo Finance API responded with ${response.status}`);
    }

    const data = await response.json();
    
    // Extract the financial data
    const chart = data.chart;
    const result = chart?.result?.[0];
    
    if (!result) {
      throw new Error('Invalid response format from Yahoo Finance');
    }

    const meta = result.meta;
    const currentPrice = meta?.regularMarketPrice || meta?.previousClose || 0;
    const previousClose = meta?.previousClose || 0;
    const change = currentPrice - previousClose;
    const changePercent = previousClose > 0 ? (change / previousClose) * 100 : 0;

    // Format the response to match our StockData interface
    const stockData = {
      symbol: symbol.toUpperCase(),
      name: meta?.longName || meta?.shortName || symbol,
      price: currentPrice,
      change,
      changePercent,
      volume: meta?.regularMarketVolume,
      marketCap: meta?.marketCap,
      high52Week: meta?.fiftyTwoWeekHigh,
      low52Week: meta?.fiftyTwoWeekLow,
      dayHigh: meta?.regularMarketDayHigh,
      dayLow: meta?.regularMarketDayLow,
      openPrice: meta?.regularMarketOpen,
      previousClose,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      data: stockData,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Stock API error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch stock data',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
