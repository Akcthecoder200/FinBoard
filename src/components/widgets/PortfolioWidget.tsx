import React, { useState, useEffect, useCallback } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  ComposedChart,
  Bar,
  Area,
} from "recharts";
import { financialApi } from "../../services/financialApi";

interface PortfolioHolding {
  symbol: string;
  name: string;
  quantity: number;
  avgCost: number;
  currentPrice: number;
  totalValue: number;
  totalCost: number;
  unrealizedPL: number;
  unrealizedPLPercent: number;
  dayChange: number;
  dayChangePercent: number;
  weight: number; // Portfolio weight percentage
}

interface PortfolioPerformance {
  date: string;
  totalValue: number;
  totalCost: number;
  totalPL: number;
  totalPLPercent: number;
  dailyReturn: number;
}

interface PortfolioMetrics {
  totalValue: number;
  totalCost: number;
  totalPL: number;
  totalPLPercent: number;
  dayChange: number;
  dayChangePercent: number;
}

interface PortfolioWidgetProps {
  portfolioId?: string;
  holdings?: Array<{
    symbol: string;
    quantity: number;
    avgCost: number;
  }>;
  height?: number;
  showDetailed?: boolean;
}

const PortfolioWidget: React.FC<PortfolioWidgetProps> = ({
  holdings = [
    { symbol: "AAPL", quantity: 10, avgCost: 150 },
    { symbol: "GOOGL", quantity: 5, avgCost: 2800 },
    { symbol: "MSFT", quantity: 8, avgCost: 320 },
    { symbol: "TSLA", quantity: 3, avgCost: 800 },
    { symbol: "NVDA", quantity: 4, avgCost: 400 },
  ],
  height = 400,
}) => {
  const [portfolioData, setPortfolioData] = useState<PortfolioHolding[]>([]);
  const [performanceHistory, setPerformanceHistory] = useState<
    PortfolioPerformance[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [selectedView, setSelectedView] = useState<
    "overview" | "performance" | "allocation" | "pl"
  >("overview");

  // Calculate portfolio metrics
  const calculatePortfolioMetrics = useCallback(
    (holdings: PortfolioHolding[]): PortfolioMetrics => {
      const totalValue = holdings.reduce(
        (sum, holding) => sum + holding.totalValue,
        0
      );
      const totalCost = holdings.reduce(
        (sum, holding) => sum + holding.totalCost,
        0
      );
      const totalPL = totalValue - totalCost;
      const totalPLPercent = totalCost > 0 ? (totalPL / totalCost) * 100 : 0;
      const dayChange = holdings.reduce(
        (sum, holding) => sum + holding.dayChange * holding.quantity,
        0
      );
      const dayChangePercent =
        totalValue > 0 ? (dayChange / (totalValue - dayChange)) * 100 : 0;

      return {
        totalValue,
        totalCost,
        totalPL,
        totalPLPercent,
        dayChange,
        dayChangePercent,
      };
    },
    []
  );

  // Generate historical performance data
  const generatePerformanceHistory = useCallback(
    (currentMetrics: PortfolioMetrics) => {
      const history: PortfolioPerformance[] = [];
      const days = 30;
      const baseValue = currentMetrics.totalValue;

      for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);

        // Simulate realistic portfolio performance
        const volatility = 0.015; // 1.5% daily volatility
        const trend = Math.random() * 0.002 - 0.001; // Small upward bias
        const dailyReturn = (Math.random() - 0.5) * 2 * volatility + trend;

        const dayValue = baseValue * (1 + (dailyReturn * (i + 1)) / days);
        const totalCost = currentMetrics.totalCost;

        history.push({
          date: date.toISOString().split("T")[0],
          totalValue: dayValue,
          totalCost,
          totalPL: dayValue - totalCost,
          totalPLPercent: ((dayValue - totalCost) / totalCost) * 100,
          dailyReturn: dailyReturn * 100,
        });
      }

      return history;
    },
    []
  );

  useEffect(() => {
    const fetchAndSetData = async () => {
      setLoading(true);
      try {
        const portfolioHoldings: PortfolioHolding[] = [];

        // Fetch current prices for all holdings
        for (const holding of holdings) {
          try {
            const stockData = await financialApi.getStockQuote(holding.symbol);

            const totalCost = holding.quantity * holding.avgCost;
            const totalValue = holding.quantity * stockData.price;
            const unrealizedPL = totalValue - totalCost;
            const unrealizedPLPercent =
              totalCost > 0 ? (unrealizedPL / totalCost) * 100 : 0;
            const dayChange = stockData.change;
            const dayChangePercent = stockData.changePercent;

            portfolioHoldings.push({
              symbol: holding.symbol,
              name: stockData.name || holding.symbol,
              quantity: holding.quantity,
              avgCost: holding.avgCost,
              currentPrice: stockData.price,
              totalValue,
              totalCost,
              unrealizedPL,
              unrealizedPLPercent,
              dayChange,
              dayChangePercent,
              weight: 0, // Will be calculated after all holdings are fetched
            });
          } catch (error) {
            console.error(`Failed to fetch data for ${holding.symbol}:`, error);
            // Add with mock data as fallback
            const mockPrice =
              holding.avgCost * (1 + (Math.random() - 0.5) * 0.2);
            const totalCost = holding.quantity * holding.avgCost;
            const totalValue = holding.quantity * mockPrice;
            const unrealizedPL = totalValue - totalCost;

            portfolioHoldings.push({
              symbol: holding.symbol,
              name: holding.symbol,
              quantity: holding.quantity,
              avgCost: holding.avgCost,
              currentPrice: mockPrice,
              totalValue,
              totalCost,
              unrealizedPL,
              unrealizedPLPercent: (unrealizedPL / totalCost) * 100,
              dayChange: (Math.random() - 0.5) * 10,
              dayChangePercent: (Math.random() - 0.5) * 3,
              weight: 0,
            });
          }
        }

        // Calculate portfolio weights
        const totalPortfolioValue = portfolioHoldings.reduce(
          (sum, h) => sum + h.totalValue,
          0
        );
        portfolioHoldings.forEach((holding) => {
          holding.weight =
            totalPortfolioValue > 0
              ? (holding.totalValue / totalPortfolioValue) * 100
              : 0;
        });

        setPortfolioData(portfolioHoldings);

        // Generate performance history
        const metrics = calculatePortfolioMetrics(portfolioHoldings);
        const history = generatePerformanceHistory(metrics);
        setPerformanceHistory(history);
      } catch (error) {
        console.error("Failed to fetch portfolio data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAndSetData();

    // Refresh every 5 minutes
    const interval = setInterval(fetchAndSetData, 300000);
    return () => clearInterval(interval);
  }, [holdings, calculatePortfolioMetrics, generatePerformanceHistory]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatPercent = (value: number) => {
    const sign = value >= 0 ? "+" : "";
    return `${sign}${value.toFixed(2)}%`;
  };

  const portfolioMetrics = calculatePortfolioMetrics(portfolioData);

  // Prepare data for charts
  const allocationData = portfolioData.map((holding) => ({
    name: holding.symbol,
    value: holding.totalValue,
    weight: holding.weight,
  }));

  const COLORS = [
    "#3b82f6",
    "#10b981",
    "#f59e0b",
    "#ef4444",
    "#8b5cf6",
    "#06b6d4",
    "#84cc16",
  ];

  if (loading) {
    return (
      <div className="w-full h-96 flex items-center justify-center bg-card rounded-lg border">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-muted-foreground">Loading portfolio data...</p>
        </div>
      </div>
    );
  }

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Portfolio Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-secondary/20 rounded-lg p-4">
          <div className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
            Total Value
          </div>
          <div className="text-xl font-bold text-foreground">
            {formatCurrency(portfolioMetrics.totalValue)}
          </div>
        </div>

        <div className="bg-secondary/20 rounded-lg p-4">
          <div className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
            Total Cost
          </div>
          <div className="text-xl font-bold text-foreground">
            {formatCurrency(portfolioMetrics.totalCost)}
          </div>
        </div>

        <div className="bg-secondary/20 rounded-lg p-4">
          <div className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
            Unrealized P&L
          </div>
          <div
            className={`text-xl font-bold ${
              portfolioMetrics.totalPL >= 0 ? "text-green-600" : "text-red-600"
            }`}
          >
            {formatCurrency(portfolioMetrics.totalPL)}
          </div>
          <div
            className={`text-xs ${
              portfolioMetrics.totalPL >= 0 ? "text-green-600" : "text-red-600"
            }`}
          >
            {formatPercent(portfolioMetrics.totalPLPercent)}
          </div>
        </div>

        <div className="bg-secondary/20 rounded-lg p-4">
          <div className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
            Day Change
          </div>
          <div
            className={`text-xl font-bold ${
              portfolioMetrics.dayChange >= 0
                ? "text-green-600"
                : "text-red-600"
            }`}
          >
            {formatCurrency(portfolioMetrics.dayChange)}
          </div>
          <div
            className={`text-xs ${
              portfolioMetrics.dayChange >= 0
                ? "text-green-600"
                : "text-red-600"
            }`}
          >
            {formatPercent(portfolioMetrics.dayChangePercent)}
          </div>
        </div>
      </div>

      {/* Holdings Table */}
      <div className="bg-secondary/10 rounded-lg p-4">
        <h4 className="font-semibold mb-4">Holdings</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2">Symbol</th>
                <th className="text-right py-2">Qty</th>
                <th className="text-right py-2">Avg Cost</th>
                <th className="text-right py-2">Current</th>
                <th className="text-right py-2">Value</th>
                <th className="text-right py-2">P&L</th>
                <th className="text-right py-2">Weight</th>
              </tr>
            </thead>
            <tbody>
              {portfolioData.map((holding) => (
                <tr key={holding.symbol} className="border-b border-border/50">
                  <td className="py-2 font-medium">{holding.symbol}</td>
                  <td className="text-right py-2">{holding.quantity}</td>
                  <td className="text-right py-2">
                    {formatCurrency(holding.avgCost)}
                  </td>
                  <td className="text-right py-2">
                    {formatCurrency(holding.currentPrice)}
                  </td>
                  <td className="text-right py-2">
                    {formatCurrency(holding.totalValue)}
                  </td>
                  <td
                    className={`text-right py-2 ${
                      holding.unrealizedPL >= 0
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {formatCurrency(holding.unrealizedPL)}
                    <br />
                    <span className="text-xs">
                      {formatPercent(holding.unrealizedPLPercent)}
                    </span>
                  </td>
                  <td className="text-right py-2">
                    {holding.weight.toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderPerformance = () => (
    <div style={{ height: height - 100 }}>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={performanceHistory}>
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
          <XAxis
            dataKey="date"
            tickFormatter={(date) =>
              new Date(date).toLocaleDateString([], {
                month: "short",
                day: "numeric",
              })
            }
            className="text-xs"
          />
          <YAxis
            yAxisId="value"
            orientation="left"
            tickFormatter={formatCurrency}
            className="text-xs"
          />
          <YAxis
            yAxisId="return"
            orientation="right"
            tickFormatter={(value) => `${value.toFixed(1)}%`}
            className="text-xs"
          />
          <Tooltip
            labelFormatter={(date) => new Date(date).toLocaleDateString()}
            formatter={(value: number, name: string) => {
              if (name === "Daily Return")
                return [`${value.toFixed(2)}%`, name];
              return [formatCurrency(value), name];
            }}
            contentStyle={{
              backgroundColor: "var(--background)",
              border: "1px solid var(--border)",
              borderRadius: "6px",
            }}
          />
          <Area
            yAxisId="value"
            type="monotone"
            dataKey="totalValue"
            fill="#3b82f6"
            fillOpacity={0.2}
            stroke="#3b82f6"
            strokeWidth={2}
            name="Portfolio Value"
          />
          <Bar
            yAxisId="return"
            dataKey="dailyReturn"
            fill="#10b981"
            opacity={0.6}
            name="Daily Return"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );

  const renderAllocation = () => (
    <div
      className="flex items-center justify-center"
      style={{ height: height - 100 }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={allocationData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={120}
            paddingAngle={5}
            dataKey="value"
          >
            {allocationData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number) => [formatCurrency(value), "Value"]}
            contentStyle={{
              backgroundColor: "var(--background)",
              border: "1px solid var(--border)",
              borderRadius: "6px",
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );

  const renderProfitLoss = () => (
    <div style={{ height: height - 100 }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={performanceHistory}>
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
          <XAxis
            dataKey="date"
            tickFormatter={(date) =>
              new Date(date).toLocaleDateString([], {
                month: "short",
                day: "numeric",
              })
            }
            className="text-xs"
          />
          <YAxis tickFormatter={formatCurrency} className="text-xs" />
          <Tooltip
            labelFormatter={(date) => new Date(date).toLocaleDateString()}
            formatter={(value: number) => [formatCurrency(value), "P&L"]}
            contentStyle={{
              backgroundColor: "var(--background)",
              border: "1px solid var(--border)",
              borderRadius: "6px",
            }}
          />
          <Line
            type="monotone"
            dataKey="totalPL"
            stroke={portfolioMetrics.totalPL >= 0 ? "#10b981" : "#ef4444"}
            strokeWidth={3}
            dot={false}
            activeDot={{
              r: 6,
              stroke: portfolioMetrics.totalPL >= 0 ? "#10b981" : "#ef4444",
              strokeWidth: 2,
              fill: "#fff",
            }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );

  return (
    <div className="w-full bg-card rounded-lg border p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold">Portfolio Performance</h3>
          <p className="text-sm text-muted-foreground">
            Track your investments and P&L
          </p>
        </div>
        <div className="flex gap-2">
          {(["overview", "performance", "allocation", "pl"] as const).map(
            (view) => (
              <button
                key={view}
                onClick={() => setSelectedView(view)}
                className={`px-3 py-1 text-xs rounded-md transition-colors ${
                  selectedView === view
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {view === "pl"
                  ? "P&L"
                  : view.charAt(0).toUpperCase() + view.slice(1)}
              </button>
            )
          )}
        </div>
      </div>

      {selectedView === "overview" && renderOverview()}
      {selectedView === "performance" && renderPerformance()}
      {selectedView === "allocation" && renderAllocation()}
      {selectedView === "pl" && renderProfitLoss()}
    </div>
  );
};

export default PortfolioWidget;
