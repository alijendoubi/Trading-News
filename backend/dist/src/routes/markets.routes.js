import { Router } from 'express';
import { mockAssets } from '../services/mock-data.service.js';
import { HttpResponse } from '../utils/http-response.js';
import { aggregatedDataService } from '../services/aggregatedData.service.js';
import { yahooFinanceClient } from '../integrations/yahooFinance.client.js';
import { binanceClient } from '../integrations/binance.client.js';
import { logger } from '../config/logger.js';
const router = Router();
// Main markets endpoint - returns all markets data with LIVE data from multiple APIs
router.get('/', async (req, res) => {
    try {
        // Get live crypto data from Binance (free, no key needed)
        const cryptoTickers = await binanceClient.get24hrTicker();
        const topCrypto = cryptoTickers
            .filter((t) => t.symbol.endsWith('USDT'))
            .sort((a, b) => b.quoteVolume - a.quoteVolume)
            .slice(0, 20)
            .map((ticker) => ({
            id: ticker.symbol,
            symbol: ticker.symbol.replace('USDT', ''),
            name: ticker.symbol.replace('USDT', ''),
            currentPrice: ticker.price,
            change24h: ticker.priceChangePercent,
            volume24h: ticker.volume,
            marketCap: ticker.quoteVolume,
            type: 'crypto',
        }));
        // Get top stocks from Yahoo Finance (free, no key needed)
        const stockSymbols = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'TSLA', 'META', 'BRK-B', 'JPM', 'V'];
        const stockQuotes = await yahooFinanceClient.getQuotes(stockSymbols);
        const stocks = stockQuotes.map((quote) => ({
            id: quote.symbol,
            symbol: quote.symbol,
            name: quote.symbol,
            currentPrice: quote.price,
            change24h: quote.changePercent,
            volume24h: quote.volume,
            marketCap: quote.marketCap || 0,
            type: 'stock',
        }));
        // Combine crypto and stocks
        const marketsData = [...topCrypto, ...stocks];
        HttpResponse.success(res, marketsData);
    }
    catch (error) {
        logger.error('Error fetching live markets data:', error);
        // Fallback to mock data
        const marketsData = mockAssets.map(asset => ({
            id: asset.id,
            symbol: asset.symbol,
            name: asset.name,
            currentPrice: asset.lastPrice,
            change24h: asset.change,
            volume24h: asset.volume || 0,
            marketCap: asset.volume ? asset.volume * asset.lastPrice : asset.lastPrice * 1000000,
            type: asset.type,
        }));
        HttpResponse.success(res, marketsData);
    }
});
router.get('/assets', (req, res) => {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const pageSize = Math.min(100, parseInt(req.query.pageSize) || 20);
    const offset = (page - 1) * pageSize;
    const filtered = mockAssets.slice(offset, offset + pageSize);
    HttpResponse.paginated(res, filtered, mockAssets.length, page, pageSize);
});
router.get('/search', async (req, res) => {
    try {
        const query = (req.query.q || '').toLowerCase();
        // Search Yahoo Finance
        const yahooResults = await yahooFinanceClient.search(query);
        const results = yahooResults.slice(0, 10).map((r) => ({
            id: r.symbol,
            symbol: r.symbol,
            name: r.longname || r.shortname || r.symbol,
            type: r.quoteType === 'CRYPTOCURRENCY' ? 'crypto' : 'stock',
        }));
        HttpResponse.success(res, results);
    }
    catch (error) {
        logger.error('Error searching:', error);
        const results = mockAssets.filter(a => a.symbol.toLowerCase().includes((req.query.q || '').toLowerCase()) ||
            a.name.toLowerCase().includes((req.query.q || '').toLowerCase()));
        HttpResponse.success(res, results);
    }
});
// Get top movers (gainers and losers)
router.get('/movers', async (req, res) => {
    try {
        const movers = await aggregatedDataService.getTopMovers();
        HttpResponse.success(res, movers);
    }
    catch (error) {
        logger.error('Error fetching movers:', error);
        HttpResponse.error(res, 'Failed to fetch market movers', 500);
    }
});
// Get live quote for a specific symbol
router.get('/quote/:symbol', async (req, res) => {
    try {
        const { symbol } = req.params;
        // Try as stock first
        let quote = await aggregatedDataService.getStockQuote(symbol);
        // If not found, try as crypto
        if (!quote) {
            quote = await aggregatedDataService.getCryptoQuote(symbol + 'USDT');
        }
        if (quote) {
            HttpResponse.success(res, quote);
        }
        else {
            HttpResponse.error(res, 'Symbol not found', 404);
        }
    }
    catch (error) {
        logger.error('Error fetching quote:', error);
        HttpResponse.error(res, 'Failed to fetch quote', 500);
    }
});
export default router;
//# sourceMappingURL=markets.routes.js.map