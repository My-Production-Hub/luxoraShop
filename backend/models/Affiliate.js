const mongoose = require('mongoose');

const AffiliateSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  referralCode: { type: String, required: true, unique: true },
  referralLink: { type: String, required: true },
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected', 'Locked'], default: 'Pending' },
  totalClick: { type: Number, default: 0 },
  totalOrder: { type: Number, default: 0 },
  totalCommission: { type: Number, default: 0 },
  availableBalance: { type: Number, default: 0 },
  pendingBalance: { type: Number, default: 0 },
  paidBalance: { type: Number, default: 0 },
  bankInfo: {
    bankName: { type: String, default: '' },
    bankNumber: { type: String, default: '' },
    accountName: { type: String, default: '' }
  }
}, { timestamps: true });

module.exports = mongoose.model('Affiliate', AffiliateSchema);
