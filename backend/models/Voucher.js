const mongoose = require('mongoose');

const VoucherSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true },
  name: { type: String, required: true },
  discountType: { type: String, enum: ['percent', 'fixed'], required: true }, // % or cash
  discountValue: { type: Number, required: true }, // e.g. 10 (%) or 100000 (VND)
  maxDiscount: { type: Number, default: 0 }, // Max discount in VND if percent
  minOrderValue: { type: Number, default: 0 }, // Minimum order value in VND
  quantity: { type: Number, required: true },
  usedQuantity: { type: Number, default: 0 },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  status: { type: String, enum: ['active', 'inactive', 'expired'], default: 'active' },
  targetType: { type: String, enum: ['all', 'category', 'brand', 'user'], default: 'all' },
  targetIds: [{ type: String }]
}, { timestamps: true });

module.exports = mongoose.model('Voucher', VoucherSchema);
