import express from 'express';
import * as downloadController from '../controllers/download.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// Get download link
router.post('/generate', protect, downloadController.generateDownloadLink);

// Download file (with token verification)
router.get('/file/:token', downloadController.downloadFile);

// Get download history
router.get('/history', protect, downloadController.getDownloadHistory);

export default router;
