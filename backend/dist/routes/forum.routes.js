import { Router } from 'express';
import { getDb } from '../config/firestore.js';
import { authMiddleware as authenticateToken } from '../middleware/auth.js';
import admin from 'firebase-admin';
const router = Router();
// GET /api/forum/categories - Get all forum categories
router.get('/categories', async (req, res) => {
    try {
        const db = getDb();
        const snapshot = await db.collection('forum_categories')
            .orderBy('created_at', 'asc')
            .get();
        const categories = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        }));
        res.json({ categories });
    }
    catch (error) {
        console.error('Error fetching forum categories:', error);
        res.json({ categories: [] });
    }
});
// GET /api/forum/threads - Get all threads
router.get('/threads', async (req, res) => {
    try {
        const { category, page = 1, limit = 20, sort = 'latest' } = req.query;
        const offset = (Number(page) - 1) * Number(limit);
        const db = getDb();
        let query = db.collection('forum_threads');
        if (category) {
            query = query.where('category_slug', '==', category);
        }
        // Apply sorting (before fetching to avoid index issues)
        if (sort === 'latest') {
            query = query.orderBy('updated_at', 'desc');
        }
        else if (sort === 'views') {
            query = query.orderBy('views', 'desc');
        }
        // Get paginated results
        const snapshot = await query
            .limit(Number(limit))
            .offset(offset)
            .get();
        const threads = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        }));
        // Get total count only if we have results
        let total = threads.length;
        if (threads.length === Number(limit)) {
            try {
                const countSnapshot = await query.count().get();
                total = countSnapshot.data().count;
            }
            catch (countError) {
                total = threads.length;
            }
        }
        res.json({
            threads,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
            },
        });
    }
    catch (error) {
        console.error('Error fetching forum threads:', error);
        res.json({ threads: [], pagination: { page: 1, limit: 20, total: 0 } });
    }
});
// GET /api/forum/threads/:id - Get single thread with posts
router.get('/threads/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const db = getDb();
        // Get thread
        const threadDoc = await db.collection('forum_threads').doc(id).get();
        if (!threadDoc.exists) {
            return res.status(404).json({ error: 'Thread not found' });
        }
        const thread = { id: threadDoc.id, ...threadDoc.data() };
        // Increment view count
        await threadDoc.ref.update({
            views: admin.firestore.FieldValue.increment(1)
        });
        // Get posts
        const postsSnapshot = await db.collection('forum_posts')
            .where('thread_id', '==', id)
            .orderBy('created_at', 'asc')
            .get();
        const posts = postsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        }));
        res.json({
            thread,
            posts,
        });
    }
    catch (error) {
        console.error('Error fetching thread:', error);
        res.status(500).json({ error: 'Failed to fetch thread' });
    }
});
// POST /api/forum/threads - Create new thread (authenticated)
router.post('/threads', authenticateToken, async (req, res) => {
    try {
        const { category_id, title, content } = req.body;
        const userId = req.userId;
        if (!category_id || !title || !content) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        // Generate slug from title
        const slug = title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '') + '-' + Date.now();
        const db = getDb();
        const docRef = await db.collection('forum_threads').add({
            category_id,
            user_id: userId,
            title,
            slug,
            content,
            views: 0,
            is_pinned: false,
            is_locked: false,
            created_at: admin.firestore.FieldValue.serverTimestamp(),
            updated_at: admin.firestore.FieldValue.serverTimestamp(),
        });
        const doc = await docRef.get();
        res.status(201).json({ thread: { id: doc.id, ...doc.data() } });
    }
    catch (error) {
        console.error('Error creating thread:', error);
        res.status(500).json({ error: 'Failed to create thread' });
    }
});
// POST /api/forum/threads/:id/posts - Add reply to thread (authenticated)
router.post('/threads/:id/posts', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { content } = req.body;
        const userId = req.userId;
        if (!content) {
            return res.status(400).json({ error: 'Content is required' });
        }
        const db = getDb();
        // Check if thread exists and is not locked
        const threadDoc = await db.collection('forum_threads').doc(id).get();
        if (!threadDoc.exists) {
            return res.status(404).json({ error: 'Thread not found' });
        }
        if (threadDoc.data()?.is_locked) {
            return res.status(403).json({ error: 'Thread is locked' });
        }
        // Create post
        const docRef = await db.collection('forum_posts').add({
            thread_id: id,
            user_id: userId,
            content,
            created_at: admin.firestore.FieldValue.serverTimestamp(),
            updated_at: admin.firestore.FieldValue.serverTimestamp(),
        });
        // Update thread's updated_at
        await threadDoc.ref.update({
            updated_at: admin.firestore.FieldValue.serverTimestamp()
        });
        const doc = await docRef.get();
        res.status(201).json({ post: { id: doc.id, ...doc.data() } });
    }
    catch (error) {
        console.error('Error creating post:', error);
        res.status(500).json({ error: 'Failed to create post' });
    }
});
// PUT /api/forum/threads/:id - Update thread (authenticated, author only)
router.put('/threads/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { title, content } = req.body;
        const userId = req.userId;
        const db = getDb();
        const docRef = db.collection('forum_threads').doc(id);
        const doc = await docRef.get();
        if (!doc.exists) {
            return res.status(404).json({ error: 'Thread not found' });
        }
        if (doc.data()?.user_id !== userId) {
            return res.status(403).json({ error: 'Not authorized to edit this thread' });
        }
        const updateData = {
            updated_at: admin.firestore.FieldValue.serverTimestamp(),
        };
        if (title)
            updateData.title = title;
        if (content)
            updateData.content = content;
        await docRef.update(updateData);
        const updatedDoc = await docRef.get();
        res.json({ thread: { id: updatedDoc.id, ...updatedDoc.data() } });
    }
    catch (error) {
        console.error('Error updating thread:', error);
        res.status(500).json({ error: 'Failed to update thread' });
    }
});
// DELETE /api/forum/threads/:id - Delete thread (authenticated, author only)
router.delete('/threads/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.userId;
        const db = getDb();
        const docRef = db.collection('forum_threads').doc(id);
        const doc = await docRef.get();
        if (!doc.exists) {
            return res.status(404).json({ error: 'Thread not found' });
        }
        if (doc.data()?.user_id !== userId) {
            return res.status(403).json({ error: 'Not authorized to delete this thread' });
        }
        await docRef.delete();
        res.json({ message: 'Thread deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting thread:', error);
        res.status(500).json({ error: 'Failed to delete thread' });
    }
});
// POST /api/forum/threads/:id/like - Like a thread (authenticated)
router.post('/threads/:id/like', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.userId;
        const db = getDb();
        // Check if already liked
        const existing = await db.collection('forum_thread_likes')
            .where('thread_id', '==', id)
            .where('user_id', '==', userId)
            .limit(1)
            .get();
        if (!existing.empty) {
            return res.json({ message: 'Thread already liked' });
        }
        await db.collection('forum_thread_likes').add({
            thread_id: id,
            user_id: userId,
            created_at: admin.firestore.FieldValue.serverTimestamp(),
        });
        res.json({ message: 'Thread liked successfully' });
    }
    catch (error) {
        console.error('Error liking thread:', error);
        res.status(500).json({ error: 'Failed to like thread' });
    }
});
// DELETE /api/forum/threads/:id/like - Unlike a thread (authenticated)
router.delete('/threads/:id/like', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.userId;
        const db = getDb();
        const snapshot = await db.collection('forum_thread_likes')
            .where('thread_id', '==', id)
            .where('user_id', '==', userId)
            .limit(1)
            .get();
        if (snapshot.empty) {
            return res.status(404).json({ error: 'Like not found' });
        }
        await snapshot.docs[0].ref.delete();
        res.json({ message: 'Thread unliked successfully' });
    }
    catch (error) {
        console.error('Error unliking thread:', error);
        res.status(500).json({ error: 'Failed to unlike thread' });
    }
});
export default router;
//# sourceMappingURL=forum.routes.js.map