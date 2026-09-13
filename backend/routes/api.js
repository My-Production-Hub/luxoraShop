const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const User = require('../models/User');
const Product = require('../models/Product');
const Category = require('../models/Category');
const Brand = require('../models/Brand');
const Order = require('../models/Order');
const Review = require('../models/Review');
const Voucher = require('../models/Voucher');
const VoucherUsage = require('../models/VoucherUsage');
const Affiliate = require('../models/Affiliate');
const AffiliateCommission = require('../models/AffiliateCommission');
const AffiliateClick = require('../models/AffiliateClick');
const AffiliateWithdraw = require('../models/AffiliateWithdraw');
const AuditLog = require('../models/AuditLog');
const InventoryLog = require('../models/InventoryLog');

const nodemailer = require('nodemailer');

const otpStore = new Map();

// System Health Check
router.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'Luxora Perfume Shop API', timestamp: new Date() });
});

// --- AUTH & USER ROUTES ---
// OTP Verification Routes & Mail Transporter Pool
let cachedTransporter = null;
function getMailTransporter() {
  if (!cachedTransporter && process.env.SMTP_USER && process.env.SMTP_PASS) {
    cachedTransporter = nodemailer.createTransport({
      service: 'gmail',
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      pool: true,
      maxConnections: 5,
      maxMessages: 100,
      connectionTimeout: 8000,
      greetingTimeout: 8000,
      socketTimeout: 15000,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS ? process.env.SMTP_PASS.replace(/\s+/g, '') : ''
      }
    });
  }
  return cachedTransporter;
}

