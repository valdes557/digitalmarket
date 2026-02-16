import express from 'express';
import * as categoryController from '../controllers/category.controller.js';
import { protect, isAdmin, isAdminOrVendor } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public routes
router.get('/', categoryController.getCategories);
router.get('/:slug', categoryController.getCategoryBySlug);

// Vendor and Admin routes - vendors can create categories
router.post('/', protect, isAdminOrVendor, categoryController.createCategory);

// Admin only routes
router.put('/:id', protect, isAdmin, categoryController.updateCategory);
router.delete('/:id', protect, isAdmin, categoryController.deleteCategory);

export default router;
