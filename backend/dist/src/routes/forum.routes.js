import { Router } from 'express';
// TODO: Migrate forum routes to Firestore
// These routes still use PostgreSQL and need migration
const router = Router();
// NOTE: Forum routes temporarily disabled - requires Firestore migration
router.get('/categories', async (req, res) => {
    res.status(503).json({ error: 'Forum feature not yet available' });
    return;
    /*
    try {
      const result = await pool.query(`
        SELECT
          c.*,
          COUNT(DISTINCT t.id) as thread_count,
          COUNT(DISTINCT p.id) as post_count
        FROM forum_categories c
        LEFT JOIN forum_threads t ON c.id = t.category_id
        LEFT JOIN forum_posts p ON t.id = p.thread_id
        GROUP BY c.id
        ORDER BY c.id
      `);
      
      res.json({ categories: result.rows });
    } catch (error) {
      console.error('Error fetching forum categories:', error);
      res.status(500).json({ error: 'Failed to fetch forum categories' });
    }
  });
  
  // GET /api/forum/threads - Get all threads with pagination and filtering
  router.get('/threads', async (req, res) => {
    try {
      const { category, page = 1, limit = 20, sort = 'latest' } = req.query;
      const offset = (Number(page) - 1) * Number(limit);
      
      let query = `
        SELECT
          t.*,
          u.name as author_name,
          u.email as author_email,
          c.name as category_name,
          c.slug as category_slug,
          COUNT(DISTINCT p.id) as reply_count,
          COUNT(DISTINCT tl.id) as like_count,
          MAX(COALESCE(p.created_at, t.created_at)) as last_activity
        FROM forum_threads t
        LEFT JOIN users u ON t.user_id = u.id
        LEFT JOIN forum_categories c ON t.category_id = c.id
        LEFT JOIN forum_posts p ON t.id = p.thread_id
        LEFT JOIN forum_thread_likes tl ON t.id = tl.thread_id
      `;
      
      const params: any[] = [];
      
      if (category) {
        query += ` WHERE c.slug = $${params.length + 1}`;
        params.push(category);
      }
      
      query += ` GROUP BY t.id, u.id, c.id`;
      
      if (sort === 'latest') {
        query += ` ORDER BY t.is_pinned DESC, last_activity DESC`;
      } else if (sort === 'popular') {
        query += ` ORDER BY t.is_pinned DESC, like_count DESC, reply_count DESC`;
      } else if (sort === 'views') {
        query += ` ORDER BY t.is_pinned DESC, t.views DESC`;
      }
      
      query += ` LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
      params.push(limit, offset);
      
      const result = await pool.query(query, params);
      
      // Get total count
      let countQuery = `SELECT COUNT(*) as total FROM forum_threads t`;
      if (category) {
        countQuery += ` JOIN forum_categories c ON t.category_id = c.id WHERE c.slug = $1`;
      }
      const countResult = await pool.query(
        countQuery,
        category ? [category] : []
      );
      
      res.json({
        threads: result.rows,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: parseInt(countResult.rows[0].total),
        },
      });
    } catch (error) {
      console.error('Error fetching forum threads:', error);
      res.status(500).json({ error: 'Failed to fetch forum threads' });
    }
  });
  
  // GET /api/forum/threads/:id - Get single thread with posts
  router.get('/threads/:id', async (req, res) => {
    try {
      const { id } = req.params;
      
      // Get thread details
      const threadResult = await pool.query(
        `
        SELECT
          t.*,
          u.name as author_name,
          u.email as author_email,
          c.name as category_name,
          c.slug as category_slug,
          COUNT(DISTINCT tl.id) as like_count
        FROM forum_threads t
        LEFT JOIN users u ON t.user_id = u.id
        LEFT JOIN forum_categories c ON t.category_id = c.id
        LEFT JOIN forum_thread_likes tl ON t.id = tl.thread_id
        WHERE t.id = $1
        GROUP BY t.id, u.id, c.id
        `,
        [id]
      );
      
      if (threadResult.rows.length === 0) {
        return res.status(404).json({ error: 'Thread not found' });
      }
      
      // Increment view count
      await pool.query(
        'UPDATE forum_threads SET views = views + 1 WHERE id = $1',
        [id]
      );
      
      // Get posts
      const postsResult = await pool.query(
        `
        SELECT
          p.*,
          u.name as author_name,
          u.email as author_email,
          COUNT(DISTINCT pl.id) as like_count
        FROM forum_posts p
        LEFT JOIN users u ON p.user_id = u.id
        LEFT JOIN forum_post_likes pl ON p.id = pl.post_id
        WHERE p.thread_id = $1
        GROUP BY p.id, u.id
        ORDER BY p.created_at ASC
        `,
        [id]
      );
      
      res.json({
        thread: threadResult.rows[0],
        posts: postsResult.rows,
      });
    } catch (error) {
      console.error('Error fetching thread:', error);
      res.status(500).json({ error: 'Failed to fetch thread' });
    }
  });
  
  // POST /api/forum/threads - Create new thread (authenticated)
  router.post('/threads', authenticateToken, async (req, res) => {
    try {
      const { category_id, title, content } = req.body;
      const userId = (req as any).user.id;
      
      if (!category_id || !title || !content) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
      
      // Generate slug from title
      const slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '') + '-' + Date.now();
      
      const result = await pool.query(
        `INSERT INTO forum_threads (category_id, user_id, title, slug, content)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [category_id, userId, title, slug, content]
      );
      
      res.status(201).json({ thread: result.rows[0] });
    } catch (error) {
      console.error('Error creating thread:', error);
      res.status(500).json({ error: 'Failed to create thread' });
    }
  });
  
  // POST /api/forum/threads/:id/posts - Add reply to thread (authenticated)
  router.post('/threads/:id/posts', authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const { content } = req.body;
      const userId = (req as any).user.id;
      
      if (!content) {
        return res.status(400).json({ error: 'Content is required' });
      }
      
      // Check if thread exists and is not locked
      const threadCheck = await pool.query(
        'SELECT is_locked FROM forum_threads WHERE id = $1',
        [id]
      );
      
      if (threadCheck.rows.length === 0) {
        return res.status(404).json({ error: 'Thread not found' });
      }
      
      if (threadCheck.rows[0].is_locked) {
        return res.status(403).json({ error: 'Thread is locked' });
      }
      
      const result = await pool.query(
        `INSERT INTO forum_posts (thread_id, user_id, content)
         VALUES ($1, $2, $3)
         RETURNING *`,
        [id, userId, content]
      );
      
      // Update thread's updated_at
      await pool.query(
        'UPDATE forum_threads SET updated_at = NOW() WHERE id = $1',
        [id]
      );
      
      res.status(201).json({ post: result.rows[0] });
    } catch (error) {
      console.error('Error creating post:', error);
      res.status(500).json({ error: 'Failed to create post' });
    }
  });
  
  // PUT /api/forum/threads/:id - Update thread (authenticated, author only)
  router.put('/threads/:id', authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const { title, content } = req.body;
      const userId = (req as any).user.id;
      
      // Check if user is the author
      const threadCheck = await pool.query(
        'SELECT user_id FROM forum_threads WHERE id = $1',
        [id]
      );
      
      if (threadCheck.rows.length === 0) {
        return res.status(404).json({ error: 'Thread not found' });
      }
      
      if (threadCheck.rows[0].user_id !== userId) {
        return res.status(403).json({ error: 'Not authorized to edit this thread' });
      }
      
      const result = await pool.query(
        `UPDATE forum_threads
         SET title = COALESCE($1, title),
             content = COALESCE($2, content),
             updated_at = NOW()
         WHERE id = $3
         RETURNING *`,
        [title, content, id]
      );
      
      res.json({ thread: result.rows[0] });
    } catch (error) {
      console.error('Error updating thread:', error);
      res.status(500).json({ error: 'Failed to update thread' });
    }
  });
  
  // DELETE /api/forum/threads/:id - Delete thread (authenticated, author only)
  router.delete('/threads/:id', authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const userId = (req as any).user.id;
      
      const threadCheck = await pool.query(
        'SELECT user_id FROM forum_threads WHERE id = $1',
        [id]
      );
      
      if (threadCheck.rows.length === 0) {
        return res.status(404).json({ error: 'Thread not found' });
      }
      
      if (threadCheck.rows[0].user_id !== userId) {
        return res.status(403).json({ error: 'Not authorized to delete this thread' });
      }
      
      await pool.query('DELETE FROM forum_threads WHERE id = $1', [id]);
      
      res.json({ message: 'Thread deleted successfully' });
    } catch (error) {
      console.error('Error deleting thread:', error);
      res.status(500).json({ error: 'Failed to delete thread' });
    }
  });
  
  // POST /api/forum/threads/:id/like - Like a thread (authenticated)
  router.post('/threads/:id/like', authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const userId = (req as any).user.id;
      
      await pool.query(
        `INSERT INTO forum_thread_likes (thread_id, user_id)
         VALUES ($1, $2)
         ON CONFLICT (thread_id, user_id) DO NOTHING`,
        [id, userId]
      );
      
      res.json({ message: 'Thread liked successfully' });
    } catch (error) {
      console.error('Error liking thread:', error);
      res.status(500).json({ error: 'Failed to like thread' });
    }
  });
  
  // DELETE /api/forum/threads/:id/like - Unlike a thread (authenticated)
  router.delete('/threads/:id/like', authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const userId = (req as any).user.id;
      
      await pool.query(
        'DELETE FROM forum_thread_likes WHERE thread_id = $1 AND user_id = $2',
        [id, userId]
      );
      
      res.json({ message: 'Thread unliked successfully' });
    } catch (error) {
      console.error('Error unliking thread:', error);
      res.status(500).json({ error: 'Failed to unlike thread' });
    }
  });
  
    */
});
export default router;
//# sourceMappingURL=forum.routes.js.map