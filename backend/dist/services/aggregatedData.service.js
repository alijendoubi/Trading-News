import { logger } from '../config/logger.js';
// Market Data Clients
import { marketDataClient } from '../integrations/marketData.client.js';
import { twelveDataClient } from '../integrations/twelveData.client.js';
import { finnhubClient } from '../integrations/finnhub.client.js';
import { polygonClient } from '../integrations/polygon.client.js';
import { yahooFinanceClient } from '../integrations/yahooFinance.client.js';
import { binanceClient } from '../integrations/binance.client.js';
// News Clients
import { newsClient } from '../integrations/news.client.js';
import { currentsClient } from '../integrations/currents.client.js';
import { gNewsClient } from '../integrations/gnews.client.js';
import { cryptoPanicClient } from '../integrations/cryptoPanic.client.js';
import { finnhubClient as finnhubNewsClient } from '../integrations/finnhub.client.js';
// Economic Data Clients
import { economicCalendarClient } from '../integrations/economicCalendar.client.js';
import { fredClient } from '../integrations/fred.client.js';
import { worldBankClient } from '../integrations/worldBank.client.js';
/**
 * Aggregated Data Service
 * Combines data from multiple free APIs to provide comprehensive market coverage
 */
export class AggregatedDataService {
    /**
     * Get stock quote from multiple sources (fallback chain)
     */
    async getStockQuote(symbol) {
        // Try Yahoo Finance first (free, no key required)
        try {
            const yahooQuote = await yahooFinanceClient.getQuote(symbol);
            if (yahooQuote) {
                return {
                    symbol: yahooQuote.symbol,
                    price: yahooQuote.price,
                    change: yahooQuote.change,
                    changePercent: yahooQuote.changePercent,
                    volume: yahooQuote.volume,
                    source: 'Yahoo Finance',
                    timestamp: yahooQuote.timestamp,
                };
            }
        }
        catch (error) {
            logger.debug(`Yahoo Finance failed for ${symbol}, trying next source`);
        }
        // Try Twelve Data
        try {
            const twelveQuote = await twelveDataClient.getQuote(symbol);
            if (twelveQuote) {
                return {
                    symbol: twelveQuote.symbol,
                    price: twelveQuote.price,
                    change: twelveQuote.change,
                    changePercent: twelveQuote.percentChange,
                    volume: twelveQuote.volume,
                    source: 'Twelve Data',
                    timestamp: twelveQuote.timestamp,
                };
            }
        }
        catch (error) {
            logger.debug(`Twelve Data failed for ${symbol}, trying next source`);
        }
        // Try Finnhub
        try {
            const finnhubQuote = await finnhubClient.getQuote(symbol);
            if (finnhubQuote) {
                return {
                    symbol: finnhubQuote.symbol,
                    price: finnhubQuote.current,
                    change: finnhubQuote.change,
                    changePercent: finnhubQuote.percentChange,
                    source: 'Finnhub',
                    timestamp: finnhubQuote.timestamp,
                };
            }
        }
        catch (error) {
            logger.debug(`Finnhub failed for ${symbol}, trying next source`);
        }
        // Try Polygon
        try {
            const polygonQuote = await polygonClient.getPreviousClose(symbol);
            if (polygonQuote) {
                return {
                    symbol: polygonQuote.symbol,
                    price: polygonQuote.price,
                    change: polygonQuote.change,
                    changePercent: polygonQuote.changePercent,
                    volume: polygonQuote.volume,
                    source: 'Polygon',
                    timestamp: polygonQuote.timestamp,
                };
            }
        }
        catch (error) {
            logger.debug(`Polygon failed for ${symbol}`);
        }
        return null;
    }
    /**
     * Get crypto quote from multiple sources
     */
    async getCryptoQuote(symbol) {
        // Try Binance first (free, no key required, most reliable for crypto)
        try {
            const binanceTicker = await binanceClient.get24hrTicker(symbol);
            if (binanceTicker && binanceTicker.length > 0) {
                const ticker = binanceTicker[0];
                return {
                    symbol: ticker.symbol,
                    price: ticker.price,
                    change: ticker.priceChange,
                    changePercent: ticker.priceChangePercent,
                    volume: ticker.volume,
                    source: 'Binance',
                    timestamp: new Date(),
                };
            }
        }
        catch (error) {
            logger.debug(`Binance failed for ${symbol}, trying next source`);
        }
        // Try CoinGecko
        try {
            const coinId = symbol.toLowerCase().replace('usdt', '').replace('btc', 'bitcoin');
            const coinPrice = await marketDataClient.getCryptoPrice(coinId);
            if (coinPrice) {
                return {
                    symbol: coinPrice.symbol,
                    price: coinPrice.price,
                    change: (coinPrice.price * coinPrice.change24h) / 100,
                    changePercent: coinPrice.change24h,
                    volume: coinPrice.volume,
                    source: 'CoinGecko',
                    timestamp: new Date(),
                };
            }
        }
        catch (error) {
            logger.debug(`CoinGecko failed for ${symbol}`);
        }
        return null;
    }
    /**
     * Get aggregated news from all sources
     */
    async getAggregatedNews(limit = 50) {
        const allNews = [];
        // Fetch from all news sources in parallel
        const newsPromises = [
            // Original news client (NewsAPI + RSS)
            newsClient.getLatestNews(limit).then(articles => articles.map(a => ({
                title: a.title,
                url: a.url,
                source: a.source,
                publishedAt: a.publishedAt,
                description: a.description,
                category: a.category,
            }))).catch(() => []),
            // Currents API
            currentsClient.getLatestNews(undefined, 'en', 20).then(articles => articles.map(a => ({
                title: a.title,
                url: a.url,
                source: a.author || 'Currents',
                publishedAt: a.published,
                description: a.description,
                category: a.category.join(', '),
            }))).catch(() => []),
            // GNews API
            gNewsClient.getTopHeadlines('business', 'en', 20).then(articles => articles.map(a => ({
                title: a.title,
                url: a.url,
                source: a.source.name,
                publishedAt: a.publishedAt,
                description: a.description,
            }))).catch(() => []),
            // Finnhub News
            finnhubNewsClient.getMarketNews('forex').then(articles => articles.map(a => ({
                title: a.headline,
                url: a.url,
                source: a.source,
                publishedAt: a.datetime,
                description: a.summary,
                category: a.category,
            }))).catch(() => []),
            // CryptoPanic (crypto-specific)
            cryptoPanicClient.getTrending().then(posts => posts.map(p => ({
                title: p.title,
                url: p.url,
                source: p.source.title,
                publishedAt: p.published_at,
                category: 'Crypto',
            }))).catch(() => []),
        ];
        const results = await Promise.all(newsPromises);
        results.forEach(newsArray => allNews.push(...newsArray));
        // Sort by date and remove duplicates
        const uniqueNews = this.deduplicateNews(allNews);
        uniqueNews.sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());
        return uniqueNews.slice(0, limit);
    }
    /**
     * Get crypto-specific news
     */
    async getCryptoNews(limit = 20) {
        const cryptoNews = [];
        // CryptoPanic
        const cryptoPanicNews = await cryptoPanicClient.getTrending();
        cryptoNews.push(...cryptoPanicNews.map(p => ({
            title: p.title,
            url: p.url,
            source: p.source.title,
            publishedAt: p.published_at,
            category: 'Crypto',
        })));
        // GNews crypto search
        const gNewsResults = await gNewsClient.search('cryptocurrency OR bitcoin OR ethereum', 'en', 10);
        cryptoNews.push(...gNewsResults.map(a => ({
            title: a.title,
            url: a.url,
            source: a.source.name,
            publishedAt: a.publishedAt,
            description: a.description,
            category: 'Crypto',
        })));
        cryptoNews.sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());
        return cryptoNews.slice(0, limit);
    }
    /**
     * Get economic indicators from multiple sources
     */
    async getEconomicIndicators(country = 'USA') {
        const indicators = {};
        // Get from FRED (US data)
        if (country === 'USA') {
            try {
                indicators.fred = await fredClient.getPopularIndicators();
            }
            catch (error) {
                logger.error('Error fetching FRED indicators:', error);
            }
        }
        // Get from World Bank (global data)
        try {
            const [gdp, inflation, unemployment] = await Promise.all([
                worldBankClient.getGDP(country, 2),
                worldBankClient.getInflation(country, 2),
                worldBankClient.getUnemployment(country, 2),
            ]);
            indicators.worldBank = {
                gdp: gdp[0],
                inflation: inflation[0],
                unemployment: unemployment[0],
            };
        }
        catch (error) {
            logger.error('Error fetching World Bank indicators:', error);
        }
        return indicators;
    }
    /**
     * Get top market movers (gainers/losers)
     */
    async getTopMovers() {
        const result = {
            stocks: { gainers: [], losers: [] },
            crypto: { gainers: [], losers: [] },
        };
        // Get crypto movers from Binance (most reliable, free)
        try {
            result.crypto = await binanceClient.getTopMovers();
        }
        catch (error) {
            logger.error('Error fetching crypto movers:', error);
        }
        // Try to get stock movers from Polygon
        try {
            const [gainers, losers] = await Promise.all([
                polygonClient.getGainersLosers('gainers'),
                polygonClient.getGainersLosers('losers'),
            ]);
            result.stocks = { gainers, losers };
        }
        catch (error) {
            logger.debug('Polygon movers not available');
        }
        return result;
    }
    /**
     * Remove duplicate news articles based on title similarity
     */
    deduplicateNews(news) {
        const seen = new Set();
        const unique = [];
        for (const article of news) {
            const normalizedTitle = article.title.toLowerCase().trim();
            if (!seen.has(normalizedTitle)) {
                seen.add(normalizedTitle);
                unique.push(article);
            }
        }
        return unique;
    }
    /**
     * Clear all caches across all clients
     */
    clearAllCaches() {
        marketDataClient.clearCache();
        newsClient.clearCache();
        economicCalendarClient.clearCache();
        twelveDataClient.clearCache();
        finnhubClient.clearCache();
        polygonClient.clearCache();
        yahooFinanceClient.clearCache();
        binanceClient.clearCache();
        currentsClient.clearCache();
        gNewsClient.clearCache();
        cryptoPanicClient.clearCache();
        fredClient.clearCache();
        worldBankClient.clearCache();
        logger.info('All API caches cleared');
    }
}
export const aggregatedDataService = new AggregatedDataService();
//# sourceMappingURL=aggregatedData.service.js.map