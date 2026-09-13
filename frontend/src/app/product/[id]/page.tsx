'use client';

import React, { useState, use, useEffect } from 'react';
import { useStore } from '@/context/StoreContext';
import { Product } from '@/types';
import { useRouter } from 'next/navigation';
import {
  Star,
  Heart,
  ShoppingBag,
  Truck,
  ShieldCheck,
  RotateCcw,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Plus,
  Minus,
  CheckCircle2,
  Share2,
  ThumbsUp,
  MessageSquare,
  Zap,
  Pencil,
  Trash2
} from 'lucide-react';
import { ProductCard } from '@/components/ProductCard';

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { 
    products, 
    wishlist, 
    toggleWishlist, 
    addToCart, 
    buyNow, 
    showToast, 
    user, 
    hasUserPurchasedProduct, 
    addRewardPoints,
    getProductReviews,
    addProductReview,
    updateProductReview,
    deleteProductReview,
    hasUserReviewedProduct,
    getVolumeStock
  } = useStore();

  const rawParamId = resolvedParams.id;
  const decodedParamId = decodeURIComponent(rawParamId);
  const product = products.find(p => p._id === rawParamId || p.slug === rawParamId || p.name === decodedParamId || p.slug === rawParamId.toLowerCase()) || products[0];
  const liveProduct = products.find(p => p._id === product._id || p.slug === product.slug || p.name === product.name) || product;

  const getProductScents = (p: Product) => {
    if (p.availableScents && p.availableScents.length > 0) {
      return p.availableScents;
    }
    if (p.fragranceNotes) {
      const notes = [p.fragranceNotes.top, p.fragranceNotes.middle, p.fragranceNotes.base]
        .map(n => (n || '').trim())
        .filter(Boolean);
      if (notes.length > 0) return notes;
    }
    return [];
  };

  const scentsList = getProductScents(product);
  const [selectedScent, setSelectedScent] = useState<string>(scentsList[0]);

  const [selectedVolume, setSelectedVolume] = useState<string>(product.volume || '100ml');
  const [selectedImage, setSelectedImage] = useState<string>(product.image);
  const [quantity, setQuantity] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<'desc' | 'notes' | 'reviews'>('desc');

  const [isClient, setIsClient] = useState(false);
  const [isFlashSaleActive, setIsFlashSaleActive] = useState(false);

  useEffect(() => {
    setIsClient(true);
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('tab') === 'reviews' || window.location.hash.includes('reviews')) {
        setActiveTab('reviews');
      }
    }
    if (liveProduct) {
      const vols = liveProduct.availableVolumes || [liveProduct.volume || '100ml'];
      const firstInStock = vols.find(v => getVolumeStock(liveProduct, v) > 0);
      if (firstInStock && getVolumeStock(liveProduct, selectedVolume) <= 0) {
        setSelectedVolume(firstInStock);
      }
    }

    if (product.isFlashSale && product.flashSaleEndTime) {
      setIsFlashSaleActive(new Date(product.flashSaleEndTime).getTime() > Date.now());
      // Optional: set up a timer to auto-update when it expires while on the page
      const timer = setInterval(() => {
        setIsFlashSaleActive(new Date(product.flashSaleEndTime!).getTime() > Date.now());
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [product, liveProduct]);

  const [newRating, setNewRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [newComment, setNewComment] = useState('');
  const [commentError, setCommentError] = useState(false);
  const [isEditingReview, setIsEditingReview] = useState(false);

  const reviewsList = getProductReviews(product._id);
  const hasReviewed = hasUserReviewedProduct(product._id);

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) {
      setCommentError(true);
      showToast('Vui lòng chia sẻ cảm nghĩ của bạn về sản phẩm', 'error');
      return;
    }

    setCommentError(false);
    if (isEditingReview || hasReviewed) {
      updateProductReview(product._id, newRating, newComment.trim());
    } else {
      addProductReview(product._id, {
        userName: user?.name || 'Khách hàng Luxora',
        userEmail: user?.email,
        rating: newRating,
        comment: newComment.trim()
      });
      addRewardPoints(5);
    }
    setNewComment('');
    setIsEditingReview(false);
  };

  const totalReviews = reviewsList.length;
  const hasReviews = totalReviews > 0;
  const averageRating = hasReviews
    ? (reviewsList.reduce((acc, r) => acc + (Number(r.rating) || 5), 0) / totalReviews).toFixed(1)
    : '0.0';
  const ratingCounts = [5, 4, 3, 2, 1].map(stars => {
    const count = reviewsList.filter(r => r.rating === stars).length;
    const percent = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;
    return { stars, count, percent };
  });

  const isWishlisted = wishlist.includes(product._id);
  const gallery = product.gallery && product.gallery.length > 0 ? product.gallery : [product.image];
  const currentImage = selectedImage || product.image;
  const currentIndex = gallery.indexOf(currentImage) >= 0 ? gallery.indexOf(currentImage) : 0;

  const handlePrevImage = () => {
    const prevIdx = (currentIndex - 1 + gallery.length) % gallery.length;
    setSelectedImage(gallery[prevIdx]);
  };

  const handleNextImage = () => {
    const nextIdx = (currentIndex + 1) % gallery.length;
    setSelectedImage(gallery[nextIdx]);
  };

  const relatedProducts = products
    .filter(p => p._id !== product._id && (p.category === product.category || p.brand === product.brand))
    .slice(0, 4);

  const handleAddToCart = () => {
    addToCart(product, selectedVolume, quantity, selectedScent);
  };

  const handleBuyNow = () => {
    buyNow(product, selectedVolume, quantity, selectedScent);
    router.push('/checkout');
  };

  const selectedVolumeOpt = product.volumeOptions?.find(v => v.volume === selectedVolume);
  const basePrice = selectedVolumeOpt ? selectedVolumeOpt.price : product.price;
  const baseOrig = selectedVolumeOpt?.originalPrice || product.originalPrice;
  const flashSalePrice = selectedVolumeOpt?.flashSalePrice || product.flashSalePrice || basePrice;
  
  const currentPrice = (isClient && isFlashSaleActive) ? flashSalePrice : basePrice;
  const currentOrig = baseOrig;
  const activeDiscount = (currentOrig && currentPrice < currentOrig) 
    ? Math.round(((currentOrig - currentPrice) / currentOrig) * 100) 
    : product.discountPercent;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-12">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs text-zinc-500">
        <button onClick={() => router.push('/')} className="hover:text-pink-600 transition-colors">
          Trang chủ
        </button>
        <ChevronRight className="w-3 h-3 text-zinc-400" />
        <button onClick={() => router.push('/products')} className="hover:text-pink-600 transition-colors">
          Nước hoa
        </button>
        <ChevronRight className="w-3 h-3 text-zinc-400" />
        <span className="text-zinc-400">{product.brand}</span>
        <ChevronRight className="w-3 h-3 text-zinc-400" />
        <span className="text-zinc-900 font-semibold truncate max-w-xs">{product.name}</span>
      </nav>

      {/* Main Product Showcase Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Left Column: Image Gallery */}
        <div className="space-y-4">
          <div className="relative aspect-square rounded-3xl overflow-hidden bg-white border border-zinc-100 shadow-md group">
            <img
              src={currentImage}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            {isClient && isFlashSaleActive ? (
              <span className="absolute top-4 left-4 text-[10px] sm:text-xs font-bold text-white bg-amber-500 px-3 py-1 rounded-full shadow-sm z-10 flex items-center gap-1.5 uppercase tracking-wider">
                <Zap className="w-3.5 h-3.5 fill-current" /> Đang Sale
              </span>
            ) : activeDiscount && activeDiscount > 0 ? (
              <span className="absolute top-4 left-4 text-xs font-bold text-pink-600 bg-white px-2 py-0.5 rounded-full border border-pink-200 z-10 shadow-sm">
                -{activeDiscount}%
              </span>
            ) : null}

            {/* Multi-Image Counter Badge */}
            {gallery.length > 1 && (
              <span className="absolute bottom-4 right-4 bg-black/60 text-white text-xs font-bold px-3 py-1 rounded-full backdrop-blur-sm z-10">
                {currentIndex + 1} / {gallery.length}
              </span>
            )}

            {/* Slider Prev/Next Controls */}
            {gallery.length > 1 && (
              <>
                <button
                  onClick={handlePrevImage}
                  className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-white/80 text-zinc-700 hover:bg-white hover:text-pink-600 shadow-md transition-all z-10"
                  title="Ảnh trước"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={handleNextImage}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-white/80 text-zinc-700 hover:bg-white hover:text-pink-600 shadow-md transition-all z-10"
                  title="Ảnh tiếp"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}

            {/* Wishlist Button */}
            <button
              onClick={() => toggleWishlist(product._id)}
              className={`absolute top-4 right-4 z-10 p-3 rounded-full backdrop-blur-md transition-all ${
                isWishlisted
                  ? 'bg-pink-600 text-white shadow-lg'
                  : 'bg-white/80 text-zinc-400 hover:text-pink-600 hover:bg-white'
              }`}
            >
              <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
            </button>
          </div>

          {/* Thumbnails */}
          {gallery.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {gallery.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  className={`relative w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all shrink-0 ${
                    selectedImage === img ? 'border-pink-600 ring-2 ring-pink-100' : 'border-zinc-100 hover:border-zinc-300'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Product Information */}
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="bg-pink-50 text-pink-600 text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                {product.brand}
              </span>
              <span className="text-xs text-zinc-400">• {product.gender}</span>
              {product.concentration && <span className="text-xs text-zinc-400">• Nồng độ {product.concentration}</span>}
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 font-serif-luxury leading-tight">
              {product.name}
            </h1>
            <div className="flex items-center gap-3 text-xs">
              {hasReviews && (
                <>
                  <div className="flex items-center text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(Number(averageRating)) ? 'fill-current' : 'text-zinc-200'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="font-bold text-zinc-800">{averageRating}</span>
                  <span className="text-zinc-400">({reviewsList.length} đánh giá từ khách hàng)</span>
                </>
              )}
              {liveProduct.stock > 0 ? (
                <span className="text-emerald-600 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Còn {liveProduct.stock} sản phẩm
                </span>
              ) : (
                <span className="text-rose-600 font-bold flex items-center gap-1">
                  ❌ Hết hàng (Đã bán hết sản phẩm)
                </span>
              )}
            </div>
          </div>

          {/* Pricing */}
          <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-100 flex items-baseline gap-3">
            <span className="text-3xl font-bold text-pink-600">
              {currentPrice.toLocaleString('vi-VN')}đ
            </span>
            {currentOrig && currentOrig > currentPrice && (
              <span className="text-base text-zinc-400 line-through">
                {currentOrig.toLocaleString('vi-VN')}đ
              </span>
            )}
            <span className="text-xs text-emerald-600 font-semibold ml-auto bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
              Giao hàng toàn quốc
            </span>
          </div>

          {/* Mùi Hương Selection */}
          {scentsList.length > 0 && (
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-pink-600" /> Chọn mùi hương:
              </label>
              <div className="flex flex-wrap gap-2">
                {scentsList.map((scent, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedScent(scent)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border flex items-center gap-2 ${
                      selectedScent === scent
                        ? 'border-pink-600 bg-pink-50 text-pink-700 ring-2 ring-pink-100 shadow-xs'
                        : 'border-zinc-200 text-zinc-700 hover:border-pink-300 bg-white'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${selectedScent === scent ? 'bg-pink-600' : 'bg-zinc-300'}`} />
                    {scent}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Dung tích Selection */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-zinc-500">
              <span>Chọn dung tích:</span>
              {(() => {
                const curVolStock = getVolumeStock(liveProduct, selectedVolume);
                return (
                  <span className={curVolStock > 0 ? "text-emerald-600 font-bold font-sans" : "text-rose-600 font-bold font-sans flex items-center gap-1"}>
                    {curVolStock > 0 ? `Còn ${curVolStock} sản phẩm` : '❌ Dung tích này đã Hết hàng'}
                  </span>
                );
              })()}
            </div>
            <div className="flex flex-wrap gap-2">
              {(liveProduct.availableVolumes || [liveProduct.volume || '100ml']).map((vol, idx) => {
                const volStock = getVolumeStock(liveProduct, vol);
                const isOutOfStock = volStock <= 0;

                return (
                  <button
                    key={idx}
                    type="button"
                    disabled={isOutOfStock}
                    onClick={() => !isOutOfStock && setSelectedVolume(vol)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border relative flex items-center gap-1.5 ${
                      isOutOfStock
                        ? 'opacity-40 bg-zinc-100 border-zinc-200 text-zinc-400 cursor-not-allowed line-through shadow-none pointer-events-none'
                        : selectedVolume === vol
                        ? 'border-pink-600 bg-pink-50 text-pink-600 ring-2 ring-pink-100 shadow-xs'
                        : 'border-zinc-200 text-zinc-700 hover:border-pink-300 bg-white'
                    }`}
                  >
                    <span>{vol}</span>
                    {isOutOfStock ? (
                      <span className="text-[10px] text-rose-500 font-normal no-underline">(Hết hàng)</span>
                    ) : (
                      <span className="text-[10px] text-zinc-400 font-normal">({volStock})</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quantity Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">
              Số lượng:
            </label>
            <div className="flex items-center gap-3">
              <div className="flex items-center border border-zinc-200 rounded-xl bg-zinc-50">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2.5 text-zinc-600 hover:bg-zinc-200 rounded-l-xl transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-4 text-sm font-bold text-zinc-800">{quantity}</span>
                <button
                  onClick={() => {
                    if (quantity >= liveProduct.stock) {
                      showToast(`Hiện tại trong kho chỉ còn ${liveProduct.stock} sản phẩm!`, 'error');
                      return;
                    }
                    setQuantity(quantity + 1);
                  }}
                  className="p-2.5 text-zinc-600 hover:bg-zinc-200 rounded-r-xl transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <span className="text-xs text-zinc-400">
                Tổng: <span className="font-bold text-pink-600">{(currentPrice * quantity).toLocaleString('vi-VN')}đ</span>
              </span>
            </div>
          </div>

          {/* CTA Action Buttons */}
          {liveProduct.stock > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                onClick={handleAddToCart}
                className="w-full bg-pink-50 hover:bg-pink-100 text-pink-600 font-bold text-xs py-3.5 rounded-full transition-all border border-pink-200 flex items-center justify-center gap-2"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Thêm vào giỏ hàng</span>
              </button>

              <button
                onClick={handleBuyNow}
                className="w-full bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white font-bold text-xs py-3.5 rounded-full transition-all shadow-lg shadow-pink-500/25 flex items-center justify-center gap-2 uppercase tracking-wider"
              >
                <span>Mua ngay</span>
              </button>
            </div>
          ) : (
            <div className="pt-2">
              <button
                disabled
                className="w-full bg-zinc-100 text-zinc-400 font-bold text-xs py-3.5 rounded-full border border-zinc-200 flex items-center justify-center cursor-not-allowed uppercase tracking-wider shadow-inner"
              >
                Đã hết hàng
              </button>
            </div>
          )}

          {/* Guarantees Badges */}
          <div className="grid grid-cols-3 gap-2 pt-4 border-t border-zinc-100 text-center">
            <div className="p-3 bg-zinc-50 rounded-2xl space-y-1">
              <Truck className="w-5 h-5 text-pink-600 mx-auto" />
              <p className="text-[10px] font-bold text-zinc-800">Freeship từ 499k</p>
              <p className="text-[9px] text-zinc-400">Giao nhanh toàn quốc</p>
            </div>
            <div className="p-3 bg-zinc-50 rounded-2xl space-y-1">
              <ShieldCheck className="w-5 h-5 text-pink-600 mx-auto" />
              <p className="text-[10px] font-bold text-zinc-800">100% Chính hãng</p>
              <p className="text-[9px] text-zinc-400">Cam kết đền 200%</p>
            </div>
            <div className="p-3 bg-zinc-50 rounded-2xl space-y-1">
              <RotateCcw className="w-5 h-5 text-pink-600 mx-auto" />
              <p className="text-[10px] font-bold text-zinc-800">Đổi trả 7 ngày</p>
              <p className="text-[9px] text-zinc-400">Nếu lỗi nhà sản xuất</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs: Description, Fragrance Notes, Reviews */}
      <div className="bg-white rounded-3xl border border-zinc-100 p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="flex border-b border-zinc-100 gap-6">
          <button
            onClick={() => setActiveTab('desc')}
            className={`pb-3 text-xs sm:text-sm font-bold transition-all relative ${
              activeTab === 'desc' ? 'text-pink-600' : 'text-zinc-400 hover:text-zinc-700'
            }`}
          >
            Mô tả sản phẩm
            {activeTab === 'desc' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-pink-600 rounded-full" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('notes')}
            className={`pb-3 text-xs sm:text-sm font-bold transition-all relative ${
              activeTab === 'notes' ? 'text-pink-600' : 'text-zinc-400 hover:text-zinc-700'
            }`}
          >
            Tầng hương & Phong cách
            {activeTab === 'notes' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-pink-600 rounded-full" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`pb-3 text-xs sm:text-sm font-bold transition-all relative ${
              activeTab === 'reviews' ? 'text-pink-600' : 'text-zinc-400 hover:text-zinc-700'
            }`}
          >
            Đánh giá ({totalReviews})
            {activeTab === 'reviews' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-pink-600 rounded-full" />
            )}
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'desc' && (
          <div className="space-y-4 text-xs text-zinc-600 leading-relaxed max-w-4xl">
            <p className="text-sm font-semibold text-zinc-900">{product.description}</p>
            <p>
              Nước hoa Luxora chính hãng mang đến mùi hương đẳng cấp, tinh tế và khả năng bám tỏa ấn tượng kéo dài suốt 8-12 tiếng. Thích hợp cho cả dịp đi làm hàng ngày lẫn những bữa tiệc tối sang trọng.
            </p>

            <div className="bg-zinc-50 border border-zinc-100 rounded-2xl p-4 space-y-2 mt-4">
              <h4 className="font-bold text-zinc-800 text-xs uppercase tracking-wider">Thông số chi tiết:</h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-zinc-400 block text-[10px]">Xuất xứ:</span>
                  <span className="font-semibold text-zinc-800">{product.origin || 'Pháp'}</span>
                </div>
                <div>
                  <span className="text-zinc-400 block text-[10px]">Nồng độ:</span>
                  <span className="font-semibold text-zinc-800">{product.concentration || 'EDP'}</span>
                </div>
                <div>
                  <span className="text-zinc-400 block text-[10px]">Giới tính:</span>
                  <span className="font-semibold text-zinc-800">{product.gender}</span>
                </div>
                <div>
                  <span className="text-zinc-400 block text-[10px]">Dung tích:</span>
                  <span className="font-semibold text-zinc-800">
                    {product.availableVolumes && product.availableVolumes.length > 0
                      ? product.availableVolumes.join(' / ')
                      : product.volumeOptions && product.volumeOptions.length > 0
                      ? product.volumeOptions.map(v => v.volume).join(' / ')
                      : product.volume}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'notes' && (
          <div className="space-y-4">
            {/* Mùi hương */}
            <div className="space-y-2">
              <span className="text-[10px] uppercase font-bold text-pink-600 tracking-wider">Mùi hương</span>
              <div className="flex flex-wrap gap-2">
                {(product.availableScents && product.availableScents.length > 0
                  ? product.availableScents
                  : ['Chưa cập nhật']
                ).map((scent, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-pink-50 border border-pink-200 text-pink-700 text-xs font-bold rounded-xl"
                  >
                    <Sparkles className="w-3 h-3 text-pink-500" />
                    {scent}
                  </span>
                ))}
              </div>
            </div>

            {/* Phong cách & Cảm nhận */}
            {product.benefits && (
              <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-100 space-y-1">
                <span className="text-[10px] uppercase font-bold text-zinc-600 tracking-wider">Phong cách & Cảm nhận</span>
                <p className="text-xs text-zinc-700 leading-relaxed">{product.benefits}</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="space-y-6">
            {/* Review Form - Only for users who purchased and order is completed */}
            {hasUserPurchasedProduct(product._id) ? (
              <>
                {(!hasReviewed || isEditingReview) && (
                  <form onSubmit={handleSubmitReview} className="bg-pink-50/50 border border-pink-200/80 rounded-2xl p-5 space-y-3 shadow-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs font-bold text-zinc-900">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Bạn đã mua sản phẩm này. Hãy viết nhận xét của bạn:</span>
                      </div>
                      <span className="text-[10px] text-pink-600 font-semibold bg-white px-2 py-0.5 rounded-full border border-pink-100">
                        Đã xác minh mua hàng
                      </span>
                    </div>

                    {/* Rating Stars Picker */}
                    <div className="flex items-center gap-1 text-xs">
                      <span className="text-zinc-600 font-medium">Chọn số sao:</span>
                      <div className="flex items-center gap-0.5 ml-1">
                        {[1, 2, 3, 4, 5].map(star => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setNewRating(star)}
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                            className="p-1 focus:outline-none cursor-pointer transition-transform hover:scale-110"
                          >
                            <Star
                              className={`w-5 h-5 ${
                                star <= (hoverRating || newRating)
                                  ? 'text-amber-400 fill-current'
                                  : 'text-zinc-300'
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                      <span className="font-bold text-amber-600 ml-2">{newRating} / 5 sao</span>
                    </div>

                    {/* Comment Textarea */}
                    <div>
                      <textarea
                        rows={3}
                        value={newComment}
                        onChange={e => {
                          setNewComment(e.target.value);
                          if (e.target.value.trim()) setCommentError(false);
                        }}
                        placeholder="Chia sẻ trải nghiệm sử dụng thực tế của bạn về mùi hương và độ bám tỏa..."
                        className={`w-full bg-white border rounded-xl p-3 text-xs focus:outline-none transition-all ${
                          commentError
                            ? 'border-rose-500 ring-2 ring-rose-100 bg-rose-50/20'
                            : 'border-zinc-200 focus:border-pink-500 focus:ring-2 focus:ring-pink-100'
                        }`}
                      />
                      {commentError && (
                        <p className="text-xs text-rose-600 font-bold mt-1.5 animate-in fade-in slide-in-from-top-1">
                          Vui lòng chia sẻ cảm nghĩ của bạn về sản phẩm
                        </p>
                      )}
                    </div>

                    <div className="flex justify-end gap-2">
                      {isEditingReview && (
                        <button
                          type="button"
                          onClick={() => {
                            setIsEditingReview(false);
                            setNewComment('');
                            setNewRating(5);
                          }}
                          className="bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-bold px-6 py-2.5 rounded-full transition-all"
                        >
                          Hủy
                        </button>
                      )}
                      <button
                        type="submit"
                        className="bg-pink-600 hover:bg-pink-700 text-white text-xs font-bold px-6 py-2.5 rounded-full transition-all shadow-md shadow-pink-500/20"
                      >
                        {isEditingReview ? 'Cập nhật đánh giá' : 'Gửi đánh giá'}
                      </button>
                    </div>
                  </form>
                )}
              </>
            ) : (
              <div className="p-5 bg-zinc-50 border border-zinc-200 rounded-2xl text-center space-y-2">
                <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h4 className="text-xs font-bold text-zinc-800">Chỉ khách hàng đã mua hàng thành công mới được gửi đánh giá</h4>
                <p className="text-[11px] text-zinc-500 max-w-md mx-auto">
                  Vui lòng đặt mua và trải nghiệm sản phẩm để có thể chia sẻ nhận xét thực tế tại đây.
                </p>
              </div>
            )}

            {/* Reviews List - Visible to ALL users */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-zinc-900 uppercase tracking-wider">
                Nhận xét từ khách hàng ({totalReviews})
              </h4>
              {reviewsList.length > 0 ? (
                reviewsList.map((rev, idx) => {
                  const isUserReview = rev.isUser || (user?.email && rev.userEmail && rev.userEmail.toLowerCase() === user.email.toLowerCase());
                  return (
                    <div key={rev.id || idx} className={`p-4 border ${isUserReview ? 'border-pink-200 bg-pink-50/30' : 'border-zinc-100 bg-white'} rounded-2xl space-y-2`}>
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-zinc-800">{rev.userName || rev.name}</span>
                          <span className="text-[10px] bg-emerald-50 text-emerald-600 font-semibold px-2 py-0.5 rounded-full border border-emerald-100 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Đã mua hàng
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] text-zinc-400">{rev.date}</span>
                          {isUserReview && (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => {
                                  setNewRating(rev.rating);
                                  setNewComment(rev.comment);
                                  setIsEditingReview(true);
                                }}
                                className="text-[10px] font-bold text-pink-600 hover:underline flex items-center gap-0.5 cursor-pointer"
                              >
                                <Pencil className="w-3 h-3" /> Sửa
                              </button>
                              <button
                                onClick={() => deleteProductReview(product._id)}
                                className="text-[10px] font-bold text-rose-600 hover:underline flex items-center gap-0.5 cursor-pointer"
                              >
                                <Trash2 className="w-3 h-3" /> Xóa
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-amber-400">
                        <div className="flex text-amber-400">
                          {[1, 2, 3, 4, 5].map(i => (
                            <Star key={i} className={`w-3.5 h-3.5 ${i <= Math.round(rev.rating) ? 'fill-current' : 'text-zinc-200'}`} />
                          ))}
                        </div>
                        <span className="text-xs font-bold text-amber-600">{rev.rating} sao</span>
                      </div>
                      <p className="text-xs text-zinc-600">{rev.comment}</p>

                      {/* Admin Reply */}
                      {rev.adminReply && (
                        <div className="mt-2 ml-4 p-3 bg-amber-50/60 border border-amber-200/60 rounded-xl">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="w-5 h-5 rounded-full bg-amber-400 text-zinc-950 flex items-center justify-center font-bold text-[8px]">
                              LX
                            </div>
                            <span className="text-[10px] font-bold text-amber-800">Phản hồi từ Luxora Shop</span>
                            {rev.adminReplyDate && (
                              <span className="text-[9px] text-zinc-400 ml-auto">{rev.adminReplyDate}</span>
                            )}
                          </div>
                          <p className="text-[11px] text-zinc-700 leading-relaxed">{rev.adminReply}</p>
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="p-6 bg-zinc-50 border border-zinc-100 rounded-2xl text-center">
                  <p className="text-xs text-zinc-400">Chưa có đánh giá nào cho sản phẩm này.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Related Products Grid */}
      {relatedProducts.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-zinc-900 font-serif-luxury">Sản phẩm tương tự bạn có thể thích</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {relatedProducts.map(prod => (
              <ProductCard key={prod._id} product={prod} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
