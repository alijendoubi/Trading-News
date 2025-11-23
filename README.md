# Trading Intelligence Platform

A modern web platform for traders featuring economic calendar, live market data, financial news, and trading tools.

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express.js, TypeScript
- **Database**: PostgreSQL 15
- **Testing**: Jest, React Testing Library, Supertest
- **DevOps**: Docker, Docker Compose

## Project Structure

```
trading/
├── frontend/                 # Next.js application
│   ├── app/                 # App router pages
│   ├── components/          # Reusable React components
│   ├── lib/                 # Client utilities and API client
│   └── public/              # Static assets
├── backend/                 # Express.js API
│   ├── src/
│   │   ├── config/          # Configuration files
│   │   ├── controllers/      # Route handlers
│   │   ├── services/        # Business logic
│   │   ├── models/          # Database models
│   │   ├── routes/          # API routes
│   │   ├── middleware/      # Express middleware
│   │   ├── integrations/    # External API clients
│   │   ├── cron/            # Scheduled jobs
│   │   ├── utils/           # Utility functions
│   │   ├── types/           # TypeScript types
│   │   └── server.ts        # Server entry point
│   └── tests/               # Test files
├── common/                  # Shared types
├── scripts/                 # Deployment and utility scripts
├── docker-compose.yml       # Local development setup
└── package.json             # Monorepo configuration
```

## Prerequisites

- Node.js >= 18.0.0
- Yarn >= 3.0.0
- Docker and Docker Compose (for containerized development)
- PostgreSQL 15 (if running locally without Docker)

## Installation

1. **Clone and enter directory**
   ```bash
   cd trading
   ```

2. **Install dependencies**
   ```bash
   yarn install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   Update the variables with your configuration:
   - Database credentials
   - JWT secret (change in production!)
   - External API keys (economic calendar, market data, news)

## Development

### Option 1: Local Development (Without Docker)

1. **Start PostgreSQL**
   ```bash
   # Using Homebrew on macOS
   brew services start postgresql
   ```

2. **Initialize database**
   ```bash
   createdb trading_db
   yarn workspace backend db:migrate
   yarn workspace backend db:seed
   ```

3. **Run both frontend and backend**
   ```bash
   yarn dev
   ```
   - Backend: http://localhost:5000
   - Frontend: http://localhost:3000

### Option 2: Docker Compose (Recommended)

```bash
docker-compose up -d
```

This starts:
- PostgreSQL database on port 5432
- Backend API on port 5000
- Frontend on port 3000

View logs:
```bash
docker-compose logs -f
```

## Build & Deployment

### Build for Production

```bash
yarn build
```

This builds both frontend and backend applications.

### Backend Deployment

```bash
yarn build:backend
yarn start
```

### Frontend Deployment

Deploy to Vercel (recommended for Next.js):
```bash
yarn build:frontend
# Then connect your repo to Vercel dashboard
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout (client-side)

### Economic Calendar
- `GET /api/events` - List upcoming events
- `GET /api/events/:id` - Get event details
- `GET /api/events?country=US` - Filter by country
- `GET /api/events?impact=High` - Filter by impact

### Markets
- `GET /api/markets/assets` - List all assets
- `GET /api/markets/assets/:symbol` - Get asset details
- `GET /api/markets/search?q=EUR` - Search assets
- `GET /api/markets/top-movers` - Top moving assets

### News
- `GET /api/news` - List recent news
- `GET /api/news?category=Forex` - Filter by category
- `GET /api/news?source=Reuters` - Filter by source

### Watchlists (Authenticated)
- `GET /api/watchlists` - Get user's watchlist
- `POST /api/watchlists` - Add asset to watchlist
- `DELETE /api/watchlists/:assetId` - Remove from watchlist

### Alerts (Authenticated)
- `GET /api/alerts` - Get user's alerts
- `POST /api/alerts` - Create alert
- `PUT /api/alerts/:id` - Update alert
- `DELETE /api/alerts/:id` - Delete alert

## Testing

### Run all tests
```bash
yarn test
```

### Backend tests
```bash
yarn test:backend
```

### Frontend tests
```bash
yarn test:frontend
```

### Watch mode
```bash
yarn test:backend --watch
yarn test:frontend --watch
```

## Linting & Formatting

### Lint code
```bash
yarn lint
```

### Format code
```bash
yarn format
```

## Database

### Run migrations
```bash
yarn workspace backend db:migrate
```

### Seed sample data
```bash
yarn workspace backend db:seed
```

### View database
```bash
psql -U postgres -d trading_db
```

## Security

- JWT tokens for authentication (expires in 7 days)
- Bcrypt password hashing (10 salt rounds)
- CORS configuration for API access
- Rate limiting on API endpoints (100 requests/15 minutes)
- Helmet.js for HTTP security headers
- SQL injection prevention via parameterized queries
- Environment variables for sensitive data

## Monitoring & Logging

Logs are written to:
- Console (all levels)
- `logs/error.log` (errors only)
- `logs/combined.log` (all logs)

Configure log level in `.env`:
```
LOG_LEVEL=debug
```

## Performance Optimization

### Frontend
- Next.js automatic code splitting
- Image optimization with next/image
- CSS-in-JS with Tailwind for minimal CSS
- React Query for efficient data fetching

### Backend
- Database connection pooling (20 connections)
- Query result caching where applicable
- Request rate limiting
- Slow query logging (>1 second)

## External Integrations

The platform integrates with:
- Economic calendar APIs (for events)
- Market data APIs (for prices)
- News feed APIs (for articles)

Configure API keys in `.env`:
```
ECONOMIC_API_KEY=your-key
MARKET_DATA_API_KEY=your-key
NEWS_API_KEY=your-key
```

## Troubleshooting

### Database connection refused
```bash
# Check if PostgreSQL is running
brew services list

# Start PostgreSQL
brew services start postgresql
```

### Port already in use
```bash
# Kill process on port 5000
lsof -i :5000
kill -9 <PID>
```

### Dependencies not installing
```bash
rm -rf node_modules yarn.lock
yarn install
```

## Contributing

1. Create feature branch: `git checkout -b feature/your-feature`
2. Commit changes: `git commit -am 'Add feature'`
3. Push to branch: `git push origin feature/your-feature`
4. Create Pull Request

## License

MIT

## Support

For issues and questions, please open an issue on GitHub or contact the development team.
