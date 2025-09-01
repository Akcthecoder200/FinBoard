import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Generate mock crypto data since most crypto APIs require API keys
    const symbols = ['BTC', 'ETH', 'ADA', 'SOL', 'DOT'];
    const cryptos = symbols.map(symbol => {
      const basePrice = Math.random() * 50000 + 1000;
      const change = (Math.random() - 0.5) * basePrice * 0.1;
      const changePercent = (change / basePrice) * 100;

      return {
        symbol,
        name: `${symbol} Coin`,
        price: basePrice,
        change,
        changePercent,
        volume: Math.random() * 1000000000,
        marketCap: basePrice * 21000000,
        high24h: basePrice + Math.random() * basePrice * 0.05,
        low24h: basePrice - Math.random() * basePrice * 0.05,
        timestamp: new Date().toISOString(),
      };
    });

    return NextResponse.json({
      success: true,
      data: cryptos,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch crypto data',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
