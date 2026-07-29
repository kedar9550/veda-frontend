const express = require('express');
const router = express.Router();
const paymentsController = require('./Payments.controller');

// Create a new Razorpay order
router.post('/create-order', paymentsController.createOrder);

// Verify a completed payment (signature verification)
router.post('/verify-payment', paymentsController.verifyPayment);

module.exports = router;
