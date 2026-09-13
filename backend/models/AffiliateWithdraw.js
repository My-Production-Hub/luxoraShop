const mongoose = require('mongoose');

const AffiliateWithdrawSchema = new mongoose.Schema({
  affiliate: { type: mongoose.Schema.Types.ObjectId, ref: 'Affiliate', required: true },
  amount: { type: Number, required: true },
  bankName: { type: String, required: true },
  bankNumber: { type: String, required: true },
  accountName: { type: String, required: true },
  status: { type: String, enum: ['Pending', 'Completed', 'Rejected'], default: 'Pending' }
}, { timestamps: true });

module.exports = mongoose.model('AffiliateWithdraw', AffiliateWithdrawSchema);
