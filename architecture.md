# Trading Intelligence Platform – System Architecture

## 1. Overview

This project is a **modern web platform for traders**, inspired by ForexFactory, that aggregates:

- **Economic calendar** (upcoming & past events)
- **Live market data** (forex, crypto, indices, commodities)
- **Financial news feed**
- **Trader tools** (calculators, heatmaps, etc.)
- (Optional) **User accounts, alerts, and watchlists**

The system is built as a **modular, API-driven web application** with a clear separation between:

- **Frontend**: Next.js app for UI/UX
- **Backend**: Node.js API + background workers (cron jobs)
- **Database**: PostgreSQL for structured data storage
- **External Services**: Financial data APIs, news feeds, TradingView widgets

---

## 2. High-Level Architecture

```txt
+-------------------------+          +-----------------------------+
|        Frontend         |  HTTPS   |           Backend           |
|  (Next.js / React)      +--------->+  (Node.js / Express/Nest)   |
|                         |          |                             |
|  - Pages (Calendar,     |          |  - REST API / WebSockets    |
|    Markets, News, Tools)|          |  - Business logic services  |
|  - UI Components        |          |  - Auth & sessions          |
|  - Client-side filters  |          |  - Data aggregation         |
+-----------+-------------+          +--------------+--------------+
            ^                                         |
            |                                         |
            |                                         v
            |                             +-----------------------+
            |                             |       PostgreSQL      |
            |                             |   (Relational DB)     |
            |                             |  events, news, etc.   |
            |                             +-----------+-----------+
            |                                         |
            |                                         v
            |                             +-----------------------+
            |                             |   External Providers  |
            |                             |  - Market data APIs   |
            |                             |  - Economic calendar  |
            |                             |  - News RSS / APIs    |
            |                             +-----------------------+
            |
            +---- CDN / Static Assets (Vercel or similar)
/frontend
  /app
    /calendar        # Economic calendar pages and filters
    /markets         # Live markets dashboard
    /news            # Aggregated news feed
    /tools           # Calculators and utility tools
    /dashboard       # (Optional) User dashboard
    /api             # Route handlers (if using Next.js server functions)
    layout.jsx
    page.jsx         # Landing / Home page
    globals.css
  /components
    /layout          # Navbar, sidebar, footer, layout shell
    /calendar        # Calendar table, filters, event row components
    /news            # News cards, list, filters
    /markets         # Market widgets, tickers, watchlists
    /tools           # Form-based calculators
    /common          # Buttons, modals, tags, badges, loaders
  /lib
    apiClient.ts     # API helpers (fetch, axios, etc.)
    config.ts        # API base URLs, constants
    utils.ts         # Generic utilities
/backend
  /src
    /routes          # HTTP route definitions
      events.routes.ts
      markets.routes.ts
      news.routes.ts
      tools.routes.ts
      users.routes.ts
    /controllers     # Request handlers (HTTP layer)
      events.controller.ts
      markets.controller.ts
      news.controller.ts
      users.controller.ts
    /services        # Business logic
      events.service.ts
      markets.service.ts
      news.service.ts
      users.service.ts
    /integrations    # External API / RSS clients
      economicApi.client.ts
      marketData.client.ts
      news.client.ts
    /cron            # Scheduled jobs
      fetchEconomicEvents.job.ts
      fetchMarketData.job.ts
      fetchNews.job.ts
    /models          # DB models / query builders
      events.model.ts
      news.model.ts
      assets.model.ts
      users.model.ts
    /config
      env.ts
      db.ts
      logger.ts
    server.ts        # App bootstrap
