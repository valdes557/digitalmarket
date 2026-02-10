import express from 'express';
import * as bannerController from '../controllers/banner.controller.js';
import { protect, isAdmin } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public routes
router.get('/', bannerController.getActiveBanners);
router.get('/position/:position', bannerController.getBannersByPosition);

// Admin routes
router.get('/all', protect, isAdmin, bannerController.getAllBanners);
router.post('/', protect, isAdmin, bannerController.createBanner);
router.put('/:id', protect, isAdmin, bannerController.updateBanner);
router.delete('/:id', protect, isAdmin, bannerController.deleteBanner);

export default router;
