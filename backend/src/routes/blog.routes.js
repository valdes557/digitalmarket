import express from 'express';
import * as blogController from '../controllers/blog.controller.js';
import { protect, isAdmin } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public routes
router.get('/posts', blogController.getPosts);
router.get('/posts/featured', blogController.getFeaturedPosts);
router.get('/posts/:slug', blogController.getPostBySlug);
router.get('/categories', blogController.getBlogCategories);

// Admin routes
router.post('/posts', protect, isAdmin, blogController.createPost);
router.put('/posts/:id', protect, isAdmin, blogController.updatePost);
router.delete('/posts/:id', protect, isAdmin, blogController.deletePost);
router.post('/categories', protect, isAdmin, blogController.createBlogCategory);
router.put('/categories/:id', protect, isAdmin, blogController.updateBlogCategory);
router.delete('/categories/:id', protect, isAdmin, blogController.deleteBlogCategory);

export default router;
