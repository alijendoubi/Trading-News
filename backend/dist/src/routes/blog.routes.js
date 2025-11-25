import { Router } from 'express';
// TODO: Migrate blog routes to Firestore
// These routes still use PostgreSQL and need migration
const router = Router();
// NOTE: Blog routes temporarily disabled - requires Firestore migration
router.get('/posts', async (req, res) => {
    res.status(503).json({ error: 'Blog feature not yet available' });
    return;
    /*
    try {
      const { category, tag, page = 1, limit = 10, status = 'published' } = req.query;
      const offset = (Number(page) - 1) * Number(limit);
      
      let query = `
        SELECT
          p.*,
          u.name as author_name,
          u.email as author_email,
          COUNT(DISTINCT c.id) as comment_count,
          COUNT(DISTINCT l.id) as like_count
        FROM blog_posts p
        LEFT JOIN users u ON p.user_id = u.id
        LEFT JOIN blog_comments c ON p.id = c.post_id
        LEFT JOIN blog_post_likes l ON p.id = l.post_id
        WHERE p.status = $1
      `;
      
      const params: any[] = [status];
      
      if (category) {
        query += ` AND p.category = $${params.length + 1}`;
        params.push(category);
      }
      
      if (tag) {
        query += ` AND $${params.length + 1} = ANY(p.tags)`;
        params.push(tag);
      }
      
      query += ` GROUP BY p.id, u.id ORDER BY p.published_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
      params.push(limit, offset);
      
      const result = await pool.query(query, params);
      
      // Get total count
      let countQuery = `SELECT COUNT(*) as total FROM blog_posts WHERE status = $1`;
      const countParams = [status];
      if (category) {
        countQuery += ` AND category = $2`;
        countParams.push(category);
      }
      const countResult = await pool.query(countQuery, countParams);
      
      res.json({
        posts: result.rows,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: parseInt(countResult.rows[0].total),
        },
      });
    } catch (error) {
      console.error('Error fetching blog posts:', error);
      res.status(500).json({ error: 'Failed to fetch blog posts' });
    }
  });
  
  // GET /api/blog/posts/:slug - Get single blog post
  router.get('/posts/:slug', async (req, res) => {
    try {
      const { slug } = req.params;
      
      const result = await pool.query(
        `SELECT
          p.*,
          u.name as author_name,
          u.email as author_email,
          COUNT(DISTINCT c.id) as comment_count,
          COUNT(DISTINCT l.id) as like_count
         FROM blog_posts p
         LEFT JOIN users u ON p.user_id = u.id
         LEFT JOIN blog_comments c ON p.id = c.post_id
         LEFT JOIN blog_post_likes l ON p.id = l.post_id
         WHERE p.slug = $1
         GROUP BY p.id, u.id`,
        [slug]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Post not found' });
      }
      
      // Increment view count
      await pool.query(
        'UPDATE blog_posts SET views = views + 1 WHERE slug = $1',
        [slug]
      );
      
      res.json({ post: result.rows[0] });
    } catch (error) {
      console.error('Error fetching blog post:', error);
      res.status(500).json({ error: 'Failed to fetch blog post' });
    }
  });
  
  // POST /api/blog/posts - Create new blog post (authenticated)
  router.post('/posts', authenticateToken, async (req, res) => {
    try {
      const { title, content, excerpt, category, tags, featured_image, status = 'draft' } = req.body;
      const userId = (req as any).user.id;
      
      if (!title || !content) {
        return res.status(400).json({ error: 'Title and content are required' });
      }
      
      const slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '') + '-' + Date.now();
      
      const published_at = status === 'published' ? new Date() : null;
      
      const result = await pool.query(
        `INSERT INTO blog_posts (user_id, title, slug, content, excerpt, category, tags, featured_image, status, published_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         RETURNING *`,
        [userId, title, slug, content, excerpt, category, tags || [], featured_image, status, published_at]
      );
      
      res.status(201).json({ post: result.rows[0] });
    } catch (error) {
      console.error('Error creating blog post:', error);
      res.status(500).json({ error: 'Failed to create blog post' });
    }
  });
  
  // PUT /api/blog/posts/:id - Update blog post (authenticated, author only)
  router.put('/posts/:id', authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const { title, content, excerpt, category, tags, featured_image, status } = req.body;
      const userId = (req as any).user.id;
      
      const postCheck = await pool.query(
        'SELECT user_id FROM blog_posts WHERE id = $1',
        [id]
      );
      
      if (postCheck.rows.length === 0) {
        return res.status(404).json({ error: 'Post not found' });
      }
      
      if (postCheck.rows[0].user_id !== userId) {
        return res.status(403).json({ error: 'Not authorized to edit this post' });
      }
      
      const published_at = status === 'published' && postCheck.rows[0].status !== 'published'
        ? new Date()
        : undefined;
      
      const result = await pool.query(
        `UPDATE blog_posts
         SET title = COALESCE($1, title),
             content = COALESCE($2, content),
             excerpt = COALESCE($3, excerpt),
             category = COALESCE($4, category),
             tags = COALESCE($5, tags),
             featured_image = COALESCE($6, featured_image),
             status = COALESCE($7, status),
             published_at = COALESCE($8, published_at),
             updated_at = NOW()
         WHERE id = $9
         RETURNING *`,
        [title, content, excerpt, category, tags, featured_image, status, published_at, id]
      );
      
      res.json({ post: result.rows[0] });
    } catch (error) {
      console.error('Error updating blog post:', error);
      res.status(500).json({ error: 'Failed to update blog post' });
    }
  });
  
  // DELETE /api/blog/posts/:id - Delete blog post (authenticated, author only)
  router.delete('/posts/:id', authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const userId = (req as any).user.id;
      
      const postCheck = await pool.query(
        'SELECT user_id FROM blog_posts WHERE id = $1',
        [id]
      );
      
      if (postCheck.rows.length === 0) {
        return res.status(404).json({ error: 'Post not found' });
      }
      
      if (postCheck.rows[0].user_id !== userId) {
        return res.status(403).json({ error: 'Not authorized to delete this post' });
      }
      
      await pool.query('DELETE FROM blog_posts WHERE id = $1', [id]);
      
      res.json({ message: 'Post deleted successfully' });
    } catch (error) {
      console.error('Error deleting blog post:', error);
      res.status(500).json({ error: 'Failed to delete blog post' });
    }
  });
  
  // GET /api/blog/posts/:postId/comments - Get comments for a post
  router.get('/posts/:postId/comments', async (req, res) => {
    try {
      const { postId } = req.params;
      
      const result = await pool.query(
        `SELECT
          c.*,
          u.name as author_name,
          u.email as author_email
         FROM blog_comments c
         LEFT JOIN users u ON c.user_id = u.id
         WHERE c.post_id = $1
         ORDER BY c.created_at ASC`,
        [postId]
      );
      
      res.json({ comments: result.rows });
    } catch (error) {
      console.error('Error fetching comments:', error);
      res.status(500).json({ error: 'Failed to fetch comments' });
    }
  });
  
  // POST /api/blog/posts/:postId/comments - Add comment (authenticated)
  router.post('/posts/:postId/comments', authenticateToken, async (req, res) => {
    try {
      const { postId } = req.params;
      const { content, parent_id } = req.body;
      const userId = (req as any).user.id;
      
      if (!content) {
        return res.status(400).json({ error: 'Content is required' });
      }
      
      const result = await pool.query(
        `INSERT INTO blog_comments (post_id, user_id, content, parent_id)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [postId, userId, content, parent_id || null]
      );
      
      res.status(201).json({ comment: result.rows[0] });
    } catch (error) {
      console.error('Error creating comment:', error);
      res.status(500).json({ error: 'Failed to create comment' });
    }
  });
  
  // POST /api/blog/posts/:postId/like - Like a post (authenticated)
  router.post('/posts/:postId/like', authenticateToken, async (req, res) => {
    try {
      const { postId } = req.params;
      const userId = (req as any).user.id;
      
      await pool.query(
        `INSERT INTO blog_post_likes (post_id, user_id)
         VALUES ($1, $2)
         ON CONFLICT (post_id, user_id) DO NOTHING`,
        [postId, userId]
      );
      
      res.json({ message: 'Post liked successfully' });
    } catch (error) {
      console.error('Error liking post:', error);
      res.status(500).json({ error: 'Failed to like post' });
    }
  });
  
    */
});
export default router;
//# sourceMappingURL=blog.routes.js.map