import { queryDb, queryDbSingle } from '../config/db.js';
import type { NewsArticle } from '../../../common/types.js';

export interface NewsRow {
  id: number;
  title: string;
  url: string;
  source: string;
  published_at: Date;
  category: string;
  summary?: string;
  image_url?: string;
  created_at: Date;
  updated_at: Date;
}

export class NewsModel {
  static rowToNews(row: NewsRow): NewsArticle {
    return {
      id: row.id.toString(),
      title: row.title,
      url: row.url,
      source: row.source,
      publishedAt: row.published_at,
      category: row.category,
      summary: row.summary,
      imageUrl: row.image_url,
    };
  }

  static async findById(id: number): Promise<NewsArticle | null> {
    const row = await queryDbSingle<NewsRow>(
      'SELECT * FROM news_articles WHERE id = $1',
      [id]
    );
    return row ? this.rowToNews(row) : null;
  }

  static async getRecent(limit = 50, offset = 0): Promise<{ articles: NewsArticle[]; total: number }> {
    const [rows, countResult] = await Promise.all([
      queryDb<NewsRow>(
        'SELECT * FROM news_articles ORDER BY published_at DESC LIMIT $1 OFFSET $2',
        [limit, offset]
      ),
      queryDb<{ count: string }>('SELECT COUNT(*) as count FROM news_articles'),
    ]);
    return {
      articles: rows.map(this.rowToNews),
      total: parseInt(countResult[0]?.count || '0', 10),
    };
  }

  static async getByCategory(category: string, limit = 50, offset = 0): Promise<{ articles: NewsArticle[]; total: number }> {
    const [rows, countResult] = await Promise.all([
      queryDb<NewsRow>(
        'SELECT * FROM news_articles WHERE category = $1 ORDER BY published_at DESC LIMIT $2 OFFSET $3',
        [category, limit, offset]
      ),
      queryDb<{ count: string }>('SELECT COUNT(*) as count FROM news_articles WHERE category = $1', [category]),
    ]);
    return {
      articles: rows.map(this.rowToNews),
      total: parseInt(countResult[0]?.count || '0', 10),
    };
  }

  static async create(article: Omit<NewsRow, 'id' | 'created_at' | 'updated_at'>): Promise<NewsArticle> {
    const result = await queryDb<NewsRow>(
      'INSERT INTO news_articles (title, url, source, published_at, category, summary, image_url) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [article.title, article.url, article.source, article.published_at, article.category, article.summary, article.image_url]
    );
    return this.rowToNews(result[0]);
  }
}
