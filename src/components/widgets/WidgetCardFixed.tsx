'use client';

import { Widget } from '@/store/slices/widgetsSlice';

interface WidgetCardProps {
  widget: Widget;
  onRemove: () => void;
}

interface TableData {
  data: Array<{
    symbol: string;
    price: string;
    change: string;
    percent: string;
  }>;
}

interface ChartData {
  symbol: string;
  price: string;
  change: string;
  trend: 'up' | 'down';
}

interface CardData {
  title: string;
  values: string[];
  changes: string[];
}

export function WidgetCard({ widget, onRemove }: WidgetCardProps) {
  const getWidgetIcon = (type: string) => {
    switch (type) {
      case 'table': return '📊';
      case 'chart': return '📈';
      case 'card': return '💰';
      default: return '📋';
    }
  };

  const getWidgetDescription = (widget: Widget) => {
    switch (widget.type) {
      case 'table':
        return `Table showing ${(widget.config?.symbol as string) || 'stock'} data with ${widget.config?.pageSize || 10} rows`;
      case 'chart':
        return `${widget.config?.chartType || 'Line'} chart for ${(widget.config?.symbol as string) || 'AAPL'} (${widget.config?.timeframe || '1D'})`;
      case 'card':
        return `Finance card tracking ${Array.isArray(widget.config?.symbols) ? widget.config.symbols.length : 3} symbols`;
      default:
        return 'Custom widget';
    }
  };

  const getMockData = (widget: Widget): TableData | ChartData | CardData => {
    switch (widget.type) {
      case 'table':
        return {
          data: [
            { symbol: 'AAPL', price: '$173.50', change: '+$2.45', percent: '+1.43%' },
            { symbol: 'GOOGL', price: '$138.21', change: '-$1.12', percent: '-0.80%' },
            { symbol: 'TSLA', price: '$248.50', change: '+$12.30', percent: '+5.21%' },
          ]
        };
      case 'chart':
        return {
          symbol: (widget.config?.symbol as string) || 'AAPL',
          price: '$173.50',
          change: '+2.45 (+1.43%)',
          trend: 'up' as const
        };
      case 'card':
        return {
          title: widget.config?.cardType === 'watchlist' ? 'Watchlist' : 'Market Summary',
          values: ['$173.50', '$138.21', '$248.50'],
          changes: ['+1.43%', '-0.80%', '+5.21%']
        };
      default:
        return {
          title: 'Default Card',
          values: ['No data'],
          changes: ['N/A']
        };
    }
  };

  const mockData = getMockData(widget);

  // Type guard functions
  const isTableData = (data: TableData | ChartData | CardData): data is TableData => {
    return 'data' in data;
  };

  const isChartData = (data: TableData | ChartData | CardData): data is ChartData => {
    return 'price' in data && 'trend' in data;
  };

  const isCardData = (data: TableData | ChartData | CardData): data is CardData => {
    return 'title' in data && 'values' in data;
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4 hover:shadow-lg transition-all duration-200">
      {/* Widget Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">{getWidgetIcon(widget.type)}</span>
          <h3 className="font-semibold text-foreground">{widget.title}</h3>
        </div>
        <div className="flex items-center gap-1">
          <button
            className="p-1 text-muted-foreground hover:text-foreground hover:bg-secondary rounded transition-colors"
            title="Settings"
          >
            ⚙️
          </button>
          <button
            onClick={onRemove}
            className="p-1 text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
            title="Remove widget"
          >
            🗑️
          </button>
        </div>
      </div>

      {/* Widget Description */}
      <p className="text-sm text-muted-foreground mb-4">
        {getWidgetDescription(widget)}
      </p>

      {/* Widget Content */}
      <div className="bg-secondary/20 rounded-lg p-4 min-h-[120px]">
        {widget.type === 'table' && isTableData(mockData) && (
          <div>
            <div className="text-xs font-medium text-muted-foreground mb-2">STOCK DATA PREVIEW</div>
            <div className="space-y-2">
              {mockData.data.map((row, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span className="font-mono">{row.symbol}</span>
                  <span className="font-mono">{row.price}</span>
                  <span className={`font-mono ${row.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                    {row.percent}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {widget.type === 'chart' && isChartData(mockData) && (
          <div className="text-center">
            <div className="text-xs font-medium text-muted-foreground mb-2">CHART PREVIEW</div>
            <div className="text-2xl font-bold text-foreground">{mockData.price}</div>
            <div className={`text-sm font-medium ${mockData.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
              {mockData.change}
            </div>
            <div className="mt-3 h-16 bg-gradient-to-r from-blue-500/20 to-green-500/20 rounded flex items-end justify-center">
              <div className="text-xs text-muted-foreground">📈 Chart visualization</div>
            </div>
          </div>
        )}

        {widget.type === 'card' && isCardData(mockData) && (
          <div>
            <div className="text-xs font-medium text-muted-foreground mb-2">{mockData.title.toUpperCase()}</div>
            <div className="space-y-2">
              {mockData.values.map((value: string, index: number) => (
                <div key={index} className="flex justify-between text-sm">
                  <span className="font-mono">{['AAPL', 'GOOGL', 'TSLA'][index]}</span>
                  <span className="font-mono">{value}</span>
                  <span className={`font-mono text-xs ${mockData.changes[index].startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                    {mockData.changes[index]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Widget Footer */}
      <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
        <span>ID: {widget.id.split('-').pop()}</span>
        <span>Type: {widget.type}</span>
      </div>
    </div>
  );
}
