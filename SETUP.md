# Trading Intelligence Platform - Setup Guide

## Quick Start

### 1. Install Dependencies

```bash
cd /Users/alijendoubi/desktop/coding/trading
yarn install
```

### 2. Setup Environment

```bash
cp .env.example .env.local
```

Edit `.env.local` with your configuration:
- Change `DB_PASSWORD` to something secure
- Add API keys when ready (they're optional for development)
- Update `JWT_SECRET` (critical for production)

### 3. Database Setup (Docker Compose - Recommended)

```bash
docker-compose up -d
```

This will:
- Start PostgreSQL on port 5432
- Initialize the database schema automatically (via db:migrate)
- Start backend on port 5000
- Start frontend on port 3000

### 4. Or Local Setup (Without Docker)

#### A. Start PostgreSQL (macOS)
```bash
brew services start postgresql
createdb trading_db
```

#### B. Initialize Database
```bash
yarn workspace backend db:migrate
yarn workspace backend db:seed
```

#### C. Start Services
```bash
# In one terminal - Backend
yarn workspace backend dev

# In another terminal - Frontend
yarn workspace frontend dev
```

## Verification

### Check Backend
```bash
curl http://localhost:5000/health
# Should return: {"status":"ok",...}
```

### Check Frontend
Open http://localhost:3000 in browser - you should see the homepage

### Check Database
```bash
psql -U postgres -d trading_db
SELECT COUNT(*) FROM market_assets;
# Should show: 7 (from seed data)
```

## Next Steps

1. **Implement External APIs**: Connect to real economic calendar, market data, and news providers
2. **Add Authentication**: Complete auth routes and user management
3. **Build Components**: Flesh out the calendar, markets, and news pages with full functionality
4. **Add Real-Time Updates**: Implement WebSockets for live price updates
5. **Testing**: Add comprehensive test suites
6. **Deployment**: Configure CI/CD and deploy to production

## Project Structure Quick Reference

- **Frontend**: `/frontend` - Next.js React app
- **Backend**: `/backend/src` - Express API server
- **Database**: PostgreSQL 15 (in Docker or local)
- **Config**: All env vars in `.env.local`
- **Docs**: See `README.md` and `ARCHITECTURE.md`

## Useful Commands

```bash
# Development
yarn dev                    # Run frontend + backend concurrently
yarn workspace backend dev  # Backend only
yarn workspace frontend dev # Frontend only

# Building
yarn build                  # Build both
yarn build:backend         # Backend only
yarn build:frontend        # Frontend only

# Testing
yarn test                  # All tests
yarn test:backend          # Backend tests
yarn test:frontend         # Frontend tests

# Database
yarn workspace backend db:migrate  # Run migrations
yarn workspace backend db:seed     # Seed sample data

# Linting/Formatting
yarn lint                  # Lint all
yarn format                # Format all

# Docker
docker-compose up -d       # Start services
docker-compose down        # Stop services
docker-compose logs -f     # View logs
```

## Troubleshooting

### "Port 5000/3000 already in use"
```bash
lsof -i :5000
kill -9 <PID>
```

### "Database connection refused"
- Ensure PostgreSQL is running: `brew services list`
- Or use Docker: `docker-compose up -d`

### "Module not found" errors
```bash
rm -rf node_modules
yarn install
```

### Docker issues
```bash
docker-compose down
docker system prune -a
docker-compose up -d
```

## Architecture Overview

The project follows a three-tier architecture:

1. **Frontend Layer** (Next.js React)
   - Pages: calendar, markets, news, tools, dashboard
   - Components: reusable UI components
   - API calls via axios client

2. **API Layer** (Express.js)
   - Routes: handle HTTP requests
   - Controllers: business logic
   - Services: data operations
   - Middleware: auth, logging, error handling

3. **Data Layer** (PostgreSQL)
   - Users, assets, events, news tables
   - Connection pooling
   - Query optimization

## Performance Tips

- Frontend: Check Next.js build optimization in `next.config.js`
- Backend: Database indexes are created automatically
- API: Response caching can be added to services
- General: Use Docker for consistent environment

## Security Reminders

- 🔐 Change JWT_SECRET in production
- 🔐 Use environment variables for all secrets
- 🔐 Enable HTTPS in production
- 🔐 Configure CORS properly for production domain
- 🔐 Use strong database passwords

## Support

Refer to:
- `README.md` - Full documentation
- `ARCHITECTURE.md` - System design
- Backend routes: `/backend/src/routes/`
- API responses: Use `/api/health` to test

---

**Created**: November 2024
**Version**: 1.0.0
