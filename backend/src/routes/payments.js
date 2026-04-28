const express = require('express');
const router = express.Router();
const { createOrder, verifyPayment, refundPayment, handleWebhook } = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');

router.post('/create-order', protect, createOrder);
router.post('/verify', protect, verifyPayment);
router.post('/refund', protect, refundPayment);

// Webhook - NO auth middleware (Razorpay calls this directly, verified via signature)
router.post('/webhook', handleWebhook);

module.exports = router;
