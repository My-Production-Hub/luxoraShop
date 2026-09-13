'use client';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Product, CartItem, Voucher, User, Affiliate, Order, Category, Customer } from '@/types';
import { PointsCelebrationModal } from '@/components/PointsCelebrationModal';
import { CheckCircle2, XCircle, Info, X } from 'lucide-react';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface StoreContextType {
  products: Product[];
  cart: CartItem[];
  directBuyItem: CartItem | null;
  setDirectBuyItem: (item: CartItem | null) => void;
  buyNow: (product: Product, volume?: string, quantity?: number, scent?: string) => void;
  wishlist: string[];
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  isWishlistOpen: boolean;
  setIsWishlistOpen: (open: boolean) => void;
  selectedProductModal: Product | null;
  setSelectedProductModal: (p: Product | null) => void;
  appliedVoucher: Voucher | null;
  discountAmount: number;
  user: User | null;
  affiliateData: Affiliate | null;
  setAffiliateData: React.Dispatch<React.SetStateAction<Affiliate | null>>;
  toasts: Toast[];
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  getVolumeStock: (product: Product, volumeName: string) => number;
  addToCart: (product: Product, volume?: string, quantity?: number, scent?: string) => void;
  updateCartQuantity: (productId: string, volume: string, qty: number, scent?: string) => void;
  removeFromCart: (productId: string, volume: string, scent?: string) => void;
  clearCart: () => void;
  toggleWishlist: (productId: string) => void;
  applyVoucher: (code: string, subtotalOverride?: number) => Promise<boolean>;
  removeVoucher: () => void;
  login: (email: string, pass: string) => boolean;
  loginWithGoogle: (name?: string, email?: string, phone?: string) => void;
  registerUser: (data: { name: string; email: string; phone: string; password: string }) => boolean;
  logout: () => void;
  customers: Customer[];
  addCustomer: (data: { name: string; email: string; phone: string; province: string; district: string; detailAddress: string; avatar?: string }) => void;
  toggleCustomerStatus: (id: string) => void;
  deleteCustomer: (id: string) => void;
  purchasedProductIds: string[];
  hasUserPurchasedProduct: (productId: string) => boolean;
  addPurchasedProducts: (productIds: string[]) => void;
  categories: Category[];
  addCategory: (category: Omit<Category, '_id'>) => void;
  updateCategory: (id: string, updates: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  brands: string[];
  addBrand: (name: string) => void;
  deleteBrand: (name: string) => void;
  addProduct: (product: Product) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (productId: string) => void;
  orders: Order[];
  addOrder: (orderData: Partial<Order>) => Order;
  updateOrderStatus: (orderId: string, status: Order['orderStatus'], estimatedDeliveryDate?: string) => void;
  vouchers: Voucher[];
  addVoucher: (voucher: Voucher) => void;
  deleteVoucher: (voucherId: string) => void;
  toggleVoucherStatus: (voucherId: string) => void;
  savedVouchers: string[];
  usedVouchers: string[];
  saveVoucher: (code: string) => void;
  markVoucherUsed: (code: string) => void;
  affiliates: Affiliate[];
  registerAffiliate: (affData: Partial<Affiliate>) => void;
  updateAffiliateStatus: (affId: string, status: 'Approved' | 'Rejected' | 'Pending' | 'Locked') => void;
  cartSubtotal: number;
  cartTotal: number;
  shippingFee: number;
  refCode: string;
  userPoints: number;
  usedPoints: number;
  addRewardPoints: (amount: number) => void;
  useRewardPoints: (amount: number) => boolean;
  showPointsModal: boolean;
  setShowPointsModal: (show: boolean) => void;
  productReviews: Record<string, any[]>;
  getProductReviews: (productId: string) => any[];
  addProductReview: (productId: string, review: { userName: string; userEmail?: string; rating: number; comment: string }) => void;
  updateProductReview: (productId: string, rating: number, comment: string) => void;
  deleteProductReview: (productId: string) => void;
  hasUserReviewedProduct: (productId: string) => boolean;
  addAdminReply: (productId: string, reviewId: string, replyText: string) => void;
  inventoryLogs: any[];
  addInventoryLog: (logData: any) => Promise<void>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const initialInventoryLogs = [
  { id: 'INV-2026-003', productId: 'prod3', productName: 'Bleu de Chanel Parfum 100ml', brand: 'Chanel', scent: 'Gỗ Tuyết Tùng', concentration: 'Parfum', volume: '100ml', quantity: 8, importPrice: 2800000, date: '16:45 07/08/2026', note: 'Nhập mới từ Pháp' },
  { id: 'INV-2026-002', productId: 'prod2', productName: 'Dior Sauvage EDP 100ml', brand: 'Dior', scent: 'Hương Gỗ Cay Nồng', concentration: 'EDP', volume: '100ml', quantity: 10, importPrice: 2100000, date: '09:15 06/08/2026', note: 'Nhập kho đợt 2' },
  { id: 'INV-2026-001', productId: 'prod1', productName: 'Miss Dior Blooming Bouquet EDP 100ml', brand: 'Dior', scent: 'Hoa Hồng & Mẫu Đơn', concentration: 'EDT', volume: '100ml', quantity: 15, importPrice: 1950000, date: '14:20 05/08/2026', note: 'Nhập kho đợt 1' }
];

// Initial Fallback Mock Products matching Image 2 & SRS
const initialProducts: Product[] = [
  {
    _id: 'prod1',
    name: 'Miss Dior Blooming Bouquet EDP 100ml',
    slug: 'miss-dior-blooming-bouquet-100ml',
    brand: 'Dior',
    category: 'Nước hoa Nữ',
    price: 2500000,
    originalPrice: 2800000,
    discountPercent: 11,
    flashSalePrice: 2250000,
    volume: '100ml',
    availableVolumes: ['30ml', '50ml', '100ml'],
    volumeOptions: [
      { volume: '30ml', price: 1400000, originalPrice: 1550000, flashSalePrice: 1250000 },
      { volume: '50ml', price: 1900000, originalPrice: 2150000, flashSalePrice: 1750000 },
      { volume: '100ml', price: 2500000, originalPrice: 2800000, flashSalePrice: 2250000 }
    ],
    availableScents: ['Hoa Hồng & Xạ Hương', 'Mẫu Đơn & Quýt Sicili', 'Gỗ Tuyết Tùng & Vani'],
    gender: 'Nữ',
    origin: 'Pháp',
    concentration: 'EDP',
    image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=600',
    gallery: [
      'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=600',
      'https://images.unsplash.com/photo-1541643600914-78b084683601?w=600',
      'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?w=600',
      'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=600'
    ],
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    description: 'Hương thơm tươi mát, nữ tính và lãng mạn. Sự kết hợp hoàn hảo giữa hương hoa mẫu đơn, hoa hồng và xạ hương trắng.',
    ingredients: 'Alcohol, Parfum (Fragrance), Aqua (Water), Limonene, Ethylhexyl Methoxycinnamate, Hexyl Cinnamal, Linalool.',
    benefits: 'Tỏa hương lôi cuốn 8-12 tiếng. Phong cách kiều diễm, sang trọng.',
    fragranceNotes: {
      top: 'Quýt Sicili tươi mát',
      middle: 'Hoa mẫu đơn hồng, hoa hồng Damascus',
      base: 'Xạ hương trắng quý phái'
    },
    stock: 45,
    soldCount: 1250,
    rating: 4.9,
    reviewCount: 256,
    isFeatured: true,
    isFlashSale: true,
    flashSaleEndTime: new Date(Date.now() + 2 * 60 * 60 * 1000 + 18 * 60 * 1000).toISOString() // ~2 hours 18 mins from load
  },
  {
    _id: 'prod2',
    name: 'Dior Sauvage EDP 100ml',
    slug: 'dior-sauvage-edp-100ml',
    brand: 'Dior',
    category: 'Nước hoa Nam',
    price: 2450000,
    originalPrice: 3400000,
    discountPercent: 30,
    volume: '100ml',
    availableVolumes: ['60ml', '100ml', '200ml'],
    volumeOptions: [
      { volume: '60ml', price: 1850000, originalPrice: 2500000 },
      { volume: '100ml', price: 2450000, originalPrice: 3400000 },
      { volume: '200ml', price: 3950000, originalPrice: 5200000 }
    ],
    availableScents: ['Cam Bergamot & Tiêu Đen', 'Oải Hương & Tiêu Tứ Xuyên', 'Gỗ Tuyết Tùng & Ambroxan'],
    gender: 'Nam',
    origin: 'Pháp',
    concentration: 'EDP',
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600',
    gallery: [
      'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600',
      'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=600',
      'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?w=600',
      'https://images.unsplash.com/photo-1541643600914-78b084683601?w=600'
    ],
    description: 'Sự hòa quyện của Cam Bergamot Calabrian và Tiêu Tứ Xuyên mộc mạc, phóng khoáng.',
    ingredients: 'Alcohol, Parfum, Aqua, Linalool, Limonene.',
    benefits: 'Tỏa hương mạnh mẽ, chuẩn nam tính phong trần.',
    fragranceNotes: {
      top: 'Cam Bergamot, Tiêu đen',
      middle: 'Oải hương, Tiêu Tứ Xuyên',
      base: 'Gỗ tuyết tùng, Ambroxan'
    },
    stock: 80,
    soldCount: 2100,
    rating: 4.9,
    reviewCount: 412,
    isFeatured: true,
    isFlashSale: true,
    flashSaleEndTime: new Date(Date.now() + 2 * 60 * 60 * 1000 + 18 * 60 * 1000).toISOString() // ~2 hours 18 mins from load
  },
  {
    _id: 'prod3',
    name: 'Chanel Coco Mademoiselle EDP 100ml',
    slug: 'chanel-coco-mademoiselle-100ml',
    brand: 'Chanel',
    category: 'Nước hoa Nữ',
    price: 2650000,
    originalPrice: 3100000,
    discountPercent: 17,
    volume: '100ml',
    availableVolumes: ['50ml', '100ml'],
    availableScents: ['Hoa Hồng Thổ Nhĩ Kỳ', 'Hoa Cam & Hoa Nhài', 'Hoắc Hương & Cỏ Hương Bài'],
    gender: 'Nữ',
    origin: 'Pháp',
    concentration: 'EDP',
    image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=600',
    gallery: [
      'https://images.unsplash.com/photo-1541643600914-78b084683601?w=600',
      'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=600',
      'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=600',
      'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600'
    ],
    description: 'Nước hoa huyền thoại tôn vinh sự thanh lịch, quyến rũ và kiêu kỳ.',
    ingredients: 'Parfum, Alcohol, Aqua, Benzyl Salicylate.',
    benefits: 'Lưu hương vượt trội trên 12h.',
    fragranceNotes: {
      top: 'Cam chanh, Hoa cam',
      middle: 'Hoa hồng Thổ Nhĩ Kỳ, Hoa nhài',
      base: 'Hoắc hương, Cỏ hương bài'
    },
    stock: 30,
    soldCount: 1890,
    rating: 4.9,
    reviewCount: 198,
    isFeatured: true,
    isFlashSale: false
  },
  {
    _id: 'prod4',
    name: 'YSL Libre EDP 90ml',
    slug: 'ysl-libre-edp-90ml',
    brand: 'Yves Saint Laurent',
    category: 'Nước hoa Nữ',
    price: 2350000,
    originalPrice: 2890000,
    discountPercent: 19,
    volume: '90ml',
    availableVolumes: ['30ml', '50ml', '90ml'],
    availableScents: ['Hoa Oải Hương Pháp', 'Hoa Cam Maroc & Vani', 'Hổ Phách Gợi Cảm'],
    gender: 'Nữ',
    origin: 'Pháp',
    concentration: 'EDP',
    image: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=600',
    gallery: [
      'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=600',
      'https://images.unsplash.com/photo-1541643600914-78b084683601?w=600',
      'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=600',
      'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?w=600'
    ],
    description: 'Tự do kiêu hãnh với hoa oải hương Pháp kết hợp cùng hoa cam Maroc nồng nàn.',
    ingredients: 'Alcohol, Parfum, Water, Benzyl Alcohol.',
    benefits: 'Độc đáo, hiện đại và vô cùng gợi cảm.',
    fragranceNotes: {
      top: 'Tinh dầu hoa cam, Oải hương',
      middle: 'Hoa nhài Ấn Độ',
      base: 'Hổ phách, Vani'
    },
    stock: 65,
    soldCount: 950,
    rating: 4.8,
    reviewCount: 122,
    isFeatured: true,
    isFlashSale: true,
    flashSaleEndTime: new Date(Date.now() + 2 * 60 * 60 * 1000 + 18 * 60 * 1000).toISOString() // ~2 hours 18 mins from load
  },
  {
    _id: 'prod5',
    name: 'Versace Dylan Blue Pour Homme 100ml',
    slug: 'versace-dylan-blue-100ml',
    brand: 'Versace',
    category: 'Nước hoa Nam',
    price: 2150000,
    originalPrice: 2800000,
    discountPercent: 23,
    volume: '100ml',
    availableVolumes: ['50ml', '100ml'],
    availableScents: ['Hương Biển & Bưởi Tây', 'Hoắc Hương & Tiêu Đen', 'Gỗ Địa Trung Hải'],
    gender: 'Nam',
    origin: 'Ý',
    concentration: 'EDT',
    image: 'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?w=600',
    gallery: [
      'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?w=600',
      'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600',
      'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=600',
      'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=600'
    ],
    description: 'Hương biển mát lạnh đan xen hương gỗ quý hiếm miền Địa Trung Hải.',
    ingredients: 'Alcohol, Fragrance, Water.',
    benefits: 'Trẻ trung, quyến rũ và tươi mát.',
    fragranceNotes: {
      top: 'Hương biển, Bưởi, Lá sung',
      middle: 'Hoắc hương, Tiêu đen',
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
    _id: 'prod6',
    name: 'Luxora Luxury Scented Wax 150g',
    slug: 'luxora-scented-wax-150g',
    brand: 'Gucci',
    category: 'Sáp thơm',
    price: 450000,
    originalPrice: 650000,
    discountPercent: 30,
    volume: '150g',
    availableVolumes: ['150g'],
    volumeOptions: [
      { volume: '150g', price: 450000, originalPrice: 650000 }
    ],
    availableScents: ['Hương Gỗ Đàn Hương', 'Hoa Nhài Trắng', 'Vani Ngọt Ngào'],
    gender: 'Unisex',
    origin: 'Pháp',
    concentration: 'Wax',
    image: 'https://images.unsplash.com/photo-1616949755610-8c9bbc08f138?w=600',
    gallery: [
      'https://images.unsplash.com/photo-1616949755610-8c9bbc08f138?w=600'
    ],
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
  },
  {
    _id: 'prod7',
    name: 'Giftset Dior J\'adore',
    slug: 'giftset-dior-jadore',
    brand: 'Dior',
    category: 'Giftset',
    price: 3500000,
    originalPrice: 4200000,
    discountPercent: 16,
    volume: 'Set 3 món',
    availableVolumes: ['Set 3 món'],
    volumeOptions: [
      { volume: 'Set 3 món', price: 3500000, originalPrice: 4200000 }
    ],
    availableScents: ['Hoa Hồng & Ngọc Lan Tây'],
    gender: 'Nữ',
    origin: 'Pháp',
    concentration: 'EDP',
    image: 'https://images.unsplash.com/photo-1549411985-115aeb7799ea?w=600',
    gallery: [
      'https://images.unsplash.com/photo-1549411985-115aeb7799ea?w=600'
    ],
    description: 'Bộ quà tặng cao cấp gồm nước hoa 100ml, mini 10ml và dưỡng thể 75ml.',
    ingredients: 'Alcohol, Parfum, Aqua.',
    benefits: 'Phù hợp làm quà tặng trong các dịp lễ đặc biệt.',
    fragranceNotes: {
      top: 'Hoa mộc lan, Dưa lưới, Đào',
      middle: 'Hoa huệ, Mận, Hoa violet, Hoa lan Nam Phi, Hoa nhài',
      base: 'Xạ hương, Vani, Gỗ tuyết tùng'
    },
    stock: 20,
    soldCount: 85,
    rating: 5.0,
    reviewCount: 12,
    isFeatured: true,
    isFlashSale: false
  },
  {
    _id: 'prod8',
    name: 'Giftset YSL Black Opium',
    slug: 'giftset-ysl-black-opium',
    brand: 'Yves Saint Laurent',
    category: 'Giftset',
    price: 3200000,
    originalPrice: 3800000,
    discountPercent: 15,
    volume: 'Set 2 món',
    availableVolumes: ['Set 2 món'],
    volumeOptions: [
      { volume: 'Set 2 món', price: 3200000, originalPrice: 3800000 }
    ],
    availableScents: ['Cà Phê & Vani'],
    gender: 'Nữ',
    origin: 'Pháp',
    concentration: 'EDP',
    image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600',
    gallery: [
      'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600'
    ],
    description: 'Bộ quà tặng gồm nước hoa 90ml và son môi cao cấp YSL Rouge Pur Couture.',
    ingredients: 'Alcohol, Parfum, Aqua, Linalool, Benzyl Salicylate.',
    benefits: 'Hương thơm ngọt ngào, quyến rũ, phù hợp cho những buổi tiệc đêm.',
    fragranceNotes: {
      top: 'Hạt tiêu hồng, Hoa cam, Quả lê',
      middle: 'Cà phê, Hoa nhài, Hạnh nhân, Cam thảo',
      base: 'Vani, Hoắc hương, Gỗ tuyết tùng'
    },
    stock: 15,
    soldCount: 42,
    rating: 4.8,
    reviewCount: 9,
    isFeatured: true,
    isFlashSale: false
  }
];

const initialVouchers: Voucher[] = [
  {
    _id: 'v1',
    code: 'LUXORA100K',
    name: 'Giảm ngay 100K cho đơn từ 699K',
    discountType: 'fixed',
    discountValue: 100000,
    minOrderValue: 699000,
    quantity: 500,
    usedQuantity: 142,
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    status: 'active'
  },
  {
    _id: 'v2',
    code: 'FREESHIP',
    name: 'Miễn phí vận chuyển 30K',
    discountType: 'fixed',
    discountValue: 30000,
    minOrderValue: 0,
    quantity: 1000,
    usedQuantity: 380,
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    status: 'active'
  },
  {
    _id: 'v3',
    code: 'LUXORAVIP20',
    name: 'Giảm 20% tối đa 300K',
    discountType: 'percent',
    discountValue: 20,
    maxDiscount: 300000,
    minOrderValue: 1000000,
    quantity: 200,
    usedQuantity: 58,
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    status: 'active'
  },
  {
    _id: 'v4',
    code: 'LUXORA50K',
    name: 'Giảm ngay 50K cho đơn từ 399K',
    discountType: 'fixed',
    discountValue: 50000,
    minOrderValue: 399000,
    quantity: 1000,
    usedQuantity: 230,
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    status: 'active'
  },
  {
    _id: 'v5',
    code: 'LUXORA200K',
    name: 'Giảm ngay 200K cho đơn từ 1499K',
    discountType: 'fixed',
    discountValue: 200000,
    minOrderValue: 1499000,
    quantity: 300,
    usedQuantity: 95,
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    status: 'active'
  },
  {
    _id: 'v6',
    code: 'NEWBIE10',
    name: 'Giảm 10% cho khách hàng mới',
    discountType: 'percent',
    discountValue: 10,
    maxDiscount: 150000,
    minOrderValue: 0,
    quantity: 2000,
    usedQuantity: 580,
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    status: 'active'
  },
  {
    _id: 'v7',
    code: 'GIFTSET15',
    name: 'Giảm 15% khi mua Giftset',
    discountType: 'percent',
    discountValue: 15,
    maxDiscount: 250000,
    minOrderValue: 2000000,
    quantity: 150,
    usedQuantity: 30,
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    status: 'active'
  },
  {
    _id: 'v8',
    code: 'WEEKEND50',
    name: 'Giảm 50K cuối tuần',
    discountType: 'fixed',
    discountValue: 50000,
    minOrderValue: 499000,
    quantity: 500,
    usedQuantity: 412,
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    status: 'active'
  },
  {
    _id: 'v9',
    code: 'NIGHTSALE150',
    name: 'Giảm 150K khung giờ vàng',
    discountType: 'fixed',
    discountValue: 150000,
    minOrderValue: 999000,
    quantity: 100,
    usedQuantity: 87,
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    status: 'active'
  },
  {
    _id: 'v10',
    code: 'BIRTHDAY25',
    name: 'Giảm 25% tháng sinh nhật',
    discountType: 'percent',
    discountValue: 25,
    maxDiscount: 500000,
    minOrderValue: 2500000,
    quantity: 100,
    usedQuantity: 15,
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    status: 'active'
  }
];

const initialAffiliates: Affiliate[] = [
  {
    _id: 'aff1',
    user: { _id: 'u1', name: 'Phạm Minh Tuấn', email: 'tuanpham@gmail.com', role: 'affiliate', phone: '0918889999' },
    referralCode: 'AFF12345',
    referralLink: 'https://luxora.vn/?ref=AFF12345',
    status: 'Approved',
    totalClick: 1248,
    totalOrder: 136,
    totalCommission: 8230000,
    availableBalance: 2450000,
    pendingBalance: 3210000,
    paidBalance: 5780000,
    bankInfo: { bankName: 'MBBank', bankNumber: '999988887777', accountName: 'NGUYEN VAN AN' }
  },
  {
    _id: 'aff2',
    user: { _id: 'u2', name: 'Trần Quỳnh Anh', email: 'quynhanh.98@gmail.com', role: 'affiliate', phone: '0988776655' },
    referralCode: 'AFF8888',
    referralLink: 'https://luxora.vn/?ref=AFF8888',
    status: 'Approved',
    totalClick: 950,
    totalOrder: 98,
    totalCommission: 9870000,
    availableBalance: 4100000,
    pendingBalance: 2100000,
    paidBalance: 3670000,
    bankInfo: { bankName: 'Vietcombank', bankNumber: '0071001234567', accountName: 'TRAN QUYNH ANH' }
  },
  {
    _id: 'aff3',
    user: { _id: 'u3', name: 'Lê Văn Cường', email: 'cuongle@gmail.com', role: 'customer', phone: '0912345678' },
    referralCode: 'AFF7777',
    referralLink: 'https://luxora.vn/?ref=AFF7777',
    status: 'Pending',
    totalClick: 42,
    totalOrder: 2,
    totalCommission: 150000,
    availableBalance: 0,
    pendingBalance: 150000,
    paidBalance: 0,
    bankInfo: { bankName: 'Techcombank', bankNumber: '19035678901234', accountName: 'LE VAN CUONG' }
  }
];

export const sortOrdersNewestFirst = (ordersList: Order[]): Order[] => {
  if (!Array.isArray(ordersList)) return [];
  return [...ordersList].sort((a, b) => {
    const getTime = (o: Order): number => {
      if (!o) return 0;
      if (o.createdAt) {
        const d = Date.parse(o.createdAt);
        if (!isNaN(d)) return d;
        if (o.createdAt.includes('/')) {
          const parts = o.createdAt.split('-');
          const dateStr = parts[parts.length - 1].trim();
          const timeStr = parts.length > 1 ? parts[0].trim() : '00:00';
          const [day, month, year] = dateStr.split('/');
          const [hour, min] = timeStr.split(':');
          if (day && month && year) {
            const parsed = new Date(
              parseInt(year, 10),
              parseInt(month, 10) - 1,
              parseInt(day, 10),
              parseInt(hour || '0', 10),
              parseInt(min || '0', 10)
            ).getTime();
            if (!isNaN(parsed)) return parsed;
          }
        }
      }
      if (o._id && typeof o._id === 'string' && o._id.startsWith('ord_')) {
        const ts = parseInt(o._id.replace('ord_', ''), 10);
        if (!isNaN(ts)) return ts;
      }
      if (o._id && typeof o._id === 'string' && o._id.length === 24) {
        const ts = parseInt(o._id.substring(0, 8), 16) * 1000;
        if (!isNaN(ts)) return ts;
      }
      return 0;
    };
    return getTime(b) - getTime(a);
  });
};

const initialOrders: Order[] = [
  {
    _id: 'ord1',
    orderCode: 'LUX10086',
    customerName: 'Trần Thị Mai',
    customerEmail: 'thimai@gmail.com',
    customerPhone: '0987654321',
    shippingAddress: '12 Nguyễn Trãi, Q5, TP.HCM',
    items: [
      { product: 'prod1', name: 'Miss Dior Blooming Bouquet EDP 100ml', image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=600', volume: '100ml', price: 2250000, quantity: 1 }
    ],
    subtotal: 2250000,
    shippingFee: 0,
    discountAmount: 0,
    totalAmount: 2250000,
    paymentMethod: 'MoMo',
    paymentStatus: 'Paid',
    orderStatus: 'Xác nhận',
    createdAt: '14:30 - 05/08/2026'
  },
  {
    _id: 'ord2',
    orderCode: 'LUX10085',
    customerName: 'Lê Hoàng Nam',
    customerEmail: 'namle@gmail.com',
    customerPhone: '0912345678',
    shippingAddress: '45 Lê Lợi, Q1, TP.HCM',
    items: [
      { product: 'prod2', name: 'Dior Sauvage EDP 100ml', image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600', volume: '100ml', price: 2450000, quantity: 1 }
    ],
    subtotal: 2450000,
    shippingFee: 0,
    discountAmount: 600000,
    totalAmount: 1850000,
    paymentMethod: 'COD',
    paymentStatus: 'Pending',
    orderStatus: 'Đóng gói',
    createdAt: '10:15 - 05/08/2026'
  }
];

const initialCategories: Category[] = [
  { _id: 'cat1', name: 'Nước hoa nam', slug: 'nuoc-hoa-nam', icon: 'UserCheck', isFeatured: true },
  { _id: 'cat2', name: 'Nước hoa nữ', slug: 'nuoc-hoa-nu', icon: 'Sparkles', isFeatured: true },
  { _id: 'cat3', name: 'Body Mist', slug: 'body-mist', icon: 'Wind', isFeatured: true },
  { _id: 'cat4', name: 'Lăn khử mùi', slug: 'lan-khu-mui', icon: 'Shield', isFeatured: true },
  { _id: 'cat5', name: 'Sáp thơm', slug: 'sap-thom', icon: 'Flame', isFeatured: true },
  { _id: 'cat6', name: 'Gift Set', slug: 'gift-set', icon: 'Gift', isFeatured: true }
];

const initialCustomers: Customer[] = [
  { id: 'c1', name: 'Trần Thị Mai', email: 'thimai@gmail.com', phone: '0987654321', provider: 'email', orderCount: 5, totalSpent: 11250000, status: 'active', createdAt: '2026-01-15' },
  { id: 'c2', name: 'Phạm Minh Tuấn', email: 'tuanpham.google@gmail.com', phone: '0918889999', provider: 'google', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', orderCount: 3, totalSpent: 6450000, status: 'active', createdAt: '2026-02-01' },
  { id: 'c3', name: 'Lê Văn Cường', email: 'cuongle@gmail.com', phone: '0912345678', provider: 'email', orderCount: 2, totalSpent: 3200000, status: 'active', createdAt: '2026-03-10' },
  { id: 'c4', name: 'Phạm Văn Hùng', email: 'spammer@gmail.com', phone: '0999999999', provider: 'email', orderCount: 0, totalSpent: 0, status: 'locked', createdAt: '2026-04-05' }
];

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [vouchers, setVouchers] = useState<Voucher[]>(initialVouchers);
  const [isHydrated, setIsHydrated] = useState(false);
  const hasLoadedRef = React.useRef(false);

  // Function to sync user session from localStorage
  const loadDataFromStorage = () => {
    if (typeof window !== 'undefined') {
      try {
        const savedUser = localStorage.getItem('luxora_user');
        if (savedUser) {
          try {
            const parsedUser = JSON.parse(savedUser) as User;
            if (parsedUser && parsedUser.email) {
              setUser(parsedUser);
            }
          } catch (e) {}
        }

        const savedUserPoints = localStorage.getItem('luxora_user_points');
        if (savedUserPoints) {
          setUserPoints(parseInt(savedUserPoints, 10) || 0);
        }

        const savedUsedPoints = localStorage.getItem('luxora_used_points');
        if (savedUsedPoints) {
          setUsedPoints(parseInt(savedUsedPoints, 10) || 0);
        }

        const savedPurchased = localStorage.getItem('luxora_purchased_products');
        if (savedPurchased) {
          try { setPurchasedProductIds(JSON.parse(savedPurchased)); } catch(e) {}
        }

        const savedReviewed = localStorage.getItem('luxora_reviewed_products');
        if (savedReviewed) {
          try { setReviewedProductIds(JSON.parse(savedReviewed)); } catch(e) {}
        }

        const savedReviews = localStorage.getItem('luxora_product_reviews');
        if (savedReviews) {
          try { setProductReviews(JSON.parse(savedReviews)); } catch(e) {}
        }

        const savedOrders = localStorage.getItem('luxora_orders');
        if (savedOrders) {
          try {
            const parsedOrders = JSON.parse(savedOrders);
            if (Array.isArray(parsedOrders) && parsedOrders.length > 0) {
              setOrders(sortOrdersNewestFirst(parsedOrders));
            } else {
              setOrders(sortOrdersNewestFirst(initialOrders));
              try { localStorage.setItem('luxora_orders', JSON.stringify(initialOrders)); } catch(e) {}
            }
          } catch(e) {
            setOrders(sortOrdersNewestFirst(initialOrders));
          }
        } else {
          setOrders(sortOrdersNewestFirst(initialOrders));
          try { localStorage.setItem('luxora_orders', JSON.stringify(initialOrders)); } catch(e) {}
        }

        const savedProducts = localStorage.getItem('luxora_products');
        if (savedProducts) {
          try {
            const parsedProducts = JSON.parse(savedProducts);
            if (Array.isArray(parsedProducts) && parsedProducts.length > 0) {
              setProducts(parsedProducts);
            }
          } catch(e) {}
        }

        const savedCustomers = localStorage.getItem('luxora_customers');
        if (savedCustomers) {
          try {
            const parsedCust = JSON.parse(savedCustomers);
            if (Array.isArray(parsedCust) && parsedCust.length > 0) {
              setCustomers(parsedCust);
            }
          } catch(e) {}
        }

        const savedInvLogs = localStorage.getItem('luxora_inventory_logs');
        if (savedInvLogs) {
          try {
            const parsedInv = JSON.parse(savedInvLogs);
            if (Array.isArray(parsedInv) && parsedInv.length > 0) {
              setInventoryLogs(parsedInv);
            } else {
              setInventoryLogs(initialInventoryLogs);
              try { localStorage.setItem('luxora_inventory_logs', JSON.stringify(initialInventoryLogs)); } catch(e) {}
            }
          } catch(e) {
            setInventoryLogs(initialInventoryLogs);
          }
        } else {
          setInventoryLogs(initialInventoryLogs);
          try { localStorage.setItem('luxora_inventory_logs', JSON.stringify(initialInventoryLogs)); } catch(e) {}
        }

        const savedModalProdId = localStorage.getItem('luxora_modal_product_id');
        if (savedModalProdId) {
          try {
            const listToSearch = savedProducts ? JSON.parse(savedProducts) : initialProducts;
            const found = listToSearch.find((p: any) => p._id === savedModalProdId || p.slug === savedModalProdId || p.id === savedModalProdId);
            if (found) setSelectedProductModal(found);
          } catch(e) {}
        }
      } catch (err) {}
    }
    hasLoadedRef.current = true;
  };

  const syncFromBackendApi = async () => {
    try {
      const [resP, resO, resU, resInv] = await Promise.all([
        fetch('http://localhost:5000/api/products').catch(() => null),
        fetch('http://localhost:5000/api/orders').catch(() => null),
        fetch('http://localhost:5000/api/users').catch(() => null),
        fetch('http://localhost:5000/api/inventory').catch(() => null)
      ]);

      if (resP && resP.ok) {
        const dbProducts = await resP.json();
        if (Array.isArray(dbProducts) && dbProducts.length > 0) {
          setProducts(dbProducts);
        }
      }

      let currentLocalOrders: Order[] = [];
      if (typeof window !== 'undefined') {
        try {
          const rawSaved = localStorage.getItem('luxora_orders');
          if (rawSaved) {
            const parsed = JSON.parse(rawSaved);
            if (Array.isArray(parsed) && parsed.length > 0) {
              currentLocalOrders = parsed;
            }
          }
        } catch (e) {}
      }
      if (currentLocalOrders.length === 0) {
        currentLocalOrders = initialOrders;
      }

      let activeOrdersList: Order[] = currentLocalOrders;

      if (resO && resO.ok) {
        const dbOrders = await resO.json();
        if (Array.isArray(dbOrders)) {
          const orderMap = new Map<string, Order>();

          // 1. Load current local orders into map
          currentLocalOrders.forEach(o => {
            if (!o) return;
            const key = (o.orderCode || o._id || '').toString().trim().toLowerCase().replace(/^#/, '');
            if (key) orderMap.set(key, o);
          });

          // 2. Add/merge backend orders into map (backend takes precedence for server state)
          dbOrders.forEach((dbO: Order) => {
            if (!dbO) return;
            const key = (dbO.orderCode || dbO._id || '').toString().trim().toLowerCase().replace(/^#/, '');
            if (key) {
              const existingLocal = orderMap.get(key);
              orderMap.set(key, { ...existingLocal, ...dbO });
            }
          });

          const mergedOrders = sortOrdersNewestFirst(Array.from(orderMap.values()));
          activeOrdersList = mergedOrders;
          setOrders(mergedOrders);

          if (typeof window !== 'undefined') {
            try { localStorage.setItem('luxora_orders', JSON.stringify(mergedOrders)); } catch(e) {}
          }

          // 3. Sync missing local orders to backend asynchronously
          const dbKeySet = new Set(dbOrders.map((o: Order) => (o.orderCode || o._id || '').toString().trim().toLowerCase().replace(/^#/, '')));
          currentLocalOrders.forEach(localOrd => {
            const lKey = (localOrd.orderCode || localOrd._id || '').toString().trim().toLowerCase().replace(/^#/, '');
            if (lKey && !dbKeySet.has(lKey)) {
              fetch('http://localhost:5000/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(localOrd)
              }).catch(() => {});
            }
          });
        }
      }

      let currentLocalInvLogs: any[] = [];
      if (typeof window !== 'undefined') {
        try {
          const rawInv = localStorage.getItem('luxora_inventory_logs');
          if (rawInv) {
            const parsed = JSON.parse(rawInv);
            if (Array.isArray(parsed) && parsed.length > 0) {
              currentLocalInvLogs = parsed;
            }
          }
        } catch (e) {}
      }
      if (currentLocalInvLogs.length === 0) {
        currentLocalInvLogs = initialInventoryLogs;
      }

      if (resInv && resInv.ok) {
        const dbLogs = await resInv.json();
        if (Array.isArray(dbLogs)) {
          const logMap = new Map<string, any>();

          // 1. Add current local inventory logs into map
          currentLocalInvLogs.forEach(l => {
            if (!l) return;
            const key = (l.id || l._id || '').toString().trim();
            if (key) logMap.set(key, l);
          });

          // 2. Add/merge backend logs into map (backend takes precedence)
          dbLogs.forEach((dbL: any) => {
            if (!dbL) return;
            const key = (dbL.id || dbL._id || '').toString().trim();
            if (key) {
              const existingLocal = logMap.get(key);
              logMap.set(key, { ...existingLocal, ...dbL });
            }
          });

          const mergedLogs = Array.from(logMap.values());
          setInventoryLogs(mergedLogs);

          if (typeof window !== 'undefined') {
            try { localStorage.setItem('luxora_inventory_logs', JSON.stringify(mergedLogs)); } catch(e) {}
          }

          // 3. Sync missing local inventory logs to backend
          const dbKeySet = new Set(dbLogs.map((l: any) => (l.id || l._id || '').toString().trim()));
          currentLocalInvLogs.forEach(localLog => {
            const lKey = (localLog.id || localLog._id || '').toString().trim();
            if (lKey && !dbKeySet.has(lKey)) {
              fetch('http://localhost:5000/api/inventory', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(localLog)
              }).catch(() => {});
            }
          });
        }
      }

      if (resU && resU.ok) {
        const dbUsers = await resU.json();
        if (Array.isArray(dbUsers)) {
          const formattedCust: Customer[] = dbUsers.map((u: any) => {
            const fullAddr = [u.detailAddress, u.district, u.province].filter(Boolean).join(', ') || (typeof u.address === 'string' ? u.address : '');

            const cleanUEmail = (u.email || '').trim().toLowerCase();
            const cleanUPhone = (u.phone || '').replace(/\D/g, '');
            const custOrders = activeOrdersList.filter(o => {
              const cleanOEmail = (o.customerEmail || '').trim().toLowerCase();
              const cleanOPhone = (o.customerPhone || '').replace(/\D/g, '');
              return (cleanUEmail && cleanOEmail === cleanUEmail) || (cleanUPhone && cleanUPhone !== '' && cleanOPhone === cleanUPhone);
            });
            const validOrders = custOrders.filter(o => o.orderStatus !== 'Hủy' && o.orderStatus !== 'Hủy đơn');
            const calcOrdersCount = validOrders.length;
            const calcTotalSpent = validOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

            return {
              id: u._id || u.id,
              name: u.name,
              email: u.email,
              phone: u.phone || '',
              province: u.province || '',
              district: u.district || '',
              detailAddress: u.detailAddress || '',
              address: fullAddr,
              provider: u.provider || 'email',
              avatar: u.avatar,
              orderCount: u.orderCount || calcOrdersCount,
              totalSpent: u.totalSpent || calcTotalSpent,
              status: u.status || 'active',
              createdAt: u.createdAt ? new Date(u.createdAt).toISOString().split('T')[0] : '2026-01-01'
            };
          });
          setCustomers(formattedCust);
          if (typeof window !== 'undefined') {
            try { localStorage.setItem('luxora_customers', JSON.stringify(formattedCust)); } catch(e) {}
          }

          // Sync current logged in user session if present
          if (user && user.email) {
            const matchedDbUser = dbUsers.find((u: any) => (u.email || '').trim().toLowerCase() === (user.email || '').trim().toLowerCase());
            if (matchedDbUser) {
              const updatedUser: User = {
                ...user,
                name: user.name || matchedDbUser.name,
                phone: user.phone || matchedDbUser.phone,
                province: (user as any).province || matchedDbUser.province || '',
                district: (user as any).district || matchedDbUser.district || '',
                detailAddress: (user as any).detailAddress || matchedDbUser.detailAddress || '',
                avatar: user.avatar || matchedDbUser.avatar,
                status: matchedDbUser.status || user.status
              };
              if (JSON.stringify(updatedUser) !== JSON.stringify(user)) {
                setUser(updatedUser);
                if (typeof window !== 'undefined') {
                  try { localStorage.setItem('luxora_user', JSON.stringify(updatedUser)); } catch (e) {}
                }
              }
            }
          }
        }
      }

      const resC = await fetch('http://localhost:5000/api/categories');
      if (resC.ok) {
        const dbCat = await resC.json();
        if (Array.isArray(dbCat)) {
          setCategories(dbCat);
        }
      }

      const resB = await fetch('http://localhost:5000/api/brands');
      if (resB.ok) {
        const dbB = await resB.json();
        if (Array.isArray(dbB)) {
          const names = dbB.map((b: any) => typeof b === 'string' ? b : b.name);
          setBrands(names);
        }
      }

      const resV = await fetch('http://localhost:5000/api/vouchers');
      if (resV.ok) {
        const dbV = await resV.json();
        if (Array.isArray(dbV)) {
          setVouchers(dbV);
        }
      }
    } catch (err) {
      console.warn('[Luxora Store] Backend API sync unreachable.');
    }
  };

  // Load saved data on client mount + sync with MongoDB
  useEffect(() => {
    loadDataFromStorage();
    syncFromBackendApi();
    setIsHydrated(true);

    // Refresh every 3 seconds to keep tabs/browsers in sync with MongoDB
    const interval = setInterval(() => {
      syncFromBackendApi();
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const [inventoryLogs, setInventoryLogs] = useState<any[]>(initialInventoryLogs);

  const addInventoryLog = async (logData: any) => {
    const logsToAdd: any[] = Array.isArray(logData) ? logData : [logData];
    setInventoryLogs(prev => {
      const newIds = new Set(logsToAdd.map(l => l.id || l._id));
      const filtered = prev.filter(l => !newIds.has(l.id || l._id));
      const updated = [...logsToAdd, ...filtered];
      if (typeof window !== 'undefined') {
        try { localStorage.setItem('luxora_inventory_logs', JSON.stringify(updated)); } catch(e) {}
      }
      return updated;
    });

    try {
      for (const item of logsToAdd) {
        await fetch('http://localhost:5000/api/inventory', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item)
        }).catch(() => {});
      }
      syncFromBackendApi();
    } catch (err) {
      console.warn('[Luxora Store] Failed to save inventory log to MongoDB:', err);
    }
  };

  const [savedVouchers, setSavedVouchers] = useState<string[]>([]);
  const [usedVouchers, setUsedVouchers] = useState<string[]>([]);
  const [affiliates, setAffiliates] = useState<Affiliate[]>(initialAffiliates);
  const [orders, setOrders] = useState<Order[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [directBuyItem, setDirectBuyItem] = useState<CartItem | null>(null);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [selectedProductModal, setSelectedProductModalState] = useState<Product | null>(null);

  const setSelectedProductModal = (product: Product | null) => {
    setSelectedProductModalState(product);
    if (typeof window !== 'undefined') {
      try {
        if (product) {
          localStorage.setItem('luxora_modal_product_id', product._id || product.slug || (product as any).id);
        } else {
          localStorage.removeItem('luxora_modal_product_id');
        }
      } catch (e) {}
    }
  };
  const [appliedVoucher, setAppliedVoucher] = useState<Voucher | null>(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [refCode, setRefCode] = useState('');
  const [customers, setCustomers] = useState<Customer[]>([]);

  const [user, setUser] = useState<User | null>(null);

  // Reward Points State
  const [userPoints, setUserPoints] = useState<number>(0);
  const [usedPoints, setUsedPoints] = useState<number>(0);
  const [showPointsModal, setShowPointsModal] = useState<boolean>(false);
  const [lastEarnedPoints, setLastEarnedPoints] = useState<number>(5);

  useEffect(() => {
    if (isHydrated && hasLoadedRef.current && typeof window !== 'undefined') {
      try {
        localStorage.setItem('luxora_user_points', userPoints.toString());
      } catch (err) {}
    }
  }, [userPoints, isHydrated]);

  useEffect(() => {
    if (isHydrated && hasLoadedRef.current && typeof window !== 'undefined') {
      try {
        localStorage.setItem('luxora_used_points', usedPoints.toString());
      } catch (err) {}
    }
  }, [usedPoints, isHydrated]);

  const addRewardPoints = (amount: number) => {
    setUserPoints(prev => {
      const updated = prev + amount;
      if (typeof window !== 'undefined') {
        try { localStorage.setItem('luxora_user_points', updated.toString()); } catch (e) {}
      }
      return updated;
    });
    setLastEarnedPoints(amount);
    setShowPointsModal(true);
  };

  const useRewardPoints = (amount: number): boolean => {
    if (userPoints < amount) return false;
    setUserPoints(prev => {
      const updated = prev - amount;
      if (typeof window !== 'undefined') {
        try { localStorage.setItem('luxora_user_points', updated.toString()); } catch (e) {}
      }
      return updated;
    });
    setUsedPoints(prev => {
      const updated = prev + amount;
      if (typeof window !== 'undefined') {
        try { localStorage.setItem('luxora_used_points', updated.toString()); } catch (e) {}
      }
      return updated;
    });
    return true;
  };

  // Product Reviews State
  const initialReviews: Record<string, any[]> = {
    prod1: [
      { id: 'rev1', productId: 'prod1', userName: 'Trần Thị Hương', userEmail: 'huongtran@gmail.com', date: '14:20 06/08/2026', createdTime: '14:20 06/08/2026', rating: 5, comment: 'Mùi thơm cực kỳ sang trọng, giao hàng siêu nhanh. Đóng gói cẩn thận có tem chống hàng giả đầy đủ.' }
    ],
    prod2: [
      { id: 'rev2', productId: 'prod2', userName: 'Nguyễn Văn Minh', userEmail: 'minhnguyen@gmail.com', date: '09:15 03/08/2026', createdTime: '09:15 03/08/2026', rating: 5, comment: 'Sản phẩm lưu hương rất lâu, khoảng 8-10 tiếng. Rất hài lòng với dịch vụ Luxora.' }
    ]
  };

  const [productReviews, setProductReviews] = useState<Record<string, any[]>>(initialReviews);
  const [reviewedProductIds, setReviewedProductIds] = useState<string[]>([]);

  const getProductReviews = (productId: string) => {
    return productReviews[productId] || [];
  };

  const addProductReview = (productId: string, reviewData: { userName: string; userEmail?: string; rating: number; comment: string }) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    const dateStr = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()}`;
    const fullDateTime = `${timeStr} ${dateStr}`;

    const newRev = {
      id: 'rev_' + Date.now(),
      productId,
      userName: reviewData.userName,
      userEmail: reviewData.userEmail || (user?.email || ''),
      date: fullDateTime,
      createdTime: fullDateTime,
      rating: reviewData.rating,
      comment: reviewData.comment,
      isUser: true
    };
    setProductReviews(prev => {
      const existing = prev[productId] || [];
      const updated = [newRev, ...existing];
      const nextState = { ...prev, [productId]: updated };
      if (typeof window !== 'undefined') {
        try { localStorage.setItem('luxora_product_reviews', JSON.stringify(nextState)); } catch(e) {}
      }
      return nextState;
    });
    setReviewedProductIds(prev => {
      const updated = Array.from(new Set([...prev, productId]));
      if (typeof window !== 'undefined') {
        try { localStorage.setItem('luxora_reviewed_products', JSON.stringify(updated)); } catch(e) {}
      }
      return updated;
    });
  };

  const updateProductReview = (productId: string, rating: number, comment: string) => {
    setProductReviews(prev => {
      const existing = prev[productId] || [];
      const userEmail = (user?.email || '').toLowerCase();
      const updated = existing.map(r => {
        const isUserReview = r.isUser || (userEmail && (r.userEmail || '').toLowerCase() === userEmail);
        if (isUserReview) {
          return {
            ...r,
            rating,
            comment,
            date: 'Đã chỉnh sửa'
          };
        }
        return r;
      });
      const nextState = { ...prev, [productId]: updated };
      if (typeof window !== 'undefined') {
        try { localStorage.setItem('luxora_product_reviews', JSON.stringify(nextState)); } catch(e) {}
      }
      return nextState;
    });
    showToast('Đã cập nhật đánh giá của bạn!', 'success');
  };

  const deleteProductReview = (productId: string) => {
    setProductReviews(prev => {
      const existing = prev[productId] || [];
      const userEmail = (user?.email || '').toLowerCase();
      const updated = existing.filter(r => {
        const isUserReview = r.isUser || (userEmail && (r.userEmail || '').toLowerCase() === userEmail);
        return !isUserReview;
      });
      const nextState = { ...prev, [productId]: updated };
      if (typeof window !== 'undefined') {
        try { localStorage.setItem('luxora_product_reviews', JSON.stringify(nextState)); } catch(e) {}
      }
      return nextState;
    });
    setReviewedProductIds(prev => {
      const updated = Array.from(new Set([...prev, productId]));
      if (typeof window !== 'undefined') {
        try { localStorage.setItem('luxora_reviewed_products', JSON.stringify(updated)); } catch(e) {}
      }
      return updated;
    });
    showToast('Đã xóa đánh giá của bạn', 'info');
  };

  const hasUserReviewedProduct = (productId: string) => {
    if (reviewedProductIds.includes(productId)) return true;
    const reviews = productReviews[productId] || [];
    if (reviews.some(r => r.isUser)) return true;
    if (user && user.email) {
      return reviews.some(r => (r.userEmail || '').toLowerCase() === user.email.toLowerCase());
    }
    return false;
  };

  const addAdminReply = (productId: string, reviewId: string, replyText: string) => {
    setProductReviews(prev => {
      const existing = prev[productId] || [];
      const updated = existing.map(r => {
        if (r.id === reviewId) {
          return {
            ...r,
            adminReply: replyText,
            adminReplyDate: new Date().toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
          };
        }
        return r;
      });
      const nextState = { ...prev, [productId]: updated };
      if (typeof window !== 'undefined') {
        try { localStorage.setItem('luxora_product_reviews', JSON.stringify(nextState)); } catch(e) {}
      }
      return nextState;
    });
    showToast('Đã phản hồi đánh giá thành công!', 'success');
  };

  const prevUserEmailRef = useRef<string | null>(null);

  useEffect(() => {
    if (isHydrated && typeof window !== 'undefined') {
      try {
        const currentEmail = (user?.email || '').trim().toLowerCase();
        const prevEmail = prevUserEmailRef.current;

        if (prevEmail !== currentEmail && hasLoadedRef.current) {
          const prevKey = prevEmail || 'guest';
          localStorage.setItem(`luxora_cart_${prevKey}`, JSON.stringify(cart));
          localStorage.setItem(`luxora_wishlist_${prevKey}`, JSON.stringify(wishlist));

          const curKey = currentEmail || 'guest';
          const savedCart = localStorage.getItem(`luxora_cart_${curKey}`);
          const savedWish = localStorage.getItem(`luxora_wishlist_${curKey}`);

          if (savedCart) {
            try { setCart(JSON.parse(savedCart)); } catch (e) { setCart([]); }
          } else if (user && (user as any).cart && Array.isArray((user as any).cart)) {
            setCart((user as any).cart);
          } else {
            setCart([]);
          }

          if (savedWish) {
            try { setWishlist(JSON.parse(savedWish)); } catch (e) { setWishlist([]); }
          } else if (user && (user as any).wishlist && Array.isArray((user as any).wishlist)) {
            setWishlist((user as any).wishlist);
          } else {
            setWishlist([]);
          }

          if (user) {
            localStorage.setItem('luxora_user', JSON.stringify(user));
          } else {
            localStorage.removeItem('luxora_user');
          }

          prevUserEmailRef.current = currentEmail;
        } else if (prevUserEmailRef.current === null && currentEmail) {
          prevUserEmailRef.current = currentEmail;
        }
      } catch (err) {}
    }
  }, [user, isHydrated]);

  useEffect(() => {
    if (isHydrated && typeof window !== 'undefined') {
      try {
        const cleanEmail = (user?.email || '').trim().toLowerCase();
        const curKey = cleanEmail || 'guest';
        localStorage.setItem(`luxora_cart_${curKey}`, JSON.stringify(cart));
        localStorage.setItem(`luxora_wishlist_${curKey}`, JSON.stringify(wishlist));

        if (user && (user._id || user.email)) {
          const uId = user._id || user.email;
          fetch(`http://localhost:5000/api/users/${uId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ cart, wishlist })
          }).catch(() => {});
        }
      } catch (e) {}
    }
  }, [cart, wishlist, isHydrated]);

  const [affiliateData, setAffiliateData] = useState<Affiliate | null>({
    _id: 'aff123',
    user: 'user123',
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

  // Check URL query for affiliate ref code and load stored data
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedBrands = localStorage.getItem('luxora_brands');
      if (savedBrands) {
        try { setBrands(JSON.parse(savedBrands)); } catch(e) {}
      }
      const savedCategories = localStorage.getItem('luxora_categories');
      if (savedCategories) {
        try { setCategories(JSON.parse(savedCategories)); } catch(e) {}
      }

      const params = new URLSearchParams(window.location.search);
      const ref = params.get('ref');
      if (ref) {
        setRefCode(ref);
        localStorage.setItem('luxora_ref_code', ref);
      } else {
        const saved = localStorage.getItem('luxora_ref_code');
        if (saved) setRefCode(saved);
      }
    }
  }, []);

  // Real-time order sync across browser tabs and backend polling
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'luxora_orders' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) {
            setOrders(sortOrdersNewestFirst(parsed));
          }
        } catch (err) {}
      }
      if (e.key === 'luxora_products' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) {
            setProducts(parsed);
          }
        } catch (err) {}
      }
    };

    const handleFocus = () => {
      syncFromBackendApi();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('focus', handleFocus);

    const intervalId = setInterval(() => {
      syncFromBackendApi();
    }, 5000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', handleFocus);
      clearInterval(intervalId);
    };
  }, []);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3500);
  };

  const getVolumeStock = (product: Product, volumeName: string): number => {
    if (!product) return 0;
    const targetVol = volumeName || product.volume || '100ml';
    const vOpt = product.volumeOptions?.find(v => v.volume === targetVol);

    let baseStock = (vOpt && typeof vOpt.stock === 'number') 
      ? vOpt.stock 
      : (product.stock || 0);

    let reservedForVolume = 0;
    if (Array.isArray(orders)) {
      orders.forEach(o => {
        if (['Chờ xác nhận', 'Xác nhận', 'Đóng gói', 'Đang giao'].includes(o.orderStatus || 'Chờ xác nhận')) {
          o.items?.forEach(it => {
            const pId = typeof it.product === 'string' ? it.product : (it.product?._id || (it.product as any)?.id);
            const sameProd = (pId === product._id || pId === product.slug || (it.name && it.name.trim().toLowerCase() === product.name.trim().toLowerCase()));
            if (sameProd && (it.selectedVolume === targetVol || (!it.selectedVolume && targetVol === product.volume))) {
              reservedForVolume += (it.quantity || 1);
            }
          });
        }
      });
    }

    const available = baseStock - reservedForVolume;
    return available > 0 ? available : 0;
  };

  const addToCart = (product: Product, volume?: string, quantity: number = 1, scent?: string) => {
    const liveProduct = products.find(p => p._id === product._id || p.slug === product.slug || p.name === product.name) || product;
    const targetVolume = volume || liveProduct.volume || '100ml';
    const volStock = getVolumeStock(liveProduct, targetVolume);

    if (volStock <= 0) {
      showToast(`Dung tích ${targetVolume} của sản phẩm "${liveProduct.name}" hiện đã hết hàng!`, 'error');
      return;
    }
    const targetScent = scent || (liveProduct.availableScents && liveProduct.availableScents.length > 0 ? liveProduct.availableScents[0] : undefined);
    setCart(prev => {
      const existing = prev.find(
        item => (item.product._id === liveProduct._id || item.product.name === liveProduct.name) && item.selectedVolume === targetVolume && item.selectedScent === targetScent
      );
      const existingQty = existing ? existing.quantity : 0;
      if (existingQty + quantity > volStock) {
        showToast(`Dung tích ${targetVolume} hiện tại trong kho chỉ còn ${volStock} sản phẩm!`, 'error');
        if (existing) return prev;
      }
      if (existing) {
        return prev.map(item =>
          (item.product._id === liveProduct._id || item.product.name === liveProduct.name) && item.selectedVolume === targetVolume && item.selectedScent === targetScent
            ? { ...item, quantity: Math.min(volStock, item.quantity + quantity) }
            : item
        );
      }
      return [...prev, { product: liveProduct, selectedVolume: targetVolume, selectedScent: targetScent, quantity: Math.min(volStock, quantity) }];
    });
    showToast(`Đã thêm "${liveProduct.name}" (${targetVolume})${targetScent ? ` - ${targetScent}` : ''} vào giỏ hàng!`, 'success');
  };

  const buyNow = (product: Product, volume?: string, quantity: number = 1, scent?: string) => {
    const liveProduct = products.find(p => p._id === product._id || p.slug === product.slug || p.name === product.name) || product;
    const targetVolume = volume || liveProduct.volume || '100ml';
    const volStock = getVolumeStock(liveProduct, targetVolume);

    if (volStock <= 0) {
      showToast(`Dung tích ${targetVolume} của sản phẩm "${liveProduct.name}" hiện đã hết hàng!`, 'error');
      return;
    }
    if (quantity > volStock) {
      showToast(`Dung tích ${targetVolume} hiện tại trong kho chỉ còn ${volStock} sản phẩm!`, 'error');
    }
    const targetScent = scent || (liveProduct.availableScents && liveProduct.availableScents.length > 0 ? liveProduct.availableScents[0] : undefined);
    const finalQty = Math.min(volStock, quantity);
    setDirectBuyItem({ product: liveProduct, selectedVolume: targetVolume, selectedScent: targetScent, quantity: finalQty });
  };

  const updateCartQuantity = (productId: string, volume: string, qty: number, scent?: string) => {
    if (qty <= 0) {
      removeFromCart(productId, volume, scent);
      return;
    }
    const itemInCart = cart.find(item => item.product._id === productId && item.selectedVolume === volume && (scent ? item.selectedScent === scent : true));
    if (itemInCart) {
      const liveProduct = products.find(p => p._id === itemInCart.product._id || p.name === itemInCart.product.name) || itemInCart.product;
      if (qty > liveProduct.stock) {
        showToast(`Hiện tại trong kho chỉ còn ${liveProduct.stock} sản phẩm!`, 'error');
        return;
      }
    }
    setCart(prev =>
      prev.map(item =>
        item.product._id === productId && item.selectedVolume === volume && item.selectedScent === scent
          ? { ...item, quantity: qty }
          : item
      )
    );
  };

  const removeFromCart = (productId: string, volume: string, scent?: string) => {
    setCart(prev => prev.filter(item => !(item.product._id === productId && item.selectedVolume === volume && item.selectedScent === scent)));
    showToast('Đã xóa sản phẩm khỏi giỏ hàng', 'info');
  };

  const clearCart = () => {
    setCart([]);
  };

  const toggleWishlist = (productId: string) => {
    setWishlist(prev => {
      const exists = prev.includes(productId);
      if (exists) {
        showToast('Đã xóa sản phẩm khỏi danh sách yêu thích', 'info');
        return prev.filter(id => id !== productId);
      } else {
        showToast('Đã thêm sản phẩm vào danh sách yêu thích!', 'success');
        return [...prev, productId];
      }
    });
  };

  const applyVoucher = async (code: string, subtotalOverride?: number): Promise<boolean> => {
    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) return false;

    if (usedVouchers.includes(cleanCode)) {
      showToast('Bạn đã sử dụng mã voucher này rồi!', 'error');
      return false;
    }

    // Find voucher dynamically from store vouchers state
    const foundVoucher = vouchers.find(
      v => v.code.toUpperCase() === cleanCode && v.status === 'active'
    );

    if (!foundVoucher) {
      showToast('Mã voucher không tồn tại hoặc đã hết hạn!', 'error');
      return false;
    }

    const currentSubtotal = typeof subtotalOverride === 'number' ? subtotalOverride : cartSubtotal;

    if (currentSubtotal < foundVoucher.minOrderValue) {
      const neededAmount = foundVoucher.minOrderValue - currentSubtotal;
      showToast(
        `Đơn hàng chưa đạt tối thiểu! Bạn cần mua thêm ${neededAmount.toLocaleString('vi-VN')}đ sản phẩm nữa để áp dụng voucher này.`,
        'error'
      );
      return false;
    }

    let calculatedDiscount = 0;
    const isFreeShip =
      (foundVoucher.discountType as string) === 'freeship' ||
      (foundVoucher.discountType as string) === 'shipping' ||
      cleanCode.includes('FREESHIP') ||
      cleanCode.includes('MIENPHI') ||
      foundVoucher.name.toLowerCase().includes('miễn phí vận chuyển') ||
      foundVoucher.name.toLowerCase().includes('freeship');

    if (isFreeShip) {
      // Free Shipping voucher waives the default 30,000 VND shipping fee
      calculatedDiscount = 30000;
    } else if (foundVoucher.discountType === 'percent') {
      calculatedDiscount = Math.round((currentSubtotal * foundVoucher.discountValue) / 100);
      if (foundVoucher.maxDiscount && calculatedDiscount > foundVoucher.maxDiscount) {
        calculatedDiscount = foundVoucher.maxDiscount;
      }
    } else {
      calculatedDiscount = foundVoucher.discountValue;
    }

    setAppliedVoucher(foundVoucher);
    setDiscountAmount(calculatedDiscount);
    showToast(
      isFreeShip
        ? `Áp dụng mã Miễn phí vận chuyển ${foundVoucher.code} (-30.000đ phí vận chuyển) thành công!`
        : `Áp dụng mã ${foundVoucher.code} (-${calculatedDiscount.toLocaleString('vi-VN')}đ) thành công!`,
      'success'
    );
    return true;
  };

  const removeVoucher = () => {
    setAppliedVoucher(null);
    setDiscountAmount(0);
    showToast('Đã hủy áp dụng mã giảm giá', 'info');
  };

  const saveVoucher = (code: string) => {
    const cleanCode = code.trim().toUpperCase();
    if (savedVouchers.includes(cleanCode)) {
      showToast('Bạn đã lưu voucher này rồi!', 'info');
      return;
    }
    setSavedVouchers(prev => [...prev, cleanCode]);
    showToast(`Đã lưu voucher ${cleanCode} thành công!`, 'success');
  };

  const markVoucherUsed = (code: string) => {
    const cleanCode = code.trim().toUpperCase();
    if (!usedVouchers.includes(cleanCode)) {
      setUsedVouchers(prev => [...prev, cleanCode]);
    }
  };

  const login = (email: string, pass: string) => {
    if (email.includes('admin')) {
      const u: User = { _id: 'admin1', name: 'Quản trị viên Luxora', email, role: 'admin', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150' };
      setUser(u);
      showToast('Đăng nhập Quản trị viên thành công!', 'success');
      return true;
    }
    const existingCust = customers.find(c => c.email.toLowerCase() === email.toLowerCase());
    const name = existingCust ? existingCust.name : (email.split('@')[0] || 'Khách hàng');
    const u: User = { _id: 'user_' + Date.now(), name, email, role: 'customer', avatar: existingCust?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', provider: existingCust?.provider || 'email' };
    setUser(u);
    showToast('Đăng nhập thành công!', 'success');
    return true;
  };

  const loginWithGoogle = (name = 'Khách hàng Google', email = 'user.google@gmail.com', phone = '0912345678') => {
    const u: User = {
      _id: 'u_gg_' + Date.now(),
      name,
      email,
      phone,
      role: 'customer',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      provider: 'google'
    };
    setUser(u);

    setCustomers(prev => {
      const exists = prev.find(c => c.email.toLowerCase() === email.toLowerCase());
      if (exists) return prev;
      return [
        {
          id: 'c_' + Date.now(),
          name,
          email,
          phone,
          provider: 'google',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
          orderCount: 1,
          totalSpent: 1250000,
          status: 'active',
          createdAt: new Date().toLocaleDateString('vi-VN')
        },
        ...prev
      ];
    });

    showToast(`Đăng nhập Google thành công! Xin chào ${name}`, 'success');
  };

  const registerUser = (data: { name: string; email: string; phone: string; password: string }) => {
    const u: User = {
      _id: 'u_reg_' + Date.now(),
      name: data.name,
      email: data.email,
      phone: data.phone,
      role: 'customer',
      provider: 'email'
    };
    setUser(u);

    setCustomers(prev => [
      {
        id: 'c_' + Date.now(),
        name: data.name,
        email: data.email,
        phone: data.phone,
        provider: 'email',
        orderCount: 0,
        totalSpent: 0,
        status: 'active',
        createdAt: new Date().toLocaleDateString('vi-VN')
      },
      ...prev
    ]);

    showToast(`Tạo tài khoản thành công! Xin chào ${data.name}`, 'success');
    return true;
  };

  const addCustomer = (data: { name: string; email: string; phone: string; province: string; district: string; detailAddress: string; avatar?: string }) => {
    const fullAddr = [data.detailAddress, data.district, data.province].filter(Boolean).join(', ');

    setCustomers(prev => {
      const cleanEmail = (data.email || '').trim().toLowerCase();
      const cleanPhone = (data.phone || '').replace(/\D/g, '');

      const existingIndex = prev.findIndex(c => {
        const cEmail = (c.email || '').trim().toLowerCase();
        const cPhone = (c.phone || '').replace(/\D/g, '');
        return (cleanEmail && cEmail === cleanEmail) || (cleanPhone && cPhone && cPhone === cleanPhone);
      });

      const updatedCust: Customer = {
        id: existingIndex >= 0 ? prev[existingIndex].id : 'c_' + Date.now(),
        name: data.name || '',
        email: data.email || '',
        phone: data.phone || '',
        province: data.province || '',
        district: data.district || '',
        detailAddress: data.detailAddress || '',
        address: fullAddr || '',
        avatar: data.avatar || (existingIndex >= 0 ? prev[existingIndex].avatar : undefined),
        provider: 'email',
        orderCount: existingIndex >= 0 ? prev[existingIndex].orderCount : 0,
        totalSpent: existingIndex >= 0 ? prev[existingIndex].totalSpent : 0,
        status: existingIndex >= 0 ? prev[existingIndex].status : 'active',
        createdAt: existingIndex >= 0 ? prev[existingIndex].createdAt : new Date().toLocaleDateString('vi-VN')
      };

      let result: Customer[] = [];
      if (existingIndex >= 0) {
        const copy = [...prev];
        copy[existingIndex] = updatedCust;
        result = copy;
      } else {
        result = [updatedCust, ...prev];
      }
      if (typeof window !== 'undefined') {
        try { localStorage.setItem('luxora_customers', JSON.stringify(result)); } catch (e) {}
      }
      return result;
    });

    fetch('http://localhost:5000/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: data.name,
        email: data.email,
        phone: data.phone,
        province: data.province,
        district: data.district,
        detailAddress: data.detailAddress,
        avatar: data.avatar,
        role: 'customer'
      })
    })
    .then(() => syncFromBackendApi())
    .catch(() => {});

    const u: User = {
      _id: user?._id || ('u_' + Date.now()),
      name: data.name || user?.name || data.email || 'Khách hàng',
      email: data.email || user?.email || '',
      phone: data.phone || user?.phone || '',
      province: data.province || (user as any)?.province || '',
      district: data.district || (user as any)?.district || '',
      detailAddress: data.detailAddress || (user as any)?.detailAddress || '',
      avatar: data.avatar || user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      role: user?.role || 'customer',
      provider: user?.provider || 'email'
    };
    setUser(u);
    if (typeof window !== 'undefined') {
      try { localStorage.setItem('luxora_user', JSON.stringify(u)); } catch (e) {}
    }
    showToast('Lưu thông tin thành công!', 'success');
  };

  const toggleCustomerStatus = (id: string) => {
    setCustomers(prev => prev.map(c => {
      if (c.id === id) {
        const newStatus = c.status === 'active' ? 'locked' : 'active';
        showToast(`Đã ${newStatus === 'locked' ? 'khóa' : 'mở khóa'} tài khoản ${c.name}`, 'info');
        return { ...c, status: newStatus };
      }
      return c;
    }));
    fetch(`http://localhost:5000/api/users/${id}/status`, { method: 'PUT' }).catch(() => {});
  };

  const deleteCustomer = (id: string) => {
    setCustomers(prev => prev.filter(c => c.id !== id));
    fetch(`http://localhost:5000/api/users/${id}`, { method: 'DELETE' }).catch(() => {});
    showToast('Đã xóa khách hàng khỏi hệ thống', 'info');
  };

  const addProduct = (p: Product) => {
    setProducts(prev => {
      const updated = [p, ...prev.filter(item => item._id !== p._id && item.name !== p.name)];
      if (typeof window !== 'undefined') {
        try { localStorage.setItem('luxora_products', JSON.stringify(updated)); } catch(e) {}
      }
      return updated;
    });
    if (p.category && !categories.some(c => c.name === p.category)) {
      setCategories(prev => [...prev, { _id: 'cat_' + Date.now(), name: p.category, slug: p.category.toLowerCase().replace(/ /g, '-'), icon: 'Tag', isFeatured: false }]);
      fetch('http://localhost:5000/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: p.category, slug: p.category.toLowerCase().replace(/ /g, '-') })
      }).catch(() => {});
    }
    if (p.brand && !brands.includes(p.brand)) {
      setBrands(prev => [...prev, p.brand]);
      fetch('http://localhost:5000/api/brands', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: p.brand, slug: p.brand.toLowerCase().replace(/ /g, '-'), logo: p.image || '' })
      }).catch(() => {});
    }

    fetch('http://localhost:5000/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(p)
    })
    .then(res => res.json())
    .then(data => {
      if (data.success && data.product) {
        setProducts(prev => {
          const updated = prev.map(item => (item.name === p.name || item._id === p._id) ? data.product : item);
          if (typeof window !== 'undefined') {
            try { localStorage.setItem('luxora_products', JSON.stringify(updated)); } catch(e) {}
          }
          return updated;
        });
      }
      syncFromBackendApi();
    })
    .catch(() => {});

    showToast(`Đã thêm sản phẩm "${p.name}" vào hệ thống`, 'success');
  };

  const updateProduct = (p: Product) => {
    setProducts(prev => {
      const filtered = prev.filter(item => item._id !== p._id && item.slug !== p.slug && item.name !== p.name);
      const updated = [p, ...filtered];
      if (typeof window !== 'undefined') {
        try { localStorage.setItem('luxora_products', JSON.stringify(updated)); } catch(e) {}
      }
      return updated;
    });
    if (p._id) {
      fetch(`http://localhost:5000/api/products/${p._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(p)
      })
      .then(() => syncFromBackendApi())
      .catch(() => {});
    }
    showToast(`Đã cập nhật thông tin sản phẩm "${p.name}"`, 'success');
  };

  const deleteProduct = (id: string) => {
    setProducts(prev => {
      const updated = prev.filter(item => item._id !== id && item.slug !== id && item.name !== id);
      if (typeof window !== 'undefined') {
        try { localStorage.setItem('luxora_products', JSON.stringify(updated)); } catch(e) {}
      }
      return updated;
    });
    fetch(`http://localhost:5000/api/products/${id}`, { method: 'DELETE' }).catch(() => {});
    showToast('Đã xóa sản phẩm khỏi hệ thống', 'info');
  };

  const addOrder = (orderData: Partial<Order>): Order => {
    const newOrd: Order = {
      _id: 'ord_' + Date.now(),
      orderCode: orderData.orderCode || ('LUX' + Math.floor(100000 + Math.random() * 900000)),
      customerName: (orderData.customerName || 'Khách hàng').trim(),
      customerEmail: (orderData.customerEmail || '').trim().toLowerCase(),
      customerPhone: (orderData.customerPhone || '').trim(),
      shippingAddress: (orderData.shippingAddress || '').trim(),
      items: orderData.items || [],
      subtotal: orderData.subtotal || 0,
      shippingFee: orderData.shippingFee || 0,
      discountAmount: orderData.discountAmount || 0,
      totalAmount: orderData.totalAmount || 0,
      paymentMethod: orderData.paymentMethod || 'COD',
      paymentStatus: orderData.paymentStatus || (String(orderData.paymentMethod) === 'MoMo' || String(orderData.paymentMethod) === 'VNPay' || orderData.paymentStatus === 'Paid' ? 'Paid' : 'Pending'),
      orderStatus: orderData.orderStatus || 'Chờ xác nhận',
      estimatedDeliveryDate: orderData.estimatedDeliveryDate,
      createdAt: orderData.createdAt || (() => {
        const now = new Date();
        const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
        return `${timeStr} - ${now.toLocaleDateString('vi-VN')}`;
      })()
    };

    if (typeof window !== 'undefined') {
      try {
        const guestCodes = JSON.parse(localStorage.getItem('luxora_my_placed_order_codes_guest') || '[]');
        if (!guestCodes.includes(newOrd.orderCode)) {
          localStorage.setItem('luxora_my_placed_order_codes_guest', JSON.stringify([...guestCodes, newOrd.orderCode]));
        }

        const cleanCustEmail = (newOrd.customerEmail || '').trim().toLowerCase();
        if (cleanCustEmail) {
          const custKey = `luxora_my_placed_order_codes_${cleanCustEmail}`;
          const custCodes = JSON.parse(localStorage.getItem(custKey) || '[]');
          if (!custCodes.includes(newOrd.orderCode)) {
            localStorage.setItem(custKey, JSON.stringify([...custCodes, newOrd.orderCode]));
          }
        }

        const cleanUserEmail = (user?.email || '').trim().toLowerCase();
        if (cleanUserEmail && cleanUserEmail !== cleanCustEmail) {
          const userKey = `luxora_my_placed_order_codes_${cleanUserEmail}`;
          const userCodes = JSON.parse(localStorage.getItem(userKey) || '[]');
          if (!userCodes.includes(newOrd.orderCode)) {
            localStorage.setItem(userKey, JSON.stringify([...userCodes, newOrd.orderCode]));
          }
        }
      } catch (e) {}
    }

    setOrders(prev => {
      const updated = [newOrd, ...prev.filter(o => o.orderCode !== newOrd.orderCode)];
      if (typeof window !== 'undefined') {
        try { localStorage.setItem('luxora_orders', JSON.stringify(updated)); } catch (e) {}
      }
      return updated;
    });

    // Decrease stock for purchased items
    if (newOrd.items && newOrd.items.length > 0) {
      setProducts(prevProducts => {
        const updatedProducts = [...prevProducts];
        newOrd.items.forEach(item => {
          const rawId = typeof item.product === 'string' ? item.product : (item.product?._id || (item.product as any)?.id || '');
          const itemName = (item.name || '').trim().toLowerCase();
          const rawIdLower = rawId ? rawId.trim().toLowerCase() : '';

          const pIndex = updatedProducts.findIndex(p => {
            if (!p) return false;
            const pId = (p._id || (p as any).id || '').trim().toLowerCase();
            const pSlug = (p.slug || '').trim().toLowerCase();
            const pName = (p.name || '').trim().toLowerCase();

            return (
              (rawIdLower && pId === rawIdLower) ||
              (rawIdLower && pSlug === rawIdLower) ||
              (itemName && pName === itemName)
            );
          });

          if (pIndex !== -1) {
            const targetProd = updatedProducts[pIndex];
            const currentStock = targetProd.stock ?? 10;
            const newStock = Math.max(0, currentStock - item.quantity);
            const newSoldCount = (targetProd.soldCount || 0) + item.quantity;

            // Also reduce stock for specific volume option if available
            let updatedVolumeOptions = targetProd.volumeOptions;
            if (item.selectedVolume && Array.isArray(updatedVolumeOptions) && updatedVolumeOptions.length > 0) {
              updatedVolumeOptions = updatedVolumeOptions.map(vo => {
                if (vo.volume === item.selectedVolume) {
                  const currentVolStock = typeof vo.stock === 'number' ? vo.stock : currentStock;
                  return {
                    ...vo,
                    stock: Math.max(0, currentVolStock - item.quantity)
                  };
                }
                return vo;
              });
            }

            const updatedP = {
              ...targetProd,
              stock: newStock,
              soldCount: newSoldCount,
              volumeOptions: updatedVolumeOptions
            };
            updatedProducts[pIndex] = updatedP;

            // Sync updated stock to backend API asynchronously
            const pId = updatedP._id || updatedP.slug || updatedP.name;
            fetch(`http://localhost:5000/api/products/${pId}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(updatedP)
            }).catch(() => {});
          }
        });
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem('luxora_products', JSON.stringify(updatedProducts));
          } catch (e) {}
        }
        return updatedProducts;
      });
    }

    fetch('http://localhost:5000/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newOrd)
    })
    .then(res => res.json())
    .then(data => {
      if (data.success && data.order) {
        setOrders(prev => {
          const updated = prev.map(o => o.orderCode === newOrd.orderCode ? data.order : o);
          if (typeof window !== 'undefined') {
            try { localStorage.setItem('luxora_orders', JSON.stringify(updated)); } catch (e) {}
          }
          return updated;
        });
      }
      syncFromBackendApi();
    })
    .catch(err => console.error('addOrder POST error:', err));

    return newOrd;
  };

  const updateOrderStatus = (orderId: string, status: Order['orderStatus'], estimatedDeliveryDate?: string) => {
    fetch(`http://localhost:5000/api/orders/${orderId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderStatus: status, estimatedDeliveryDate })
    }).catch(() => {});
    const rawId = (orderId || '').trim().toLowerCase().replace(/^#/, '');
    let targetOrder = orders.find(o => {
      if (!o) return false;
      const pId = (o._id || '').trim().toLowerCase().replace(/^#/, '');
      const pCode = (o.orderCode || '').trim().toLowerCase().replace(/^#/, '');
      const pCustomId = String((o as any).id || '').trim().toLowerCase().replace(/^#/, '');
      return (pId && pId === rawId) || (pCode && pCode === rawId) || (pCustomId && pCustomId === rawId);
    });

    if (targetOrder) {
      const oldStatus = targetOrder.orderStatus;
      const isOldCanceled = oldStatus === 'Hủy' || (oldStatus as string) === 'Hủy đơn';
      const isNewCanceled = status === 'Hủy' || (status as string) === 'Hủy đơn';

      if (!isOldCanceled && isNewCanceled) {
        // Restore stock when order is canceled
        if (targetOrder.items && targetOrder.items.length > 0) {
          setProducts(prevProducts => {
            const updatedProducts = [...prevProducts];
            targetOrder!.items.forEach(item => {
              const rawId = typeof item.product === 'string' ? item.product : (item.product?._id || (item.product as any)?.id || '');
              const itemName = (item.name || '').trim().toLowerCase();
              const rawIdLower = rawId ? rawId.trim().toLowerCase() : '';

              const pIndex = updatedProducts.findIndex(p => {
                if (!p) return false;
                const pId = (p._id || (p as any).id || '').trim().toLowerCase();
                const pSlug = (p.slug || '').trim().toLowerCase();
                const pName = (p.name || '').trim().toLowerCase();

                return (
                  (rawIdLower && pId === rawIdLower) ||
                  (rawIdLower && pSlug === rawIdLower) ||
                  (itemName && pName === itemName)
                );
              });

              if (pIndex !== -1) {
                const currentStock = updatedProducts[pIndex].stock ?? 0;
                const newStock = currentStock + item.quantity;
                const newSoldCount = Math.max(0, (updatedProducts[pIndex].soldCount || 0) - item.quantity);
                updatedProducts[pIndex] = {
                  ...updatedProducts[pIndex],
                  stock: newStock,
                  soldCount: newSoldCount
                };
              }
            });
            if (typeof window !== 'undefined') {
              try { localStorage.setItem('luxora_products', JSON.stringify(updatedProducts)); } catch (e) {}
            }
            return updatedProducts;
          });
        }
      } else if (isOldCanceled && !isNewCanceled) {
        // Re-deduct stock if order status changes from Canceled back to Active
        if (targetOrder.items && targetOrder.items.length > 0) {
          setProducts(prevProducts => {
            const updatedProducts = [...prevProducts];
            targetOrder!.items.forEach(item => {
              const rawId = typeof item.product === 'string' ? item.product : (item.product?._id || (item.product as any)?.id || '');
              const itemName = (item.name || '').trim().toLowerCase();
              const rawIdLower = rawId ? rawId.trim().toLowerCase() : '';

              const pIndex = updatedProducts.findIndex(p => {
                if (!p) return false;
                const pId = (p._id || (p as any).id || '').trim().toLowerCase();
                const pSlug = (p.slug || '').trim().toLowerCase();
                const pName = (p.name || '').trim().toLowerCase();

                return (
                  (rawIdLower && pId === rawIdLower) ||
                  (rawIdLower && pSlug === rawIdLower) ||
                  (itemName && pName === itemName)
                );
              });

              if (pIndex !== -1) {
                const currentStock = updatedProducts[pIndex].stock ?? 0;
                const newStock = Math.max(0, currentStock - item.quantity);
                const newSoldCount = (updatedProducts[pIndex].soldCount || 0) + item.quantity;
                updatedProducts[pIndex] = {
                  ...updatedProducts[pIndex],
                  stock: newStock,
                  soldCount: newSoldCount
                };
              }
            });
            if (typeof window !== 'undefined') {
              try { localStorage.setItem('luxora_products', JSON.stringify(updatedProducts)); } catch (e) {}
            }
            return updatedProducts;
          });
        }
      }

      // Sync status change with backend API
      const realId = targetOrder._id || targetOrder.orderCode;
      if (realId) {
        fetch(`http://localhost:5000/api/orders/${encodeURIComponent(realId)}/status`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderStatus: status, estimatedDeliveryDate })
        }).catch(err => console.error('Failed to sync order status to backend:', err));
      }
    }

    setOrders(prev => {
      const updated = prev.map(o => {
        if (!o) return o;
        const pId = (o._id || '').trim().toLowerCase().replace(/^#/, '');
        const pCode = (o.orderCode || '').trim().toLowerCase().replace(/^#/, '');
        const pCustomId = String((o as any).id || '').trim().toLowerCase().replace(/^#/, '');
        const matches = (pId && pId === rawId) || (pCode && pCode === rawId) || (pCustomId && pCustomId === rawId);
        if (matches) {
          return {
            ...o,
            orderStatus: status,
            estimatedDeliveryDate: estimatedDeliveryDate !== undefined ? estimatedDeliveryDate : o.estimatedDeliveryDate
          };
        }
        return o;
      });
      if (typeof window !== 'undefined') {
        try { localStorage.setItem('luxora_orders', JSON.stringify(updated)); } catch (e) {}
      }
      return updated;
    });

    showToast(`Đã cập nhật trạng thái đơn sang "${status}"`, 'success');
  };

  const addVoucher = (v: Voucher) => {
    setVouchers(prev => [v, ...prev]);
    showToast(`Đã tạo mã giảm giá ${v.code}`, 'success');
  };

  const deleteVoucher = (vId: string) => {
    setVouchers(prev => prev.filter(v => v._id !== vId && v.code !== vId));
    showToast('Đã xóa mã giảm giá', 'info');
  };

  const toggleVoucherStatus = (vId: string) => {
    setVouchers(prev => prev.map(v => (v._id === vId || v.code === vId) ? { ...v, status: v.status === 'active' ? 'inactive' : 'active' } : v));
    showToast('Đã thay đổi trạng thái mã giảm giá', 'info');
  };

  const registerAffiliate = (affData: Partial<Affiliate>) => {
    const newAff: Affiliate = {
      _id: 'aff_' + Date.now(),
      user: affData.user || { _id: 'u_' + Date.now(), name: 'Đăng ký mới', email: 'aff@gmail.com', role: 'customer' },
      referralCode: affData.referralCode || ('AFF' + Math.floor(1000 + Math.random() * 9000)),
      referralLink: affData.referralLink || `https://luxora.vn/?ref=${affData.referralCode}`,
      status: 'Pending',
      totalClick: 0,
      totalOrder: 0,
      totalCommission: 0,
      availableBalance: 0,
      pendingBalance: 0,
      paidBalance: 0,
      bankInfo: affData.bankInfo
    };
    setAffiliates(prev => [newAff, ...prev]);
    setAffiliateData(newAff);
    showToast('Đã gửi đăng ký Affiliate! Vui lòng chờ Admin duyệt.', 'info');
  };

  const updateAffiliateStatus = (affId: string, status: 'Approved' | 'Rejected' | 'Pending' | 'Locked') => {
    setAffiliates(prev => prev.map(a => a._id === affId ? { ...a, status } : a));
    if (affiliateData && affiliateData._id === affId) {
      setAffiliateData(prev => prev ? { ...prev, status } : null);
    }
    showToast(`Đã ${status === 'Approved' ? 'duyệt' : status === 'Rejected' ? 'từ chối' : status === 'Locked' ? 'khóa' : 'cập nhật'} tài khoản Affiliate!`, 'success');
  };

  const [purchasedProductIds, setPurchasedProductIds] = useState<string[]>([]);

  const hasUserPurchasedProduct = (productId: string) => {
    if (!user) return false;
    const completedOrders = orders.filter(
      o => (o.customerEmail || '').toLowerCase() === (user.email || '').toLowerCase() && o.orderStatus === 'Hoàn thành'
    );
    const isCompletedInOrder = completedOrders.some(o =>
      o.items.some(item => {
        const itemProductId = typeof item.product === 'string' ? item.product : (item.product?._id || (item.product as any)?.id);
        const itemName = item.name || (typeof item.product !== 'string' ? item.product?.name : '');
        return itemProductId === productId || itemName === products.find(p => p._id === productId)?.name;
      })
    );
    return isCompletedInOrder || purchasedProductIds.includes(productId);
  };

  const addPurchasedProducts = (productIds: string[]) => {
    setPurchasedProductIds(prev => {
      const updated = Array.from(new Set([...prev, ...productIds]));
      if (typeof window !== 'undefined') {
        try { localStorage.setItem('luxora_purchased_products', JSON.stringify(updated)); } catch(e) {}
      }
      return updated;
    });
  };



  const [brands, setBrands] = useState<string[]>([
    'Dior',
    'Chanel',
    'Yves Saint Laurent',
    'Versace',
    'Gucci',
    'Tom Ford',
    'Creed'
  ]);

  const addCategory = (categoryData: Omit<Category, '_id'>) => {
    const isDuplicate = categories.some(
      c => c.name.toLowerCase() === categoryData.name.toLowerCase()
    );

    if (isDuplicate) {
      showToast(`Danh mục "${categoryData.name}" đã tồn tại! Vui lòng chọn tên khác.`, 'error');
      return;
    }

    const newCat: Category = {
      _id: 'cat_' + Date.now(),
      ...categoryData
    };
    setCategories(prev => [...prev, newCat]);
    fetch('http://localhost:5000/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(categoryData)
    }).then(() => syncFromBackendApi()).catch(() => {});
    showToast(`Đã thêm danh mục "${categoryData.name}" thành công!`, 'success');
  };

  const updateCategory = (id: string, updates: Partial<Category>) => {
    setCategories(prev => prev.map(c => c._id === id ? { ...c, ...updates } : c));
    fetch(`http://localhost:5000/api/categories/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    }).then(() => syncFromBackendApi()).catch(() => {});
    showToast(`Đã cập nhật danh mục thành công!`, 'success');
  };

  const deleteCategory = (id: string) => {
    setCategories(prev => prev.filter(c => c._id !== id));
    fetch(`http://localhost:5000/api/categories/${id}`, { method: 'DELETE' }).then(() => syncFromBackendApi()).catch(() => {});
    showToast(`Đã xóa danh mục!`, 'info');
  };

  const addBrand = (name: string) => {
    const trimmed = name.trim();
    if (trimmed) {
      const isDuplicate = brands.some(b => b.toLowerCase() === trimmed.toLowerCase());
      if (isDuplicate) {
        showToast(`Thương hiệu "${trimmed}" đã tồn tại!`, 'error');
        return;
      }
      setBrands(prev => [...prev, trimmed]);
      fetch('http://localhost:5000/api/brands', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: trimmed, slug: trimmed.toLowerCase().replace(/\s+/g, '-'), logo: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=300' })
      }).then(() => syncFromBackendApi()).catch(() => {});
      showToast(`Đã thêm thương hiệu "${trimmed}" thành công!`, 'success');
    }
  };

  const deleteBrand = (name: string) => {
    setBrands(prev => prev.filter(b => b !== name));
    fetch(`http://localhost:5000/api/brands/${name}`, { method: 'DELETE' }).then(() => syncFromBackendApi()).catch(() => {});
    showToast(`Đã xóa thương hiệu "${name}"!`, 'info');
  };

  const logout = () => {
    if (typeof window !== 'undefined') {
      try {
        const cleanEmail = (user?.email || '').trim().toLowerCase();
        const curKey = cleanEmail || 'guest';
        localStorage.setItem(`luxora_cart_${curKey}`, JSON.stringify(cart));
        localStorage.setItem(`luxora_wishlist_${curKey}`, JSON.stringify(wishlist));
        localStorage.removeItem('luxora_user');
      } catch (e) {}
    }
    prevUserEmailRef.current = '';
    setUser(null);
    setCart([]);
    setWishlist([]);
    showToast('Đã đăng xuất tài khoản', 'info');
  };

  const cartSubtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const shippingFee = 30000;
  const cartTotal = Math.max(0, cartSubtotal + shippingFee - discountAmount);

  return (
    <StoreContext.Provider
      value={{
        products,
        cart,
        directBuyItem,
        setDirectBuyItem,
        buyNow,
        wishlist,
        isCartOpen,
        setIsCartOpen,
        isWishlistOpen,
        setIsWishlistOpen,
        selectedProductModal,
        setSelectedProductModal,
        appliedVoucher,
        discountAmount,
        user,
        affiliateData,
        setAffiliateData,
        toasts,
        showToast,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        toggleWishlist,
        applyVoucher,
        removeVoucher,
        purchasedProductIds,
        hasUserPurchasedProduct,
        addPurchasedProducts,
        categories,
        addCategory,
        updateCategory,
        deleteCategory,
        brands,
        addBrand,
        deleteBrand,
        addProduct,
        updateProduct,
        deleteProduct,
        orders,
        addOrder,
        updateOrderStatus,
        vouchers,
        addVoucher,
        deleteVoucher,
        toggleVoucherStatus,
        savedVouchers,
        usedVouchers,
        saveVoucher,
        markVoucherUsed,
        affiliates,
        registerAffiliate,
        updateAffiliateStatus,
        login,
        loginWithGoogle,
        registerUser,
        logout,
        customers,
        addCustomer,
        toggleCustomerStatus,
        deleteCustomer,
        cartSubtotal,
        cartTotal,
        shippingFee,
        refCode,
        userPoints,
        usedPoints,
        addRewardPoints,
        useRewardPoints,
        showPointsModal,
        setShowPointsModal,
        productReviews,
        getProductReviews,
        addProductReview,
        updateProductReview,
        deleteProductReview,
        hasUserReviewedProduct,
        addAdminReply,
        inventoryLogs,
        addInventoryLog,
        getVolumeStock
      }}
    >
      {children}

      {/* Toast Notification Container (Top Right Badge Button) */}
      <div className="fixed top-20 right-5 z-[9999] flex flex-col gap-3 max-w-sm pointer-events-none">
        {toasts.map(t => (
          <div
            key={t.id}
            className={`px-4 py-3 rounded-2xl shadow-2xl text-xs font-bold flex flex-col gap-2 transition-all duration-300 transform translate-y-0 animate-in slide-in-from-right-12 fade-in pointer-events-auto border backdrop-blur-md relative overflow-hidden ${
              t.type === 'success'
                ? 'bg-emerald-600/95 text-white border-emerald-400/50 shadow-emerald-600/35 ring-2 ring-emerald-400/30'
                : t.type === 'error'
                ? 'bg-rose-600/95 text-white border-rose-400/50 shadow-rose-600/35 ring-2 ring-rose-400/30'
                : 'bg-zinc-900/95 text-zinc-100 border-zinc-700/50 shadow-zinc-950/40 ring-2 ring-zinc-700/30'
            }`}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 shadow-inner ${
                  t.type === 'success' ? 'bg-white/20 text-white' : t.type === 'error' ? 'bg-white/20 text-white' : 'bg-amber-400/20 text-amber-300'
                }`}>
                  {t.type === 'success' && <CheckCircle2 className="w-4 h-4 text-white" />}
                  {t.type === 'error' && <XCircle className="w-4 h-4 text-white" />}
                  {t.type === 'info' && <Info className="w-4 h-4 text-amber-300" />}
                </div>
                <span className="leading-snug font-semibold text-xs text-white truncate">{t.message}</span>
              </div>

              <button
                type="button"
                onClick={() => setToasts(prev => prev.filter(item => item.id !== t.id))}
                className="p-1 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors shrink-0"
                title="Đóng thông báo"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Running animated progress line underneath */}
            <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden p-0.5 relative">
              <div className="h-full bg-gradient-to-r from-emerald-200 to-white rounded-full animate-progress-shrink relative">
                <div className="absolute -right-1 top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-white rounded-full shadow-[0_0_10px_#ffffff] ring-2 ring-emerald-300 animate-pulse" />
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* Points Celebration Modal */}
      <PointsCelebrationModal
        isOpen={showPointsModal}
        points={lastEarnedPoints}
        onClose={() => setShowPointsModal(false)}
      />
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore must be used within StoreProvider');
  return context;
};
