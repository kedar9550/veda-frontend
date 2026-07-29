const paymentsService = require('./Payments.service');

exports.createOrder = async (req, res) => {
  try {
    const { amount, currency, receipt } = req.body;
    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    const order = await paymentsService.createOrder({ amount, currency, receipt });
    return res.json({ orderId: order.id, order });
  } catch (err) {
    console.error('Payments.createOrder error', err);
    return res.status(500).json({ error: 'Unable to create order', details: err.message });
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    const { order_id, payment_id, signature, amountInPaisa, amount, amountInRupees } = req.body;
    if (!order_id || !payment_id || !signature) {
      return res.status(400).json({ error: 'Missing verification fields' });
    }

    const valid = paymentsService.verifySignature({ order_id, payment_id, signature });
    if (!valid) return res.status(400).json({ error: 'Invalid signature' });

    const payment = await paymentsService.fetchPayment(payment_id);
    if (!payment) {
      return res.status(500).json({ error: 'Unable to fetch payment details' });
    }

    if (payment.order_id && payment.order_id !== order_id) {
      return res.status(400).json({ error: 'Payment order mismatch' });
    }

    // TODO: mark order as paid in DB or perform post-payment processing
    return res.json({
      ok: true,
      payment,
    });
  } catch (err) {
    console.error('Payments.verifyPayment error', err);
    return res.status(500).json({ error: 'Unable to verify payment', details: err.message });
  }
};
