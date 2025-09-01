import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Generate mock market data
    const marketData = {
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
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      data: marketData,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch market data',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
