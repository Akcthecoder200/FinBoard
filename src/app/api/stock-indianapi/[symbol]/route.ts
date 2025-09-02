import { NextRequest, NextResponse } from 'next/server';

const INDIANAPI_KEY = process.env.NEXT_PUBLIC_INDIANAPI_KEY || '';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ symbol: string }> }
) {
  const { symbol } = await params;
  try {
    if (!INDIANAPI_KEY) {
      throw new Error('IndianAPI key is missing. Set NEXT_PUBLIC_INDIANAPI_KEY in your .env.local');
    }
    // Use the correct endpoint and header
    const url = `https://stock.indianapi.in/stock?name=${encodeURIComponent(symbol.replace(/\+/g, ' '))}`;
    const response = await fetch(url, {
      headers: {
        'X-Api-Key': INDIANAPI_KEY
      }
    });
    if (!response.ok) {
      throw new Error(`IndianAPI responded with ${response.status}`);
    }
    const data = await response.json();
    // Map the response to StockData (adjust as needed for actual API response)
    const stockData = {
      symbol: symbol.toUpperCase(),
      price: data.price,
      change: data.change,
      changePercent: data.changePercent,
      volume: data.volume,
      dayHigh: data.dayHigh,
      dayLow: data.dayLow,
      openPrice: data.openPrice,
      previousClose: data.previousClose,
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
        error: error instanceof Error ? error.message : 'Failed to fetch IndianAPI data',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
