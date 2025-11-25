import { Router } from 'express';
import { pool } from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

// GET /api/brokers - Get all brokers with average ratings
router.get('/', async (req, res) => {
  try {
    const { instruments, regulation, page = 1, limit = 20 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);
    
    let query = `
      SELECT 
        b.*,
        COALESCE(AVG(r.rating), 0) as avg_rating,
        COUNT(DISTINCT r.id) as review_count
      FROM brokers b
      LEFT JOIN broker_reviews r ON b.id = r.broker_id
    `;
    
    const params: any[] = [];
    const conditions: string[] = [];
    
    if (instruments) {
      conditions.push(`$${params.length + 1} = ANY(b.instruments)`);
      params.push(instruments);
    }
    
    if (regulation) {
      conditions.push(`b.regulation ILIKE $${params.length + 1}`);
      params.push(`%${regulation}%`);
    }
    
    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(' AND ')}`;
    }
    
    query += ` GROUP BY b.id ORDER BY review_count DESC, avg_rating DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);
    
    const result = await pool.query(query, params);
    
    // Get total count
    let countQuery = `SELECT COUNT(*) as total FROM brokers`;
    if (conditions.length > 0) {
      countQuery += ` WHERE ${conditions.join(' AND ')}`;
    }
    const countResult = await pool.query(
      countQuery,
      params.slice(0, params.length - 2)
    );
    
    res.json({
      brokers: result.rows,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: parseInt(countResult.rows[0].total),
      },
    });
  } catch (error) {
    console.error('Error fetching brokers:', error);
    res.status(500).json({ error: 'Failed to fetch brokers' });
  }
});

// GET /api/brokers/:slug - Get single broker with reviews
router.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    
    // Get broker details
    const brokerResult = await pool.query(
      `SELECT 
        b.*,
        COALESCE(AVG(r.rating), 0) as avg_rating,
        COUNT(DISTINCT r.id) as review_count
       FROM brokers b
       LEFT JOIN broker_reviews r ON b.id = r.broker_id
       WHERE b.slug = $1
       GROUP BY b.id`,
      [slug]
    );
    
    if (brokerResult.rows.length === 0) {
      return res.status(404).json({ error: 'Broker not found' });
    }
    
    // Get reviews with category ratings
    const reviewsResult = await pool.query(
      `SELECT 
        r.*,
        u.name as reviewer_name,
        json_agg(
          json_build_object(
            'category', rc.category,
            'rating', rc.rating
          )
        ) FILTER (WHERE rc.id IS NOT NULL) as category_ratings
       FROM broker_reviews r
       LEFT JOIN users u ON r.user_id = u.id
       LEFT JOIN broker_rating_categories rc ON r.id = rc.review_id
       WHERE r.broker_id = $1
       GROUP BY r.id, u.id
       ORDER BY r.created_at DESC`,
      [brokerResult.rows[0].id]
    );
    
    res.json({
      broker: brokerResult.rows[0],
      reviews: reviewsResult.rows,
    });
  } catch (error) {
    console.error('Error fetching broker:', error);
    res.status(500).json({ error: 'Failed to fetch broker' });
  }
});

// POST /api/brokers/:brokerId/reviews - Add review (authenticated)
router.post('/:brokerId/reviews', authenticateToken, async (req, res) => {
  try {
    const { brokerId } = req.params;
    const { rating, title, content, pros, cons, category_ratings } = req.body;
    const userId = (req as any).user.id;
    
    if (!rating || !content) {
      return res.status(400).json({ error: 'Rating and content are required' });
    }
    
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }
    
    // Check if user already reviewed this broker
    const existingReview = await pool.query(
      'SELECT id FROM broker_reviews WHERE broker_id = $1 AND user_id = $2',
      [brokerId, userId]
    );
    
    if (existingReview.rows.length > 0) {
      return res.status(400).json({ error: 'You have already reviewed this broker' });
    }
    
    // Insert review
    const reviewResult = await pool.query(
      `INSERT INTO broker_reviews (broker_id, user_id, rating, title, content, pros, cons)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [brokerId, userId, rating, title, content, pros, cons]
    );
    
    const reviewId = reviewResult.rows[0].id;
    
    // Insert category ratings if provided
    if (category_ratings && Array.isArray(category_ratings)) {
      for (const catRating of category_ratings) {
        if (catRating.category && catRating.rating) {
          await pool.query(
            `INSERT INTO broker_rating_categories (review_id, category, rating)
             VALUES ($1, $2, $3)`,
            [reviewId, catRating.category, catRating.rating]
          );
        }
      }
    }
    
    res.status(201).json({ review: reviewResult.rows[0] });
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({ error: 'Failed to create review' });
  }
});

// PUT /api/brokers/reviews/:reviewId - Update review (authenticated, author only)
router.put('/reviews/:reviewId', authenticateToken, async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { rating, title, content, pros, cons } = req.body;
    const userId = (req as any).user.id;
    
    const reviewCheck = await pool.query(
      'SELECT user_id FROM broker_reviews WHERE id = $1',
      [reviewId]
    );
    
    if (reviewCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Review not found' });
    }
    
    if (reviewCheck.rows[0].user_id !== userId) {
      return res.status(403).json({ error: 'Not authorized to edit this review' });
    }
    
    const result = await pool.query(
      `UPDATE broker_reviews 
       SET rating = COALESCE($1, rating),
           title = COALESCE($2, title),
           content = COALESCE($3, content),
           pros = COALESCE($4, pros),
           cons = COALESCE($5, cons),
           updated_at = NOW()
       WHERE id = $6
       RETURNING *`,
      [rating, title, content, pros, cons, reviewId]
    );
    
    res.json({ review: result.rows[0] });
  } catch (error) {
    console.error('Error updating review:', error);
    res.status(500).json({ error: 'Failed to update review' });
  }
});

// DELETE /api/brokers/reviews/:reviewId - Delete review (authenticated, author only)
router.delete('/reviews/:reviewId', authenticateToken, async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = (req as any).user.id;
    
    const reviewCheck = await pool.query(
      'SELECT user_id FROM broker_reviews WHERE id = $1',
      [reviewId]
    );
    
    if (reviewCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Review not found' });
    }
    
    if (reviewCheck.rows[0].user_id !== userId) {
      return res.status(403).json({ error: 'Not authorized to delete this review' });
    }
    
    await pool.query('DELETE FROM broker_reviews WHERE id = $1', [reviewId]);
    
    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({ error: 'Failed to delete review' });
  }
});

// POST /api/brokers/reviews/:reviewId/helpful - Mark review as helpful (authenticated)
router.post('/reviews/:reviewId/helpful', authenticateToken, async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = (req as any).user.id;
    
    await pool.query(
      `INSERT INTO broker_review_helpful (review_id, user_id)
       VALUES ($1, $2)
       ON CONFLICT (review_id, user_id) DO NOTHING`,
      [reviewId, userId]
    );
    
    // Update helpful count
    await pool.query(
      `UPDATE broker_reviews 
       SET helpful_count = (
         SELECT COUNT(*) FROM broker_review_helpful WHERE review_id = $1
       )
       WHERE id = $1`,
      [reviewId]
    );
    
    res.json({ message: 'Review marked as helpful' });
  } catch (error) {
    console.error('Error marking review as helpful:', error);
    res.status(500).json({ error: 'Failed to mark review as helpful' });
  }
});

export default router;
