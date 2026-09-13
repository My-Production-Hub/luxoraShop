const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, default: '' },
  province: { type: String, default: '' },
  district: { type: String, default: '' },
  detailAddress: { type: String, default: '' },
  avatar: { type: String, default: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150' },
  role: { type: String, enum: ['customer', 'affiliate', 'admin', 'staff'], default: 'customer' },
  status: { type: String, enum: ['active', 'locked'], default: 'active' },
  googleId: { type: String, default: null },
  provider: { type: String, enum: ['email', 'google'], default: 'email' },
  address: [{
    recipient: String,
    phone: String,
    street: String,
    city: String,
    district: String,
    isDefault: Boolean
  }],
  wishlist: { type: mongoose.Schema.Types.Mixed, default: [] },
  cart: { type: mongoose.Schema.Types.Mixed, default: [] }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
