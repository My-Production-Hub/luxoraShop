const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  brand: { type: String, required: true },
  category: { type: String, required: true },
  price: { type: Number, required: true },
  originalPrice: { type: Number },
  discountPercent: { type: Number, default: 0 },
  volume: { type: String, required: true }, // e.g. "100ml", "50ml", "30ml"
  availableVolumes: [{ type: String }],
  volumeOptions: [{
    volume: { type: String },
    price: { type: Number },
    originalPrice: { type: Number },
    flashSalePrice: { type: Number },
    stock: { type: Number, default: 0 }
  }],
  availableScents: [{ type: String }],
  gender: { type: String, enum: ['Nam', 'Nữ', 'Unisex'], default: 'Unisex' },
  origin: { type: String, default: 'Pháp' }, // e.g. "Pháp", "Ý", "Mỹ"
  concentration: { type: String, default: 'EDP' }, // e.g. "EDP", "EDT", "Parfum", "Extrait"
  image: { type: String, required: true },
  gallery: [{ type: String }],
  videoUrl: { type: String, default: '' },
  description: { type: String, required: true },
  ingredients: { type: String, default: '' },
  benefits: { type: String, default: '' },
  fragranceNotes: {
    top: String,
    middle: String,
    base: String
  },
  stock: { type: Number, default: 50 },
  soldCount: { type: Number, default: 0 },
  rating: { type: Number, default: 4.8 },
  reviewCount: { type: Number, default: 0 },
  isFeatured: { type: Boolean, default: false },
  isFlashSale: { type: Boolean, default: false },
  flashSaleEndTime: { type: String },
  flashSalePrice: { type: Number },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' }
}, { timestamps: true });

module.exports = mongoose.model('Product', ProductSchema);
