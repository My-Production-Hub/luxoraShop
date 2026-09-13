const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const User = require('../models/User');
const Product = require('../models/Product');
const Category = require('../models/Category');
const Brand = require('../models/Brand');
const Order = require('../models/Order');
const Review = require('../models/Review');
const Voucher = require('../models/Voucher');
const Affiliate = require('../models/Affiliate');
const AffiliateCommission = require('../models/AffiliateCommission');
const AffiliateClick = require('../models/AffiliateClick');
const MarketingAsset = require('../models/MarketingAsset');
const AuditLog = require('../models/AuditLog');
const InventoryLog = require('../models/InventoryLog');

const seedData = async () => {
  try {
    if (mongoose.connection.readyState !== 1) {
      const rawUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/luxora_shop';
      const uri = rawUri.trim().replace(/^["']|["']$/g, '');
      await mongoose.connect(uri, { serverSelectionTimeoutMS: 2500 });
    }
    console.log('[Seed] Connected to MongoDB...');

    // Clear existing data
    await User.deleteMany({});
    await Product.deleteMany({});
    await Category.deleteMany({});
    await Brand.deleteMany({});
    await Order.deleteMany({});
    await Review.deleteMany({});
    await Voucher.deleteMany({});
    await Affiliate.deleteMany({});
    await AffiliateCommission.deleteMany({});
    await AffiliateClick.deleteMany({});
    await MarketingAsset.deleteMany({});
    await AuditLog.deleteMany({});
    await InventoryLog.deleteMany({});

    console.log('[Seed] Cleared old collections...');

    // Create Categories
    const categories = await Category.insertMany([
      { name: 'Nước hoa Nam', slug: 'nuoc-hoa-nam', icon: 'UserCheck', description: 'Nước hoa nam tính, lịch lãm & quyến rũ' },
      { name: 'Nước hoa Nữ', slug: 'nuoc-hoa-nu', icon: 'Sparkles', description: 'Nước hoa nữ dịu dàng, sang trọng & quý phái' },
      { name: 'Body Mist', slug: 'body-mist', icon: 'Wind', description: 'Xịt thơm toàn thân dịu mát hàng ngày' },
      { name: 'Lăn khử mùi', slug: 'lan-khu-mui', icon: 'Shield', description: 'Khử mùi tỏa hương nước hoa cao cấp' },
      { name: 'Sáp thơm', slug: 'sap-thom', icon: 'Flame', description: 'Sáp thơm không gian phòng & ô tô' },
      { name: 'Gift Set', slug: 'gift-set', icon: 'Gift', description: 'Bộ quà tặng nước hoa sang trọng cao cấp' },
      { name: 'Combo', slug: 'combo', icon: 'Layers', description: 'Combo tiết kiệm nước hoa & chăm sóc toàn thân' }
    ]);

    // Create Brands
    const brands = await Brand.insertMany([
      { name: 'Dior', slug: 'dior', logo: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=300', country: 'Pháp' },
      { name: 'Chanel', slug: 'chanel', logo: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=300', country: 'Pháp' },
      { name: 'Yves Saint Laurent', slug: 'ysl', logo: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=300', country: 'Pháp' },
      { name: 'Versace', slug: 'versace', logo: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=300', country: 'Ý' },
      { name: 'Gucci', slug: 'gucci', logo: 'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?w=300', country: 'Ý' },
      { name: 'Lancôme', slug: 'lancome', logo: 'https://images.unsplash.com/photo-1616949755610-8c9bbc08f138?w=300', country: 'Pháp' },
      { name: 'Armani', slug: 'armani', logo: 'https://images.unsplash.com/photo-1595425970377-c9703cf48b6d?w=300', country: 'Ý' }
    ]);

    // Create Products
    const products = await Product.insertMany([
      {
        name: 'Miss Dior Blooming Bouquet EDP 100ml',
        slug: 'miss-dior-blooming-bouquet-100ml',
        brand: 'Dior',
        category: 'Nước hoa Nữ',
        price: 2250000,
        originalPrice: 2800000,
        discountPercent: 20,
        volume: '100ml',
        availableVolumes: ['30ml', '50ml', '100ml'],
        gender: 'Nữ',
        origin: 'Pháp',
        concentration: 'EDP',
        image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=600',
        gallery: [
          'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=600',
          'https://images.unsplash.com/photo-1541643600914-78b084683601?w=600',
          'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?w=600'
        ],
        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        description: 'Hương thơm tươi mát, nữ tính và lãng mạn. Sự kết hợp hoàn hảo giữa hương hoa mẫu đơn, hoa hồng và xạ hương trắng bồng bềnh.',
        ingredients: 'Alcohol, Parfum (Fragrance), Aqua (Water), Limonene, Ethylhexyl Methoxycinnamate, Hexyl Cinnamal, Linalool.',
        benefits: 'Giữ hương lôi cuốn từ 8-12 tiếng. Tôn vinh nét thanh lịch chuẩn phái đẹp.',
        fragranceNotes: {
          top: 'Quả quýt Sicili tươi mát',
          middle: 'Hoa mẫu đơn hồng, hoa hồng Damascus',
          base: 'Xạ hương trắng lôi cuốn'
        },
        stock: 45,
        soldCount: 1250,
        rating: 4.9,
        reviewCount: 256,
        isFeatured: true,
        isFlashSale: true
      },
      {
        name: 'Dior Sauvage EDP 100ml',
        slug: 'dior-sauvage-edp-100ml',
        brand: 'Dior',
        category: 'Nước hoa Nam',
        price: 2450000,
        originalPrice: 3400000,
        discountPercent: 30,
        volume: '100ml',
        availableVolumes: ['60ml', '100ml', '200ml'],
        gender: 'Nam',
        origin: 'Pháp',
        concentration: 'EDP',
        image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600',
        gallery: [
          'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600',
          'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=600'
        ],
        description: 'Sự hòa quyện giữa cam Bergamot Calabrian tươi mát cùng tiêu Tứ Xuyên mộc mạc phong trần.',
        ingredients: 'Alcohol, Parfum, Aqua, Linalool, Limonene, Citronellol.',
        benefits: 'Độ tỏa hương xa 2 mét, cực kỳ nam tính và thu hút.',
        fragranceNotes: {
          top: 'Cam Bergamot, Tiêu đen',
          middle: 'Tiêu Tứ Xuyên, Hoa oải hương',
          base: 'Gỗ tuyết tùng, Ambroxan'
        },
        stock: 80,
        soldCount: 2100,
        rating: 4.9,
        reviewCount: 412,
        isFeatured: true,
        isFlashSale: true
      },
      {
        name: 'Chanel Coco Mademoiselle EDP 100ml',
        slug: 'chanel-coco-mademoiselle-100ml',
        brand: 'Chanel',
        category: 'Nước hoa Nữ',
        price: 2650000,
        originalPrice: 3100000,
        discountPercent: 17,
        volume: '100ml',
        availableVolumes: ['50ml', '100ml'],
        gender: 'Nữ',
        origin: 'Pháp',
        concentration: 'EDP',
        image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=600',
        gallery: ['https://images.unsplash.com/photo-1541643600914-78b084683601?w=600'],
        description: 'Biểu tượng nữ tính huyền thoại tôn vinh người phụ nữ hiện đại, độc lập và sang trọng.',
        ingredients: 'Parfum, Alcohol, Aqua, Benzyl Salicylate.',
        benefits: 'Bắt hương bền bỉ suốt ngày dài năng động.',
        fragranceNotes: {
          top: 'Cam chanh tươi, Hoa cam',
          middle: 'Hoa hồng Thổ Nhĩ Kỳ, Hoa nhài',
          base: 'Gỗ hoắc hương, Cỏ hương bài'
        },
        stock: 30,
        soldCount: 1890,
        rating: 4.9,
        reviewCount: 198,
        isFeatured: true,
        isFlashSale: false
      },
      {
        name: 'YSL Libre EDP 90ml',
        slug: 'ysl-libre-edp-90ml',
        brand: 'Yves Saint Laurent',
        category: 'Nước hoa Nữ',
        price: 2350000,
        originalPrice: 2890000,
        discountPercent: 19,
        volume: '90ml',
        availableVolumes: ['30ml', '50ml', '90ml'],
        gender: 'Nữ',
        origin: 'Pháp',
        concentration: 'EDP',
        image: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=600',
        gallery: ['https://images.unsplash.com/photo-1594035910387-fea47794261f?w=600'],
        description: 'Hương thơm tự do kiêu hãnh với hoa oải hương Pháp kết hợp cùng hoa cam Maroc nồng nàn.',
        ingredients: 'Alcohol, Parfum, Water, Benzyl Alcohol.',
        benefits: 'Gợi cảm, hiện đại và lôi cuốn.',
        fragranceNotes: {
          top: 'Tinh dầu hoa cam, Oải hương',
          middle: 'Hoa nhài Ấn Độ, Hoa cam',
          base: 'Hổ phách, Vani Madagascar'
        },
        stock: 65,
        soldCount: 950,
        rating: 4.8,
        reviewCount: 122,
        isFeatured: true,
        isFlashSale: true
      },
      {
        name: 'Versace Dylan Blue Pour Homme 100ml',
        slug: 'versace-dylan-blue-100ml',
        brand: 'Versace',
        category: 'Nước hoa Nam',
        price: 2150000,
        originalPrice: 2800000,
        discountPercent: 23,
        volume: '100ml',
        availableVolumes: ['50ml', '100ml'],
        gender: 'Nam',
        origin: 'Ý',
        concentration: 'EDT',
        image: 'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?w=600',
        gallery: ['https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?w=600'],
        description: 'Sự pha trộn của lá sung, bưởi Calabria kết hợp với hương gỗ quý hiếm miền Địa Trung Hải.',
        ingredients: 'Alcohol, Fragrance, Water.',
        benefits: 'Thích hợp cho quý ông công sở & dạ tiệc sang trọng.',
        fragranceNotes: {
          top: 'Hương nước, Bưởi, Lá sung',
          middle: 'Hoa hoắc hương, Tiêu đen',
          base: 'Xạ hương, Hổ phách'
        },
        stock: 50,
        soldCount: 840,
        rating: 4.7,
        reviewCount: 86,
        isFeatured: false,
        isFlashSale: false
      },
      {
        name: 'Luxora Luxury Scented Wax 150g',
        slug: 'luxora-scented-wax-150g',
        brand: 'Gucci',
        category: 'Sáp thơm',
        price: 450000,
        originalPrice: 650000,
        discountPercent: 30,
        volume: '150g',
        availableVolumes: ['150g'],
        gender: 'Unisex',
        origin: 'Pháp',
        concentration: 'Wax',
        image: 'https://images.unsplash.com/photo-1616949755610-8c9bbc08f138?w=600',
        gallery: ['https://images.unsplash.com/photo-1616949755610-8c9bbc08f138?w=600'],
        description: 'Sáp thơm tinh dầu cao cấp lưu hương lâu dài cho phòng khách, phòng ngủ và ô tô.',
        ingredients: 'Soy Wax, Natural Essential Oils.',
        benefits: 'Khử mùi hiệu quả, tạo không gian thư giãn như Spa 5 sao.',
        fragranceNotes: {
          top: 'Hương gỗ đàn hương',
          middle: 'Hoa nhài trắng',
          base: 'Vani ngọt ngào'
        },
        stock: 120,
        soldCount: 310,
        rating: 4.9,
        reviewCount: 45,
        isFeatured: true,
        isFlashSale: false
      }
    ]);

    // Create Users
    const users = await User.insertMany([
      {
        name: 'Admin Luxora',
        email: 'admin@luxora.vn',
        password: 'admin123password',
        role: 'admin',
        phone: '0901234567'
      },
      {
        name: 'Nguyễn Văn An',
        email: 'nguyenvanan@gmail.com',
        password: 'user123password',
        role: 'affiliate',
        phone: '0123456789'
      },
      {
        name: 'Trần Thị Mai',
        email: 'thimai@gmail.com',
        password: 'user123password',
        role: 'customer',
        phone: '0987654321'
      }
    ]);

    // Create Affiliate
    const affiliate = await Affiliate.create({
      user: users[1]._id,
      referralCode: 'AFF12345',
      referralLink: 'https://luxora.vn/?ref=AFF12345',
      status: 'Approved',
      totalClick: 1248,
      totalOrder: 136,
      totalCommission: 8230000,
      availableBalance: 2450000,
      pendingBalance: 3210000,
      paidBalance: 5780000,
      bankInfo: {
        bankName: 'MBBank',
        bankNumber: '999988887777',
        accountName: 'NGUYEN VAN AN'
      }
    });

    // Create Vouchers
    await Voucher.insertMany([
      {
        code: 'LUXORA100K',
        name: 'Giảm ngay 100K cho đơn từ 699K',
        discountType: 'fixed',
        discountValue: 100000,
        minOrderValue: 699000,
        quantity: 500,
        usedQuantity: 142,
        startDate: new Date('2026-01-01'),
        endDate: new Date('2026-12-31'),
        status: 'active'
      },
      {
        code: 'FREESHIP',
        name: 'Miễn phí vận chuyển 30K',
        discountType: 'fixed',
        discountValue: 30000,
        minOrderValue: 499000,
        quantity: 1000,
        usedQuantity: 380,
        startDate: new Date('2026-01-01'),
        endDate: new Date('2026-12-31'),
        status: 'active'
      },
      {
        code: 'LUXORAVIP20',
        name: 'Giảm 20% tối đa 300K',
        discountType: 'percent',
        discountValue: 20,
        maxDiscount: 300000,
        minOrderValue: 1500000,
        quantity: 200,
        usedQuantity: 58,
        startDate: new Date('2026-01-01'),
        endDate: new Date('2026-12-31'),
        status: 'active'
      }
    ]);

    // Create Marketing Assets
    await MarketingAsset.insertMany([
      {
        title: 'Banner Hương thơm nâng tầm cảm xúc 1920x1080',
        type: 'Banner',
        url: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=1200',
        thumbnail: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=400',
        dimensions: '1920x1080',
        fileSize: '3.2 MB'
      },
      {
        title: 'Poster Flash Sale Giảm tới 50%',
        type: 'Poster',
        url: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=1200',
        thumbnail: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400',
        dimensions: '1080x1350',
        fileSize: '2.8 MB'
      },
      {
        title: 'Video Commercial Miss Dior Luxora HD',
        type: 'Video',
        url: 'https://www.w3schools.com/html/mov_bbb.mp4',
        thumbnail: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=400',
        dimensions: '1080p MP4',
        fileSize: '24.5 MB'
      }
    ]);

    // Create Sample Orders
    const order1 = await Order.create({
      orderCode: '#DH10086',
      user: users[2]._id,
      customerName: 'Trần Thị Mai',
      customerEmail: 'thimai@gmail.com',
      customerPhone: '0987654321',
      shippingAddress: '123 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh',
      items: [{
        product: products[0]._id,
        name: products[0].name,
        image: products[0].image,
        volume: '100ml',
        price: 2250000,
        quantity: 1
      }],
      subtotal: 2250000,
      shippingFee: 30000,
      discountAmount: 30000,
      totalAmount: 2250000,
      paymentMethod: 'MoMo',
      paymentStatus: 'Paid',
      orderStatus: 'Hoàn thành',
      affiliateId: affiliate._id,
      affiliateCommission: 337500
    });

    await AffiliateCommission.create({
      affiliate: affiliate._id,
      order: order1._id,
      product: products[0]._id,
      commissionRate: 0.15,
      commissionAmount: 337500,
      status: 'Approved'
    });

    await InventoryLog.insertMany([
      { id: 'INV-2026-001', productId: products[0]._id.toString(), productName: 'Miss Dior Blooming Bouquet EDP 100ml', brand: 'Dior', scent: 'Hoa Hồng & Mẫu Đơn', concentration: 'EDT', volume: '100ml', quantity: 15, importPrice: 1950000, date: '14:20 05/08/2026', note: 'Nhập kho đợt 1' },
      { id: 'INV-2026-002', productId: products[1]._id.toString(), productName: 'Dior Sauvage EDP 100ml', brand: 'Dior', scent: 'Hương Gỗ Cay Nồng', concentration: 'EDP', volume: '100ml', quantity: 10, importPrice: 2100000, date: '09:15 06/08/2026', note: 'Nhập kho đợt 2' },
      { id: 'INV-2026-003', productId: products[2]._id.toString(), productName: 'Bleu de Chanel Parfum 100ml', brand: 'Chanel', scent: 'Gỗ Tuyết Tùng', concentration: 'Parfum', volume: '100ml', quantity: 8, importPrice: 2800000, date: '16:45 07/08/2026', note: 'Nhập mới từ Pháp' }
    ]);

    console.log('[Seed] Database seeded successfully!');
    if (require.main === module) process.exit(0);
  } catch (err) {
    console.error('[Seed Error]', err);
    if (require.main === module) process.exit(1);
  }
};

if (require.main === module) {
  seedData();
}

module.exports = seedData;
