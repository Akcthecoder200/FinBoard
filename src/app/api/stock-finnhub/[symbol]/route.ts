import { NextRequest, NextResponse } from 'next/server';

const FINNHUB_API_KEY = process.env.NEXT_PUBLIC_FINNHUB_API_KEY || '';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ symbol: string }> }
) {
  const { symbol } = await params;
  try {
    if (!FINNHUB_API_KEY) {
      throw new Error('Finnhub API key is missing. Set NEXT_PUBLIC_FINNHUB_API_KEY in your .env.local');
    }
    const url = `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${FINNHUB_API_KEY}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Finnhub API responded with ${response.status}`);
    }
    const data = await response.json();
    if (!data.c) {
      throw new Error('No quote data found');
    }
    // Finnhub returns: c (current), h (high), l (low), o (open), pc (prev close), t (timestamp)
    const stockData = {
      symbol: symbol.toUpperCase(),
      price: data.c,
      change: data.c - data.pc,
      changePercent: data.pc ? ((data.c - data.pc) / data.pc) * 100 : 0,
      volume: data.v,
      dayHigh: data.h,
      dayLow: data.l,
      openPrice: data.o,
      previousClose: data.pc,
      timestamp: new Date(data.t * 1000).toISOString(),
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
        error: error instanceof Error ? error.message : 'Failed to fetch Finnhub data',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
