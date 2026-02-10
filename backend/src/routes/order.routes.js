import express from 'express';
import * as orderController from '../controllers/order.controller.js';
import { protect, isAdmin } from '../middleware/auth.middleware.js';

const router = express.Router();

// Protected routes
router.get('/my-orders', protect, orderController.getMyOrders);
router.get('/my-orders/:id', protect, orderController.getOrderDetails);
router.get('/my-downloads', protect, orderController.getMyDownloads);

// Admin routes
router.get('/', protect, isAdmin, orderController.getAllOrders);
router.get('/stats', protect, isAdmin, orderController.getOrderStats);
router.get('/:id', protect, isAdmin, orderController.getOrderById);

export default router;
