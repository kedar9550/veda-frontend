const path = require('path');
const crypto = require('crypto');
module.paths.push('C:/Users/USER/Downloads/Simhadri/projects/MIS/unified-backend/node_modules');

require('dotenv').config({ path: 'C:/Users/USER/Downloads/Simhadri/projects/MIS/unified-backend/.env' });
const mongoose = require('mongoose');

async function backfill() {
  await mongoose.connect(process.env.UnifiedDb);
  console.log('Connected to MongoDB');

  const PaymentRegistration = require('C:/Users/USER/Downloads/Simhadri/projects/MIS/unified-backend/modules/Payments/PaymentRegistration.model');

  // Find all PAID registrations
  const paidRegistrations = await PaymentRegistration.find({ paymentStatus: 'PAID' });
  console.log(`Total PAID registrations in database: ${paidRegistrations.length}`);

  let updatedDocsCount = 0;
  let totalBarcodesGenerated = 0;

  for (const doc of paidRegistrations) {
    if (!Array.isArray(doc.participants) || doc.participants.length === 0) continue;

    let docModified = false;
    doc.participants.forEach((p, idx) => {
      if (!p.barcode || typeof p.barcode !== 'string' || p.barcode.trim() === '') {
        const newBarcode = crypto.randomBytes(4).toString('hex').toUpperCase();
        p.barcode = newBarcode;
        docModified = true;
        totalBarcodesGenerated++;
      }
    });

    if (docModified) {
      doc.markModified('participants');
      await doc.save();
      updatedDocsCount++;
    }
  }

  console.log(`\nBackfill Summary:`);
  console.log(`Documents updated: ${updatedDocsCount}`);
  console.log(`Total barcodes generated: ${totalBarcodesGenerated}`);

  // Specifically check team VD26-M536QQ
  const targetDoc = await PaymentRegistration.findOne({ teamId: 'VD26-M536QQ' }).lean();
  console.log('\nVerification for team VD26-M536QQ:');
  if (targetDoc) {
    targetDoc.participants.forEach((p, i) => {
      console.log(`  Participant ${i + 1} (${p.name} - ${p.roll}): barcode = ${p.barcode}`);
    });
  } else {
    console.log('  Target team VD26-M536QQ not found');
  }

  // Double check remaining docs
  const remainingPaid = await PaymentRegistration.find({ paymentStatus: 'PAID' }).lean();
  let remainingMissing = 0;
  remainingPaid.forEach(d => {
    if (d.participants && d.participants.some(p => !p.barcode || p.barcode.trim() === '')) {
      remainingMissing++;
    }
  });

  console.log(`\nRemaining PAID documents with participants missing barcode: ${remainingMissing}`);

  await mongoose.disconnect();
  console.log('Disconnected from MongoDB');
}

backfill().catch(err => {
  console.error('Backfill error:', err);
  process.exit(1);
});
