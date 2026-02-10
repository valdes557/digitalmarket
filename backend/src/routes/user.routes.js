import express from 'express';
import * as userController from '../controllers/user.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect);

// Profile
router.get('/profile', userController.getProfile);
router.put('/profile', userController.updateProfile);
router.put('/password', userController.changePassword);
router.put('/avatar', userController.updateAvatar);

// Wishlist
router.get('/wishlist', userController.getWishlist);
router.post('/wishlist/:productId', userController.addToWishlist);
router.delete('/wishlist/:productId', userController.removeFromWishlist);

// Cart
router.get('/cart', userController.getCart);
router.post('/cart', userController.addToCart);
router.delete('/cart/:productId', userController.removeFromCart);
router.delete('/cart', userController.clearCart);

export default router;
