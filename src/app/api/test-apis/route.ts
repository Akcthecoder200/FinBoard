import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const testResults = {
    timestamp: new Date().toISOString(),
    results: {
      yahoo: { status: 'unknown', message: '', data: null },
      alphaVantage: { status: 'unknown', message: '', data: null },
      finnhub: { status: 'unknown', message: '', data: null },
      indianapi: { status: 'unknown', message: '', data: null },
    }
  };

  // Test Yahoo Finance
  try {
    const yahooResponse = await fetch(`${request.nextUrl.origin}/api/stock/AAPL`);
    if (yahooResponse.ok) {
      const yahooData = await yahooResponse.json();
      testResults.results.yahoo = {
        status: 'success',
        message: 'Yahoo Finance API working',
        data: yahooData
      };
    } else {
      testResults.results.yahoo = {
        status: 'error',
        message: `Yahoo API returned ${yahooResponse.status}`,
        data: null
      };
    }
  } catch (error) {
    testResults.results.yahoo = {
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
      data: null
    };
  }

  // Test Alpha Vantage
  try {
    const avResponse = await fetch(`${request.nextUrl.origin}/api/stock-alpha-vantage/AAPL`);
    if (avResponse.ok) {
      const avData = await avResponse.json();
      testResults.results.alphaVantage = {
        status: 'success',
        message: 'Alpha Vantage API working',
        data: avData
      };
    } else {
      testResults.results.alphaVantage = {
        status: 'error',
        message: `Alpha Vantage API returned ${avResponse.status}`,
        data: null
      };
    }
  } catch (error) {
    testResults.results.alphaVantage = {
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
      data: null
    };
  }

  // Test Finnhub
  try {
    const finnhubResponse = await fetch(`${request.nextUrl.origin}/api/stock-finnhub/AAPL`);
    if (finnhubResponse.ok) {
      const finnhubData = await finnhubResponse.json();
      testResults.results.finnhub = {
        status: 'success',
        message: 'Finnhub API working',
        data: finnhubData
      };
    } else {
      testResults.results.finnhub = {
        status: 'error',
        message: `Finnhub API returned ${finnhubResponse.status}`,
        data: null
      };
    }
  } catch (error) {
    testResults.results.finnhub = {
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
      data: null
    };
  }

  // Test IndianAPI with a common Indian stock
  try {
    const indianResponse = await fetch(`${request.nextUrl.origin}/api/stock-indianapi/RELIANCE`);
    if (indianResponse.ok) {
      const indianData = await indianResponse.json();
      testResults.results.indianapi = {
        status: 'success',
        message: 'IndianAPI working',
        data: indianData
      };
    } else {
      testResults.results.indianapi = {
        status: 'error',
        message: `IndianAPI returned ${indianResponse.status}`,
        data: null
      };
    }
  } catch (error) {
    testResults.results.indianapi = {
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
      data: null
    };
  }

  return NextResponse.json(testResults);
}
