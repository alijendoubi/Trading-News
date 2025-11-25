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
export declare class NewsModel {
    static rowToNews(row: NewsRow): NewsArticle;
    static findById(id: string): Promise<NewsArticle | null>;
    static getRecent(limit?: number, offset?: number): Promise<{
        articles: NewsArticle[];
        total: number;
    }>;
    static getByCategory(category: string, limit?: number, offset?: number): Promise<{
        articles: NewsArticle[];
        total: number;
    }>;
    static create(article: Omit<NewsRow, 'id' | 'created_at' | 'updated_at'>): Promise<NewsArticle>;
    static findByUrl(url: string): Promise<NewsArticle | null>;
}
//# sourceMappingURL=news.model.d.ts.map