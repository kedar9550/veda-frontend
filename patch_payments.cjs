const fs = require('fs');
const path = 'c:/Users/Mic_Lab/Documents/MIS_NEW/unified-backend/modules/Payments/Payments.controller.js';
let content = fs.readFileSync(path, 'utf8');

const replacement = `exports.createOrder = async (req, res) => {
  try {
    const { amount: frontendAmount, eventId, teamSize, extraTeamSize, currency, receipt } = req.body;
    let amountInPaisa = 0;

    if (eventId) {
      const Events = require('../Events/Events.model');
      const event = await Events.findById(eventId);
      if (!event) {
        return res.status(404).json({ error: 'Event not found' });
      }

      const baseAmount = Number(event.price) || 0;
      const extraPerHead = Number(event.extraAmountPerHead) || 0;
      const tSize = Number(teamSize) || 1;
      const eSize = Number(extraTeamSize) || 0;

      let totalBase = baseAmount;
      if (event.priceType && event.priceType.toLowerCase() === 'per head') {
        totalBase = baseAmount * tSize;
      }
      const totalAmount = totalBase + (eSize * extraPerHead);
      
      amountInPaisa = Math.round(totalAmount * 100);
    } else {
      amountInPaisa = Number(frontendAmount);
    }

    if (!amountInPaisa || typeof amountInPaisa !== 'number' || amountInPaisa <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    const order = await paymentsService.createOrder({ amount: amountInPaisa, currency, receipt });
    return res.json({ orderId: order.id, order, amountInPaisa });
  } catch (err) {`;

content = content.replace(/exports\.createOrder = async.*?catch \(err\) \{/s, replacement);
fs.writeFileSync(path, content, 'utf8');
console.log('Successfully patched using regex.');
