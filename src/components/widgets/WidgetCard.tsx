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
    <div className="group bg-card border border-border rounded-xl p-5 hover:shadow-xl hover:shadow-primary/5 hover:border-primary/20 transition-all duration-300">
      {/* Widget Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
            <span className="text-lg">{getWidgetIcon(widget.type)}</span>
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{widget.title}</h3>
            <p className="text-xs text-muted-foreground capitalize">{widget.type} widget</p>
          </div>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
            title="Widget settings"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
          <button
            onClick={onRemove}
            className="p-1.5 text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            title="Remove widget"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Widget Description */}
      <div className="mb-4 px-1">
        <p className="text-sm text-muted-foreground leading-relaxed">
          {getWidgetDescription(widget)}
        </p>
      </div>

      {/* Widget Content */}
      <div className="bg-gradient-to-br from-secondary/30 to-secondary/10 rounded-lg p-4 min-h-[140px] border border-secondary/20">
        {widget.type === 'table' && isTableData(mockData) && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Live Data Preview</span>
            </div>
            <div className="space-y-2">
              {mockData.data.map((row, index) => (
                <div key={index} className="flex justify-between items-center text-sm bg-background/50 rounded-md px-3 py-2">
                  <span className="font-mono font-medium">{row.symbol}</span>
                  <span className="font-mono">{row.price}</span>
                  <span className={`font-mono text-xs px-2 py-1 rounded ${row.change.startsWith('+') ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                    {row.percent}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {widget.type === 'chart' && isChartData(mockData) && (
          <div className="text-center">
            <div className="flex items-center gap-2 mb-3 justify-center">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Chart Preview</span>
            </div>
            <div className="text-3xl font-bold text-foreground mb-2">{mockData.price}</div>
            <div className={`text-sm font-medium mb-4 ${mockData.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
              {mockData.change}
            </div>
            <div className="h-16 bg-gradient-to-r from-blue-500/20 via-green-500/20 to-blue-500/20 rounded-lg flex items-end justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-t from-primary/10 to-transparent"></div>
              <div className="text-xs text-muted-foreground relative z-10">📈 Interactive chart coming soon</div>
            </div>
          </div>
        )}

        {widget.type === 'card' && isCardData(mockData) && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{mockData.title}</span>
            </div>
            <div className="space-y-2">
              {mockData.values.map((value: string, index: number) => (
                <div key={index} className="flex justify-between items-center text-sm bg-background/50 rounded-md px-3 py-2">
                  <span className="font-mono text-muted-foreground">{['AAPL', 'GOOGL', 'TSLA'][index]}</span>
                  <span className="font-mono font-medium">{value}</span>
                  <span className={`font-mono text-xs px-2 py-1 rounded ${mockData.changes[index].startsWith('+') ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                    {mockData.changes[index]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Widget Footer */}
      <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-between">
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 bg-muted-foreground/50 rounded-full"></div>
            ID: {widget.id.split('-').pop()}
          </span>
          <span className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 bg-primary/60 rounded-full"></div>
            {widget.type}
          </span>
        </div>
        <div className="text-xs text-muted-foreground">
          <span className="bg-secondary/50 px-2 py-1 rounded-full">
            Active
          </span>
        </div>
      </div>
    </div>
  );
}
