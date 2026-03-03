# Market Dashboard

A modern stock and cryptocurrency market dashboard built with Next.js 14, TypeScript, and Tailwind CSS.

## Screenshots

### Dashboard Overview
![Dashboard](screenshots/dashboard.avif)

### Stock Detail View  
![Stock Detail](screenshots/detail.avif)

## Features

- **Market Overview**: Real-time market data and watchlist
- **Stock Details**: Comprehensive stock information with charts and metrics
- **Cryptocurrency Tracking**: Crypto prices and market data
- **Market News**: Latest financial news and updates
- **Dark/Light Theme**: Theme toggle with system preference support

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS with shadcn/ui components
- **Charts**: Recharts for data visualization
- **Icons**: Lucide React
- **Data Sources**: Finnhub API, Alpha Vantage API

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   ```bash
   FINNHUB_API_KEY=your_finnhub_api_key
   ALPHA_VANTAGE_API_KEY=your_alpha_vantage_api_key
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```
5. Open [http://localhost:3000](http://localhost:3000)

## Project Structure

- `/app` - Next.js app router pages and API routes
- `/components` - Reusable React components
- `/lib` - Utility functions and API integrations
- `/hooks` - Custom React hooks
- `/types` - TypeScript type definitions

## API Integration

The dashboard integrates with:
- **Finnhub**: Real-time stock quotes, company profiles, financial data, and market news
- **Alpha Vantage**: Cryptocurrency market data

Note: Some features require premium API subscriptions (e.g., candle data).

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
