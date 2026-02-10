import express from 'express';
import * as adminController from '../controllers/admin.controller.js';
import { protect, isAdmin } from '../middleware/auth.middleware.js';

const router = express.Router();

// All routes require admin
router.use(protect, isAdmin);

// Dashboard stats
router.get('/dashboard', adminController.getDashboardStats);

// Users management
router.get('/users', adminController.getUsers);
router.put('/users/:id', adminController.updateUser);
router.delete('/users/:id', adminController.deleteUser);

// Settings
router.get('/settings', adminController.getSettings);
router.put('/settings', adminController.updateSettings);

// Reports
router.get('/reports/sales', adminController.getSalesReport);
router.get('/reports/vendors', adminController.getVendorsReport);
router.get('/reports/products', adminController.getProductsReport);

export default router;
