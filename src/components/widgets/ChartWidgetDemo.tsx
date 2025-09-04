import React from "react";
import ChartWidget from "./ChartWidget";

const ChartWidgetDemo: React.FC = () => {
  return (
    <div className="p-6 space-y-8 bg-background min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            📊 Interactive Chart Widget Demo
          </h1>
          <p className="text-muted-foreground">
            Experience real-time financial charts with multiple visualization
            types
          </p>
        </div>

        <div className="grid gap-8">
          {/* Line Chart Demo */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
              📈 Line Chart - Apple Stock (AAPL)
            </h2>
            <ChartWidget
              symbol="AAPL"
              title="Apple Inc. (AAPL)"
              chartType="line"
              timeRange="1D"
              height={350}
              refreshInterval={60000}
            />
          </div>

          {/* Area Chart Demo */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
              🌊 Area Chart - Tesla Stock (TSLA)
            </h2>
            <ChartWidget
              symbol="TSLA"
              title="Tesla Inc. (TSLA)"
              chartType="area"
              timeRange="5D"
              height={350}
              refreshInterval={60000}
            />
          </div>

          {/* Volume Chart Demo */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
              📊 Volume Chart - Microsoft Stock (MSFT)
            </h2>
            <ChartWidget
              symbol="MSFT"
              title="Microsoft Corp. (MSFT)"
              chartType="volume"
              timeRange="1M"
              height={300}
              refreshInterval={60000}
            />
          </div>

          {/* Multiple Charts Grid */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
              🔄 Multiple Charts Comparison
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <ChartWidget
                symbol="GOOGL"
                title="Google (GOOGL)"
                chartType="line"
                timeRange="1D"
                height={250}
                refreshInterval={60000}
              />
              <ChartWidget
                symbol="AMZN"
                title="Amazon (AMZN)"
                chartType="area"
                timeRange="1D"
                height={250}
                refreshInterval={60000}
              />
            </div>
          </div>

          {/* Features Overview */}
          <div className="bg-card border border-border rounded-xl p-6 mt-8">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              🚀 Chart Widget Features
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="flex items-start gap-3 p-3 bg-secondary/20 rounded-lg">
                <div className="text-green-500 mt-1">✅</div>
                <div>
                  <h4 className="font-medium text-sm">Real-time Data</h4>
                  <p className="text-xs text-muted-foreground">
                    Live stock prices with auto-refresh
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-secondary/20 rounded-lg">
                <div className="text-green-500 mt-1">✅</div>
                <div>
                  <h4 className="font-medium text-sm">Multiple Chart Types</h4>
                  <p className="text-xs text-muted-foreground">
                    Line, Area, and Volume charts
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-secondary/20 rounded-lg">
                <div className="text-green-500 mt-1">✅</div>
                <div>
                  <h4 className="font-medium text-sm">Interactive Tooltips</h4>
                  <p className="text-xs text-muted-foreground">
                    Hover for detailed price information
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-secondary/20 rounded-lg">
                <div className="text-green-500 mt-1">✅</div>
                <div>
                  <h4 className="font-medium text-sm">Responsive Design</h4>
                  <p className="text-xs text-muted-foreground">
                    Adapts to any screen size
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-secondary/20 rounded-lg">
                <div className="text-green-500 mt-1">✅</div>
                <div>
                  <h4 className="font-medium text-sm">Error Handling</h4>
                  <p className="text-xs text-muted-foreground">
                    Graceful fallbacks and error states
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-secondary/20 rounded-lg">
                <div className="text-green-500 mt-1">✅</div>
                <div>
                  <h4 className="font-medium text-sm">Theme Support</h4>
                  <p className="text-xs text-muted-foreground">
                    Dark/light mode compatible
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* API Integration Status */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              🔌 API Integration Status
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="font-medium">Yahoo Finance API</span>
                </div>
                <span className="text-green-600 text-sm font-medium">
                  ✅ Working
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="font-medium">Alpha Vantage API</span>
                </div>
                <span className="text-green-600 text-sm font-medium">
                  ✅ Working
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span className="font-medium">Finnhub API</span>
                </div>
                <span className="text-yellow-600 text-sm font-medium">
                  ⚠️ Demo Mode
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="font-medium">IndianAPI</span>
                </div>
                <span className="text-red-600 text-sm font-medium">
                  ❌ Auth Required
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChartWidgetDemo;
