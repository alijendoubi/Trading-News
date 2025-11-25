import { Collections, getDb, getDocumentById, createDocument, queryWithPagination } from '../config/firestore.js';
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
        const row = await getDocumentById(Collections.NEWS_ARTICLES, id);
        return row ? this.rowToNews(row) : null;
    }
    static async getRecent(limit = 50, offset = 0) {
        const result = await queryWithPagination(Collections.NEWS_ARTICLES, (ref) => ref.orderBy('published_at', 'desc'), limit, offset);
        return {
            articles: result.items.map(this.rowToNews),
            total: result.total,
        };
    }
    static async getByCategory(category, limit = 50, offset = 0) {
        const result = await queryWithPagination(Collections.NEWS_ARTICLES, (ref) => ref.where('category', '==', category).orderBy('published_at', 'desc'), limit, offset);
        return {
            articles: result.items.map(this.rowToNews),
            total: result.total,
        };
    }
    static async create(article) {
        const row = await createDocument(Collections.NEWS_ARTICLES, article);
        return this.rowToNews(row);
    }
    static async findByUrl(url) {
        const db = getDb();
        const snapshot = await db.collection(Collections.NEWS_ARTICLES)
            .where('url', '==', url)
            .limit(1)
            .get();
        if (snapshot.empty) {
            return null;
        }
        const doc = snapshot.docs[0];
        const row = { id: doc.id, ...doc.data() };
        return this.rowToNews(row);
    }
}
//# sourceMappingURL=news.model.js.map