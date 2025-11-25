import { AssetModel } from '../models/asset.model.js';
import { marketDataClient } from '../integrations/marketData.client.js';
import { logger } from '../config/logger.js';

export class MarketsService {
  /**
   * Get all assets with live prices
   */
  static async getAssets(limit = 100, offset = 0) {
    try {
      const dbAssets = await AssetModel.getAll(limit, offset);
      
      // Enrich crypto assets with live prices
      try {
        const cryptoPrices = await marketDataClient.getCryptoPrices(['bitcoin', 'ethereum']);
        
        dbAssets.assets = dbAssets.assets.map((asset: any) => {
          if (asset.type === 'crypto') {
            const livePrice = cryptoPrices.find(p => 
              p.symbol.toLowerCase() === asset.symbol.toLowerCase()
            );
            if (livePrice) {
              return { ...asset, last_price: livePrice.price, change_24h: livePrice.change24h };
            }
          }
          return asset;
        });
      } catch (error) {
        logger.warn('Failed to fetch live prices, using database values');
      }
      
      return dbAssets;
    } catch (error) {
      logger.error('Error in getAssets:', error);
      throw error;
    }
  }

  /**
   * Get single asset by symbol
   */
  static async getAssetBySymbol(symbol: string) {
    try {
      const asset = await AssetModel.findBySymbol(symbol);
      if (!asset) return null;
      
      if (asset.type === 'crypto') {
        try {
          const livePrice = await marketDataClient.getCryptoPrice(symbol.toLowerCase());
          if (livePrice) {
            return { ...asset, last_price: livePrice.price, change_24h: livePrice.change24h };
          }
        } catch (error) {
          logger.warn(`Failed to fetch live price for ${symbol}`);
        }
      }
      
      return asset;
    } catch (error) {
      logger.error('Error in getAssetBySymbol:', error);
      throw error;
    }
  }

  /**
   * Search assets
   */
  static async searchAssets(query: string) {
    return AssetModel.search(query);
  }

  /**
   * Get top moving assets
   */
  static async getTopMovers(limit = 10) {
    try {
      const trending = await marketDataClient.getTrendingCrypto();
      
      if (trending.length > 0) {
        return {
          assets: trending.slice(0, limit).map(t => ({
            symbol: t.symbol,
            name: t.name,
            type: 'crypto',
            last_price: t.price,
            change_24h: t.change24h,
          })),
          total: trending.length,
        };
      }
      
      return AssetModel.getTopMovers(limit);
    } catch (error) {
      logger.error('Error in getTopMovers:', error);
      return AssetModel.getTopMovers(limit);
    }
  }

  /**
   * Get assets by type
   */
  static async getAssetsByType(type: string, limit = 50, offset = 0) {
    return AssetModel.findByType(type, limit, offset);
  }

  /**
   * Update prices from external APIs (for cron job)
   */
  static async updatePrices(): Promise<void> {
    try {
      logger.info('Updating market prices');
      
      const livePrices = await marketDataClient.getCryptoPrices(['bitcoin', 'ethereum']);
      
      for (const price of livePrices) {
        const asset = await AssetModel.findBySymbol(price.symbol);
        if (asset) {
          await AssetModel.updatePrice(asset.id, price.price, price.change24h);
        }
      }
      
      logger.info(`Updated ${livePrices.length} asset prices`);
    } catch (error) {
      logger.error('Error updating prices:', error);
    }
  }
}
