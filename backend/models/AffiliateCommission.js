const mongoose = require('mongoose');

const AffiliateCommissionSchema = new mongoose.Schema({
  affiliate: { type: mongoose.Schema.Types.ObjectId, ref: 'Affiliate', required: true },
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  commissionRate: { type: Number, required: true }, // e.g., 0.15 (15%)
  commissionAmount: { type: Number, required: true },
  status: { type: String, enum: ['Pending', 'Approved', 'Cancelled', 'Paid'], default: 'Pending' }
}, { timestamps: true });

module.exports = mongoose.model('AffiliateCommission', AffiliateCommissionSchema);
