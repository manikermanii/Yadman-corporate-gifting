import { Router } from 'express';
import { blogController } from '../controllers/blogController.js';
import { requireAdmin } from '../middleware/auth.js';

const router = Router();

// Public Blog
router.get('/posts', blogController.getPosts);
router.get('/posts/:slug', blogController.getPostBySlug);
router.get('/categories', blogController.getCategories);
router.get('/authors', blogController.getAuthors);

// Admin Blog
router.post('/admin/posts', requireAdmin, blogController.createPost);
router.put('/admin/posts/:id', requireAdmin, blogController.updatePost);
router.delete('/admin/posts/:id', requireAdmin, blogController.deletePost);

export default router;
