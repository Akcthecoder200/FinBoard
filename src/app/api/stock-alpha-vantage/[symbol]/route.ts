import { NextRequest, NextResponse } from 'next/server';

const ALPHA_VANTAGE_API_KEY = process.env.NEXT_PUBLIC_ALPHA_VANTAGE_API_KEY || 'demo';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ symbol: string }> }
) {
  const { symbol } = await params;
  try {
    const url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&outputsize=full&apikey=${ALPHA_VANTAGE_API_KEY}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Alpha Vantage API responded with ${response.status}`);
    }
    const data = await response.json();
    const timeSeries = data['Time Series (Daily)'];
    if (!timeSeries) {
      throw new Error(data['Error Message'] || 'No time series data found');
    }
    // Get the most recent trading day
    const dates = Object.keys(timeSeries).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
    const latest = timeSeries[dates[0]];
    const previous = timeSeries[dates[1]];
    const openPrice = parseFloat(latest['1. open']);
    const closePrice = parseFloat(latest['4. close']);
    const previousClose = parseFloat(previous['4. close']);
    const high = parseFloat(latest['2. high']);
    const low = parseFloat(latest['3. low']);
    const volume = parseInt(latest['5. volume'], 10);
    const change = closePrice - previousClose;
    const changePercent = previousClose ? (change / previousClose) * 100 : 0;
    const stockData = {
      symbol: symbol.toUpperCase(),
      price: closePrice,
      change,
      changePercent,
      volume,
      dayHigh: high,
      dayLow: low,
      openPrice,
      previousClose,
      timestamp: new Date().toISOString(),
    };
    return NextResponse.json({
      success: true,
      data: stockData,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch Alpha Vantage data',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
