import express from 'express';
import { body } from 'express-validator';
import * as vendorController from '../controllers/vendor.controller.js';
import { protect, isVendor, isAdmin } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public routes
router.get('/', vendorController.getVendors);
router.get('/:slug', vendorController.getVendorBySlug);
router.get('/:slug/products', vendorController.getVendorProducts);

// Apply to become vendor
router.post('/apply', protect, [
  body('store_name').notEmpty().withMessage('Le nom de la boutique est requis'),
  body('store_description').notEmpty().withMessage('La description est requise')
], vendorController.applyAsVendor);

// Protected vendor routes
router.get('/me/dashboard', protect, isVendor, vendorController.getVendorDashboard);
router.get('/me/products', protect, isVendor, vendorController.getMyProducts);
router.get('/me/orders', protect, isVendor, vendorController.getMyOrders);
router.get('/me/stats', protect, isVendor, vendorController.getMyStats);
router.put('/me/profile', protect, isVendor, vendorController.updateVendorProfile);

// Admin routes
router.get('/admin/requests', protect, isAdmin, vendorController.getVendorRequests);
router.put('/admin/requests/:id', protect, isAdmin, vendorController.processVendorRequest);
router.get('/admin/all', protect, isAdmin, vendorController.getAllVendors);
router.put('/admin/:id/status', protect, isAdmin, vendorController.updateVendorStatus);

export default router;
