# Coin Tracker

A real-time cryptocurrency tracking dashboard built with Next.js 16, featuring live price charts, technical indicators, and crypto news aggregation.

## Features

- 📈 Real-time price charts with candlestick visualization
- 📊 Technical indicators (MA, EMA, RSI, MACD, Bollinger Bands)
- 📰 Live crypto news feed with sentiment analysis
- 🌓 Dark mode optimized UI
- 📱 Responsive design

## Tech Stack

- **Framework**: Next.js 16
- **Styling**: TailwindCSS 4
- **Charts**: Lightweight Charts
- **State Management**: TanStack Query
- **Testing**: Vitest + Testing Library
- **Deployment**: Docker (standalone output)

## Getting Started

### Prerequisites

- Node.js 20+
- npm

### Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

### Testing

```bash
# Run tests in watch mode
npm run test

# Run tests once
npm run test:run

# Run tests with coverage
npm run test:coverage
```

### Linting

```bash
npm run lint
```

## Deployment

### Docker

The project includes an optimized multi-stage Dockerfile for production deployment.

```bash
# Build the Docker image
docker build -t coin-tracker .

# Run the container
docker run -p 3000:3000 coin-tracker
```

The app will be available at [http://localhost:3000](http://localhost:3000).

### Environment Variables

Currently, no environment variables are required. The app fetches data from public APIs:
- Binance API (for price data)
- CoinGecko API (for fallback data)
- Hyperliquid API (for HYPE token)
- Cointelegraph/Decrypt (for news)

### CI/CD

The project includes a GitHub Actions workflow (`.github/workflows/ci.yml`) that:
- Runs linting
- Runs tests
- Builds the application
- Builds the Docker image (on push to main)

## Project Structure

```
src/
├── app/           # Next.js app router pages and API routes
├── components/    # React components
├── hooks/         # Custom React hooks
├── lib/           # Utilities and configurations
├── services/      # API service layers
└── test/          # Test setup
```

## License

MIT
