'use client';

import React, { useState, useEffect } from 'react';
import { useStore } from '@/context/StoreContext';
import { Product } from '@/types';
import { useRouter } from 'next/navigation';
import {
  X,
  Star,
  Plus,
  Minus,
  Heart,
  ShoppingBag,
  Zap,
  CheckCircle,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Share2,
  Play,
  Sparkles,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Trash2
} from 'lucide-react';

export const ProductDetailModal: React.FC = () => {
  const router = useRouter();
  const {
    products,
    selectedProductModal,
    setSelectedProductModal,
    addToCart,
    buyNow,
    wishlist,
    toggleWishlist,
    user,
    hasUserPurchasedProduct,
    showToast,
    addRewardPoints,
    getProductReviews,
    addProductReview,
    updateProductReview,
    deleteProductReview,
    hasUserReviewedProduct,
    getVolumeStock
  } = useStore();

  const [selectedImage, setSelectedImage] = useState<string>('');
  const [selectedVolume, setSelectedVolume] = useState<string>('100ml');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'info' | 'notes' | 'reviews'>('info');

  const [newRating, setNewRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [newComment, setNewComment] = useState('');
  const [commentError, setCommentError] = useState(false);
  const [isEditingReview, setIsEditingReview] = useState(false);
  const [localReviews, setLocalReviews] = useState<Array<{ name: string; date: string; rating: number; comment: string; isUser?: boolean }>>([
    {
      name: 'Trần Thị Hương',
      date: '2 ngày trước',
      rating: 5,
      comment: 'Mùi thơm cực kỳ sang trọng, giao hàng siêu nhanh. Đóng gói cẩn thận có tem chống hàng giả đầy đủ.'
    }
  ]);

  const [isClient, setIsClient] = useState(false);
  const [isFlashSaleActive, setIsFlashSaleActive] = useState(false);

  const [selectedScent, setSelectedScent] = useState<string>('');

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

  useEffect(() => {
    setIsClient(true);
    if (selectedProductModal) {
      const liveProduct = products.find(p => p._id === selectedProductModal._id || p.slug === selectedProductModal.slug || p.name === selectedProductModal.name) || selectedProductModal;
      const scents = getProductScents(liveProduct);
      setSelectedScent(scents[0]);
      
      const vols = liveProduct.availableVolumes || [liveProduct.volume || '100ml'];
      const firstInStock = vols.find(v => getVolumeStock(liveProduct, v) > 0);
      if (firstInStock && getVolumeStock(liveProduct, selectedVolume) <= 0) {
        setSelectedVolume(firstInStock);
      }

      if (hasUserPurchasedProduct(selectedProductModal._id)) {
        setActiveTab('reviews');
      }
    }
    if (selectedProductModal?.isFlashSale && selectedProductModal?.flashSaleEndTime) {
      setIsFlashSaleActive(new Date(selectedProductModal.flashSaleEndTime).getTime() > Date.now());
      const timer = setInterval(() => {
        setIsFlashSaleActive(new Date(selectedProductModal.flashSaleEndTime!).getTime() > Date.now());
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [selectedProductModal, products]);

  if (!selectedProductModal) return null;

  const product = products.find(p => p._id === selectedProductModal._id || p.slug === selectedProductModal.slug || p.name === selectedProductModal.name) || selectedProductModal;
  const currentImage = selectedImage || product.image;

  const reviewsList = getProductReviews(product._id);
  const totalReviews = reviewsList.length;
  const hasReviews = totalReviews > 0;
  const averageRating = hasReviews
    ? (reviewsList.reduce((acc, r) => acc + (Number(r.rating) || 5), 0) / totalReviews).toFixed(1)
    : '0.0';
  const ratingCounts = [5, 4, 3, 2, 1].map(stars => {
    const count = reviewsList.filter(r => r.rating === stars).length;
    const percent = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;
    return { stars, percent };
  });

  const isWishlisted = wishlist.includes(product._id);
  
  const selectedVolumeOpt = product.volumeOptions?.find(v => v.volume === selectedVolume);
  const basePrice = selectedVolumeOpt ? selectedVolumeOpt.price : product.price;
  const baseOrig = selectedVolumeOpt?.originalPrice || product.originalPrice;
  const flashSalePrice = selectedVolumeOpt?.flashSalePrice || product.flashSalePrice || basePrice;
  
  const currentPrice = (isClient && isFlashSaleActive) ? flashSalePrice : basePrice;
  const currentOrig = baseOrig;
  const activeDiscount = (currentOrig && currentPrice < currentOrig) 
    ? Math.round(((currentOrig - currentPrice) / currentOrig) * 100) 
    : product.discountPercent;
  const gallery = product.gallery && product.gallery.length > 0 ? product.gallery : [product.image];
  const currentIndex = gallery.indexOf(currentImage) >= 0 ? gallery.indexOf(currentImage) : 0;
  const hasPurchased = hasUserPurchasedProduct(product._id);
  const hasReviewed = hasUserReviewedProduct(product._id);

  const scentsList = getProductScents(product);

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    const prevIdx = (currentIndex - 1 + gallery.length) % gallery.length;
    setSelectedImage(gallery[prevIdx]);
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextIdx = (currentIndex + 1) % gallery.length;
    setSelectedImage(gallery[nextIdx]);
  };

  const handleBuyNow = () => {
    buyNow(product, selectedVolume, quantity, selectedScent);
    setSelectedProductModal(null);
    router.push('/checkout');
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (newRating === 0 || !newComment.trim()) {
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

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative bg-white rounded-3xl max-w-4xl w-full overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={() => setSelectedProductModal(null)}
          className="absolute top-4 right-4 z-20 p-2 bg-white/80 text-zinc-500 hover:text-zinc-900 rounded-full hover:bg-zinc-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 sm:p-8">
          {/* Left Column: Image Gallery with Multi-Image Slider */}
          <div className="flex gap-4">
            {/* Thumbnails list */}
            {gallery.length > 1 && (
              <div className="flex flex-col gap-2 shrink-0">
                {gallery.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(img)}
                    className={`w-14 h-14 rounded-xl border-2 overflow-hidden transition-all relative ${
                      currentImage === img ? 'border-pink-600 shadow-md scale-105' : 'border-zinc-200 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Main Featured Image with Navigation Arrows */}
            <div className="flex-1 relative aspect-square rounded-2xl overflow-hidden bg-pink-50/40 border border-pink-100 flex items-center justify-center group">
              <img src={currentImage} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />

              {/* Discount Tag */}
              {isClient && isFlashSaleActive ? (
                <span className="absolute top-3 left-3 bg-amber-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-md shadow z-10 flex items-center gap-1.5 uppercase tracking-wider">
                  <Zap className="w-3 h-3 fill-current" /> Đang Sale
                </span>
              ) : activeDiscount && activeDiscount > 0 ? (
                <span className="absolute top-3 left-3 bg-pink-600 text-white text-xs font-bold px-2.5 py-1 rounded-md shadow z-10">
                  -{activeDiscount}%
                </span>
              ) : null}

              {/* Multi-Image Counter Badge */}
              {gallery.length > 1 && (
                <span className="absolute bottom-3 right-3 bg-black/60 text-white text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-sm z-10">
                  {currentIndex + 1} / {gallery.length}
                </span>
              )}

              {/* Slider Prev/Next Controls */}
              {gallery.length > 1 && (
                <>
                  <button
                    onClick={handlePrevImage}
                    className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 text-zinc-700 hover:bg-white hover:text-pink-600 shadow-md transition-all z-10"
                    title="Ảnh trước"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleNextImage}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 text-zinc-700 hover:bg-white hover:text-pink-600 shadow-md transition-all z-10"
                    title="Ảnh tiếp"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Right Column: Information & Controls matching Image 2 */}
          <div className="flex flex-col justify-between space-y-4">
            <div>
              {/* Breadcrumb */}
              <div className="text-[11px] text-zinc-400 font-medium space-x-1 mb-1">
                <span>Trang chủ</span>
                <span>/</span>
                <span>{product.category}</span>
                <span>/</span>
                <span className="text-zinc-600">{product.brand}</span>
              </div>

              {/* Title */}
              <h2 className="text-xl font-bold text-zinc-900 font-serif-luxury leading-tight">{product.name}</h2>

              {/* Rating & Sales Stats matching Image 2 */}
              <div className="flex items-center gap-3 text-xs text-zinc-500 my-2">
                {hasReviews && (
                  <>
                    <div className="flex items-center text-amber-400">
                      <Star className="w-4 h-4 fill-current" />
                      <span className="font-bold text-zinc-800 ml-1">{averageRating}</span>
                    </div>
                    <span>•</span>
                    <span>{totalReviews} đánh giá</span>
                    <span>•</span>
                  </>
                )}
                <span className="text-emerald-600 font-medium">Đã bán {(product.soldCount / 1000).toFixed(1)}k</span>
              </div>

              {/* Tab Navigation: Information vs Reviews */}
              <div className="flex border-b border-zinc-200 gap-6 my-3 text-xs">
                <button
                  type="button"
                  onClick={() => setActiveTab('info')}
                  className={`pb-2 font-bold transition-all relative ${
                    activeTab === 'info' ? 'text-pink-600' : 'text-zinc-400 hover:text-zinc-600'
                  }`}
                >
                  Thông tin sản phẩm
                  {activeTab === 'info' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-pink-600 rounded-full" />}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('notes')}
                  className={`pb-2 font-bold transition-all relative ${
                    activeTab === 'notes' ? 'text-pink-600' : 'text-zinc-400 hover:text-zinc-600'
                  }`}
                >
                  Tầng hương & Phong cách
                  {activeTab === 'notes' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-pink-600 rounded-full" />}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('reviews')}
                  className={`pb-2 font-bold transition-all relative ${
                    activeTab === 'reviews' ? 'text-pink-600' : 'text-zinc-400 hover:text-zinc-600'
                  }`}
                >
                  Đánh giá ({totalReviews})
                  {activeTab === 'reviews' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-pink-600 rounded-full" />}
                </button>
              </div>

              {activeTab === 'info' ? (
                <>
                  {/* Price section matching Image 2 */}
                  {(() => {
                    return (
                      <div className="flex items-baseline gap-3 my-3 bg-pink-50/60 p-3 rounded-2xl border border-pink-100">
                        <span className="text-2xl font-bold text-pink-600">
                          {currentPrice.toLocaleString('vi-VN')}đ
                        </span>
                        {currentOrig && currentOrig > currentPrice && (
                          <span className="text-sm text-zinc-400 line-through">
                            {currentOrig.toLocaleString('vi-VN')}đ
                          </span>
                        )}
                        {activeDiscount && activeDiscount > 0 ? (
                          <span className="text-xs font-bold text-pink-600 bg-white px-2 py-0.5 rounded-full border border-pink-200">
                            -{activeDiscount}%
                          </span>
                        ) : null}
                      </div>
                    );
                  })()}

                  {/* Description */}
                  <p className="text-xs text-zinc-600 leading-relaxed mb-4">{product.description}</p>

                  {/* Scent Variant Options */}
                  {scentsList.length > 0 && (
                    <div className="space-y-1.5 mb-4">
                      <label className="text-xs font-bold text-zinc-800 flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-pink-600" /> Chọn Mùi Hương:
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {scentsList.map((scent, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setSelectedScent(scent)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all flex items-center gap-1.5 ${
                              selectedScent === scent
                                ? 'border-pink-600 bg-pink-50 text-pink-700 font-bold shadow-xs'
                                : 'border-zinc-200 text-zinc-600 hover:border-pink-300'
                            }`}
                          >
                            <span className={`w-2 h-2 rounded-full ${selectedScent === scent ? 'bg-pink-600' : 'bg-zinc-300'}`} />
                            {scent}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Volume Options matching Image 2 */}
                  <div className="space-y-1.5 mb-4">
                    <div className="flex items-center justify-between text-xs font-bold text-zinc-800">
                      <span>Dung tích</span>
                      {(() => {
                        const curVolStock = getVolumeStock(product, selectedVolume);
                        return (
                          <span className={curVolStock > 0 ? "text-emerald-600 font-semibold" : "text-rose-600 font-bold"}>
                            {curVolStock > 0 ? `Còn ${curVolStock} chai` : '❌ Dung tích này đã Hết hàng'}
                          </span>
                        );
                      })()}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {(product.availableVolumes || ['30ml', '50ml', '100ml']).map((vol, idx) => {
                        const volStock = getVolumeStock(product, vol);
                        const isOutOfStock = volStock <= 0;

                        return (
                          <button
                            key={idx}
                            type="button"
                            disabled={isOutOfStock}
                            onClick={() => !isOutOfStock && setSelectedVolume(vol)}
                            className={`px-4 py-1.5 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                              isOutOfStock
                                ? 'opacity-40 bg-zinc-100 border-zinc-200 text-zinc-400 cursor-not-allowed line-through shadow-none pointer-events-none'
                                : selectedVolume === vol
                                ? 'border-pink-600 bg-pink-50 text-pink-600 shadow-sm'
                                : 'border-zinc-200 text-zinc-600 hover:border-pink-300 bg-white'
                            }`}
                          >
                            <span>{vol}</span>
                            {isOutOfStock ? (
                              <span className="text-[10px] text-rose-500 font-normal no-underline">(Hết)</span>
                            ) : (
                              <span className="text-[10px] text-zinc-400 font-normal">({volStock})</span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Quantity Picker & Stock matching Image 2 */}
                  <div className="flex items-center gap-4 mb-5">
                    <label className="text-xs font-bold text-zinc-800">Số lượng</label>
                    <div className="flex items-center border border-zinc-200 rounded-xl overflow-hidden bg-zinc-50">
                      <button
                        type="button"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="px-3 py-1.5 text-zinc-600 hover:bg-zinc-200 transition-colors"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="px-4 text-xs font-bold text-zinc-900">{quantity}</span>
                      <button
                        type="button"
                        onClick={() => {
                          if (quantity >= product.stock) {
                            showToast(`Hiện tại trong kho chỉ còn ${product.stock} sản phẩm!`, 'error');
                            return;
                          }
                          setQuantity(quantity + 1);
                        }}
                        className="px-3 py-1.5 text-zinc-600 hover:bg-zinc-200 transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    {product.stock > 0 ? (
                      <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5" /> Còn {product.stock} sản phẩm
                      </span>
                    ) : (
                      <span className="text-xs text-rose-600 font-bold flex items-center gap-1">
                        ❌ Hết hàng (Đã bán hết sản phẩm)
                      </span>
                    )}
                  </div>
                </>
              ) : activeTab === 'notes' ? (
                /* Fragrance Notes & Style Tab Content */
                <div className="space-y-3 my-3 max-h-[280px] overflow-y-auto pr-1">
                  {/* Mùi hương */}
                  <div className="space-y-2">
                    <span className="text-[9px] uppercase font-bold text-pink-600 tracking-wider">Mùi hương</span>
                    <div className="flex flex-wrap gap-2">
                      {(product.availableScents && product.availableScents.length > 0
                        ? product.availableScents
                        : ['Chưa cập nhật']
                      ).map((scent, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-pink-50 border border-pink-200 text-pink-700 text-[11px] font-bold rounded-xl"
                        >
                          <Sparkles className="w-3 h-3 text-pink-500" />
                          {scent}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Phong cách & Cảm nhận */}
                  {product.benefits && (
                    <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-100 space-y-1">
                      <span className="text-[9px] uppercase font-bold text-zinc-600 tracking-wider">Phong cách & Cảm nhận</span>
                      <p className="text-[11px] text-zinc-700 leading-relaxed">{product.benefits}</p>
                    </div>
                  )}
                </div>
              ) : (
                /* Reviews Tab Content */
                <div className="space-y-3 max-h-[280px] overflow-y-auto pr-1 my-3">
                  {/* Box 3 (Nếu đã mua & chưa đánh giá) HOẶC Box 2 (Nếu chưa mua/đơn chưa hoàn thành). Nếu đã mua & ĐÃ ĐÁNH GIÁ RỒI thì ẨN CẢ 2 BOX */}
                  {(hasPurchased && !hasReviewed) || isEditingReview ? (
                    <form onSubmit={handleSubmitReview} className="bg-pink-50/60 border border-pink-200 rounded-2xl p-3.5 space-y-2.5">
                      <div className="flex items-center justify-between text-[11px] font-bold text-zinc-800">
                        <span className="flex items-center gap-1 text-emerald-600">
                          <CheckCircle2 className="w-3.5 h-3.5" /> {isEditingReview ? 'Chỉnh sửa nhận xét của bạn:' : 'Bạn đã mua sản phẩm này. Hãy viết nhận xét của bạn:'}
                        </span>
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

                      <div>
                        <textarea
                          rows={2}
                          placeholder="Chia sẻ trải nghiệm sử dụng thực tế của bạn về mùi hương và độ bám tỏa..."
                          value={newComment}
                          onChange={e => {
                            setNewComment(e.target.value);
                            if (e.target.value.trim()) setCommentError(false);
                          }}
                          className={`w-full bg-white border rounded-xl p-2.5 text-xs text-zinc-800 focus:outline-none transition-all ${
                            commentError
                              ? 'border-rose-500 ring-2 ring-rose-100 bg-rose-50/20'
                              : 'border-pink-200 focus:border-pink-500'
                          }`}
                        />
                        {commentError && (
                          <p className="text-xs text-rose-600 font-bold mt-1 animate-in fade-in slide-in-from-top-1">
                            Vui lòng chia sẻ cảm nghĩ của bạn về sản phẩm
                          </p>
                        )}
                      </div>

                      <div className="flex items-center justify-end gap-2">
                        {isEditingReview && (
                          <button
                            type="button"
                            onClick={() => {
                              setIsEditingReview(false);
                              setNewComment('');
                              setNewRating(5);
                            }}
                            className="bg-white hover:bg-zinc-100 text-zinc-600 text-[11px] font-bold px-3 py-1.5 rounded-xl border border-zinc-200 transition-all"
                          >
                            Hủy Sửa
                          </button>
                        )}
                        <button
                          type="submit"
                          className="bg-pink-600 hover:bg-pink-700 text-white text-[11px] font-bold px-4 py-1.5 rounded-xl transition-all shadow-sm"
                        >
                          {isEditingReview ? 'Cập Nhật Nhận Xét' : 'Gửi Đánh Giá'}
                        </button>
                      </div>
                    </form>
                  ) : !hasPurchased && !hasReviewed ? (
                    <div className="p-4 bg-zinc-50/80 border border-zinc-200 rounded-2xl text-center space-y-1.5">
                      <div className="w-8 h-8 bg-amber-100/80 text-amber-600 rounded-full flex items-center justify-center mx-auto shadow-2xs">
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                      <h4 className="text-xs font-bold text-zinc-800">Chỉ khách hàng đã mua hàng thành công mới được gửi đánh giá</h4>
                      <p className="text-[11px] text-zinc-500 max-w-sm mx-auto">
                        Vui lòng đặt mua và trải nghiệm sản phẩm để có thể chia sẻ nhận xét thực tế tại đây.
                      </p>
                    </div>
                  ) : null}

                  {/* Reviews List */}
                  <div className="space-y-3">
                    {reviewsList.map((rev, idx) => {
                      const isUserReview = rev.isUser || (user?.email && rev.userEmail && rev.userEmail.toLowerCase() === user.email.toLowerCase());
                      return (
                        <div key={rev.id || idx} className={`rounded-2xl p-3 border space-y-1 ${isUserReview ? 'border-pink-200 bg-pink-50/40' : 'bg-zinc-50 border-zinc-100'}`}>
                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-zinc-900">{rev.userName || rev.name}</span>
                              <span className="text-[9px] bg-emerald-50 text-emerald-600 font-semibold px-1.5 py-0.5 rounded-full border border-emerald-100 flex items-center gap-0.5">
                                <CheckCircle2 className="w-2.5 h-2.5" /> Đã mua hàng
                              </span>
                            </div>
                            <div className="flex items-center gap-2.5">
                              <span className="text-[10px] text-zinc-400">{rev.date}</span>
                              {isUserReview && (
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => {
                                      setNewRating(rev.rating);
                                      setNewComment(rev.comment);
                                      setIsEditingReview(true);
                                    }}
                                    className="text-[10px] text-pink-600 hover:text-pink-700 font-bold hover:underline flex items-center gap-0.5"
                                  >
                                    <Pencil className="w-3 h-3" /> Sửa
                                  </button>
                                  <button
                                    onClick={() => deleteProductReview(product._id)}
                                    className="text-[10px] text-rose-600 hover:text-rose-700 font-bold hover:underline flex items-center gap-0.5"
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
                                <Star key={i} className={`w-3 h-3 ${i <= Math.round(rev.rating) ? 'fill-current' : 'text-zinc-200'}`} />
                              ))}
                            </div>
                            <span className="text-[11px] font-bold text-amber-600">{rev.rating} sao</span>
                          </div>
                          <p className="text-zinc-600 text-[11px]">{rev.comment}</p>

                          {/* Admin Reply */}
                          {rev.adminReply && (
                            <div className="mt-1.5 ml-3 p-2 bg-amber-50/70 border border-amber-200/70 rounded-xl space-y-0.5">
                              <div className="flex items-center gap-1.5 text-[9px] font-bold text-amber-800">
                                <div className="w-4 h-4 rounded-full bg-amber-400 text-zinc-950 flex items-center justify-center font-bold text-[7px]">
                                  LX
                                </div>
                                <span>Phản hồi từ Luxora Shop</span>
                                {rev.adminReplyDate && (
                                  <span className="text-[8px] text-zinc-400 ml-auto font-normal">{rev.adminReplyDate}</span>
                                )}
                              </div>
                              <p className="text-[10px] text-zinc-700 leading-snug">{rev.adminReply}</p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Main Action Buttons matching Image 2 */}
            <div className="space-y-3">
              {product.stock > 0 ? (
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => addToCart(product, selectedVolume, quantity, selectedScent)}
                    className="w-full bg-white border-2 border-pink-600 text-pink-600 hover:bg-pink-50 text-xs font-bold py-3 rounded-full transition-colors flex items-center justify-center gap-2"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    Thêm vào giỏ hàng
                  </button>
                  <button
                    onClick={handleBuyNow}
                    className="w-full bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white text-xs font-bold py-3 rounded-full transition-all shadow-md shadow-pink-500/20 flex items-center justify-center gap-2"
                  >
                    <Zap className="w-4 h-4 fill-current" />
                    Mua ngay
                  </button>
                </div>
              ) : (
                <button
                  disabled
                  className="w-full bg-zinc-100 text-zinc-400 font-bold text-xs py-3 rounded-full border border-zinc-200 flex items-center justify-center cursor-not-allowed uppercase tracking-wider shadow-inner"
                >
                  🚫 Hết hàng - Không thể mua ngay
                </button>
              )}

              {/* Secondary actions: Wishlist & Compare */}
              <div className="flex items-center justify-around text-xs text-zinc-500 pt-2 border-t border-zinc-100">
                <button
                  onClick={() => toggleWishlist(product._id)}
                  className={`flex items-center gap-1.5 hover:text-pink-600 transition-colors ${
                    isWishlisted ? 'text-pink-600 font-bold' : ''
                  }`}
                >
                  <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
                  {isWishlisted ? 'Đã yêu thích' : 'Thêm vào yêu thích'}
                </button>
                <span>|</span>
                <button className="flex items-center gap-1.5 hover:text-pink-600 transition-colors">
                  <RefreshCw className="w-4 h-4" />
                  So sánh sản phẩm
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
