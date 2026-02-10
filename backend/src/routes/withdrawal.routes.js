import express from 'express';
import * as withdrawalController from '../controllers/withdrawal.controller.js';
import { protect, isVendor, isAdmin } from '../middleware/auth.middleware.js';

const router = express.Router();

// Vendor routes
router.get('/my-withdrawals', protect, isVendor, withdrawalController.getMyWithdrawals);
router.get('/balance', protect, isVendor, withdrawalController.getBalance);
router.post('/request', protect, isVendor, withdrawalController.requestWithdrawal);

// Admin routes
router.get('/', protect, isAdmin, withdrawalController.getAllWithdrawals);
router.put('/:id/process', protect, isAdmin, withdrawalController.processWithdrawal);

export default router;
