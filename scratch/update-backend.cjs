const fs = require('fs');
const file = 'c:/Users/Mic_Lab/Documents/MIS_NEW/unified-backend/modules/Payments/Payments.controller.js';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  'const { amount: frontendAmount, eventId, teamSize, extraTeamSize, currency, receipt } = req.body;',
  'const { amount: frontendAmount, eventId, teamSize, extraTeamSize, currency, receipt, participants, teamId } = req.body;'
);

const oldReg = `        const registration = new PaymentRegistration({
          eventId: eventId || '',
          eventName: eventName,
          category: category,
          amount: amountInPaisa / 100,
          amountRupees: amountInPaisa / 100,
          currency: currency || 'INR',
          teamSize: Number(teamSize) || 1,
          razorpayOrderId: order.id,
          razorpayPaymentId: 'PENDING',
          razorpaySignature: 'PENDING',
          paymentStatus: 'PENDING',
          verified: false,
        });`;

const newReg = `        const registration = new PaymentRegistration({
          eventId: eventId || '',
          eventName: eventName,
          category: category,
          amount: amountInPaisa / 100,
          amountRupees: amountInPaisa / 100,
          currency: currency || 'INR',
          teamSize: Number(teamSize) || 1,
          razorpayOrderId: order.id,
          razorpayPaymentId: 'PENDING',
          razorpaySignature: 'PENDING',
          paymentStatus: 'PENDING',
          verified: false,
          participants: participants || [],
          teamId: teamId || '',
        });`;

content = content.replace(oldReg, newReg);
fs.writeFileSync(file, content);
console.log('Successfully updated Payments.controller.js');
