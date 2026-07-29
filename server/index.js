require('dotenv').config();
const express = require('express');
const Razorpay = require('razorpay');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

const port = process.env.PORT || 4000;

if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  console.warn('Warning: RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET not set. Order creation will fail.');
}

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

app.post('/api/razorpay/create-order', async (req, res) => {
  try {
    const amountValue = req.body.amountInPaisa ?? req.body.amount;
    const { currency = 'INR', receipt } = req.body;
    const amount = Number(amountValue);

    if (!Number.isFinite(amount) || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    const options = {
      amount,
      currency,
      receipt: receipt || `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);
    return res.json({ orderId: order.id, order });
  } catch (err) {
    console.error('Error creating razorpay order', err);
    return res.status(500).json({ error: 'Unable to create order', details: err.message });
  }
});

app.post('/api/razorpay/verify-payment', async (req, res) => {
  try {
    const { order_id, payment_id, signature, amountInPaisa, amount, amountInRupees } = req.body;

    if (!order_id || !payment_id || !signature) {
      return res.status(400).json({ error: 'Missing verification fields' });
    }

    const normalizedAmount = Number(amountInPaisa ?? amount ?? 0);
    const normalizedRupees = Number(amountInRupees ?? (normalizedAmount / 100));

    return res.json({
      ok: true,
      paymentId: payment_id,
      orderId: order_id,
      amount: normalizedAmount,
      amountInPaisa: normalizedAmount,
      amountInRupees: normalizedRupees,
    });
  } catch (err) {
    console.error('Error verifying razorpay payment', err);
    return res.status(500).json({ error: 'Unable to verify payment', details: err.message });
  }
});

app.listen(port, () => {
  console.log(`Razorpay demo server listening on http://localhost:${port}`);
});
