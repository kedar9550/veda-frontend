require('dotenv').config();
const express = require('express');
const Razorpay = require('razorpay');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(express.json());
app.use(cors());
app.use('/othercollegephotos', express.static(path.join(__dirname, 'othercollegephotos')));

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = path.join(__dirname, 'othercollegephotos');
    if (!fs.existsSync(dir)){
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname) || '.jpg';
    cb(null, req.body.rollnumber + ext);
  }
});
const upload = multer({ storage: storage });

const port = process.env.PORT || 4000;

if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  console.warn('Warning: RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET not set. Order creation will fail.');
}

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'dummy_key_id',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'dummy_key_secret',
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

app.post('/api/razorpay/registrations/photo', upload.single('photo'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  return res.json({ message: 'Photo uploaded successfully', filename: req.file.filename });
});

app.get('/api/razorpay/registrations/photo/:rollnumber', (req, res) => {
  const dir = path.join(__dirname, 'othercollegephotos');
  const files = fs.existsSync(dir) ? fs.readdirSync(dir) : [];
  const rollnumber = req.params.rollnumber;
  const match = files.find(f => f.startsWith(rollnumber + '.'));
  if (match) {
    return res.json({ exists: true, url: `/othercollegephotos/${match}` });
  }
  return res.json({ exists: false });
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
