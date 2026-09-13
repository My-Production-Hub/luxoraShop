const mongoose = require('mongoose');

const MarketingAssetSchema = new mongoose.Schema({
  title: { type: String, required: true },
  type: { type: String, enum: ['Banner', 'Poster', 'ProductImage', 'Video', 'Template'], required: true },
  url: { type: String, required: true },
  thumbnail: { type: String },
  dimensions: { type: String, default: '1920x1080' },
  fileSize: { type: String, default: '2.5 MB' },
  downloadCount: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('MarketingAsset', MarketingAssetSchema);
