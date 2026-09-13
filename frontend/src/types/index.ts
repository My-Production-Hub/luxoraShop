export interface Product {
  _id: string;
  name: string;
  slug: string;
  brand: string;
  category: string;
  price: number;
  originalPrice?: number;
  discountPercent?: number;
  volume: string;
  availableVolumes?: string[];
  volumeOptions?: Array<{ volume: string; price: number; originalPrice?: number; flashSalePrice?: number; stock?: number }>;
  availableScents?: string[];
  gender: 'Nam' | 'Nữ' | 'Unisex';
  origin: string;
  concentration: string;
  image: string;
  gallery: string[];
  videoUrl?: string;
  description: string;
  ingredients?: string;
  benefits?: string;
  fragranceNotes?: {
    top: string;
    middle: string;
    base: string;
  };
  stock: number;
  soldCount: number;
  rating: number;
  reviewCount: number;
  isFeatured?: boolean;
  isFlashSale?: boolean;
  flashSaleEndTime?: string;
  flashSalePrice?: number;
}

export interface CartItem {
  product: Product;
  selectedVolume: string;
  selectedScent?: string;
  quantity: number;
}

export interface Voucher {
  _id: string;
  code: string;
  name: string;
  discountType: 'percent' | 'fixed' | 'freeship' | 'shipping';
  discountValue: number;
  maxDiscount?: number;
  minOrderValue: number;
  quantity: number;
  usedQuantity: number;
  startDate: string;
  endDate: string;
  status: 'active' | 'inactive' | 'expired';
}

export interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  province?: string;
  district?: string;
  detailAddress?: string;
  address?: string;
  role: 'customer' | 'affiliate' | 'admin' | 'staff';
  avatar?: string;
  status?: 'active' | 'locked';
  provider?: 'google' | 'email';
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  provider: 'google' | 'email';
  avatar?: string;
  province?: string;
  district?: string;
  detailAddress?: string;
  address?: string;
  orderCount: number;
  totalSpent: number;
  status: 'active' | 'locked';
  createdAt: string;
}

export interface Affiliate {
  _id: string;
  user: User | string;
  referralCode: string;
  referralLink: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Locked';
  totalClick: number;
  totalOrder: number;
  totalCommission: number;
  availableBalance: number;
  pendingBalance: number;
  paidBalance: number;
  bankInfo?: {
    bankName: string;
    bankNumber: string;
    accountName: string;
  };
}

export interface Order {
  _id: string;
  orderCode: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  items: Array<{
    product: string | Product;
    name: string;
    image: string;
    volume: string;
    selectedVolume?: string;
    scent?: string;
    price: number;
    quantity: number;
  }>;
  subtotal: number;
  shippingFee: number;
  voucherCode?: string;
  discountAmount: number;
  totalAmount: number;
  paymentMethod: 'COD' | 'VNPay' | 'MoMo' | 'BankTransfer';
  paymentStatus: 'Pending' | 'Paid' | 'Failed';
  orderStatus: 'Chờ xác nhận' | 'Xác nhận' | 'Đóng gói' | 'Đang giao' | 'Hoàn thành' | 'Hủy' | 'Hủy đơn';
  estimatedDeliveryDate?: string;
  notes?: string;
  createdAt: string;
}

export interface Review {
  _id: string;
  product: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  photos?: string[];
  createdAt: string;
}

export interface MarketingAsset {
  _id: string;
  title: string;
  type: 'Banner' | 'Poster' | 'ProductImage' | 'Video' | 'Template';
  url: string;
  thumbnail?: string;
  dimensions: string;
  fileSize: string;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  icon: string;
  isFeatured?: boolean;
}

