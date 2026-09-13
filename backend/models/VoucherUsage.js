const mongoose = require('mongoose');

const VoucherUsageSchema = new mongoose.Schema({
  voucher: { type: mongoose.Schema.Types.ObjectId, ref: 'Voucher', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  discountAmount: { type: Number, required: true },
  usedAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('VoucherUsage', VoucherUsageSchema);
