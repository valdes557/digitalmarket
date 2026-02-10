import express from 'express';
import * as paymentController from '../controllers/payment.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// Initialize payment
router.post('/initialize', protect, paymentController.initializePayment);

// CinetPay routes
router.post('/cinetpay/webhook', paymentController.cinetpayWebhook);
router.get('/cinetpay/verify/:transaction_id', paymentController.verifyCinetpayPayment);

// Card payment routes
router.post('/card/initialize', protect, paymentController.initializeCardPayment);
router.post('/card/webhook', paymentController.cardPaymentWebhook);

// Check payment status
router.get('/status/:order_number', protect, paymentController.checkPaymentStatus);

export default router;
