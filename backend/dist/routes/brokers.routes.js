import { Router } from 'express';
import { getDb } from '../config/firestore.js';
import { authMiddleware as authenticateToken } from '../middleware/auth.js';
import admin from 'firebase-admin';
const router = Router();
// GET /api/brokers - Get all brokers
router.get('/', async (req, res) => {
    try {
        const { instruments, regulation, page = 1, limit = 20 } = req.query;
        const offset = (Number(page) - 1) * Number(limit);
        const db = getDb();
        let query = db.collection('brokers');
        if (instruments) {
            query = query.where('instruments', 'array-contains', instruments);
        }
        // Get total count
        const countSnapshot = await query.count().get();
        const total = countSnapshot.data().count;
        // Get paginated results
        const snapshot = await query
            .orderBy('created_at', 'desc')
            .limit(Number(limit))
            .offset(offset)
            .get();
        const brokers = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        }));
        res.json({
            brokers,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
            },
        });
    }
    catch (error) {
        console.error('Error fetching brokers:', error);
        res.status(500).json({ error: 'Failed to fetch brokers' });
    }
});
// GET /api/brokers/:slug - Get single broker
router.get('/:slug', async (req, res) => {
    try {
        const { slug } = req.params;
        const db = getDb();
        const snapshot = await db.collection('brokers')
            .where('slug', '==', slug)
            .limit(1)
            .get();
        if (snapshot.empty) {
            return res.status(404).json({ error: 'Broker not found' });
        }
        const brokerDoc = snapshot.docs[0];
        const broker = { id: brokerDoc.id, ...brokerDoc.data() };
        // Get reviews for this broker
        const reviewsSnapshot = await db.collection('broker_reviews')
            .where('broker_id', '==', brokerDoc.id)
            .orderBy('created_at', 'desc')
            .get();
        const reviews = reviewsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        }));
        res.json({
            broker,
            reviews,
        });
    }
    catch (error) {
        console.error('Error fetching broker:', error);
        res.status(500).json({ error: 'Failed to fetch broker' });
    }
});
// POST /api/brokers/:brokerId/reviews - Add review (authenticated)
router.post('/:brokerId/reviews', authenticateToken, async (req, res) => {
    try {
        const { brokerId } = req.params;
        const { rating, title, content, pros, cons } = req.body;
        const userId = req.userId;
        if (!rating || !content) {
            return res.status(400).json({ error: 'Rating and content are required' });
        }
        if (rating < 1 || rating > 5) {
            return res.status(400).json({ error: 'Rating must be between 1 and 5' });
        }
        const db = getDb();
        // Check if user already reviewed this broker
        const existingReview = await db.collection('broker_reviews')
            .where('broker_id', '==', brokerId)
            .where('user_id', '==', userId)
            .limit(1)
            .get();
        if (!existingReview.empty) {
            return res.status(400).json({ error: 'You have already reviewed this broker' });
        }
        // Insert review
        const docRef = await db.collection('broker_reviews').add({
            broker_id: brokerId,
            user_id: userId,
            rating,
            title,
            content,
            pros,
            cons,
            helpful_count: 0,
            created_at: admin.firestore.FieldValue.serverTimestamp(),
            updated_at: admin.firestore.FieldValue.serverTimestamp(),
        });
        const doc = await docRef.get();
        res.status(201).json({ review: { id: doc.id, ...doc.data() } });
    }
    catch (error) {
        console.error('Error creating review:', error);
        res.status(500).json({ error: 'Failed to create review' });
    }
});
// PUT /api/brokers/reviews/:reviewId - Update review (authenticated, author only)
router.put('/reviews/:reviewId', authenticateToken, async (req, res) => {
    try {
        const { reviewId } = req.params;
        const { rating, title, content, pros, cons } = req.body;
        const userId = req.userId;
        const db = getDb();
        const docRef = db.collection('broker_reviews').doc(reviewId);
        const doc = await docRef.get();
        if (!doc.exists) {
            return res.status(404).json({ error: 'Review not found' });
        }
        if (doc.data()?.user_id !== userId) {
            return res.status(403).json({ error: 'Not authorized to edit this review' });
        }
        const updateData = {
            updated_at: admin.firestore.FieldValue.serverTimestamp(),
        };
        if (rating)
            updateData.rating = rating;
        if (title)
            updateData.title = title;
        if (content)
            updateData.content = content;
        if (pros)
            updateData.pros = pros;
        if (cons)
            updateData.cons = cons;
        await docRef.update(updateData);
        const updatedDoc = await docRef.get();
        res.json({ review: { id: updatedDoc.id, ...updatedDoc.data() } });
    }
    catch (error) {
        console.error('Error updating review:', error);
        res.status(500).json({ error: 'Failed to update review' });
    }
});
// DELETE /api/brokers/reviews/:reviewId - Delete review (authenticated, author only)
router.delete('/reviews/:reviewId', authenticateToken, async (req, res) => {
    try {
        const { reviewId } = req.params;
        const userId = req.userId;
        const db = getDb();
        const docRef = db.collection('broker_reviews').doc(reviewId);
        const doc = await docRef.get();
        if (!doc.exists) {
            return res.status(404).json({ error: 'Review not found' });
        }
        if (doc.data()?.user_id !== userId) {
            return res.status(403).json({ error: 'Not authorized to delete this review' });
        }
        await docRef.delete();
        res.json({ message: 'Review deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting review:', error);
        res.status(500).json({ error: 'Failed to delete review' });
    }
});
// POST /api/brokers/reviews/:reviewId/helpful - Mark review as helpful (authenticated)
router.post('/reviews/:reviewId/helpful', authenticateToken, async (req, res) => {
    try {
        const { reviewId } = req.params;
        const userId = req.userId;
        const db = getDb();
        // Check if already marked helpful
        const existing = await db.collection('broker_review_helpful')
            .where('review_id', '==', reviewId)
            .where('user_id', '==', userId)
            .limit(1)
            .get();
        if (!existing.empty) {
            return res.json({ message: 'Review already marked as helpful' });
        }
        // Add helpful marking
        await db.collection('broker_review_helpful').add({
            review_id: reviewId,
            user_id: userId,
            created_at: admin.firestore.FieldValue.serverTimestamp(),
        });
        // Increment helpful count
        const reviewRef = db.collection('broker_reviews').doc(reviewId);
        await reviewRef.update({
            helpful_count: admin.firestore.FieldValue.increment(1)
        });
        res.json({ message: 'Review marked as helpful' });
    }
    catch (error) {
        console.error('Error marking review as helpful:', error);
        res.status(500).json({ error: 'Failed to mark review as helpful' });
    }
});
export default router;
//# sourceMappingURL=brokers.routes.js.map