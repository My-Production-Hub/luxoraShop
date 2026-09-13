const mongoose = require('mongoose');

const InventoryLogSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  productId: { type: String, required: true },
  productName: { type: String, required: true },
  brand: { type: String, default: '' },
  scent: { type: String, default: '' },
  concentration: { type: String, default: '' },
  volume: { type: String, default: '' },
  quantity: { type: Number, required: true },
  importPrice: { type: Number, required: true },
  sellingPrice: { type: Number, default: 0 },
  image: { type: String, default: '' },
  date: { type: String, required: true },
  note: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('InventoryLog', InventoryLogSchema);
