const mongoose = require('mongoose');

const AuditLogSchema = new mongoose.Schema({
  adminUser: { type: String, required: true },
  action: { type: String, required: true },
  module: { type: String, required: true },
  details: { type: String, required: true },
  ipAddress: { type: String, default: '127.0.0.1' }
}, { timestamps: true });

module.exports = mongoose.model('AuditLog', AuditLogSchema);
