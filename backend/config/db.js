const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

const connectDB = async () => {
  try {
    const rawUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/luxora_shop';
    const uri = rawUri.trim().replace(/^["']|["']$/g, '');
    
    // Attempt standard connection with 2.5s timeout
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 2500 });
    console.log(`[Luxora DB] Connected to MongoDB at ${uri}`);
  } catch (error) {
    console.warn(`[Luxora DB Warning] Primary MongoDB connection failed (${error.message}). Launching embedded MongoDB memory server...`);
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const dbPath = path.join(__dirname, '../data/mongodb_data');
      if (!fs.existsSync(dbPath)) {
        fs.mkdirSync(dbPath, { recursive: true });
      }

      const mongod = await MongoMemoryServer.create({
        instance: {
          dbPath: dbPath,
          storageEngine: 'wiredTiger'
        }
      });
      const mongoUri = mongod.getUri();
      await mongoose.connect(mongoUri);
      console.log(`[Luxora DB] Connected to Embedded MongoDB Server at ${mongoUri} (Persistent Data: ${dbPath})`);
    } catch (memErr) {
      console.error(`[Luxora DB Error] Could not start embedded MongoDB: ${memErr.message}`);
    }
  }

  // Check if DB is empty and auto-seed initial data
  try {
    const Product = require('../models/Product');
    const Order = require('../models/Order');
    const pCount = await Product.countDocuments();
    const oCount = await Order.countDocuments();
    if (pCount === 0 || oCount === 0) {
      console.log('[Luxora DB] CSDL missing products or orders. Auto-seeding initial dataset...');
      const seedData = require('../scripts/seed');
      await seedData();
    }
  } catch (seedErr) {
    console.warn('[Luxora DB] Auto-seed check error:', seedErr.message);
  }
};

module.exports = connectDB;
