# Trading Intelligence Platform

A full-stack real-time trading intelligence platform with authentication, market data, economic calendar, news aggregation, watchlists, and price alerts.

## 🚀 Features

### Backend
- **Authentication System**: JWT-based authentication with access & refresh tokens
- **Real-time Market Data**: Live price updates from CoinGecko, Alpha Vantage, and Cryptocompare
- **Economic Calendar**: Economic events from FMP API and web scraping
- **News Aggregation**: RSS feeds from Bloomberg, Reuters, Financial Times + NewsAPI
- **Watchlist Management**: Track favorite assets with live price updates
- **Price Alerts**: Configurable price alerts with above/below conditions
- **Automated Data Syncing**: Cron jobs for market data (1min), events (6h), news (30min), alerts (5min)

### Frontend
- **User Authentication**: Login/Register pages with protected routes
- **Market Dashboard**: Real-time market data with auto-refresh (30s polling)
- **Economic Calendar**: Upcoming economic events
- **News Feed**: Latest financial news
- **Watchlist UI**: Add/remove assets, view live prices
- **Alerts Management**: Create, toggle, and delete price alerts

## 📋 Prerequisites

- Node.js 18+ and npm
- PostgreSQL 14+ (optional - works in mock mode without DB)
- Git

## 🛠️ Installation

### 1. Clone the repository

```bash
git clone https://github.com/alijendoubi/CRM-1.1.git
cd CRM-1.1
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Copy `.env.local` and update with your API keys:

```bash
# Backend
PORT=3001
API_BASE_URL=http://localhost:3001
NODE_ENV=development

# Database (optional)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=trading_db
DB_USER=postgres
DB_PASSWORD=password

# JWT
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRY=7d

# API Keys (all free, no credit card required)
NEWS_API_KEY=your_newsapi_key          # Get at https://newsapi.org/register
ALPHA_VANTAGE_API_KEY=your_av_key     # Get at https://www.alphavantage.co/support/#api-key
FMP_API_KEY=your_fmp_key              # Get at https://financialmodelingprep.com/developer/docs/
CRYPTOCOMPARE_API_KEY=                # Optional

# Frontend
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
```

### 4. Set up the database (Optional)

If you want to use PostgreSQL instead of mock mode:

```bash
# Create database
createdb trading_db

# Run migrations
npm run migrate
```

**Note**: The platform works perfectly in mock mode without a database for development/testing.

## 🏃 Running the Application

### Development Mode

Start both backend and frontend:

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend  
cd frontend
npm run dev
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

### Production Mode

```bash
# Build
npm run build

# Start
npm start
```

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Create new user account
- `POST /api/auth/login` - Login and get tokens
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user (protected)

### Market Data
- `GET /api/markets` - Get market data with live prices

### Economic Events
- `GET /api/events` - Get economic calendar events
- `GET /api/events?country=US` - Filter by country
- `GET /api/events?impact=High` - Filter by impact

### News
- `GET /api/news` - Get latest financial news
- `GET /api/news?category=crypto` - Filter by category

### Watchlist (Protected)
- `GET /api/watchlists` - Get user's watchlist
- `POST /api/watchlists` - Add asset to watchlist
- `DELETE /api/watchlists/:assetId` - Remove from watchlist

### Alerts (Protected)
- `GET /api/alerts` - Get user's price alerts
- `POST /api/alerts` - Create new alert
- `PUT /api/alerts/:id` - Update alert (toggle active/inactive)
- `DELETE /api/alerts/:id` - Delete alert

## 🗂️ Project Structure

```
.
├── backend/
│   ├── src/
│   │   ├── config/          # Configuration (env, db, logger)
│   │   ├── controllers/     # Request handlers
│   │   ├── cron/            # Scheduled jobs
│   │   ├── integrations/    # External API clients
│   │   ├── middleware/      # Auth, error handling
│   │   ├── models/          # Database models
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic
│   │   ├── utils/           # Helper functions
│   │   └── server.ts        # Express server
│   └── package.json
│
├── frontend/
│   ├── app/                 # Next.js pages
│   │   ├── login/          # Login page
│   │   ├── register/       # Register page
│   │   ├── watchlist/      # Watchlist management
│   │   ├── alerts/         # Price alerts
│   │   ├── markets/        # Market data
│   │   ├── calendar/       # Economic calendar
│   │   └── news/           # News feed
│   ├── components/          # React components
│   ├── lib/                 # Utilities
│   │   ├── authContext.tsx # Auth state management
│   │   ├── apiClient.ts    # HTTP client
│   │   └── usePolling.ts   # Real-time polling hook
│   └── package.json
│
├── common/                  # Shared types
└── .env.local              # Environment variables
```

## 🔐 Authentication Flow

1. User registers/logs in → receives access token (24h) and refresh token (7d)
2. Access token sent with every protected request in `Authorization: Bearer <token>` header
3. When access token expires, frontend automatically refreshes using refresh token
4. User can logout to invalidate tokens

## 📊 Data Syncing

The platform automatically syncs data via cron jobs:

- **Market Data**: Every 1 minute (CoinGecko, Alpha Vantage, Cryptocompare)
- **Economic Events**: Every 6 hours (FMP API)
- **News**: Every 30 minutes (NewsAPI + RSS feeds)
- **Price Alerts**: Every 5 minutes (checks conditions and triggers alerts)

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## 🚢 Deployment

### Backend (Node.js)

Deploy to any Node.js hosting platform (Heroku, Railway, DigitalOcean, AWS):

```bash
cd backend
npm run build
npm start
```

### Frontend (Next.js)

Deploy to Vercel (recommended) or any other Next.js host:

```bash
cd frontend
npm run build
npm start
```

### Environment Variables

Make sure to set all environment variables in your hosting platform:
- Database credentials
- JWT secret
- API keys
- CORS origins

## 📝 API Keys (Free Tier)

All required API keys are free with no credit card required:

1. **NewsAPI** (100 requests/day)
   - Sign up: https://newsapi.org/register
   - Use: Financial news aggregation

2. **Alpha Vantage** (5 requests/min, 500/day)
   - Sign up: https://www.alphavantage.co/support/#api-key
   - Use: Stock and forex data

3. **FMP** (250 requests/day)
   - Sign up: https://financialmodelingprep.com/developer/docs/
   - Use: Economic calendar events

4. **Cryptocompare** (Optional)
   - Free tier available for additional crypto data

## 🐛 Troubleshooting

### Port 5000 Already in Use (macOS)

macOS uses port 5000 for AirPlay. The project is configured to use port 3001 instead.

### Database Connection Failed

The platform runs in mock mode if the database is unavailable. This is perfect for development. For production, ensure PostgreSQL is running and credentials are correct.

### API Rate Limits

If you hit API rate limits:
- Increase cron job intervals in `backend/src/cron/scheduler.ts`
- Add additional API keys for backup
- Consider caching responses

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

- CoinGecko for cryptocurrency data
- Alpha Vantage for stock/forex data
- NewsAPI for news aggregation
- Financial Modeling Prep for economic calendar

## 📧 Support

For issues and questions, please open a GitHub issue or contact the maintainers.

---

Built with ❤️ using Node.js, Express, Next.js, TypeScript, and PostgreSQL
