const mongoose = require('mongoose');

const AffiliateClickSchema = new mongoose.Schema({
  affiliate: { type: mongoose.Schema.Types.ObjectId, ref: 'Affiliate', required: true },
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  ipAddress: { type: String, default: '127.0.0.1' },
  device: { type: String, default: 'Desktop Web Browser' },
  clickTime: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('AffiliateClick', AffiliateClickSchema);