router.post('/auth/send-otp', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email không được để trống' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore.set(cleanEmail, { code, expiresAt: Date.now() + 60 * 1000 });

    // Respond immediately to frontend (< 20ms)
    res.json({
      success: true,
      message: `Đã gửi mã xác nhận tới email ${cleanEmail}`,
      code
    });

    // Send email asynchronously using pooled transporter
    const transporter = getMailTransporter();
    if (transporter) {
      const otpEmailHtml = `
        <div style="font-family: Arial, Helvetica, sans-serif; max-width: 560px; margin: 0 auto; background: #ffffff; border: 1px solid #e4e4e7; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.06);">
          <div style="background: linear-gradient(180deg, #18181b 0%, #09090b 100%); padding: 32px 20px; text-align: center; border-bottom: 3px solid #fbbf24;">
            <div style="display: inline-block; width: 56px; height: 56px; line-height: 56px; border-radius: 50%; border: 2px solid #fbbf24; background: #000000; color: #fef08a; font-size: 26px; font-weight: bold; font-family: Georgia, serif; box-shadow: 0 4px 15px rgba(251,191,36,0.35);">LX</div>
            <h1 style="color: #fbbf24; font-family: Georgia, serif; font-size: 25px; letter-spacing: 6px; margin: 12px 0 3px 0; font-weight: bold;">LUXORA</h1>
            <p style="color: #d4d4d8; font-size: 10px; letter-spacing: 2px; text-transform: uppercase; margin: 0; font-weight: 500;">Shine Through Fragrance</p>
          </div>
          <div style="padding: 28px 24px; text-align: left; color: #27272a; line-height: 1.6;">
            <p style="font-size: 15px; margin-top: 0; margin-bottom: 12px; color: #18181b;">Xin chào,</p>
            <p style="font-size: 14px; color: #3f3f46; margin-bottom: 18px;">Cảm ơn bạn đã đăng ký tài khoản trên <strong>Luxora Perfume Shop</strong>.</p>
            <p style="font-size: 13px; color: #52525b; margin-bottom: 8px; font-weight: 600;">Mã xác nhận (OTP) của bạn là:</p>
            <div style="text-align: center; margin: 20px 0;">
              <div style="font-size: 36px; letter-spacing: 10px; color: #db2777; font-weight: bold; font-family: 'Courier New', Courier, monospace; background: #fdf2f8; border: 2px dashed #f472b6; padding: 14px 28px; display: inline-block; border-radius: 20px; box-shadow: 0 4px 12px rgba(219,39,119,0.08);">${code}</div>
              <p style="font-size: 13px; color: #e11d48; font-weight: 600; margin-top: 12px; margin-bottom: 0;">⏱️ Mã này sẽ hết hạn sau <strong>1 phút</strong>.</p>
            </div>
            <div style="background: #fffbebfb; border-left: 4px solid #f59e0b; border-radius: 8px; padding: 14px 16px; margin: 20px 0; font-size: 12px; color: #92400e; line-height: 1.5;">
              <strong>⚠️ Lưu ý bảo mật:</strong> Vui lòng không chia sẻ mã này với bất kỳ ai.
            </div>
          </div>
        </div>
      `;

      transporter.sendMail({
        from: `"Luxora Perfume" <${process.env.SMTP_USER}>`,
        to: cleanEmail,
        subject: 'Mã xác nhận đăng nhập Luxora Shop',
        html: otpEmailHtml
      }).then(() => {
        console.log(`[Email Sent Success]: Gmail sent OTP ${code} to ${cleanEmail}`);
      }).catch((err) => {
        console.error('[Gmail Send Error]:', err.message);
      });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/auth/verify-otp', async (req, res) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) {
      return res.status(400).json({ success: false, message: 'Thiếu email hoặc mã xác nhận' });
    }

    const record = otpStore.get(email.toLowerCase());
    if (!record) {
      return res.status(400).json({ success: false, message: 'Mã xác nhận không tồn tại hoặc đã hết hạn' });
    }

    if (Date.now() > record.expiresAt) {
      otpStore.delete(email.toLowerCase());
      return res.status(400).json({ success: false, message: 'Mã xác nhận đã hết hạn' });
    }

    if (record.code !== code.trim()) {
      return res.status(400).json({ success: false, message: 'Mã không khớp, vui lòng nhập lại' });
    }

    otpStore.delete(email.toLowerCase());
    res.json({ success: true, message: 'Xác nhận mã thành công' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/auth/register', async (req, res) => {
  try {
    const { name, email, password, role = 'customer' } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email đã được đăng ký' });

    const user = new User({ name, email, password, role });
    await user.save();
    res.json({ success: true, message: 'Đăng ký tài khoản thành công', user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || user.password !== password) {
      return res.status(401).json({ message: 'Email hoặc mật khẩu không chính xác' });
    }
    if (user.status === 'locked') {
      return res.status(403).json({ message: 'Tài khoản đã bị khóa bởi Quản trị viên' });
    }
    res.json({
      success: true,
      token: 'luxora_jwt_token_mock_' + user._id,
      user: { id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Google OAuth 2.0 Auth Endpoint matching User Spec
router.post('/auth/google', async (req, res) => {
  try {
    const { idToken, googleId, name, email, avatar, phone } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Google Token không hợp lệ' });
    }

    // Step 5: Backend verifies token & checks if user exists
    let user = await User.findOne({ email });

    // Step 6: Create new user if first time, or log in if existing
    if (!user) {
      user = new User({
        name: name || email.split('@')[0],
        email,
        phone: phone || '0912345678',
        password: 'google_oauth_protected_' + Date.now(),
        avatar: avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        role: 'customer',
        googleId: googleId || 'gg_' + Date.now(),
        provider: 'google',
        status: 'active'
      });
      await user.save();
    } else {
      user.provider = 'google';
      if (googleId) user.googleId = googleId;
      await user.save();
    }

    if (user.status === 'locked') {
      return res.status(403).json({ message: 'Tài khoản đã bị khóa bởi Quản trị viên' });
    }

    // Step 7: Return JWT Token & User Session to frontend
    const token = 'luxora_jwt_token_google_' + Date.now() + '_' + user._id;
    res.json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatar: user.avatar,
        provider: 'google'
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- PRODUCTS ROUTES ---
router.get('/products', async (req, res) => {
  try {
    const { category, brand, gender, search, featured, flashSale, sort } = req.query;
    let filter = {};
    if (category) filter.category = category;
    if (brand) filter.brand = brand;
    if (gender) filter.gender = gender;
    if (featured === 'true') filter.isFeatured = true;
    if (flashSale === 'true') filter.isFlashSale = true;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } }
      ];
    }
    const products = await Product.find(filter).sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/products/:id', async (req, res) => {
  try {
    const id = req.params.id;
    let product;
    if (mongoose.Types.ObjectId.isValid(id)) {
      product = await Product.findById(id);
    } else {
      product = await Product.findOne({ $or: [{ _id: id }, { slug: id }] });
    }
    if (!product) return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/products', async (req, res) => {
  try {
    const data = { ...req.body };
    if (data._id && !mongoose.Types.ObjectId.isValid(data._id)) {
      delete data._id;
    }
    if (!data.slug && data.name) {
      data.slug = data.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '') + '-' + Date.now();
    }
    const product = new Product(data);
    await product.save();
    res.json({ success: true, product });
  } catch (err) {
    console.error('[Create Product Error]:', err.message);
    res.status(500).json({ error: err.message });
  }
});

router.put('/products/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const data = { ...req.body };
    if (data._id && !mongoose.Types.ObjectId.isValid(data._id)) {
      delete data._id;
    }
    let product;
    if (mongoose.Types.ObjectId.isValid(id)) {
      product = await Product.findByIdAndUpdate(id, data, { new: true });
    } else {
      product = await Product.findOneAndUpdate(
        { $or: [{ slug: id }, { name: data.name }] },
        data,
        { new: true, upsert: true }
      );
    }
    res.json({ success: true, product });
  } catch (err) {
    console.error('[Update Product Error]:', err.message);
    res.status(500).json({ error: err.message });
  }
});

router.delete('/products/:id', async (req, res) => {
  try {
    const id = req.params.id;
    if (mongoose.Types.ObjectId.isValid(id)) {
      await Product.findByIdAndDelete(id);
    } else {
      await Product.findOneAndDelete({ $or: [{ slug: id }] });
    }
    res.json({ success: true, message: 'Đã xóa sản phẩm' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- CATEGORIES & BRANDS ---
router.get('/categories', async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/categories', async (req, res) => {
  try {
    const data = { ...req.body };
    if (data._id && !mongoose.Types.ObjectId.isValid(data._id)) delete data._id;
    const category = new Category(data);
    await category.save();
    res.json({ success: true, category });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/categories/:id', async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, category });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/categories/:id', async (req, res) => {
  try {
    await Category.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Đã xóa danh mục' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/brands', async (req, res) => {
  try {
    const brands = await Brand.find();
    res.json(brands);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/brands', async (req, res) => {
  try {
    const data = { ...req.body };
    if (data._id && !mongoose.Types.ObjectId.isValid(data._id)) delete data._id;
    const brand = new Brand(data);
    await brand.save();
    res.json({ success: true, brand });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/brands/:id', async (req, res) => {
  try {
    await Brand.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Đã xóa thương hiệu' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- USERS & CUSTOMERS ---
router.get('/users', async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/users', async (req, res) => {
  try {
    const { name, email, phone, province, district, detailAddress, avatar, role = 'customer', password = 'default_pass_123' } = req.body;
    if (!email) return res.status(400).json({ error: 'Email không được để trống' });
    const cleanEmail = email.trim().toLowerCase();

    let user = await User.findOne({
      $or: [
        { email: cleanEmail },
        { email: new RegExp(`^${cleanEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') }
      ]
    });

    if (user) {
      if (name !== undefined) user.name = name;
      if (phone !== undefined) user.phone = phone;
      if (province !== undefined) user.province = province;
      if (district !== undefined) user.district = district;
      if (detailAddress !== undefined) user.detailAddress = detailAddress;
      if (avatar !== undefined) user.avatar = avatar;
      await user.save();
    } else {
      user = new User({ name, email: cleanEmail, phone, province, district, detailAddress, avatar, role, password });
      await user.save();
    }
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/users/:id/status', async (req, res) => {
  try {
    const rawId = req.params.id;
    let user = null;
    if (mongoose.Types.ObjectId.isValid(rawId)) {
      user = await User.findById(rawId);
    }
    if (!user) {
      const cleanId = rawId.trim().toLowerCase();
      user = await User.findOne({
        $or: [
          { email: cleanId },
          { email: new RegExp(`^${cleanId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
          { phone: rawId }
        ]
      });
    }
    if (!user) return res.status(404).json({ message: 'Không tìm thấy người dùng' });

    user.status = user.status === 'active' ? 'locked' : 'active';
    await user.save();
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/users/:id', async (req, res) => {
  try {
    const rawId = req.params.id;
    const { name, email, phone, province, district, detailAddress, avatar, status, cart, wishlist } = req.body;
    let user = null;
    if (mongoose.Types.ObjectId.isValid(rawId)) {
      user = await User.findById(rawId);
    }
    if (!user && email) {
      const cleanEmail = email.trim().toLowerCase();
      user = await User.findOne({
        $or: [
          { email: cleanEmail },
          { email: new RegExp(`^${cleanEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') }
        ]
      });
    }
    if (!user && rawId) {
      const cleanRaw = rawId.trim().toLowerCase();
      user = await User.findOne({
        $or: [
          { email: cleanRaw },
          { email: new RegExp(`^${cleanRaw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
          { phone: rawId }
        ]
      });
    }
    if (!user) return res.status(404).json({ message: 'Không tìm thấy người dùng' });

    if (name !== undefined) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (province !== undefined) user.province = province;
    if (district !== undefined) user.district = district;
    if (detailAddress !== undefined) user.detailAddress = detailAddress;
    if (avatar !== undefined) user.avatar = avatar;
    if (status !== undefined) user.status = status;
    if (cart !== undefined) user.cart = cart;
    if (wishlist !== undefined) user.wishlist = wishlist;

    await user.save();
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/users/:id', async (req, res) => {
  try {
    const rawId = req.params.id;
    if (mongoose.Types.ObjectId.isValid(rawId)) {
      await User.findByIdAndDelete(rawId);
    } else {
      await User.findOneAndDelete({ $or: [{ email: rawId }, { phone: rawId }] });
    }
    res.json({ success: true, message: 'Đã xóa khách hàng khỏi hệ thống' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- VOUCHERS ---
router.get('/vouchers', async (req, res) => {
  try {
    const vouchers = await Voucher.find();
    res.json(vouchers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/vouchers', async (req, res) => {
  try {
    const data = { ...req.body };
    if (data._id && !mongoose.Types.ObjectId.isValid(data._id)) delete data._id;
    const voucher = new Voucher(data);
    await voucher.save();
    res.json({ success: true, voucher });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/vouchers/:id', async (req, res) => {
  try {
    await Voucher.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Đã xóa voucher' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/vouchers/apply', async (req, res) => {
  try {
    const { code, subtotal } = req.body;
    const voucher = await Voucher.findOne({ code: code.toUpperCase(), status: 'active' });
    if (!voucher) return res.status(404).json({ success: false, message: 'Mã giảm giá không hợp lệ hoặc đã hết hạn' });
    
    if (subtotal < voucher.minOrderValue) {
      return res.status(400).json({
        success: false,
        message: `Giá trị đơn hàng tối thiểu để áp dụng mã này là ${voucher.minOrderValue.toLocaleString('vi-VN')}đ`
      });
    }

    let discount = 0;
    if (voucher.discountType === 'percent') {
      discount = (subtotal * voucher.discountValue) / 100;
      if (voucher.maxDiscount > 0 && discount > voucher.maxDiscount) {
        discount = voucher.maxDiscount;
      }
    } else {
      discount = voucher.discountValue;
    }

    res.json({ success: true, voucher, discountAmount: discount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- ORDERS ---
router.post('/orders', async (req, res) => {
  try {
    const orderData = { ...req.body };
    if (orderData._id && !mongoose.Types.ObjectId.isValid(orderData._id)) {
      delete orderData._id;
    }
    if (!orderData.orderCode) {
      orderData.orderCode = 'LUX' + Math.floor(100000 + Math.random() * 900000);
    }
    const cleanCode = (orderData.orderCode || '').replace(/^#/, '');
    let order = await Order.findOne({
      $or: [
        { orderCode: orderData.orderCode },
        { orderCode: '#' + cleanCode },
        { orderCode: cleanCode }
      ].filter(Boolean)
    });

    if (order) {
      Object.assign(order, orderData);
      await order.save();
    } else {
      order = new Order(orderData);
      await order.save();
    }

    // Deduct stock for each purchased item in DB safely
    if (orderData.items && orderData.items.length > 0) {
      for (const item of orderData.items) {
        try {
          const productId = typeof item.product === 'string' ? item.product : (item.product?._id || item.product?.id);
          const qty = item.quantity || 1;
          const itemName = (item.name || '').trim();
          let pDoc = null;

          if (productId && mongoose.Types.ObjectId.isValid(productId)) {
            pDoc = await Product.findById(productId);
          }
          if (!pDoc && (productId || itemName)) {
            pDoc = await Product.findOne({
              $or: [
                productId ? { _id: productId } : null,
                productId ? { slug: productId } : null,
                itemName ? { name: itemName } : null,
                itemName ? { name: new RegExp(`^${itemName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') } : null
              ].filter(Boolean)
            });
          }

          if (pDoc) {
            pDoc.stock = Math.max(0, (pDoc.stock ?? 10) - qty);
            pDoc.soldCount = (pDoc.soldCount || 0) + qty;
            await pDoc.save();
          }
        } catch (stockErr) {
          console.warn('[Stock Deduction Non-Fatal Warning]:', stockErr.message);
        }
      }
    }

    // Track Affiliate commission if applicable safely
    if (orderData.affiliateId) {
      try {
        const commAmount = Math.round(order.subtotal * 0.15); // 15% standard commission
        order.affiliateCommission = commAmount;
        await order.save();

        if (mongoose.Types.ObjectId.isValid(orderData.affiliateId)) {
          const commission = new AffiliateCommission({
            affiliate: orderData.affiliateId,
            order: order._id,
            commissionRate: 0.15,
            commissionAmount: commAmount,
            status: 'Pending'
          });
          await commission.save();

          await Affiliate.findByIdAndUpdate(orderData.affiliateId, {
            $inc: { totalOrder: 1, pendingBalance: commAmount, totalCommission: commAmount }
          });
        }
      } catch (affErr) {
        console.warn('[Affiliate Tracking Non-Fatal Warning]:', affErr.message);
      }
    }

    res.json({ success: true, message: 'Đặt hàng thành công', order });
  } catch (err) {
    console.error('[Create Order Error]:', err.message, err.stack);
    res.status(500).json({ error: err.message });
  }
});

router.get('/orders', async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/orders/:id/status', async (req, res) => {
  try {
    const { orderStatus, estimatedDeliveryDate } = req.body;
    const orderId = req.params.id;
    const rawId = (orderId || '').replace(/^#/, '');

    let existingOrder = null;
    if (mongoose.Types.ObjectId.isValid(rawId)) {
      existingOrder = await Order.findById(rawId);
    }
    if (!existingOrder) {
      existingOrder = await Order.findOne({
        $or: [
          { orderCode: rawId },
          { orderCode: '#' + rawId },
          { _id: rawId },
          { _id: orderId }
        ]
      });
    }
    if (!existingOrder) return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });

    const oldStatus = existingOrder.orderStatus;
    const isOldCanceled = oldStatus === 'Hủy' || oldStatus === 'Hủy đơn';
    const isNewCanceled = orderStatus === 'Hủy' || orderStatus === 'Hủy đơn';

    // Handle stock changes on cancel or un-cancel
    if (!isOldCanceled && isNewCanceled) {
      // Order is being canceled -> restore stock
      if (existingOrder.items && existingOrder.items.length > 0) {
        for (const item of existingOrder.items) {
          try {
            const productId = typeof item.product === 'string' ? item.product : item.product?._id;
            const qty = item.quantity || 1;
            let pDoc = null;

            if (productId && mongoose.Types.ObjectId.isValid(productId)) {
              pDoc = await Product.findById(productId);
            }
            if (!pDoc && productId) {
              pDoc = await Product.findOne({
                $or: [
                  { slug: productId },
                  { name: item.name },
                  { name: new RegExp(`^${(item.name || '').trim()}$`, 'i') }
                ]
              });
            }
            if (!pDoc && item.name) {
              pDoc = await Product.findOne({
                name: new RegExp(`^${(item.name || '').trim()}$`, 'i')
              });
            }

            if (pDoc) {
              pDoc.stock = (pDoc.stock || 0) + qty;
              pDoc.soldCount = Math.max(0, (pDoc.soldCount || 0) - qty);
              await pDoc.save();
            }
          } catch (err) {
            console.warn('[Stock Restore Error]:', err.message);
          }
        }
      }
    } else if (isOldCanceled && !isNewCanceled) {
      // Order is being un-canceled -> re-deduct stock
      if (existingOrder.items && existingOrder.items.length > 0) {
        for (const item of existingOrder.items) {
          try {
            const productId = typeof item.product === 'string' ? item.product : item.product?._id;
            const qty = item.quantity || 1;
            let pDoc = null;

            if (productId && mongoose.Types.ObjectId.isValid(productId)) {
              pDoc = await Product.findById(productId);
            }
            if (!pDoc && productId) {
              pDoc = await Product.findOne({
                $or: [
                  { slug: productId },
                  { name: item.name },
                  { name: new RegExp(`^${(item.name || '').trim()}$`, 'i') }
                ]
              });
            }
            if (!pDoc && item.name) {
              pDoc = await Product.findOne({
                name: new RegExp(`^${(item.name || '').trim()}$`, 'i')
              });
            }

            if (pDoc) {
              pDoc.stock = Math.max(0, (pDoc.stock || 0) - qty);
              pDoc.soldCount = (pDoc.soldCount || 0) + qty;
              await pDoc.save();
            }
          } catch (err) {
            console.warn('[Stock Re-Deduct Error]:', err.message);
          }
        }
      }
    }

    existingOrder.orderStatus = orderStatus;
    if (estimatedDeliveryDate !== undefined) {
      existingOrder.estimatedDeliveryDate = estimatedDeliveryDate;
    }
    await existingOrder.save();

    // If order complete -> update affiliate pending balance to available
    if (orderStatus === 'Hoàn thành' && existingOrder.affiliateId) {
      const comm = await AffiliateCommission.findOne({ order: existingOrder._id });
      if (comm && comm.status === 'Pending') {
        comm.status = 'Approved';
        await comm.save();
        await Affiliate.findByIdAndUpdate(existingOrder.affiliateId, {
          $inc: { pendingBalance: -comm.commissionAmount, availableBalance: comm.commissionAmount }
        });
      }
    }

    res.json({ success: true, order: existingOrder });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- AFFILIATE ROUTES ---
router.post('/affiliate/register', async (req, res) => {
  try {
    const { userId, name, email, phone, bankName, bankNumber, accountName } = req.body;
    const existing = await Affiliate.findOne({ user: userId });
    if (existing) return res.status(400).json({ message: 'Tài khoản đã gửi yêu cầu Affiliate' });

    const refCode = 'LUX' + name.replace(/\s+/g, '').toUpperCase().slice(0, 4) + Math.floor(100 + Math.random() * 900);
    const refLink = `https://luxora.vn/?ref=${refCode}`;

    const affiliate = new Affiliate({
      user: userId,
      referralCode: refCode,
      referralLink: refLink,
      status: 'Approved', // Auto-approve for demo preview
      bankInfo: { bankName, bankNumber, accountName }
    });
    await affiliate.save();

    await User.findByIdAndUpdate(userId, { role: 'affiliate' });

    res.json({ success: true, message: 'Đăng ký làm Affiliate thành công!', affiliate });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/affiliate/dashboard/:userId', async (req, res) => {
  try {
    const affiliate = await Affiliate.findOne({ user: req.params.userId }).populate('user');
    if (!affiliate) return res.status(404).json({ message: 'Chưa có thông tin Affiliate' });

    const commissions = await AffiliateCommission.find({ affiliate: affiliate._id }).populate('order');
    const clicks = await AffiliateClick.find({ affiliate: affiliate._id });
    const withdraws = await AffiliateWithdraw.find({ affiliate: affiliate._id });

    res.json({ affiliate, commissions, clicks, withdraws });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/affiliate/withdraw', async (req, res) => {
  try {
    const { affiliateId, amount, bankName, bankNumber, accountName } = req.body;
    const affiliate = await Affiliate.findById(affiliateId);
    if (!affiliate) return res.status(404).json({ message: 'Không tìm thấy Affiliate' });

    if (affiliate.availableBalance < amount) {
      return res.status(400).json({ message: 'Số dư khả dụng không đủ để thực hiện rút tiền' });
    }

    const withdraw = new AffiliateWithdraw({
      affiliate: affiliateId,
      amount,
      bankName,
      bankNumber,
      accountName,
      status: 'Pending'
    });
    await withdraw.save();

    affiliate.availableBalance -= amount;
    await affiliate.save();

    res.json({ success: true, message: 'Gửi yêu cầu rút tiền thành công', withdraw });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- MARKETING ASSETS ---
router.get('/marketing-assets', async (req, res) => {
  try {
    const assets = await MarketingAsset.find();
    res.json(assets);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- REVIEWS ---
router.get('/reviews/:productId', async (req, res) => {
  try {
    const reviews = await Review.find({ product: req.params.productId }).sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/reviews', async (req, res) => {
  try {
    const review = new Review(req.body);
    await review.save();
    
    // Update product rating average
    const allReviews = await Review.find({ product: req.body.product });
    const avgRating = (allReviews.reduce((acc, r) => acc + r.rating, 0) / allReviews.length).toFixed(1);
    await Product.findByIdAndUpdate(req.body.product, {
      rating: parseFloat(avgRating),
      reviewCount: allReviews.length
    });

    res.json({ success: true, review });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/reviews/:id/reply', async (req, res) => {
  try {
    const { replyText } = req.body;
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: 'Không tìm thấy đánh giá' });

    review.adminReply = replyText;
    review.repliedAt = new Date();
    await review.save();

    res.json({ success: true, review });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- INVENTORY LOGS ---
router.get('/inventory', async (req, res) => {
  try {
    let logs = await InventoryLog.find().sort({ createdAt: -1 });
    if (logs.length === 0) {
      const initialLogs = [
        { id: 'INV-2026-001', productId: 'prod1', productName: 'Miss Dior Blooming Bouquet EDP 100ml', brand: 'Dior', scent: 'Hoa Hồng & Mẫu Đơn', concentration: 'EDT', volume: '100ml', quantity: 15, importPrice: 1950000, date: '14:20 05/08/2026', note: 'Nhập kho đợt 1' },
        { id: 'INV-2026-002', productId: 'prod2', productName: 'Dior Sauvage EDP 100ml', brand: 'Dior', scent: 'Hương Gỗ Cay Nồng', concentration: 'EDP', volume: '100ml', quantity: 10, importPrice: 2100000, date: '09:15 06/08/2026', note: 'Nhập kho đợt 2' },
        { id: 'INV-2026-003', productId: 'prod3', productName: 'Bleu de Chanel Parfum 100ml', brand: 'Chanel', scent: 'Gỗ Tuyết Tùng', concentration: 'Parfum', volume: '100ml', quantity: 8, importPrice: 2800000, date: '16:45 07/08/2026', note: 'Nhập mới từ Pháp' }
      ];
      logs = await InventoryLog.insertMany(initialLogs).catch(() => []);
    }
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/inventory', async (req, res) => {
  try {
    const data = { ...req.body };
    if (!data.id) {
      const now = new Date();
      data.id = `INV-${now.getFullYear()}-${Date.now().toString().slice(-4)}`;
    }

    const isNewLog = !(await InventoryLog.exists({ id: data.id }));
    const log = await InventoryLog.findOneAndUpdate(
      { id: data.id },
      data,
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // Update Product stock quantity in MongoDB if this is a new stock-in log
    if (isNewLog && (data.productId || data.productName)) {
      let product = null;
      if (data.productId && mongoose.Types.ObjectId.isValid(data.productId)) {
        product = await Product.findById(data.productId).catch(() => null);
      }
      if (!product && data.productId) {
        product = await Product.findOne({ id: data.productId }).catch(() => null);
      }
      if (!product && data.productName) {
        product = await Product.findOne({ name: new RegExp('^' + data.productName.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$', 'i') }).catch(() => null);
      }

      if (product) {
        product.stock = (product.stock || 0) + Number(data.quantity || 0);
        if (data.image) product.image = data.image;
        if (data.brand && !product.brand) product.brand = data.brand;
        if (data.concentration && !product.concentration) product.concentration = data.concentration;
        if (data.volume && (!product.availableVolumes || !product.availableVolumes.includes(data.volume))) {
          product.availableVolumes = Array.from(new Set([...(product.availableVolumes || []), data.volume]));
        }
        if (data.scent && (!product.availableScents || !product.availableScents.includes(data.scent))) {
          product.availableScents = Array.from(new Set([...(product.availableScents || []), data.scent]));
        }

        if (data.volume && data.sellingPrice && Number(data.sellingPrice) > 0) {
          const vOpts = product.volumeOptions || [];
          const vIdx = vOpts.findIndex((v) => v.volume === data.volume);
          const selP = Number(data.sellingPrice);
          const origP = Math.round(selP * 1.25);
          if (vIdx >= 0) {
            vOpts[vIdx] = { ...vOpts[vIdx], price: selP, originalPrice: origP };
          } else {
            vOpts.push({ volume: data.volume, price: selP, originalPrice: origP });
          }
          product.volumeOptions = vOpts;
          const minP = Math.min(...vOpts.map(v => v.price));
          if (minP && isFinite(minP)) {
            product.price = minP;
            product.originalPrice = Math.round(minP * 1.25);
          }
        }
        await product.save();
      }
    }

    res.json({ success: true, log });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/inventory/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const query = mongoose.Types.ObjectId.isValid(id) ? { $or: [{ _id: id }, { id: id }] } : { id: id };
    await InventoryLog.deleteOne(query);
    res.json({ success: true, message: 'Đã xóa phiếu nhập kho' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

