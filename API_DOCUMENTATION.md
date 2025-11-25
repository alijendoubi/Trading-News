# API Documentation

Base URL: `http://localhost:3001/api`

## Authentication

All protected endpoints require a valid JWT token in the Authorization header:
```
Authorization: Bearer <access_token>
```

### Register

Create a new user account.

**Endpoint**: `POST /auth/register`

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

**Response** (201):
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "1",
      "email": "user@example.com",
      "name": "John Doe"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Login

Authenticate and receive tokens.

**Endpoint**: `POST /auth/login`

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response** (200):
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "1",
      "email": "user@example.com",
      "name": "John Doe"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Refresh Token

Get a new access token using refresh token.

**Endpoint**: `POST /auth/refresh`

**Request Body**:
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response** (200):
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Logout

Invalidate refresh token.

**Endpoint**: `POST /auth/logout`

**Request Body**:
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response** (200):
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

### Get Current User

Get authenticated user details.

**Endpoint**: `GET /auth/me` 🔒

**Response** (200):
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "1",
      "email": "user@example.com",
      "name": "John Doe"
    }
  }
}
```

## Market Data

### Get Markets

Get live market data with current prices.

**Endpoint**: `GET /markets`

**Query Parameters**:
- None

**Response** (200):
```json
{
  "success": true,
  "data": [
    {
      "id": "bitcoin",
      "symbol": "BTC",
      "name": "Bitcoin",
      "currentPrice": 45230.50,
      "change24h": 2.45,
      "volume24h": 28500000000,
      "marketCap": 880000000000
    },
    {
      "id": "ethereum",
      "symbol": "ETH",
      "name": "Ethereum",
      "currentPrice": 2850.75,
      "change24h": -1.23,
      "volume24h": 15200000000,
      "marketCap": 342000000000
    }
  ]
}
```

## Economic Events

### Get Economic Events

Get upcoming economic calendar events.

**Endpoint**: `GET /events`

**Query Parameters**:
- `country` (optional): Filter by country (e.g., "US", "GB", "EU")
- `impact` (optional): Filter by impact level ("Low", "Medium", "High")
- `limit` (optional, default: 20): Number of results per page
- `offset` (optional, default: 0): Pagination offset

**Response** (200):
```json
{
  "success": true,
  "data": {
    "events": [
      {
        "id": "1",
        "title": "Non-Farm Payrolls",
        "date": "2025-12-01T13:30:00.000Z",
        "impact": "High",
        "country": "US",
        "forecast": 180000,
        "previous": 200000,
        "actual": null,
        "description": "Monthly employment figures"
      }
    ],
    "total": 45,
    "page": 1,
    "limit": 20
  }
}
```

## News

### Get News

Get latest financial news articles.

**Endpoint**: `GET /news`

**Query Parameters**:
- `category` (optional): Filter by category ("stocks", "crypto", "forex", "economy")
- `limit` (optional, default: 50): Number of results per page
- `offset` (optional, default: 0): Pagination offset

**Response** (200):
```json
{
  "success": true,
  "data": {
    "articles": [
      {
        "id": "1",
        "title": "Bitcoin Reaches New All-Time High",
        "url": "https://example.com/article",
        "source": "Bloomberg",
        "publishedAt": "2025-11-24T10:30:00.000Z",
        "category": "crypto",
        "summary": "Bitcoin surpassed $50,000...",
        "imageUrl": "https://example.com/image.jpg"
      }
    ],
    "total": 120,
    "page": 1,
    "limit": 50
  }
}
```

## Watchlist

All watchlist endpoints require authentication 🔒

### Get Watchlist

Get user's watchlist with live prices.

**Endpoint**: `GET /watchlists` 🔒

**Response** (200):
```json
{
  "success": true,
  "data": [
    {
      "assetId": "bitcoin",
      "assetType": "crypto",
      "assetName": "Bitcoin",
      "currentPrice": 45230.50,
      "change24h": 2.45
    },
    {
      "assetId": "AAPL",
      "assetType": "stock",
      "assetName": "Apple Inc.",
      "currentPrice": 178.35,
      "change24h": -0.82
    }
  ]
}
```

### Add to Watchlist

Add an asset to watchlist.

**Endpoint**: `POST /watchlists` 🔒

**Request Body**:
```json
{
  "assetId": "ethereum",
  "assetType": "crypto",
  "assetName": "Ethereum"
}
```

**Response** (201):
```json
{
  "success": true,
  "data": {
    "assetId": "ethereum",
    "assetType": "crypto",
    "assetName": "Ethereum",
    "userId": "1",
    "addedAt": "2025-11-24T15:30:00.000Z"
  }
}
```

### Remove from Watchlist

Remove an asset from watchlist.

**Endpoint**: `DELETE /watchlists/:assetId` 🔒

**Response** (200):
```json
{
  "success": true,
  "message": "Removed from watchlist"
}
```

## Price Alerts

All alert endpoints require authentication 🔒

### Get Alerts

Get user's price alerts.

**Endpoint**: `GET /alerts` 🔒

**Response** (200):
```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "assetId": "bitcoin",
      "assetType": "crypto",
      "condition": "above",
      "targetPrice": 50000,
      "isActive": true,
      "createdAt": "2025-11-24T10:00:00.000Z"
    },
    {
      "id": "2",
      "assetId": "ethereum",
      "assetType": "crypto",
      "condition": "below",
      "targetPrice": 2500,
      "isActive": false,
      "createdAt": "2025-11-23T14:30:00.000Z"
    }
  ]
}
```

### Create Alert

Create a new price alert.

**Endpoint**: `POST /alerts` 🔒

**Request Body**:
```json
{
  "assetId": "bitcoin",
  "assetType": "crypto",
  "condition": "above",
  "targetPrice": 50000
}
```

**Validation**:
- `assetId`: Required, string
- `assetType`: Required, one of: "crypto", "stock", "forex"
- `condition`: Required, one of: "above", "below"
- `targetPrice`: Required, positive number

**Response** (201):
```json
{
  "success": true,
  "data": {
    "id": "3",
    "assetId": "bitcoin",
    "assetType": "crypto",
    "condition": "above",
    "targetPrice": 50000,
    "isActive": true,
    "userId": "1",
    "createdAt": "2025-11-24T15:45:00.000Z"
  }
}
```

### Update Alert

Update an alert (toggle active/inactive).

**Endpoint**: `PUT /alerts/:id` 🔒

**Request Body**:
```json
{
  "isActive": false
}
```

**Response** (200):
```json
{
  "success": true,
  "data": {
    "id": "3",
    "assetId": "bitcoin",
    "assetType": "crypto",
    "condition": "above",
    "targetPrice": 50000,
    "isActive": false,
    "updatedAt": "2025-11-24T16:00:00.000Z"
  }
}
```

### Delete Alert

Delete a price alert.

**Endpoint**: `DELETE /alerts/:id` 🔒

**Response** (200):
```json
{
  "success": true,
  "message": "Alert deleted"
}
```

## Error Responses

All errors follow this format:

```json
{
  "success": false,
  "error": {
    "message": "Error description",
    "code": "ERROR_CODE"
  }
}
```

### Common Error Codes

- **400 Bad Request**: Invalid request data
- **401 Unauthorized**: Missing or invalid authentication token
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Resource not found
- **409 Conflict**: Duplicate resource (e.g., asset already in watchlist)
- **429 Too Many Requests**: Rate limit exceeded
- **500 Internal Server Error**: Server error

### Example Error Response

```json
{
  "success": false,
  "error": {
    "message": "Invalid credentials",
    "code": "INVALID_CREDENTIALS"
  }
}
```

## Rate Limiting

- **Global limit**: 100 requests per 15 minutes per IP
- **Auth endpoints**: Additional rate limiting may apply

Rate limit headers are included in responses:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640000000
```

## cURL Examples

### Register
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123","name":"John Doe"}'
```

### Login
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'
```

### Get Markets
```bash
curl http://localhost:3001/api/markets
```

### Get Watchlist (Authenticated)
```bash
curl http://localhost:3001/api/watchlists \
  -H "Authorization: Bearer <your_access_token>"
```

### Create Alert (Authenticated)
```bash
curl -X POST http://localhost:3001/api/alerts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your_access_token>" \
  -d '{"assetId":"bitcoin","assetType":"crypto","condition":"above","targetPrice":50000}'
```
