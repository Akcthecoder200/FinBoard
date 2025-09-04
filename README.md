# FinBoard - Advanced Financial Dashboard

A comprehensive, real-time financial dashboard built with Next.js 15, React 19, and TypeScript. Features customizable widgets, advanced charting, and intelligent data persistence.

🔗 **Live Demo:** [FinBoard on Vercel](https://finboard-your-deployment.vercel.app)

## ✨ Features

### 🏗️ **Core Functionality**
- **Real-time Market Data** - Live stock prices, crypto data, and market indicators
- **Customizable Widgets** - Drag-and-drop dashboard with personalized layouts
- **Advanced Charts** - Interactive candlestick charts with technical indicators
- **Data Persistence** - Browser storage with backup/restore functionality
- **Responsive Design** - Optimized for desktop, tablet, and mobile devices

### 📊 **Widget Types**
- **Stock Tracker** - Real-time stock prices and performance metrics
- **Portfolio Manager** - Track holdings with P&L calculations
- **Market Scanner** - Discover trending stocks and opportunities
- **Technical Analysis** - RSI, MACD, Bollinger Bands, and more
- **News Feed** - Latest financial news and market updates

### � **User Experience**
- **Modern UI/UX** - Clean, professional interface with dark/light themes
- **Interactive Charts** - Drawing tools, annotations, and zoom capabilities
- **Loading States** - Comprehensive feedback during data fetching
- **Error Handling** - Graceful degradation and user-friendly error messages
- **Settings Panel** - Complete customization and data management

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Alpha Vantage API key (free at [alphavantage.co](https://www.alphavantage.co))

### Installation
```bash
# Clone the repository
git clone https://github.com/Akcthecoder200/FinBoard.git
cd FinBoard

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your API keys

# Start development server
npm run dev
```

### Environment Variables
Create a `.env.local` file with:
```bash
NEXT_PUBLIC_ALPHA_VANTAGE_API_KEY=your_api_key_here
```

## 🏢 Tech Stack

### **Frontend**
- **Next.js 15** - React framework with App Router
- **React 19** - Latest React with enhanced features
- **TypeScript** - Type-safe development
- **Tailwind CSS 4** - Utility-first styling
- **Redux Toolkit** - State management

### **Charts & Data Visualization**
- **Recharts** - Responsive chart library
- **Chart.js** - Interactive charts
- **Lightweight Charts** - Professional trading charts
- **React Financial Charts** - Advanced financial visualizations

### **APIs & Data**
- **Alpha Vantage** - Stock market data
- **Intelligent Caching** - Optimized data fetching
- **Dynamic Data Mapping** - Flexible API integration

### **Features & Utilities**
- **@dnd-kit** - Drag and drop functionality
- **Browser Storage** - Local data persistence
- **Responsive Layout** - Multi-device support
- **Error Boundaries** - Robust error handling

## 📱 Responsive Design

FinBoard is fully responsive with optimized layouts for:
- **Desktop** (1200px+) - Full feature set with multi-column layouts
- **Tablet** (768px-1199px) - Adapted interface with touch-friendly controls
- **Mobile** (320px-767px) - Streamlined experience with stacked layouts

## 🔧 Development

### Project Structure
```
src/
├── app/                 # Next.js App Router pages
├── components/          # Reusable React components
│   ├── charts/         # Chart components
│   ├── ui/             # UI components
│   └── widgets/        # Dashboard widgets
├── hooks/              # Custom React hooks
├── services/           # API and data services
├── store/              # Redux store configuration
└── utils/              # Utility functions
```

### Scripts
```bash
npm run dev       # Development server
npm run build     # Production build
npm run start     # Production server
npm run lint      # Code linting
```

### Key Features Implemented

#### 🏗️ **Step 1: API Integration**
- Enhanced Financial Data API with intelligent caching
- Dynamic data mapping for flexible API sources
- Real-time market data integration

#### 📈 **Step 2: Advanced Charts & Technical Analysis**
- Professional candlestick charts
- Technical indicators (RSI, MACD, Bollinger Bands)
- Interactive chart annotations and drawing tools

#### 🎨 **Step 3: User Interface & Experience** 
- Customizable widget system with editable titles
- Comprehensive responsive design framework
- Loading states and error handling

#### 💾 **Step 4: Data Persistence**
- Browser storage integration with auto-save
- Complete state recovery on page refresh
- Backup/import system for configuration management

## � Deployment

### Vercel (Recommended)
1. **Connect GitHub repository** to Vercel
2. **Set environment variables** in Vercel dashboard
3. **Deploy** - automatic builds on push

### Manual Deployment
```bash
# Build for production
npm run build

# Start production server
npm start
```

### Environment Setup
Ensure these environment variables are set in production:
- `NEXT_PUBLIC_ALPHA_VANTAGE_API_KEY`

## 🤝 Contributing

1. **Fork the repository**
2. **Create feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit changes** (`git commit -m 'Add amazing feature'`)
4. **Push to branch** (`git push origin feature/amazing-feature`)
5. **Open Pull Request**

## � License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Alpha Vantage** for financial data API
- **Vercel** for hosting and deployment
- **Next.js team** for the amazing framework
- **React community** for excellent libraries and tools

## 📞 Support

- **Documentation:** [Deployment Guide](VERCEL_DEPLOYMENT_GUIDE.md)
- **Issues:** [GitHub Issues](https://github.com/Akcthecoder200/FinBoard/issues)
- **Discussions:** [GitHub Discussions](https://github.com/Akcthecoder200/FinBoard/discussions)

---

**Built with ❤️ by [Akcthecoder200](https://github.com/Akcthecoder200)**

*FinBoard - Your professional financial dashboard solution*
