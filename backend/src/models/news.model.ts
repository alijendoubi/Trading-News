import { Collections, getDb, getDocumentById, createDocument, queryWithPagination } from '../config/firestore.js';
import type { NewsArticle } from '../types/common.types.js';

export interface NewsRow {
  id: string;
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

  static async findById(id: string): Promise<NewsArticle | null> {
    const row = await getDocumentById<NewsRow>(Collections.NEWS_ARTICLES, id);
    return row ? this.rowToNews(row) : null;
  }

  static async getRecent(limit = 50, offset = 0): Promise<{ articles: NewsArticle[]; total: number }> {
    const result = await queryWithPagination<NewsRow>(
      Collections.NEWS_ARTICLES,
      (ref) => ref.orderBy('published_at', 'desc'),
      limit,
      offset
    );
    return {
      articles: result.items.map(this.rowToNews),
      total: result.total,
    };
  }

  static async getByCategory(category: string, limit = 50, offset = 0): Promise<{ articles: NewsArticle[]; total: number }> {
    const result = await queryWithPagination<NewsRow>(
      Collections.NEWS_ARTICLES,
      (ref) => ref.where('category', '==', category).orderBy('published_at', 'desc'),
      limit,
      offset
    );
    return {
      articles: result.items.map(this.rowToNews),
      total: result.total,
    };
  }

  static async create(article: Omit<NewsRow, 'id' | 'created_at' | 'updated_at'>): Promise<NewsArticle> {
    const row = await createDocument<NewsRow>(Collections.NEWS_ARTICLES, article);
    return this.rowToNews(row);
  }

  static async findByUrl(url: string): Promise<NewsArticle | null> {
    const db = getDb();
    const snapshot = await db.collection(Collections.NEWS_ARTICLES)
      .where('url', '==', url)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return null;
    }

    const doc = snapshot.docs[0];
    const row = { id: doc.id, ...doc.data() } as NewsRow;
    return this.rowToNews(row);
  }
}
