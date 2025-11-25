import { queryDb, queryDbSingle } from '../config/db.js';
export class NewsModel {
    static rowToNews(row) {
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
    static async findById(id) {
        const row = await queryDbSingle('SELECT * FROM news_articles WHERE id = $1', [id]);
        return row ? this.rowToNews(row) : null;
    }
    static async getRecent(limit = 50, offset = 0) {
        const [rows, countResult] = await Promise.all([
            queryDb('SELECT * FROM news_articles ORDER BY published_at DESC LIMIT $1 OFFSET $2', [limit, offset]),
            queryDb('SELECT COUNT(*) as count FROM news_articles'),
        ]);
        return {
            articles: rows.map(this.rowToNews),
            total: parseInt(countResult[0]?.count || '0', 10),
        };
    }
    static async getByCategory(category, limit = 50, offset = 0) {
        const [rows, countResult] = await Promise.all([
            queryDb('SELECT * FROM news_articles WHERE category = $1 ORDER BY published_at DESC LIMIT $2 OFFSET $3', [category, limit, offset]),
            queryDb('SELECT COUNT(*) as count FROM news_articles WHERE category = $1', [category]),
        ]);
        return {
            articles: rows.map(this.rowToNews),
            total: parseInt(countResult[0]?.count || '0', 10),
        };
    }
    static async create(article) {
        const result = await queryDb('INSERT INTO news_articles (title, url, source, published_at, category, summary, image_url) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *', [article.title, article.url, article.source, article.published_at, article.category, article.summary, article.image_url]);
        return this.rowToNews(result[0]);
    }
    static async findByUrl(url) {
        const row = await queryDbSingle('SELECT * FROM news_articles WHERE url = $1', [url]);
        return row ? this.rowToNews(row) : null;
    }
}
//# sourceMappingURL=news.model.js.map