import express from 'express';
import * as templateController from '../controllers/template.controller.js';
import { protect, isVendor, isAdmin } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public routes
router.get('/', templateController.getTemplates);
router.get('/featured', templateController.getFeaturedTemplates);
router.get('/:slug', templateController.getTemplateBySlug);

// Vendor routes
router.post('/', protect, isVendor, templateController.createTemplate);
router.put('/:id', protect, isVendor, templateController.updateTemplate);
router.delete('/:id', protect, isVendor, templateController.deleteTemplate);

// Admin routes
router.put('/:id/status', protect, isAdmin, templateController.updateTemplateStatus);

export default router;
