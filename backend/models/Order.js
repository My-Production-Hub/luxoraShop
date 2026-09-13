const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  orderCode: { type: String, required: true, unique: true },
  user: { type: mongoose.Schema.Types.Mixed },
  customerName: { type: String, required: true },
  customerEmail: { type: String, required: true },
  customerPhone: { type: String, required: true },
  shippingAddress: { type: String, required: true },
  items: [{
    product: { type: mongoose.Schema.Types.Mixed },
    name: String,
    image: String,
    volume: String,
    scent: String,
    price: Number,
    quantity: Number
  }],
  subtotal: { type: Number, required: true },
  shippingFee: { type: Number, default: 30000 },
  voucherCode: { type: String, default: '' },
  discountAmount: { type: Number, default: 0 },
  totalAmount: { type: Number, required: true },
  paymentMethod: { type: String, default: 'COD' },
  paymentStatus: { type: String, default: 'Pending' },
  orderStatus: { type: String, default: 'Chờ xác nhận' },
  affiliateId: { type: mongoose.Schema.Types.Mixed },
  affiliateCommission: { type: Number, default: 0 },
  notes: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Order', OrderSchema);
