import express from 'express';
import multer from 'multer';
import * as uploadController from '../controllers/upload.controller.js';
import { protect, isVendor, isAdmin } from '../middleware/auth.middleware.js';

const router = express.Router();

// Multer configuration
const storage = multer.memoryStorage();

const imageFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Seules les images sont autorisées'), false);
  }
};

const fileFilter = (req, file, cb) => {
  // Accept all file types for digital products
  cb(null, true);
};

const uploadImage = multer({
  storage,
  fileFilter: imageFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

const uploadFile = multer({
  storage,
  fileFilter,
  limits: { fileSize: 500 * 1024 * 1024 } // 500MB
});

// Upload single image
router.post('/image', protect, uploadImage.single('image'), uploadController.uploadImage);

// Upload multiple images
router.post('/images', protect, uploadImage.array('images', 10), uploadController.uploadImages);

// Upload product file (vendor)
router.post('/product-file', protect, isVendor, uploadFile.single('file'), uploadController.uploadProductFile);

// Upload multiple product files (vendor)
router.post('/product-files', protect, isVendor, uploadFile.array('files', 10), uploadController.uploadProductFiles);

// Delete file
router.delete('/:publicId', protect, uploadController.deleteFile);

export default router;
