import { Router } from 'express';
import { getDb } from '../config/firestore.js';
import { authMiddleware as authenticateToken } from '../middleware/auth.js';
import admin from 'firebase-admin';

const router = Router();

// GET /api/blog/posts - Get all blog posts
router.get('/posts', async (req, res) => {
  try {
    const { category, tag, page = 1, limit = 10, status = 'published' } = req.query;
    const offset = (Number(page) - 1) * Number(limit);
    
    const db = getDb();
    let query = db.collection('blog_posts').where('status', '==', status);
    
    if (category) {
      query = query.where('category', '==', category);
    }
    
    if (tag) {
      query = query.where('tags', 'array-contains', tag);
    }
    
    // Get paginated results
    const snapshot = await query
      .orderBy('published_at', 'desc')
      .limit(Number(limit))
      .offset(offset)
      .get();
    
    const posts = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    
    // Get total count only if we have results
    let total = posts.length;
    if (posts.length === Number(limit)) {
      try {
        const countSnapshot = await query.count().get();
        total = countSnapshot.data().count;
      } catch (countError) {
        total = posts.length;
      }
    }
    
    res.json({
      posts,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
      },
    });
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    res.json({ posts: [], pagination: { page: 1, limit: 10, total: 0 } });
  }
});

// GET /api/blog/posts/:slug - Get single blog post
router.get('/posts/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const db = getDb();
    
    const snapshot = await db.collection('blog_posts')
      .where('slug', '==', slug)
      .limit(1)
      .get();
    
    if (snapshot.empty) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    const doc = snapshot.docs[0];
    const post = { id: doc.id, ...doc.data() };
    
    // Increment view count
    await doc.ref.update({
      views: admin.firestore.FieldValue.increment(1)
    });
    
    res.json({ post });
  } catch (error) {
    console.error('Error fetching blog post:', error);
    res.status(500).json({ error: 'Failed to fetch blog post' });
  }
});

// POST /api/blog/posts - Create new blog post (authenticated)
router.post('/posts', authenticateToken, async (req, res) => {
  try {
    const { title, content, excerpt, category, tags, featured_image, status = 'draft' } = req.body;
    const userId = (req as any).userId;
    
    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }
    
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') + '-' + Date.now();
    
    const db = getDb();
    const docRef = await db.collection('blog_posts').add({
      user_id: userId,
      title,
      slug,
      content,
      excerpt,
      category,
      tags: tags || [],
      featured_image,
      status,
      published_at: status === 'published' ? admin.firestore.FieldValue.serverTimestamp() : null,
      views: 0,
      created_at: admin.firestore.FieldValue.serverTimestamp(),
      updated_at: admin.firestore.FieldValue.serverTimestamp(),
    });
    
    const doc = await docRef.get();
    res.status(201).json({ post: { id: doc.id, ...doc.data() } });
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
    const userId = (req as any).userId;
    
    const db = getDb();
    const docRef = db.collection('blog_posts').doc(id);
    const doc = await docRef.get();
    
    if (!doc.exists) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    const postData = doc.data();
    if (postData?.user_id !== userId) {
      return res.status(403).json({ error: 'Not authorized to edit this post' });
    }
    
    const updateData: any = {
      updated_at: admin.firestore.FieldValue.serverTimestamp(),
    };
    
    if (title) updateData.title = title;
    if (content) updateData.content = content;
    if (excerpt) updateData.excerpt = excerpt;
    if (category) updateData.category = category;
    if (tags) updateData.tags = tags;
    if (featured_image) updateData.featured_image = featured_image;
    if (status) {
      updateData.status = status;
      if (status === 'published' && postData?.status !== 'published') {
        updateData.published_at = admin.firestore.FieldValue.serverTimestamp();
      }
    }
    
    await docRef.update(updateData);
    const updatedDoc = await docRef.get();
    
    res.json({ post: { id: updatedDoc.id, ...updatedDoc.data() } });
  } catch (error) {
    console.error('Error updating blog post:', error);
    res.status(500).json({ error: 'Failed to update blog post' });
  }
});

// DELETE /api/blog/posts/:id - Delete blog post (authenticated, author only)
router.delete('/posts/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = (req as any).userId;
    
    const db = getDb();
    const docRef = db.collection('blog_posts').doc(id);
    const doc = await docRef.get();
    
    if (!doc.exists) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    if (doc.data()?.user_id !== userId) {
      return res.status(403).json({ error: 'Not authorized to delete this post' });
    }
    
    await docRef.delete();
    
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
    const db = getDb();
    
    const snapshot = await db.collection('blog_comments')
      .where('post_id', '==', postId)
      .orderBy('created_at', 'asc')
      .get();
    
    const comments = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    
    res.json({ comments });
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
    const userId = (req as any).userId;
    
    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }
    
    const db = getDb();
    const docRef = await db.collection('blog_comments').add({
      post_id: postId,
      user_id: userId,
      content,
      parent_id: parent_id || null,
      created_at: admin.firestore.FieldValue.serverTimestamp(),
      updated_at: admin.firestore.FieldValue.serverTimestamp(),
    });
    
    const doc = await docRef.get();
    res.status(201).json({ comment: { id: doc.id, ...doc.data() } });
  } catch (error) {
    console.error('Error creating comment:', error);
    res.status(500).json({ error: 'Failed to create comment' });
  }
});

// POST /api/blog/posts/:postId/like - Like a post (authenticated)
router.post('/posts/:postId/like', authenticateToken, async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = (req as any).userId;
    
    const db = getDb();
    
    // Check if already liked
    const existing = await db.collection('blog_post_likes')
      .where('post_id', '==', postId)
      .where('user_id', '==', userId)
      .limit(1)
      .get();
    
    if (!existing.empty) {
      return res.json({ message: 'Post already liked' });
    }
    
    await db.collection('blog_post_likes').add({
      post_id: postId,
      user_id: userId,
      created_at: admin.firestore.FieldValue.serverTimestamp(),
    });
    
    res.json({ message: 'Post liked successfully' });
  } catch (error) {
    console.error('Error liking post:', error);
    res.status(500).json({ error: 'Failed to like post' });
  }
});

export default router;
