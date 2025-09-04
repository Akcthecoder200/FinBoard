import { NextRequest, NextResponse } from "next/server";

const ALPHA_VANTAGE_API_KEY =
  process.env.NEXT_PUBLIC_ALPHA_VANTAGE_API_KEY || "demo";

// Rate limiting variables
let requestCount = 0;
let resetTime = Date.now() + 60000; // Reset every minute
const RATE_LIMIT = 5; // Alpha Vantage free tier: 5 requests per minute

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ symbol: string }> }
) {
  const { symbol } = await params;

  try {
    // Check rate limit
    if (Date.now() > resetTime) {
      requestCount = 0;
      resetTime = Date.now() + 60000;
    }

    if (requestCount >= RATE_LIMIT) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Alpha Vantage rate limit exceeded (5 requests/minute). Try again later.",
          timestamp: new Date().toISOString(),
        },
        { status: 429 } // Rate limit status
      );
    }

    requestCount++;

    // Check for demo API key
    if (ALPHA_VANTAGE_API_KEY === "demo") {
      return NextResponse.json(
        {
          success: false,
          error:
            "Alpha Vantage demo key has limited functionality. Please use a valid API key.",
          timestamp: new Date().toISOString(),
        },
        { status: 403 }
      );
    }

    const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${ALPHA_VANTAGE_API_KEY}`;

    const response = await fetch(url, {
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });

    if (!response.ok) {
      throw new Error(`Alpha Vantage API responded with ${response.status}`);
    }

    const data = await response.json();

    // Check for Alpha Vantage specific error messages
    if (data["Error Message"]) {
      throw new Error(`Alpha Vantage Error: ${data["Error Message"]}`);
    }

    if (data["Note"]) {
      // Rate limit message from Alpha Vantage
      return NextResponse.json(
        {
          success: false,
          error: "Alpha Vantage API rate limit exceeded",
          timestamp: new Date().toISOString(),
        },
        { status: 429 }
      );
    }

    const quote = data["Global Quote"];
    if (!quote) {
      throw new Error("No quote data found in Alpha Vantage response");
    }

    // Parse the Global Quote response
    const price = parseFloat(quote["05. price"]) || 0;
    const change = parseFloat(quote["09. change"]) || 0;
    const changePercent =
      parseFloat(quote["10. change percent"]?.replace("%", "")) || 0;
    const volume = parseInt(quote["06. volume"]) || 0;
    const high = parseFloat(quote["03. high"]) || 0;
    const low = parseFloat(quote["04. low"]) || 0;
    const open = parseFloat(quote["02. open"]) || 0;
    const previousClose = parseFloat(quote["08. previous close"]) || 0;

    const stockData = {
      symbol: symbol.toUpperCase(),
      name: symbol.toUpperCase(),
      price,
      change,
      changePercent,
      volume,
      dayHigh: high,
      dayLow: low,
      openPrice: open,
      previousClose,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      data: stockData,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error(`Alpha Vantage API error for ${symbol}:`, error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch Alpha Vantage data",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
