import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { financialApi } from '../../services/financialApi';

interface TableData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap?: number;
  pe?: number;
  sector?: string;
}

interface TableWidgetProps {
  symbols?: string[];
  height?: number;
  pageSize?: number;
  showFilters?: boolean;
  title?: string;
}

interface FilterCriteria {
  searchTerm: string;
  minPrice: number;
  maxPrice: number;
  minVolume: number;
  sector: string;
  sortBy: 'symbol' | 'price' | 'change' | 'volume' | 'marketCap';
  sortOrder: 'asc' | 'desc';
}

const TableWidget: React.FC<TableWidgetProps> = ({
  symbols = [
    'AAPL', 'GOOGL', 'MSFT', 'AMZN', 'TSLA', 'NVDA', 'META', 'NFLX', 
    'AMD', 'CRM', 'UBER', 'SPOT', 'ZM', 'PYPL', 'ROKU', 'TWLO', 
    'OKTA', 'SNOW', 'PLTR', 'COIN', 'HOOD', 'RBLX', 'UPST', 'SOFI'
  ],
  height = 600,
  pageSize = 10,
  showFilters = true,
  title = "Stock Table"
}) => {
  const [data, setData] = useState<TableData[]>([]);
  const [filteredData, setFilteredData] = useState<TableData[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<FilterCriteria>({
    searchTerm: '',
    minPrice: 0,
    maxPrice: 10000,
    minVolume: 0,
    sector: '',
    sortBy: 'symbol',
    sortOrder: 'asc'
  });

  const sectors = useMemo(() => 
    ['Technology', 'Healthcare', 'Finance', 'Energy', 'Consumer', 'Industrial'], 
    []
  );

  const fetchTableData = useCallback(async () => {
    setLoading(true);
    try {
      const promises = symbols.map(symbol => 
        financialApi.getStockQuote(symbol).catch(error => {
          console.warn(`Failed to fetch ${symbol}:`, error);
          return null;
        })
      );
      
      const results = await Promise.all(promises);
      
      const tableData: TableData[] = results
        .filter((result): result is NonNullable<typeof result> => result !== null)
        .map(stock => ({
          symbol: stock.symbol,
          name: stock.name || stock.symbol,
          price: stock.price,
          change: stock.change,
          changePercent: stock.changePercent,
          volume: stock.volume || 0,
          marketCap: stock.marketCap,
          pe: 15 + Math.random() * 25, // Mock P/E ratio
          sector: sectors[Math.floor(Math.random() * sectors.length)]
        }));

      setData(tableData);
      setFilteredData(tableData);
    } catch (error) {
      console.error('Failed to fetch table data:', error);
    } finally {
      setLoading(false);
    }
  }, [symbols, sectors]);

  useEffect(() => {
    fetchTableData();
    
    // Refresh every 2 minutes
    const interval = setInterval(fetchTableData, 120000);
    return () => clearInterval(interval);
  }, [fetchTableData]);

  // Apply filters and sorting
  useEffect(() => {
    let filtered = [...data];

    // Apply search filter
    if (filters.searchTerm) {
      filtered = filtered.filter(
        item =>
          item.symbol.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
          item.name.toLowerCase().includes(filters.searchTerm.toLowerCase())
      );
    }

    // Apply price range filter
    filtered = filtered.filter(
      item => item.price >= filters.minPrice && item.price <= filters.maxPrice
    );

    // Apply volume filter
    filtered = filtered.filter(item => item.volume >= filters.minVolume);

    // Apply sector filter
    if (filters.sector) {
      filtered = filtered.filter(item => item.sector === filters.sector);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: string | number | undefined = a[filters.sortBy];
      let bValue: string | number | undefined = b[filters.sortBy];

      // Handle undefined values
      if (aValue === undefined && bValue === undefined) return 0;
      if (aValue === undefined) return filters.sortOrder === 'asc' ? 1 : -1;
      if (bValue === undefined) return filters.sortOrder === 'asc' ? -1 : 1;

      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = (bValue as string).toLowerCase();
      }

      if (aValue < bValue) return filters.sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return filters.sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    setFilteredData(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [data, filters]);

  const handleFilterChange = (key: keyof FilterCriteria, value: string | number) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleSort = (column: FilterCriteria['sortBy']) => {
    setFilters(prev => ({
      ...prev,
      sortBy: column,
      sortOrder: prev.sortBy === column && prev.sortOrder === 'asc' ? 'desc' : 'asc'
    }));
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatLargeNumber = (value: number) => {
    if (value >= 1e12) return `$${(value / 1e12).toFixed(1)}T`;
    if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
    if (value >= 1e3) return `$${(value / 1e3).toFixed(1)}K`;
    return `$${value.toFixed(0)}`;
  };

  // Pagination
  const totalPages = Math.ceil(filteredData.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedData = filteredData.slice(startIndex, startIndex + pageSize);

  const getSortIcon = (column: FilterCriteria['sortBy']) => {
    if (filters.sortBy !== column) return '↕️';
    return filters.sortOrder === 'asc' ? '↑' : '↓';
  };

  const getChangeColor = (change: number) => {
    return change >= 0 ? 'text-green-600' : 'text-red-600';
  };

  return (
    <div className="w-full bg-card rounded-lg border p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold">{title}</h3>
          <p className="text-sm text-muted-foreground">
            {filteredData.length} stocks • Page {currentPage} of {totalPages}
          </p>
        </div>
        <button
          onClick={fetchTableData}
          disabled={loading}
          className="px-3 py-1 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 text-sm"
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="mb-4 p-4 bg-secondary/20 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs text-muted-foreground mb-1">Search</label>
              <input
                type="text"
                placeholder="Symbol or name..."
                value={filters.searchTerm}
                onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
                className="w-full px-2 py-1 border border-border rounded bg-background text-foreground text-sm"
              />
            </div>
            
            <div>
              <label className="block text-xs text-muted-foreground mb-1">Price Range</label>
              <div className="flex gap-1">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.minPrice || ''}
                  onChange={(e) => handleFilterChange('minPrice', Number(e.target.value) || 0)}
                  className="w-full px-2 py-1 border border-border rounded bg-background text-foreground text-sm"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.maxPrice === 10000 ? '' : filters.maxPrice}
                  onChange={(e) => handleFilterChange('maxPrice', Number(e.target.value) || 10000)}
                  className="w-full px-2 py-1 border border-border rounded bg-background text-foreground text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-muted-foreground mb-1">Min Volume</label>
              <input
                type="number"
                placeholder="0"
                value={filters.minVolume || ''}
                onChange={(e) => handleFilterChange('minVolume', Number(e.target.value) || 0)}
                className="w-full px-2 py-1 border border-border rounded bg-background text-foreground text-sm"
              />
            </div>

            <div>
              <label className="block text-xs text-muted-foreground mb-1">Sector</label>
              <select
                value={filters.sector}
                onChange={(e) => handleFilterChange('sector', e.target.value)}
                className="w-full px-2 py-1 border border-border rounded bg-background text-foreground text-sm"
              >
                <option value="">All Sectors</option>
                {sectors.map(sector => (
                  <option key={sector} value={sector}>{sector}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <div style={{ height: height - 200, overflowY: 'auto' }}>
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="text-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
                <p className="text-sm text-muted-foreground">Loading table data...</p>
              </div>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-muted/30 sticky top-0">
                <tr className="text-left text-xs">
                  <th 
                    className="px-4 py-3 cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('symbol')}
                  >
                    Symbol {getSortIcon('symbol')}
                  </th>
                  <th 
                    className="px-4 py-3 cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('price')}
                  >
                    Price {getSortIcon('price')}
                  </th>
                  <th 
                    className="px-4 py-3 cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('change')}
                  >
                    Change {getSortIcon('change')}
                  </th>
                  <th className="px-4 py-3">% Change</th>
                  <th 
                    className="px-4 py-3 cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('volume')}
                  >
                    Volume {getSortIcon('volume')}
                  </th>
                  <th 
                    className="px-4 py-3 cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('marketCap')}
                  >
                    Market Cap {getSortIcon('marketCap')}
                  </th>
                  <th className="px-4 py-3">P/E</th>
                  <th className="px-4 py-3">Sector</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((row, index) => (
                  <tr 
                    key={row.symbol}
                    className={`border-b border-border hover:bg-muted/30 transition-colors ${
                      index % 2 === 0 ? 'bg-background' : 'bg-muted/10'
                    }`}
                  >
                    <td className="px-4 py-3">
                      <div>
                        <div className="font-medium text-foreground">{row.symbol}</div>
                        <div className="text-xs text-muted-foreground truncate max-w-32">
                          {row.name}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-foreground">
                      {formatCurrency(row.price)}
                    </td>
                    <td className={`px-4 py-3 font-mono ${getChangeColor(row.change)}`}>
                      {row.change >= 0 ? '+' : ''}{formatCurrency(row.change)}
                    </td>
                    <td className={`px-4 py-3 font-mono font-medium ${getChangeColor(row.change)}`}>
                      {row.changePercent >= 0 ? '+' : ''}{row.changePercent.toFixed(2)}%
                    </td>
                    <td className="px-4 py-3 font-mono text-muted-foreground text-xs">
                      {(row.volume / 1000000).toFixed(1)}M
                    </td>
                    <td className="px-4 py-3 font-mono text-foreground text-sm">
                      {row.marketCap ? formatLargeNumber(row.marketCap) : '--'}
                    </td>
                    <td className="px-4 py-3 font-mono text-sm">
                      {row.pe?.toFixed(1) || '--'}
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 bg-secondary text-secondary-foreground rounded text-xs">
                        {row.sector}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-muted-foreground">
            Showing {startIndex + 1}-{Math.min(startIndex + pageSize, filteredData.length)} of {filteredData.length}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border border-border rounded hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              Previous
            </button>
            
            <div className="flex gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-3 py-1 border border-border rounded text-sm ${
                      currentPage === pageNum 
                        ? 'bg-primary text-primary-foreground' 
                        : 'hover:bg-secondary'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border border-border rounded hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Statistics */}
      <div className="mt-4 p-3 bg-secondary/10 rounded-lg">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <div className="text-muted-foreground">Gainers</div>
            <div className="font-medium text-green-600">
              {filteredData.filter(item => item.changePercent > 0).length}
            </div>
          </div>
          <div>
            <div className="text-muted-foreground">Losers</div>
            <div className="font-medium text-red-600">
              {filteredData.filter(item => item.changePercent < 0).length}
            </div>
          </div>
          <div>
            <div className="text-muted-foreground">Avg Volume</div>
            <div className="font-medium">
              {filteredData.length > 0 
                ? `${(filteredData.reduce((sum, item) => sum + item.volume, 0) / filteredData.length / 1000000).toFixed(1)}M`
                : '0M'
              }
            </div>
          </div>
          <div>
            <div className="text-muted-foreground">Top Gainer</div>
            <div className="font-medium text-green-600">
              {filteredData.length > 0 
                ? `${Math.max(...filteredData.map(item => item.changePercent)).toFixed(1)}%`
                : '--'
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TableWidget;
