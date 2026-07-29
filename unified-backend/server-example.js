// Example Express server showing how to mount the Payments module
// Copy relevant parts into your actual backend (CommonJS style)
require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const paymentsRouter = require('./modules/Payments/Payments.route');

// Mount payments routes under /api/razorpay
app.use('/api/razorpay', paymentsRouter);

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`Example backend listening on http://localhost:${port}`);
});
