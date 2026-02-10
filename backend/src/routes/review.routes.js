import express from 'express';
import * as reviewController from '../controllers/review.controller.js';
import { protect, isVendor } from '../middleware/auth.middleware.js';

const router = express.Router();

// Get reviews for a product
router.get('/product/:productId', reviewController.getProductReviews);

// Create review (must have purchased)
router.post('/', protect, reviewController.createReview);

// Update review
router.put('/:id', protect, reviewController.updateReview);

// Delete review
router.delete('/:id', protect, reviewController.deleteReview);

// Vendor reply
router.post('/:id/reply', protect, isVendor, reviewController.vendorReply);

export default router;
