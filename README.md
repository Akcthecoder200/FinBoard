# 📊 FinBoard - Professional Financial Dashboard

> **A modern, real-time financial dashboard built with Next.js 15 and React 19**

![FinBoard Preview](https://via.placeholder.com/800x400/1f2937/ffffff?text=FinBoard+Dashboard)

[![Vercel Deploy](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Akcthecoder200/FinBoard)
[![Next.js](https://img.shields.io/badge/Next.js-15.5.2-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.1.0-blue)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.17-38bdf8)](https://tailwindcss.com/)

🔗 **Live Demo:** [FinBoard on Vercel](https://finboard-your-deployment.vercel.app)

---

## ✨ Features

### 🏗️ **Core Functionality**
- 📈 **Real-time Market Data** - Live stock prices, crypto data, and market indicators powered by Alpha Vantage API
- 🎛️ **Customizable Widgets** - Drag-and-drop dashboard with personalized layouts using @dnd-kit
- 📊 **Advanced Charts** - Interactive candlestick charts with technical indicators (Recharts, Chart.js, Lightweight Charts)
- 💾 **Data Persistence** - Intelligent browser storage with auto-save and backup/restore functionality
- 📱 **Responsive Design** - Optimized for desktop, tablet, and mobile devices

### 🎨 **User Experience**
- 🌙 **Dark/Light Themes** - Professional UI with theme switching
- ⚡ **Loading States** - Comprehensive feedback during data fetching
- 🚨 **Error Handling** - Graceful degradation and user-friendly error messages
- ⚙️ **Settings Panel** - Complete customization and data management
- 🎯 **Interactive Charts** - Drawing tools, annotations, and zoom capabilities

---

## 🚀 Quick Start

### Prerequisites

Before you begin, ensure you have:
- **Node.js 18+** installed
- **npm** or **yarn** package manager
- **Alpha Vantage API key** (free at [alphavantage.co](https://www.alphavantage.co))

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/Akcthecoder200/FinBoard.git
cd FinBoard

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local

# 4. Add your API key to .env.local
echo "NEXT_PUBLIC_ALPHA_VANTAGE_API_KEY=your_api_key_here" > .env.local

# 5. Start development server
npm run dev
```

### Environment Variables

Create a `.env.local` file in the root directory:

```bash
# Alpha Vantage API Configuration
NEXT_PUBLIC_ALPHA_VANTAGE_API_KEY=VMFAF630EBQ1HFBK
```

> **Note:** Replace with your actual API key from [Alpha Vantage](https://www.alphavantage.co/support/#api-key)

---

## 🏗️ Tech Stack

### **Frontend & Framework**
- **[Next.js 15.5.2](https://nextjs.org/)** - React framework with App Router and Server Components
- **[React 19.1.0](https://reactjs.org/)** - Latest React with enhanced concurrent features
- **[TypeScript 5](https://www.typescriptlang.org/)** - Type-safe development with strict configuration
- **[Tailwind CSS 3.4.17](https://tailwindcss.com/)** - Utility-first CSS framework with custom design system

### **State Management & Data**
- **[@reduxjs/toolkit 2.8.2](https://redux-toolkit.js.org/)** - Modern Redux for predictable state management
- **[react-redux 9.2.0](https://react-redux.js.org/)** - Official React bindings for Redux

### **Charts & Visualization**
- **[Recharts 3.1.2](https://recharts.org/)** - Responsive chart library built on React components
- **[Chart.js 4.5.0](https://www.chartjs.org/)** - Interactive charts with react-chartjs-2 wrapper
- **[Lightweight Charts 5.0.8](https://tradingview.github.io/lightweight-charts/)** - Professional financial charts

### **UI/UX & Interactions**
- **[@dnd-kit 6.3.1](https://dndkit.com/)** - Modern drag and drop toolkit for React
  - `@dnd-kit/core` - Core drag and drop functionality
  - `@dnd-kit/sortable` - Sortable components
  - `@dnd-kit/utilities` - Utility functions

### **Development Tools**
- **[ESLint 9](https://eslint.org/)** - Code linting with Next.js configuration
- **[PostCSS 8.4.49](https://postcss.org/)** - CSS processing with Autoprefixer
- **[Autoprefixer 10.4.20](https://autoprefixer.github.io/)** - CSS vendor prefixing

---

## 📁 Project Structure

```
FinBoard/
├── 📁 src/
│   ├── 📁 app/                    # Next.js App Router
│   │   ├── globals.css           # Global styles with Tailwind
│   │   ├── layout.tsx            # Root layout with providers
│   │   └── page.tsx              # Home page component
│   ├── 📁 components/            # Reusable React components
│   │   ├── 📁 charts/           # Chart components
│   │   ├── 📁 ui/               # UI components (buttons, inputs, etc.)
│   │   └── 📁 widgets/          # Dashboard widgets
│   ├── 📁 hooks/                # Custom React hooks
│   ├── 📁 providers/            # Context providers
│   ├── 📁 services/             # API services and data fetching
│   ├── 📁 store/                # Redux store configuration
│   └── 📁 utils/                # Utility functions and helpers
├── 📁 public/                   # Static assets
├── 📄 .env.local               # Environment variables
├── 📄 .env.vercel              # Vercel deployment config
├── 📄 .npmrc                   # NPM configuration
├── 📄 package.json             # Dependencies and scripts
├── 📄 tailwind.config.ts       # Tailwind CSS configuration
├── 📄 postcss.config.mjs       # PostCSS configuration
├── 📄 next.config.ts           # Next.js configuration
└── 📄 tsconfig.json            # TypeScript configuration
```

---

## 🛠️ Development

### Available Scripts

```bash
# Development
npm run dev          # Start development server on http://localhost:3000

# Production
npm run build        # Create optimized production build
npm run start        # Start production server

# Code Quality
npm run lint         # Run ESLint for code analysis
```

### Development Workflow

1. **Start Development Server**
   ```bash
   npm run dev
   ```

2. **Make Changes** - Edit files in `src/` directory

3. **Test Locally** - Verify changes in browser

4. **Build for Production**
   ```bash
   npm run build
   ```

### Key Development Features

- **Hot Reload** - Instant updates during development
- **TypeScript Integration** - Full type checking and IntelliSense
- **ESLint Configuration** - Automated code quality checks
- **Tailwind CSS** - Utility-first styling with custom design tokens

---

## 🌐 Deployment

### Vercel (Recommended)

**One-Click Deploy:**
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Akcthecoder200/FinBoard)

**Manual Deployment:**

1. **Connect Repository**
   - Sign in to [Vercel](https://vercel.com)
   - Import your GitHub repository

2. **Configure Environment Variables**
   ```bash
   NEXT_PUBLIC_ALPHA_VANTAGE_API_KEY=your_api_key_here
   ```

3. **Deploy**
   - Automatic deployments on every push to main branch
   - Preview deployments for pull requests

### Other Platforms

**Netlify:**
```bash
npm run build
# Deploy the .next folder
```

**Docker:**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

---

## 📊 Deployment History

### Recent Fixes & Improvements

| Commit | Description | Status |
|--------|-------------|--------|
| `a2105fa` | Update deployment status: CSS syntax fixed | ✅ Latest |
| `ff60afb` | Fix Tailwind CSS imports: Convert v4 syntax to v3 for Vercel compatibility | ✅ Fixed |
| `f7385b1` | Fix LightningCSS error: Downgrade Tailwind to v3 for Vercel compatibility | ✅ Fixed |
| `a9d8678` | Force new Vercel deployment - timestamp update | ✅ Fixed |
| `1bf57d4` | FORCE DEPLOYMENT: Remove vercel.json completely - Auto-detect Next.js | ✅ Fixed |

### Deployment Troubleshooting

**Common Issues & Solutions:**

1. **LightningCSS Error** ✅ **FIXED**
   - **Problem:** `Cannot find module '../lightningcss.linux-x64-gnu.node'`
   - **Solution:** Downgraded Tailwind CSS from v4 to v3.4.17

2. **CSS Import Error** ✅ **FIXED**
   - **Problem:** `Module not found: Can't resolve 'tailwindcss'`
   - **Solution:** Updated CSS imports from v4 to v3 syntax

3. **React 19 Compatibility** ✅ **FIXED**
   - **Problem:** Peer dependency conflicts
   - **Solution:** Added `legacy-peer-deps=true` to `.npmrc`

---

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `NEXT_PUBLIC_ALPHA_VANTAGE_API_KEY` | Alpha Vantage API key for market data | Yes | - |

### NPM Configuration (`.npmrc`)

```ini
legacy-peer-deps=true
fund=false
audit=false
```

### Tailwind CSS Configuration

```typescript
// tailwind.config.ts
export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        // Custom color palette
      },
    },
  },
  plugins: [],
};
```

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

### Getting Started

1. **Fork the Repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/FinBoard.git
   ```

2. **Create Feature Branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```

3. **Make Changes**
   - Follow the existing code style
   - Add tests for new features
   - Update documentation

4. **Commit Changes**
   ```bash
   git commit -m "Add amazing feature"
   ```

5. **Push and Create PR**
   ```bash
   git push origin feature/amazing-feature
   ```

### Development Guidelines

- **Code Style:** Follow ESLint configuration
- **TypeScript:** Maintain strict type safety
- **Components:** Create reusable, well-documented components
- **Testing:** Add tests for new functionality
- **Documentation:** Update README for significant changes

---

## 📚 API Documentation

### Alpha Vantage Integration

**Supported Endpoints:**
- `GLOBAL_QUOTE` - Real-time stock quotes
- `TIME_SERIES_DAILY` - Daily stock data
- `CRYPTO_CURRENCIES` - Cryptocurrency data
- `NEWS_SENTIMENT` - Market news and sentiment

**Example Usage:**
```typescript
// services/api.ts
const API_KEY = process.env.NEXT_PUBLIC_ALPHA_VANTAGE_API_KEY;
const BASE_URL = 'https://www.alphavantage.co/query';

export const fetchStockQuote = async (symbol: string) => {
  const response = await fetch(
    `${BASE_URL}?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${API_KEY}`
  );
  return response.json();
};
```

---

## 🔍 Troubleshooting

### Common Issues

**1. API Key Issues**
```bash
Error: API key required
```
**Solution:** Ensure `NEXT_PUBLIC_ALPHA_VANTAGE_API_KEY` is set in `.env.local`

**2. Build Errors**
```bash
Module not found
```
**Solution:** Run `npm install` to ensure all dependencies are installed

**3. Development Server Issues**
```bash
Port 3000 is already in use
```
**Solution:** Use different port: `npm run dev -- -p 3001`

### Debug Mode

Enable debug logging:
```bash
DEBUG=* npm run dev
```

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

### MIT License Summary
- ✅ Commercial use
- ✅ Modification
- ✅ Distribution
- ✅ Private use
- ❌ Liability
- ❌ Warranty

---

## 🙏 Acknowledgments

### Technologies & Libraries
- **[Alpha Vantage](https://www.alphavantage.co/)** - Financial data API
- **[Vercel](https://vercel.com/)** - Deployment and hosting platform
- **[Next.js Team](https://nextjs.org/)** - Amazing React framework
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework
- **[Redux Toolkit](https://redux-toolkit.js.org/)** - Modern Redux development

### Community & Support
- **[React Community](https://reactjs.org/community/support.html)** - Excellent ecosystem and resources
- **[TypeScript Team](https://www.typescriptlang.org/)** - Type-safe JavaScript development
- **[Chart.js Community](https://www.chartjs.org/)** - Data visualization libraries

---

## 📞 Support & Contact

### Get Help
- 📖 **Documentation:** [Deployment Guide](DEPLOYMENT_STATUS.md)
- 🐛 **Bug Reports:** [GitHub Issues](https://github.com/Akcthecoder200/FinBoard/issues)
- 💬 **Discussions:** [GitHub Discussions](https://github.com/Akcthecoder200/FinBoard/discussions)
- 📧 **Email:** [Contact Developer](mailto:your-email@example.com)

### Social Links
- 🐙 **GitHub:** [@Akcthecoder200](https://github.com/Akcthecoder200)
- 💼 **LinkedIn:** [Your Profile](https://linkedin.com/in/your-profile)
- 🐦 **Twitter:** [@YourHandle](https://twitter.com/your-handle)

---

## 🎯 Roadmap

### Upcoming Features
- [ ] **Portfolio Analytics** - Advanced performance tracking
- [ ] **Real-time Alerts** - Price and volume notifications
- [ ] **Social Trading** - Share and follow trading strategies
- [ ] **Mobile App** - React Native companion app
- [ ] **AI Insights** - Machine learning market predictions

### Version History
- **v1.0.0** - Initial release with core dashboard functionality
- **v1.1.0** - Enhanced chart features and responsive design
- **v1.2.0** - Data persistence and customization options

---

<div align="center">

**Built with ❤️ by [Akcthecoder200](https://github.com/Akcthecoder200)**

_FinBoard - Your Professional Financial Dashboard Solution_

⭐ **Star this repository if you find it helpful!** ⭐

</div>
