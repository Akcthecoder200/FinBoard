# FinBoard - Customizable Finance Dashboard

A modern, customizable finance dashboard built with Next.js, TypeScript, Tailwind CSS, Redux Toolkit, and Recharts. Create, configure, and manage financial widgets with **real-time financial data integration**.

![FinBoard Dashboard](https://img.shields.io/badge/Status-Live%20API%20Integration-brightgreen)
![Next.js](https://img.shields.io/badge/Next.js-15.5.2-black)
![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38bdf8)

## 🎯 Features

### ✅ Completed Features

#### 🎨 **Professional Dashboard Layout**

- **Responsive Sidebar Navigation** with finance-focused menu items
- **Main Content Area** with stats cards and widget zones
- **Theme System** (Light/Dark/System) with persistence
- **Mobile-First Design** that adapts to all screen sizes

#### 🔧 **Advanced Widget System**

- **Real-time Financial Widgets**:
  - 📈 **Stock Tracker** - Live stock prices with real-time updates
  - ₿ **Crypto Tracker** - Cryptocurrency price monitoring
  - 🌐 **Market Overview** - Major indices and sector performance
  - 📊 **Portfolio** - Multi-stock portfolio tracking
- **Custom Data Hooks** for efficient API integration
- **Auto-refresh** with configurable intervals (30 seconds to 1 hour)
- **Widget Persistence** - Survives page refreshes and browser sessions
- **Error Handling** with retry functionality and loading states

#### 📊 **Widget Configuration Modal**

- **4-Step Setup Process**:
  1. **Widget Details** - Name and description
  2. **Data Configuration** - Symbol/portfolio setup based on widget type
  3. **Widget Type Selection** - Modern financial widget types
  4. **Review & Create** - Final confirmation with live preview
- **Smart Validation** based on widget type requirements
- **Professional UI** with visual feedback and progress tracking

#### 🔄 **State Management**

- **Redux Toolkit** for centralized state management
- **localStorage Persistence** for widget configurations
- **SSR-Safe Implementation** with proper hydration
- **Automatic Save/Load** for seamless user experience

#### 📡 **Real API Integration (Step 4)**

- **Comprehensive Financial API Service** with multiple provider support:
  - Yahoo Finance API integration
  - Alpha Vantage support
  - IEX Cloud compatibility
  - Finnhub integration
  - Mock API for development/testing
- **Custom React Hooks** for data fetching:
  - `useStockData` - Individual stock tracking
  - `useCryptoData` - Cryptocurrency monitoring
  - `useMarketData` - Market overview data
  - `useMultipleStocks` - Portfolio management
  - `useWidgetData` - Universal widget data hook
- **Advanced Features**:
  - Rate limiting and error handling
  - Request timeouts and retry logic
  - TypeScript type safety
  - Automatic data refresh cycles
  - Real-time price updates with change indicators

#### 🎯 **User Experience**

- **Live Data Display** with professional formatting
- **Interactive Widget Cards** with refresh controls
- **Dashboard Analytics** showing utilization and statistics
- **Smart Loading States** and error handling
- **Responsive Design** optimized for all devices
- **Modern Design Language** with gradients and animations

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn package manager

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/finboard.git
   cd finboard
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start development server**

   ```bash
   npm run dev
   ```

4. **Open in browser**
   ```
   http://localhost:3000
   ```

## 📁 Project Structure

```
src/
├── app/
│   ├── globals.css           # Tailwind + CSS variables
│   ├── layout.tsx            # Root layout with providers
│   └── page.tsx              # Main dashboard page
├── components/
│   ├── widgets/
│   │   ├── AddWidgetModal.tsx    # 4-step widget creation modal
│   │   ├── WidgetCard.tsx        # Individual widget display
│   │   └── WidgetContainer.tsx   # Widget management container
│   ├── ReduxProvider.tsx     # Redux store provider
│   └── ThemeProvider.tsx     # Theme context provider
├── hooks/
│   └── useWidgetPersistence.ts   # localStorage persistence hook
├── store/
│   ├── index.ts              # Redux store configuration
│   └── slices/
│       └── widgetsSlice.ts   # Widget state management
└── utils/                    # Utility functions
```

## 🛠️ Tech Stack

| Technology        | Version | Purpose                                  |
| ----------------- | ------- | ---------------------------------------- |
| **Next.js**       | 15.5.2  | React framework with App Router          |
| **TypeScript**    | Latest  | Type safety and developer experience     |
| **Tailwind CSS**  | v4      | Utility-first styling with custom themes |
| **Redux Toolkit** | Latest  | State management with persistence        |
| **Recharts**      | Latest  | Chart visualizations (ready for use)     |

## 📊 Widget System

### Widget Types

1. **📊 Data Table**

   - Tabular display of financial data
   - Sortable columns and custom field selection
   - Real-time updates with color-coded changes

2. **📈 Chart Widget**

   - Visual price trends and market data
   - Multiple chart types (line, bar, candlestick)
   - Interactive tooltips and zoom functionality

3. **💰 Summary Card**
   - Key metrics and portfolio summaries
   - Watchlist tracking with percentage changes
   - Compact design for dashboard overviews

### Configuration Options

- **Widget Name**: Custom titles for easy identification
- **API URL**: Connect to any financial data API
- **Refresh Interval**: 5 seconds to 15 minutes
- **Data Fields**: Select from 8+ available fields:
  - Symbol, Current Price, Price Change, Percent Change
  - Volume, Market Cap, 52W High/Low, and more
- **Display Type**: Choose visualization format

## 🔄 Data Persistence

### localStorage Integration

- **Automatic Save**: Every widget operation persists to browser storage
- **Cross-Session**: Widgets survive browser restarts
- **Error Handling**: Graceful fallback for storage issues
- **JSON Serialization**: Efficient data storage format

### Storage Structure

```json
{
  "finboard-widgets": [
    {
      "id": "widget-1234567890-abc123",
      "type": "table",
      "title": "My Stock Portfolio",
      "config": {
        "apiUrl": "https://api.example.com/stocks",
        "refreshInterval": 30,
        "selectedFields": ["symbol", "price", "change"]
      }
    }
  ]
}
```

## 🎨 Theme System

### Available Themes

- **Light Mode**: Clean, professional light theme
- **Dark Mode**: Modern dark theme for low-light environments
- **System**: Automatically follows OS preference

### Theme Features

- **CSS Variables**: Consistent color system
- **Smooth Transitions**: Animated theme switching
- **Persistence**: Remembers your preference
- **SSR Compatible**: Works with server-side rendering

## 📱 Responsive Design

### Breakpoints

- **Mobile**: 320px - 768px (Stack layout)
- **Tablet**: 768px - 1024px (Collapsible sidebar)
- **Desktop**: 1024px+ (Full sidebar navigation)

### Grid System

- **1 Column**: Mobile devices
- **2 Columns**: Tablets and small desktops
- **3 Columns**: Large desktops (>1280px)

## 🚀 Development Phases

### ✅ Phase 1: Project Setup (Completed)
- Next.js 15.5.2 project initialization with TypeScript
- Tailwind CSS v4 configuration with CSS variables
- Redux Toolkit state management setup
- Project structure and folder organization
- Development environment configuration

### ✅ Phase 2: Dashboard Layout (Completed)
- Professional sidebar navigation with finance menu items
- Responsive main content area with grid layout
- Theme system implementation (Light/Dark/System)
- Mobile-first responsive design
- Header with user profile and theme switcher

### ✅ Phase 3: Widget System (Completed)
- Advanced 4-step widget creation modal
- Widget management with Redux state persistence
- localStorage integration for cross-session persistence
- Widget container with analytics and management features
- Professional widget card design with interactions

### ✅ Phase 4: Real API Integration (Completed)
- Comprehensive financial API service architecture
- Multiple API provider support (Yahoo Finance, Alpha Vantage, IEX Cloud, Finnhub)
- Custom React hooks for data fetching and management
- Real-time data updates with configurable refresh intervals
- TypeScript type safety and error handling
- Modern financial widget types (Stock, Crypto, Market Overview, Portfolio)

### 🔄 Future Phases
- **Phase 5**: Advanced Charting with Recharts integration
- **Phase 6**: User Authentication and saved dashboards
- **Phase 7**: Advanced portfolio analytics and insights
- **Phase 8**: Real-time WebSocket data streaming

## 🧪 Development Commands

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server

# Code Quality
npm run lint         # Run ESLint
npm run type-check   # TypeScript type checking

# Testing (when implemented)
npm run test         # Run test suite
npm run test:watch   # Run tests in watch mode
```

## 🗂️ Development Steps Completed

### ✅ Step 1: Project Setup

- Next.js initialization with TypeScript
- Tailwind CSS v4 configuration
- Redux Toolkit setup
- Development environment configuration

### ✅ Step 2: Dashboard Layout

- Professional sidebar navigation
- Responsive main content area
- Theme system implementation
- Stats cards and placeholder areas

### ✅ Step 3: Widget System Core

- Dynamic widget creation modal
- Widget types and configurations
- Redux state management
- localStorage persistence
- Professional widget cards with interactions

## 🔮 Upcoming Features

### 🎯 Step 4: Real API Integration

- Connect to financial data APIs
- Real-time data fetching
- Error handling and retry logic
- Data caching and optimization

### 🔄 Step 5: Drag & Drop

- Reorderable widget positions
- Grid layout system
- Touch-friendly mobile interactions
- Position persistence

### 📈 Step 6: Advanced Charts

- Recharts integration
- Multiple chart types
- Interactive features
- Export capabilities

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- State managed with [Redux Toolkit](https://redux-toolkit.js.org/)
- Charts powered by [Recharts](https://recharts.org/)

---

**FinBoard** - Empowering financial insights through customizable dashboards 📊✨
